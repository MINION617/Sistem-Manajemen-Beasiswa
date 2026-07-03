# Schema Notes (reconstructed) — 2026-07-03

## What this is

There is no `pg_dump` of the live Supabase project in this repo. This document is a
**best-effort reconstruction** of the running schema, assembled entirely from:

- Table/column/enum documentation already written in frontend file headers (e.g.
  `frontend/STAFFADMIN/verifikasiPendaftaran/verifikasiPendaftar.js`,
  `frontend/STAFFADMIN/PencairanDana/pencairanDana.js`), which explicitly cross-reference
  each other ("SINKRON DENGAN MAHASISWA...").
- Query shapes in `backend/supabaseclient.js` (`.from('table').select(...)`).
- `backend/seed-users.js` (auth metadata → `profiles` columns).

**This is not authoritative.** It must be reconciled against a real `pg_dump` or the
Supabase dashboard schema visualizer as soon as dashboard access is available (see
Stabilization Checklist in `DATABASE/README.md`, item S2). Treat every enum/column below as
"high confidence, unverified" unless noted otherwise.

It supersedes `DATABASE/legacy/beasiswa.sql`, which is a stale MySQL/phpMyAdmin dump that does
**not** match the running Postgres/Supabase model (different table names, integer PKs instead
of UUIDs, no `sponsors`/`dokumen_pendaftaran`/`hasil_seleksi`/`penyaluran_dana`/
`laporan_kendala`/`notifikasi` tables at all). Kept only for historical reference.

## Tables

### `profiles`
Source: `backend/seed-users.js`, `backend/supabaseclient.js`, all page headers.

| Column | Notes |
|---|---|
| `id` | uuid, = `auth.users.id` |
| `nama_lengkap` | |
| `nim_nip` | NIM (mahasiswa) or NIP (staff/kabag/wabag); login resolves NIM → email |
| `role` | enum: `mahasiswa` \| `staff` \| `kabag` \| `wabag` |
| `program_studi` | mahasiswa only |
| `ipk` | mahasiswa only |
| `jabatan`, `unit` | staff/kabag/wabag only |
| `no_rekening` | referenced by `PencairanDana/pencairanDana.js` |
| `nomor_whatsapp`, `alamat` | from seed script |

### `sponsors`
Source: `STAFFADMIN/sponsorDanBeasiswa/manajemenSponsorBeasiswa.js`.

`id, nama_perusahaan, industri, tagline, tentang, narahubung, kontak, email, alamat, warna, is_aktif`

### `beasiswa`
Source: same file + `daftarBeasiswa.js`.

`id, sponsor_id (FK -> sponsors), nama_program, deskripsi, nominal_dana, kuota_penerima, tanggal_buka, tanggal_tutup, kategori, status`

- `kategori` observed values: `prestasi`, `riset`, `industri`, `afirmasi` (not confirmed exhaustive).
- `status` enum values not directly observed in any header comment — **unconfirmed**, likely
  `dibuka` / `ditutup` or similar; confirm in S2.

### `pendaftaran`
Source: `verifikasiPendaftar.js`, `penetapanPenerima.js`, `pendaftaranSaya.js` (all three
explicitly state they share the same enum — this is the most trustworthy cross-checked finding
in this document).

`id, mahasiswa_id (FK -> profiles), beasiswa_id (FK -> beasiswa), status, tanggal_daftar, catatan_staff (nullable), updated_at`

**`status` enum (high confidence, corroborated across 3 files):**
```
menunggu_verifikasi -> lolos_berkas | ditolak_berkas -> wawancara -> lolos_final | tidak_lolos_final
```
`catatan_staff` doubles as the staff-facing note field at every stage (verification remarks,
interview notes, final decision notes) — there is no separate "rejection reason" column.

### `dokumen_pendaftaran`
Source: `verifikasiPendaftar.js`.

`id, pendaftaran_id (FK -> pendaftaran), jenis_dokumen, file_url, status`

`status` values seen only in dummy/demo data (`ada`, `missing`) — **low confidence**, likely a
presence flag rather than a verification-workflow enum. Confirm in S2.

### `hasil_seleksi`
Source: `inputHasilSeleksi.js`, `penetapanPenerima.js`.

`pendaftaran_id (FK -> pendaftaran), nilai_tes, nilai_wawancara, catatan_staff, jadwal_wawancara`

### `penyaluran_dana`
Source: `PencairanDana/pencairanDana.js` (explicitly cross-references `penerimaBeasiswa.js`).

`id, pendaftaran_id (FK -> pendaftaran), mahasiswa_id (FK -> profiles), nominal_transfer, tanggal_transfer, periode_bulan, no_rekening_tujuan, bank_tujuan, no_referensi, bukti_transfer_url, catatan, status, created_at`

**`status` enum (corroborated across 2 files):** `pending | sedang_diproses | sudah_cair`

### `laporan_kendala`
Source: `pusatLaporanKendala.js` (explicitly cross-references `laporanKendala.js`).

`id, mahasiswa_id (FK -> profiles), beasiswa_id (FK -> beasiswa), judul_laporan, deskripsi, kategori, status, tanggapan_staff, tanggal_lapor, tanggal_selesai`

**`status` enum (corroborated across 2 files):** `masuk | diproses | selesai`

### `notifikasi`
Source: `backend/supabaseclient.js` only (`getUserNotifikasi`, `markNotifikasiAsRead`,
`subscribeToNotifikasi`); no frontend page is wired to it yet (`notifikasi.js` still uses dummy
data).

`id, user_id (FK -> profiles), is_read, created_at` — likely also a `title`/`message`/`type`
column given the UI's notification cards, but no source confirms exact names. **Unconfirmed.**

## Open questions for S2 (real schema dump)

1. Exact `beasiswa.status` and `dokumen_pendaftaran.status` enum values.
2. Full `notifikasi` column list (message/title/type/link fields).
3. Whether `backend/supabaseclient.js`'s `penerima_beasiswa` table (referenced in
   `getUserPendaftaran`'s join) actually exists — it appears nowhere in any frontend header.
   Possibly dead/aspirational code, or `pendaftaran.status = 'lolos_final'` is used as the
   "is a recipient" signal instead of a dedicated table. Needs verification.
4. Foreign key `ON DELETE` behavior (cascade vs. restrict) for every relationship above.
