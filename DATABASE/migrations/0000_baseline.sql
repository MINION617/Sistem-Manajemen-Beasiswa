-- ============================================================================
-- BASELINE SCHEMA — reconstructed from a live metadata query
-- ============================================================================
-- Captured 2026-07-03 by querying information_schema/pg_catalog in the
-- Supabase SQL Editor (supabase db dump was not usable in this environment —
-- see DATABASE/README.md). This is NOT a pg_dump; it is DDL re-derived from
-- exact column types, defaults, enum values, and foreign keys read back from
-- the live database, so it should match structurally, but privileges,
-- indexes beyond PKs/FKs, triggers, and functions are NOT captured here.
--
-- This file is a reference snapshot, not meant to be run — the objects
-- already exist. Future schema changes should be added as new numbered
-- migration files (0001_..., 0002_...) applied via the Supabase CLI/SQL
-- editor and recorded here.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type app_role as enum ('mahasiswa', 'staff', 'kabag', 'wabag');

create type status_pendaftaran as enum (
  'menunggu_verifikasi', 'lolos_berkas', 'ditolak_berkas',
  'wawancara', 'lolos_final', 'tidak_lolos_final'
);

create type status_penerima as enum ('diusulkan', 'disahkan', 'dibatalkan');

create type status_penyaluran as enum ('pending', 'sedang_diproses', 'sudah_cair');

create type status_laporan as enum ('masuk', 'diproses', 'selesai');

-- ---------------------------------------------------------------------------
-- profiles (id = auth.users.id)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id             uuid primary key,
  nim_nip        varchar not null,
  nama_lengkap   varchar not null,
  role           app_role not null default 'mahasiswa',
  email          varchar,
  program_studi  varchar,
  ipk            numeric,
  nomor_whatsapp varchar,
  alamat         text,
  jabatan        varchar,
  unit           varchar,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sponsors
-- ---------------------------------------------------------------------------
create table public.sponsors (
  id                 uuid primary key default gen_random_uuid(),
  nama_perusahaan    varchar not null,
  kontak_perusahaan  varchar,
  alamat_perusahaan  text,
  jenis_industri     varchar,
  created_at         timestamptz not null default now(),
  tagline            text,
  tentang            text,
  narahubung         varchar,
  email              varchar,
  warna              varchar,
  is_aktif           boolean not null default true
);

-- ---------------------------------------------------------------------------
-- beasiswa
-- ---------------------------------------------------------------------------
create table public.beasiswa (
  id              uuid primary key default gen_random_uuid(),
  sponsor_id      uuid references public.sponsors(id),
  nama_program    varchar not null,
  tahun_akademik  varchar,
  deskripsi       text,
  kategori        varchar,
  nominal_dana    bigint,
  kuota           integer,
  status          varchar not null default 'aktif',
  created_at      timestamptz not null default now(),
  tanggal_buka    date,
  tanggal_tutup   date,
  persyaratan     text[]
);
-- NOTE: `status` is free-text (varchar), not an enum. Only the default
-- ('aktif') is confirmed; other values in use are unconfirmed.

-- ---------------------------------------------------------------------------
-- pendaftaran
-- ---------------------------------------------------------------------------
create table public.pendaftaran (
  id             uuid primary key default gen_random_uuid(),
  mahasiswa_id   uuid not null references public.profiles(id),
  beasiswa_id    uuid not null references public.beasiswa(id),
  status         status_pendaftaran not null default 'menunggu_verifikasi',
  tanggal_daftar timestamptz not null default now(),
  created_at     timestamptz not null default now()
);
-- NOTE: no notes/reason column exists here (no catatan_staff, no
-- updated_at) despite some frontend header comments implying otherwise.
-- See migrations/0001_add_pendaftaran_catatan_verifikasi.sql.

