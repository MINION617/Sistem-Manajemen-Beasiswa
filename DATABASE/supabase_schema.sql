-- ============================================================
-- CANONICAL SUPABASE SCHEMA — Sistem Informasi Manajemen Beasiswa
-- ============================================================
-- Source of truth for the Postgres data model behind BACKEND/supabaseclient.js.
-- Reconciles the legacy MySQL dump (DATABASE/beasiswa.sql) with the names the
-- client actually queries (e.g. nama_program, status, uuid ids).
--
-- Run this in the Supabase SQL editor. Then create the two storage buckets
-- (see STORAGE section at the bottom) and apply the storage policies.
--
-- Decisions baked in:
--   KD-1: real Supabase backend (supersedes dummy-first D-12).
--   KD-3: recipient decision is a two-step flow — Staff proposes (diusulkan),
--         Kabag gives final ACC (disahkan). Both actors are recorded.
--   KD-4: canonical snake_case status vocabulary via the enums below.
-- ============================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------- ENUMS (KD-4 canonical vocabulary) ----------
do $$ begin
  create type app_role as enum ('mahasiswa', 'staff', 'kabag', 'wabag');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_pendaftaran as enum (
    'menunggu_verifikasi', 'lolos_berkas', 'ditolak_berkas',
    'wawancara', 'lolos_final', 'tidak_lolos_final'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_penerima as enum ('diusulkan', 'disahkan', 'dibatalkan');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_penyaluran as enum ('pending', 'sedang_diproses', 'sudah_cair');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_laporan as enum ('masuk', 'diproses', 'selesai');
exception when duplicate_object then null; end $$;

-- ---------- TABLES ----------

-- profiles: 1:1 with auth.users; role drives RLS and routing.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  nim_nip         varchar(20) unique not null,
  nama_lengkap    varchar(100) not null,
  role            app_role not null default 'mahasiswa',
  email           varchar(120),
  program_studi   varchar(100),          -- mahasiswa
  ipk             numeric(3,2),          -- mahasiswa
  nomor_whatsapp  varchar(20),
  alamat          text,
  jabatan         varchar(100),          -- staff/kabag/wabag
  unit            varchar(100),          -- staff/kabag/wabag
  created_at      timestamptz not null default now()
);

create table if not exists public.sponsors (
  id                uuid primary key default gen_random_uuid(),
  nama_perusahaan   varchar(100) not null,
  kontak_perusahaan varchar(50),
  alamat_perusahaan text,
  jenis_industri    varchar(50),
  created_at        timestamptz not null default now()
);

create table if not exists public.beasiswa (
  id             uuid primary key default gen_random_uuid(),
  sponsor_id     uuid references public.sponsors(id) on delete set null,
  nama_program   varchar(100) not null,
  tahun_akademik varchar(9),
  deskripsi      text,
  kategori       varchar(50),
  nominal_dana   bigint,
  kuota          int,
  status         varchar(20) not null default 'aktif',   -- aktif | nonaktif
  created_at     timestamptz not null default now()
);

create table if not exists public.pendaftaran (
  id             uuid primary key default gen_random_uuid(),
  mahasiswa_id   uuid not null references public.profiles(id) on delete cascade,
  beasiswa_id    uuid not null references public.beasiswa(id) on delete cascade,
  status         status_pendaftaran not null default 'menunggu_verifikasi',
  tanggal_daftar timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  unique (mahasiswa_id, beasiswa_id)   -- anti duplicate submission (audit C4)
);

create table if not exists public.dokumen_pendaftaran (
  id             uuid primary key default gen_random_uuid(),
  pendaftaran_id uuid not null references public.pendaftaran(id) on delete cascade,
  jenis_dokumen  varchar(50) not null,  -- sertifikat_prestasi | sertifikat_bahasa | berkas_pendukung
  file_path      text,
  file_url       text,
  ukuran_file    bigint,
  created_at     timestamptz not null default now()
);

create table if not exists public.hasil_seleksi (
  id               uuid primary key default gen_random_uuid(),
  pendaftaran_id   uuid not null references public.pendaftaran(id) on delete cascade,
  nilai_tes        numeric(5,2),
  nilai_wawancara  numeric(5,2),
  catatan_prestasi text,
  catatan_staff    text,
  created_at       timestamptz not null default now()
);

