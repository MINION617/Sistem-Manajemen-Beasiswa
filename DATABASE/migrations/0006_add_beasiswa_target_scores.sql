-- ============================================================================
-- Add manual target-score columns to beasiswa (fallback for Rekomendasi Kandidat)
-- ============================================================================
-- Why: getRekomendasi() (backend/src/modules/kabag/kabag.service.js) scores
-- wawancara-stage candidates against an "acuan penerima berhasil" profile
-- derived automatically from past successful recipients (penerima_beasiswa
-- with status disahkan + IPK >= 3.0). A brand-new program has zero recipients
-- yet, so it falls into cold-start mode (profileAvailable: false, candidates
-- only sorted by IPK, no comparison score at all). Staff can now set a
-- manual target per dimension when the program is created, used ONLY until
-- enough historical data exists (see MIN_HISTORICAL_SAMPLE in
-- kabag.service.js) — once a program accumulates that many successful
-- recipients, the automatically-derived historical profile takes over and
-- these manual targets are no longer read.
--
-- All 7 columns mirror the dimensions in kabag.service.js DIMENSION_WEIGHTS,
-- same scale as the source values they're compared against (IPK 0-4,
-- nilai_tes/nilai_wawancara 0-100, the 4 trait scores 0-10). All nullable —
-- staff can leave any subset unset; getRekomendasi() only uses target
-- columns that are non-null.
--
-- ACTION REQUIRED: run this in the Supabase SQL editor before deploying
-- backend/src/modules/beasiswa's updated create/update schema and
-- backend/src/modules/kabag's updated getRekomendasi.
-- ============================================================================

alter table public.beasiswa
  add column if not exists target_ipk numeric,
  add column if not exists target_nilai_tes numeric,
  add column if not exists target_nilai_wawancara numeric,
  add column if not exists target_kerja_keras numeric,
  add column if not exists target_kepemimpinan numeric,
  add column if not exists target_komunikasi numeric,
  add column if not exists target_keberanian numeric;

comment on column public.beasiswa.target_ipk is
  'Manual target IPK (0-4) set by staff at program creation, used as the Rekomendasi Kandidat acuan only until enough historical successful-recipient data exists.';
comment on column public.beasiswa.target_nilai_tes is
  'Manual target nilai tes (0-100), same fallback role as target_ipk.';
comment on column public.beasiswa.target_nilai_wawancara is
  'Manual target nilai wawancara (0-100), same fallback role as target_ipk.';
comment on column public.beasiswa.target_kerja_keras is
  'Manual target nilai kerja keras (0-10), same fallback role as target_ipk.';
comment on column public.beasiswa.target_kepemimpinan is
  'Manual target nilai kepemimpinan (0-10), same fallback role as target_ipk.';
comment on column public.beasiswa.target_komunikasi is
  'Manual target nilai komunikasi (0-10), same fallback role as target_ipk.';
comment on column public.beasiswa.target_keberanian is
  'Manual target nilai keberanian (0-10), same fallback role as target_ipk.';
