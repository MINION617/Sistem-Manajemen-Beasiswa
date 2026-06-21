-- Migration delta — run this if you already applied supabase_schema.sql
-- BEFORE the dokumen_mahasiswa table existed (added 2026-06-22).
-- Profile-stage document package (D-08), owned by the student and reused
-- across all their applications. Needed by the Phase 1 readiness gate (01-02).

create table if not exists public.dokumen_mahasiswa (
  id            uuid primary key default gen_random_uuid(),
  mahasiswa_id  uuid not null references public.profiles(id) on delete cascade,
  jenis_dokumen varchar(50) not null,  -- transkrip | berkas_pendukung | sertifikat_prestasi
  file_path     text,
  file_url      text,
  ukuran_file   bigint,
  uploaded_at   timestamptz not null default now(),
  unique (mahasiswa_id, jenis_dokumen)
);

alter table public.dokumen_mahasiswa enable row level security;

create policy dokmhs_owner on public.dokumen_mahasiswa
  for all using (mahasiswa_id = auth.uid()) with check (mahasiswa_id = auth.uid());

create policy dokmhs_staff_read on public.dokumen_mahasiswa
  for select using (public.current_role() in ('staff','kabag'));
