# Schema Notes — CONFIRMED 2026-07-03

The canonical schema now lives in `DATABASE/migrations/0000_baseline.sql`, reconstructed from
a live `information_schema`/`pg_catalog` metadata query run in the Supabase SQL Editor
(`supabase db dump` wasn't usable in this environment — see `DATABASE/README.md`). This
supersedes the original code-archaeology reconstruction that lived in this file.

`DATABASE/legacy/beasiswa.sql` (MySQL) remains archived and irrelevant — see its own README.

## Corrections vs. the earlier code-archaeology reconstruction

Frontend file-header comments were a useful starting point but got some things wrong. Real
schema, confirmed:

- `beasiswa.kuota`, not `kuota_penerima`. `status` is a free-text `varchar` (default `'aktif'`),
  not an enum — other values in use are still unconfirmed.
- `sponsors.jenis_industri`, `kontak_perusahaan`, `alamat_perusahaan` — not `industri`,
  `kontak`, `alamat`.
- `pendaftaran` has **no** `catatan_staff` or `updated_at` column, despite
  `penetapanPenerima.js`'s header comment claiming otherwise. It also has no notes/reason
  column at all — `DATABASE/migrations/0001_add_pendaftaran_catatan_verifikasi.sql` adds one
  (`catatan_verifikasi`) because `backend/src/modules/verifikasi` needs it for VERI-01.
- Two separate document tables exist, not one: `dokumen_mahasiswa` (profile-level, `mahasiswa_id`
  FK) and `dokumen_pendaftaran` (application-level, `pendaftaran_id` FK). Only the latter was
  known before.
- `penerima_beasiswa` is a real table (previously an open question — `supabaseclient.js`
  referenced it but no frontend page corroborated it). It has its own `status_penerima` enum:
  `diusulkan | disahkan | dibatalkan`, plus `diusulkan_oleh`/`disahkan_oleh` (both FK to
  `profiles`) — this is the plenary-decision record for SELE-02/MGMT.

## Confirmed enums

| Enum | Values |
|---|---|
| `app_role` | `mahasiswa`, `staff`, `kabag`, `wabag` |
| `status_pendaftaran` | `menunggu_verifikasi`, `lolos_berkas`, `ditolak_berkas`, `wawancara`, `lolos_final`, `tidak_lolos_final` |
| `status_penerima` | `diusulkan`, `disahkan`, `dibatalkan` |
| `status_penyaluran` | `pending`, `sedang_diproses`, `sudah_cair` |
| `status_laporan` | `masuk`, `diproses`, `selesai` |

## Still open

- `beasiswa.status` and `dokumen_pendaftaran`/`dokumen_mahasiswa` have no per-document status
  column at all — document "verification" state today is inferred only from
  `pendaftaran.status`, not tracked per-file.
- RLS is enabled on every table with policies already in place (see
  `DATABASE/README.md` and `0000_baseline.sql`'s trailing comment block for names/commands).
  Their exact `USING`/`WITH CHECK` logic was not captured by the metadata query used — a
  follow-up query against `pg_policies`/`pg_policy` (`pg_get_expr(qual, ...)`) is needed for a
  full policy audit.
