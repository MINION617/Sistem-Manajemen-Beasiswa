-- ============================================================================
-- DEMO-ONLY: backdate created_at on a few outstanding penyaluran_dana rows
-- (status pending / sedang_diproses) so the Wabag "Antrian Pencairan" aging
-- buckets (0–7 / 8–14 / 15–30 / >30 hari) are not all in the first bucket.
-- Not a real migration (kept outside DATABASE/migrations/ on purpose) — run
-- manually in Supabase SQL Editor, once, for demo purposes only.
-- ============================================================================

-- Oldest outstanding row → >30 hari bucket
update public.penyaluran_dana
set created_at = now() - interval '34 days'
where id in (
  select id from public.penyaluran_dana
  where status <> 'sudah_cair'
  order by created_at asc limit 1
);

-- Next → 15–30 hari bucket
update public.penyaluran_dana
set created_at = now() - interval '20 days'
where id in (
  select id from public.penyaluran_dana
  where status <> 'sudah_cair'
  order by created_at asc offset 1 limit 1
);

-- Next → 8–14 hari bucket
update public.penyaluran_dana
set created_at = now() - interval '11 days'
where id in (
  select id from public.penyaluran_dana
  where status <> 'sudah_cair'
  order by created_at asc offset 2 limit 1
);

-- Verify:
select id, status, created_at, now() - created_at as umur
from public.penyaluran_dana
where status <> 'sudah_cair'
order by created_at asc;

-- ============================================================================
-- Bagian 2: backdate a couple of *sudah_cair* rows into previous years so the
-- Wabag "Tren Dana Tersalur Tahun ke Tahun" chart has more than one year.
-- (Grouping uses created_at; tanggal_pencairan is aligned for coherence.)
-- ============================================================================

update public.penyaluran_dana
set created_at = '2024-05-14T09:00:00Z', tanggal_pencairan = '2024-05-20T09:00:00Z'
where id in (
  select id from public.penyaluran_dana
  where status = 'sudah_cair'
  order by created_at asc limit 1
);

update public.penyaluran_dana
set created_at = '2025-04-08T09:00:00Z', tanggal_pencairan = '2025-04-15T09:00:00Z'
where id in (
  select id from public.penyaluran_dana
  where status = 'sudah_cair'
  order by created_at asc offset 1 limit 1
);

-- Verify:
select date_part('year', created_at) as tahun, count(*), sum(nominal)
from public.penyaluran_dana
group by 1 order by 1;
