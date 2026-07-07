-- ============================================================================
-- Add tanggal_tes_wawancara + tanggal_penetapan to beasiswa
-- ============================================================================
-- Why: schedule for the seleksi (tes & wawancara) and penetapan (final
-- decision) stages was never set anywhere — staff picked these dates
-- ad-hoc per applicant instead of once when the scholarship program itself
-- is created. `beasiswa` today only has tanggal_buka/tanggal_tutup
-- (registration window). These two columns are informational (a reference
-- schedule shown to staff/kabag/wabag/mahasiswa) — they do not gate any
-- action; staff can still record nilai/keputusan on any date.
--
-- ACTION REQUIRED: run this in the Supabase SQL editor before deploying
-- backend/src/modules/beasiswa's updated create/update schema.
-- ============================================================================

alter table public.beasiswa
  add column if not exists tanggal_tes_wawancara date,
  add column if not exists tanggal_penetapan date;

comment on column public.beasiswa.tanggal_tes_wawancara is
  'Reference date for the tes & wawancara stage, set once when the program is created. Informational only — does not block recording nilai on other dates.';
comment on column public.beasiswa.tanggal_penetapan is
  'Reference date for the penetapan (final decision) stage, set once when the program is created. Informational only — does not block the decision on other dates.';
