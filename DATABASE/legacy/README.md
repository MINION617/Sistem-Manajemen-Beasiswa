# Legacy schema (archived)

`beasiswa.sql` is a MySQL/phpMyAdmin dump from an early design iteration. It does **not**
match the system that is actually running today:

- MySQL/InnoDB, not Postgres.
- Integer primary keys (`id_beasiswa`, `id_mahasiswa`, ...), not UUIDs.
- Only 5 tables (`administrasi`, `beasiswa`, `mahasiswa`, `pendaftaran`, `sponsor`) — missing
  `sponsors` (note plural), `dokumen_pendaftaran`, `hasil_seleksi`, `penyaluran_dana`,
  `laporan_kendala`, `notifikasi`, and `profiles`, all of which the live app depends on today
  (see `backend/supabaseclient.js` and `DATABASE/SCHEMA_NOTES.md`).

Kept for historical reference only. **Do not use this file to design new backend code** — use
`DATABASE/SCHEMA_NOTES.md` (reconstructed from the current frontend/backend) until a real
Supabase schema dump replaces it.
