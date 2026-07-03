-- ============================================================================
-- RLS POLICY DRAFT — SUPERSEDED, DO NOT RUN
-- ============================================================================
-- A live schema pull (2026-07-03, see DATABASE/SCHEMA_NOTES.md) showed RLS is
-- already enabled on every table in the live project, with policies already
-- defined (names/commands listed in DATABASE/migrations/0000_baseline.sql).
-- This file was written before that was known, against speculative table/
-- column names, and its policy names likely collide with the real ones
-- (`create policy` would fail with "already exists").
--
-- Kept only as a design reference for the default-deny reasoning below.
-- Before touching live RLS, pull the real policies' USING/WITH CHECK logic
-- (see the open item in SCHEMA_NOTES.md) and diff against this file's intent
-- rather than running it as-is.
-- ============================================================================
--
-- Design principle (matches ROADMAP.md "Architecture Baseline"):
--   RLS is the SECOND line of defense. The Express API (service-role key,
--   which bypasses RLS entirely) is the FIRST line of defense for every
--   privileged write (verification, scoring, disbursement, sponsor/program
--   management, complaint resolution).
--
--   So these policies are intentionally narrow for anon/authenticated:
--     - Public catalog data (active beasiswa + sponsors): SELECT only.
--     - A user's own rows: SELECT only, across the board.
--     - The handful of self-service writes Phase 1 already promises
--       (submit an application, upload own documents, edit own profile,
--       submit a complaint): INSERT/UPDATE, scoped to own rows.
--     - Everything else (status transitions, scores, payouts, sponsor/
--       program CRUD): NO grant here. Those go through the API.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: resolve the caller's role without recursive RLS evaluation on
-- profiles itself. SECURITY DEFINER bypasses RLS for this one lookup.
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- profiles
-- ============================================================================
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_staff"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.current_role() in ('staff', 'kabag', 'wabag')
  );

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- NOTE: if `role` must never be self-editable, add a BEFORE UPDATE trigger
-- that rejects changes to the role column, since RLS alone can't restrict
-- individual columns on UPDATE.

-- ============================================================================
-- sponsors — public catalog, staff-managed via API only
-- ============================================================================
alter table public.sponsors enable row level security;

create policy "sponsors_select_active_public"
  on public.sponsors for select
  to anon, authenticated
  using (is_aktif = true);

create policy "sponsors_select_all_staff"
  on public.sponsors for select
  to authenticated
  using (public.current_role() in ('staff', 'kabag', 'wabag'));

-- ============================================================================
-- beasiswa — public catalog, staff-managed via API only
-- ============================================================================
alter table public.beasiswa enable row level security;

create policy "beasiswa_select_public"
  on public.beasiswa for select
  to anon, authenticated
  using (true);
-- TODO(schema): once `status` enum is confirmed (see SCHEMA_NOTES.md open
-- questions), narrow this to active/open programs only for anon, e.g.
-- `using (status = 'dibuka')`, and keep the unrestricted staff policy below.

create policy "beasiswa_select_all_staff"
  on public.beasiswa for select
  to authenticated
  using (public.current_role() in ('staff', 'kabag', 'wabag'));

-- ============================================================================
-- pendaftaran — mahasiswa owns creation + read of own rows (APPL-01/02,
-- STAT-01); status transitions are staff-only and happen via the API.
-- ============================================================================
alter table public.pendaftaran enable row level security;

create policy "pendaftaran_select_own_or_staff"
  on public.pendaftaran for select
  to authenticated
  using (
    mahasiswa_id = auth.uid()
    or public.current_role() in ('staff', 'kabag', 'wabag')
  );

create policy "pendaftaran_insert_own"
  on public.pendaftaran for insert
  to authenticated
  with check (mahasiswa_id = auth.uid());
-- No UPDATE policy for anon/authenticated: status changes are API-only
-- (service-role), enforced server-side by backend/src/modules/verifikasi
-- and future seleksi/penetapan modules.

-- ============================================================================
-- dokumen_pendaftaran — mahasiswa uploads for their own application (DOCS-01)
-- ============================================================================
alter table public.dokumen_pendaftaran enable row level security;

create policy "dokumen_select_own_or_staff"
  on public.dokumen_pendaftaran for select
  to authenticated
  using (
    exists (
      select 1 from public.pendaftaran p
      where p.id = dokumen_pendaftaran.pendaftaran_id
        and (p.mahasiswa_id = auth.uid() or public.current_role() in ('staff', 'kabag', 'wabag'))
    )
  );

create policy "dokumen_insert_own"
  on public.dokumen_pendaftaran for insert
  to authenticated
  with check (
    exists (
      select 1 from public.pendaftaran p
      where p.id = dokumen_pendaftaran.pendaftaran_id
        and p.mahasiswa_id = auth.uid()
    )
  );

-- ============================================================================
-- hasil_seleksi — staff-only writes (SELE-01), student can read their own
-- ============================================================================
alter table public.hasil_seleksi enable row level security;

create policy "hasil_seleksi_select_own_or_staff"
  on public.hasil_seleksi for select
  to authenticated
  using (
    exists (
      select 1 from public.pendaftaran p
      where p.id = hasil_seleksi.pendaftaran_id
        and (p.mahasiswa_id = auth.uid() or public.current_role() in ('staff', 'kabag', 'wabag'))
    )
  );
-- No insert/update policy: hasil_seleksi is written by staff via the API
-- (service-role) only.

-- ============================================================================
-- penyaluran_dana — student reads own payout status (STAT-02); staff/wabag
-- write and audit via the API only (PAY-01, FIN-03)
-- ============================================================================
alter table public.penyaluran_dana enable row level security;

create policy "penyaluran_select_own_or_staff"
  on public.penyaluran_dana for select
  to authenticated
  using (
    mahasiswa_id = auth.uid()
    or public.current_role() in ('staff', 'kabag', 'wabag')
  );

-- ============================================================================
-- laporan_kendala — mahasiswa submits + reads own (COMP-01); staff
-- resolves via the API (COMP-02)
-- ============================================================================
alter table public.laporan_kendala enable row level security;

create policy "laporan_select_own_or_staff"
  on public.laporan_kendala for select
  to authenticated
  using (
    mahasiswa_id = auth.uid()
    or public.current_role() in ('staff', 'kabag', 'wabag')
  );

create policy "laporan_insert_own"
  on public.laporan_kendala for insert
  to authenticated
  with check (mahasiswa_id = auth.uid());

-- ============================================================================
-- notifikasi — user reads + marks own notifications read (NOTF-01); rows
-- are inserted by the API (service-role) when status changes happen
-- ============================================================================
alter table public.notifikasi enable row level security;

create policy "notifikasi_select_own"
  on public.notifikasi for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifikasi_update_own_mark_read"
  on public.notifikasi for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
