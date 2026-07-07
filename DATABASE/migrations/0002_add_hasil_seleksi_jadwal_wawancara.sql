-- ============================================================================
-- Add jadwal_wawancara to hasil_seleksi
-- ============================================================================
-- Why: FRONTEND/STAFFADMIN/inputHasilSeleksi/inputHasilSeleksi.js (SELE-01)
-- lets staff set an interview schedule per applicant and displays it as a
-- tag on the peserta card. The baseline schema's `hasil_seleksi` table only
-- has nilai_tes, nilai_wawancara, catatan_prestasi, catatan_staff — no
-- column to store this date/time.
--
-- ACTION REQUIRED: run this in the Supabase SQL editor (or via CLI once
-- linked) before backend/src/modules/seleksi can persist jadwal_wawancara.
-- Until this is applied, seleksi.service.js does not read/write this field
-- and the frontend's jadwal_wawancara input is not wired to the backend.
-- ============================================================================

alter table public.hasil_seleksi
  add column if not exists jadwal_wawancara timestamptz;

comment on column public.hasil_seleksi.jadwal_wawancara is
  'Scheduled interview date/time set by staff (SELE-01), shown to the applicant.';