-- penerima_beasiswa: KD-3 two-step approval (Staff proposes -> Kabag ACC).
create table if not exists public.penerima_beasiswa (
  id                uuid primary key default gen_random_uuid(),
  pendaftaran_id    uuid not null references public.pendaftaran(id) on delete cascade,
  status            status_penerima not null default 'diusulkan',
  diusulkan_oleh    uuid references public.profiles(id),   -- staff
  tanggal_usul      timestamptz default now(),
  disahkan_oleh     uuid references public.profiles(id),   -- kabag (ACC final)
  tanggal_acc       timestamptz,
  created_at        timestamptz not null default now()
);

create table if not exists public.penyaluran_dana (
  id                 uuid primary key default gen_random_uuid(),
  pendaftaran_id     uuid not null references public.pendaftaran(id) on delete cascade,
  nominal            bigint,
  bukti_transfer_url text,
  status             status_penyaluran not null default 'pending',
  tanggal_pencairan  timestamptz,
  diverifikasi_oleh  uuid references public.profiles(id),   -- wabag (FIN-03 audit)
  created_at         timestamptz not null default now()
);

create table if not exists public.laporan_kendala (
  id             uuid primary key default gen_random_uuid(),
  mahasiswa_id   uuid not null references public.profiles(id) on delete cascade,
  beasiswa_id    uuid references public.beasiswa(id) on delete set null,
  judul_laporan  varchar(150) not null,
  deskripsi      text,
  kategori       varchar(30),  -- dokumen | status | dana | teknis | lainnya
  status         status_laporan not null default 'masuk',
  tanggapan_staff text,
  tanggal_lapor  timestamptz not null default now()
);

create table if not exists public.notifikasi (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  judul      varchar(150),
  pesan      text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- PROFILE BOOTSTRAP TRIGGER ----------
-- Matches the "Profile auto-created via trigger" comment in supabaseclient.js.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nim_nip, nama_lengkap, role, email, program_studi, ipk, nomor_whatsapp, alamat)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nim', new.raw_user_meta_data->>'nim_nip', new.id::text),
    coalesce(new.raw_user_meta_data->>'nama_lengkap', 'Tanpa Nama'),
    coalesce((new.raw_user_meta_data->>'role')::app_role, 'mahasiswa'),
    new.email,
    new.raw_user_meta_data->>'program_studi',
    nullif(new.raw_user_meta_data->>'ipk','')::numeric,
    new.raw_user_meta_data->>'nomor_whatsapp',
    new.raw_user_meta_data->>'alamat'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ROLE HELPER (SECURITY DEFINER avoids RLS recursion) ----------
create or replace function public.current_role()
returns app_role
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- ROW LEVEL SECURITY (least-privilege per role)
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.sponsors            enable row level security;
alter table public.beasiswa            enable row level security;
alter table public.pendaftaran         enable row level security;
alter table public.dokumen_pendaftaran enable row level security;
alter table public.hasil_seleksi       enable row level security;
alter table public.penerima_beasiswa   enable row level security;
alter table public.penyaluran_dana     enable row level security;
alter table public.laporan_kendala     enable row level security;
alter table public.notifikasi          enable row level security;

-- profiles: read own row; staff/kabag/wabag read all; update own row.
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.current_role() in ('staff','kabag','wabag'));
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid());

-- sponsors & beasiswa: readable by any authenticated user; writes = staff only.
create policy sponsors_read on public.sponsors
  for select using (auth.role() = 'authenticated');
create policy sponsors_write on public.sponsors
  for all using (public.current_role() = 'staff') with check (public.current_role() = 'staff');
create policy beasiswa_read on public.beasiswa
  for select using (auth.role() = 'authenticated');
create policy beasiswa_write on public.beasiswa
  for all using (public.current_role() = 'staff') with check (public.current_role() = 'staff');

-- pendaftaran: mahasiswa owns its rows; staff/kabag/wabag read all; staff update.
create policy pendaftaran_select on public.pendaftaran
  for select using (mahasiswa_id = auth.uid() or public.current_role() in ('staff','kabag','wabag'));
create policy pendaftaran_insert on public.pendaftaran
  for insert with check (mahasiswa_id = auth.uid() and public.current_role() = 'mahasiswa');
create policy pendaftaran_update_owner on public.pendaftaran
  for update using (mahasiswa_id = auth.uid() and status = 'menunggu_verifikasi');  -- D-10 editability
