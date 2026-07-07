-- ============================================================================
-- Add catatan_penetapan + updated_at to pendaftaran
-- ============================================================================
-- Why: STAFFADMIN/penetapanPenerima (SELE-02 final decision stage) lets staff
-- attach a note when setting/undoing lolos_final/tidak_lolos_final, and shows
-- when that decision was last made. Neither column exists on `pendaftaran`
-- today (see note in 0000_baseline.sql) — `catatan_verifikasi` (0001) and
-- `hasil_seleksi.catatan_staff` cover the earlier berkas/wawancara stages only.
--
-- ACTION REQUIRED: run this in the Supabase SQL editor before deploying
-- backend/src/modules/penetapan.
-- ============================================================================

alter table public.pendaftaran
  add column if not exists catatan_penetapan text,
  add column if not exists updated_at timestamptz not null default now();

comment on column public.pendaftaran.catatan_penetapan is
  'Staff note attached when setting/undoing the final lolos_final/tidak_lolos_final decision (SELE-02), shown to the applicant.';
comment on column public.pendaftaran.updated_at is
  'Last time this application row changed status; set explicitly by application code (no DB trigger).';