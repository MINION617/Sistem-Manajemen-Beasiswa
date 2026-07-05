-- ============================================================================
-- DEMO-ONLY: backdate a couple of pendaftaran rows into 2025 so the Kabag
-- "Tren Pendaftaran Tahun ke Tahun" chart has more than one year to compare.
-- Not a real migration (kept outside DATABASE/migrations/ on purpose) — run
-- manually in Supabase SQL Editor, once, for demo purposes only.
-- ============================================================================

update public.pendaftaran
set tanggal_daftar = '2025-03-15T09:00:00Z'
where id in (
  select id from public.pendaftaran order by tanggal_daftar asc limit 1
);

update public.pendaftaran
set tanggal_daftar = '2025-09-10T09:00:00Z'
where id in (
  select id from public.pendaftaran order by tanggal_daftar asc offset 1 limit 1
);

-- Verify:
select id, tanggal_daftar from public.pendaftaran order by tanggal_daftar asc;