create policy pendaftaran_update_staff on public.pendaftaran
  for update using (public.current_role() = 'staff');

-- dokumen_pendaftaran: owner via parent pendaftaran; staff read.
create policy dokumen_owner on public.dokumen_pendaftaran
  for all using (
    exists (select 1 from public.pendaftaran p
            where p.id = pendaftaran_id and p.mahasiswa_id = auth.uid())
  ) with check (
    exists (select 1 from public.pendaftaran p
            where p.id = pendaftaran_id and p.mahasiswa_id = auth.uid())
  );
create policy dokumen_staff_read on public.dokumen_pendaftaran
  for select using (public.current_role() in ('staff','kabag'));

-- hasil_seleksi: staff write; mahasiswa read own; kabag read all (MGMT-02).
create policy hasil_staff_write on public.hasil_seleksi
  for all using (public.current_role() = 'staff') with check (public.current_role() = 'staff');
create policy hasil_read on public.hasil_seleksi
  for select using (
    public.current_role() in ('staff','kabag')
    or exists (select 1 from public.pendaftaran p
               where p.id = pendaftaran_id and p.mahasiswa_id = auth.uid())
  );

-- penerima_beasiswa (KD-3): staff proposes; kabag ACC (sets disahkan_oleh); all internal read.
create policy penerima_read on public.penerima_beasiswa
  for select using (
    public.current_role() in ('staff','kabag','wabag')
    or exists (select 1 from public.pendaftaran p
               where p.id = pendaftaran_id and p.mahasiswa_id = auth.uid())
  );
create policy penerima_staff_propose on public.penerima_beasiswa
  for insert with check (public.current_role() = 'staff');
create policy penerima_kabag_acc on public.penerima_beasiswa
  for update using (public.current_role() = 'kabag');

-- penyaluran_dana: staff record/upload (PAY-01); wabag verify/read (FIN-03); kabag read.
create policy penyaluran_staff_write on public.penyaluran_dana
  for all using (public.current_role() = 'staff') with check (public.current_role() = 'staff');
create policy penyaluran_wabag_update on public.penyaluran_dana
  for update using (public.current_role() = 'wabag');
create policy penyaluran_read on public.penyaluran_dana
  for select using (
    public.current_role() in ('staff','kabag','wabag')
    or exists (select 1 from public.pendaftaran p
               where p.id = pendaftaran_id and p.mahasiswa_id = auth.uid())
  );

-- laporan_kendala: mahasiswa owns; staff read/respond (COMP-02); kabag read (MGMT-03).
create policy laporan_owner_insert on public.laporan_kendala
  for insert with check (mahasiswa_id = auth.uid());
create policy laporan_select on public.laporan_kendala
  for select using (mahasiswa_id = auth.uid() or public.current_role() in ('staff','kabag'));
create policy laporan_staff_update on public.laporan_kendala
  for update using (public.current_role() = 'staff');

-- notifikasi: each user reads/updates only their own.
create policy notifikasi_owner on public.notifikasi
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS (run in dashboard or via API; policies below)
-- ============================================================
-- Create two PRIVATE buckets:
--   'dokumen-pendaftar'  -> applicant documents, path = <auth.uid()>/<file>
--   'bukti-transfer'     -> staff transfer proofs, path = <pendaftaran_id>/<file>
--
-- insert into storage.buckets (id, name, public) values
--   ('dokumen-pendaftar','dokumen-pendaftar', false),
--   ('bukti-transfer','bukti-transfer', false)
-- on conflict (id) do nothing;

-- Students write/read only their own folder; staff/kabag read all docs.
create policy dok_owner_rw on storage.objects
  for all using (
    bucket_id = 'dokumen-pendaftar'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'dokumen-pendaftar'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy dok_staff_read on storage.objects
  for select using (
    bucket_id = 'dokumen-pendaftar' and public.current_role() in ('staff','kabag')
  );

-- Transfer proofs: staff write; wabag/kabag read (audit FIN-03).
create policy bukti_staff_write on storage.objects
  for all using (
    bucket_id = 'bukti-transfer' and public.current_role() = 'staff'
  ) with check (
    bucket_id = 'bukti-transfer' and public.current_role() = 'staff'
  );
create policy bukti_finance_read on storage.objects
  for select using (
    bucket_id = 'bukti-transfer' and public.current_role() in ('wabag','kabag','staff')
  );

-- ============================================================
-- END
-- ============================================================
