-- Migration delta — run if you applied supabase_schema.sql before these
-- beasiswa columns existed (added 2026-06-22). Used by the scholarship cards
-- (open/close dates + requirements list) and by staff master-data management.

alter table public.beasiswa add column if not exists tanggal_buka  date;
alter table public.beasiswa add column if not exists tanggal_tutup date;
alter table public.beasiswa add column if not exists persyaratan   text[];
