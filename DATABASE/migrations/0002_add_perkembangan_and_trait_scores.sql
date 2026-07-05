-- ============================================================================
-- Add structured trait/prestasi scoring to hasil_seleksi + perkembangan_penerima
-- ============================================================================
-- Why: (1) SELE-01 needs structured personality-trait + academic-achievement
-- scores, not just free-text catatan_prestasi, to support the Kabag
-- recommendation feature (rekomendasi kandidat). (2) Kabag wants to track
-- post-award student progress ("perkembangan") — no such table exists today.
-- perkembangan_penerima intentionally stores dummy/manually-entered snapshots;
-- this is NOT a periodic automated pipeline (explicitly out of scope).
--
-- ACTION REQUIRED: run in Supabase SQL editor before deploying
-- backend/src/modules/seleksi and the new kabag endpoints.
-- ============================================================================

alter table public.hasil_seleksi
  add column if not exists nilai_kerja_keras   numeric check (nilai_kerja_keras   between 1 and 10),
  add column if not exists nilai_kepemimpinan  numeric check (nilai_kepemimpinan  between 1 and 10),
  add column if not exists nilai_komunikasi    numeric check (nilai_komunikasi    between 1 and 10),
  add column if not exists nilai_keberanian    numeric check (nilai_keberanian    between 1 and 10),
  add column if not exists skor_prestasi_akademik numeric check (skor_prestasi_akademik between 1 and 10);

comment on column public.hasil_seleksi.nilai_kerja_keras is 'Trait score 1-10: kerja keras (hard work), scored by staff at interview stage.';
comment on column public.hasil_seleksi.nilai_kepemimpinan is 'Trait score 1-10: kepemimpinan (leadership).';
comment on column public.hasil_seleksi.nilai_komunikasi is 'Trait score 1-10: komunikasi (communication).';
comment on column public.hasil_seleksi.nilai_keberanian is 'Trait score 1-10: keberanian (courage/initiative).';
comment on column public.hasil_seleksi.skor_prestasi_akademik is 'Numeric 1-10 score for academic competition achievement; catatan_prestasi text column retained for free-text description.';

create table if not exists public.perkembangan_penerima (
  id              uuid primary key default gen_random_uuid(),
  penerima_id     uuid not null references public.penerima_beasiswa(id),
  periode         varchar not null,          -- e.g. 'Semester 1 2026', freeform label
  ipk_snapshot    numeric,
  catatan         text,                      -- free-text: performance, destination program, etc.
  dicatat_oleh    uuid references public.profiles(id),
  created_at      timestamptz not null default now()
);

comment on table public.perkembangan_penerima is
  'Post-award progress tracking for scholarship recipients (dummy/manually-entered snapshots by design — not an automated periodic pipeline). Feeds Kabag "Perkembangan Penerima" view and the successful-recipient profile used by the recommendation feature.';

alter table public.perkembangan_penerima enable row level security;

create policy perkembangan_read on public.perkembangan_penerima
  for select using (true);

create policy perkembangan_write on public.perkembangan_penerima
  for all using (true) with check (true);
