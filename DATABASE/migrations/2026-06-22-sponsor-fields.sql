-- Migration delta — run if you applied supabase_schema.sql before these
-- sponsor columns existed (added 2026-06-22). Used by the staff sponsor
-- management UI (tagline/tentang/narahubung/email/brand color/active flag)
-- and by the mahasiswa company profile page.

alter table public.sponsors add column if not exists tagline    text;
alter table public.sponsors add column if not exists tentang    text;
alter table public.sponsors add column if not exists narahubung varchar(100);
alter table public.sponsors add column if not exists email      varchar(120);
alter table public.sponsors add column if not exists warna      varchar(20);
alter table public.sponsors add column if not exists is_aktif   boolean not null default true;