-- ---------------------------------------------------------------------------
-- dokumen_mahasiswa (profile-level documents — PROF-01/DOCS-01)
-- ---------------------------------------------------------------------------
create table public.dokumen_mahasiswa (
  id            uuid primary key default gen_random_uuid(),
  mahasiswa_id  uuid not null references public.profiles(id),
  jenis_dokumen varchar not null,
  file_path     text,
  file_url      text,
  ukuran_file   bigint,
  uploaded_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- dokumen_pendaftaran (application-level documents — DOCS-01, VERI-01)
-- ---------------------------------------------------------------------------
create table public.dokumen_pendaftaran (
  id             uuid primary key default gen_random_uuid(),
  pendaftaran_id uuid not null references public.pendaftaran(id),
  jenis_dokumen  varchar not null,
  file_path      text,
  file_url       text,
  ukuran_file    bigint,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- hasil_seleksi (SELE-01)
-- ---------------------------------------------------------------------------
create table public.hasil_seleksi (
  id                uuid primary key default gen_random_uuid(),
  pendaftaran_id    uuid not null references public.pendaftaran(id),
  nilai_tes         numeric,
  nilai_wawancara   numeric,
  catatan_prestasi  text,
  catatan_staff     text,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- penerima_beasiswa (SELE-02, MGMT plenary decision)
-- ---------------------------------------------------------------------------
create table public.penerima_beasiswa (
  id              uuid primary key default gen_random_uuid(),
  pendaftaran_id  uuid not null references public.pendaftaran(id),
  status          status_penerima not null default 'diusulkan',
  diusulkan_oleh  uuid references public.profiles(id),
  tanggal_usul    timestamptz default now(),
  disahkan_oleh   uuid references public.profiles(id),
  tanggal_acc     timestamptz,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- penyaluran_dana (PAY-01/02, FIN-01/02/03)
-- ---------------------------------------------------------------------------
create table public.penyaluran_dana (
  id                  uuid primary key default gen_random_uuid(),
  pendaftaran_id      uuid not null references public.pendaftaran(id),
  nominal             bigint,
  bukti_transfer_url  text,
  status              status_penyaluran not null default 'pending',
  tanggal_pencairan   timestamptz,
  diverifikasi_oleh   uuid references public.profiles(id),
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- laporan_kendala (COMP-01/02)
-- ---------------------------------------------------------------------------
create table public.laporan_kendala (
  id               uuid primary key default gen_random_uuid(),
  mahasiswa_id     uuid not null references public.profiles(id),
  beasiswa_id      uuid references public.beasiswa(id),
  judul_laporan    varchar not null,
  deskripsi        text,
  kategori         varchar,
  status           status_laporan not null default 'masuk',
  tanggapan_staff  text,
  tanggal_lapor    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- notifikasi (NOTF-01)
-- ---------------------------------------------------------------------------
create table public.notifikasi (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id),
  judul      varchar,
  pesan      text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: enabled on every table above (confirmed live). Policies already
-- exist per table (confirmed live, names/commands below) but their exact
-- USING/WITH CHECK logic was not captured by the metadata query used here
-- — pull `pg_get_expr(qual, ...)` / `pg_get_expr(with_check, ...)` from
-- pg_policy for a full audit if/when that's needed.
-- ---------------------------------------------------------------------------
-- sponsors:            sponsors_read (SELECT), sponsors_write (ALL)
-- profiles:            profiles_select_self (SELECT), profiles_update_self (UPDATE)
-- pendaftaran:         pendaftaran_insert (INSERT), pendaftaran_select (SELECT),
--                      pendaftaran_update_owner (UPDATE), pendaftaran_update_staff (UPDATE)
-- dokumen_pendaftaran: dokumen_owner (ALL), dokumen_staff_read (SELECT)
-- beasiswa:            beasiswa_read (SELECT), beasiswa_write (ALL)
-- hasil_seleksi:       hasil_read (SELECT), hasil_staff_write (ALL)
-- penerima_beasiswa:   penerima_kabag_acc (UPDATE), penerima_read (SELECT),
--                      penerima_staff_propose (INSERT)
-- penyaluran_dana:     penyaluran_read (SELECT), penyaluran_staff_write (ALL),
--                      penyaluran_wabag_update (UPDATE)
-- laporan_kendala:     laporan_owner_insert (INSERT), laporan_select (SELECT),
--                      laporan_staff_update (UPDATE)
-- notifikasi:          notifikasi_owner (ALL)
-- dokumen_mahasiswa:   dokmhs_owner (ALL), dokmhs_staff_read (SELECT)
