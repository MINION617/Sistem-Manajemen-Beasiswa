# 01-03 SUMMARY — Admin Master-Data Slice (real Supabase)

**Plan:** 01-03 (wave 3) · **Executed:** 2026-06-22 · **Status:** code complete; needs live-data verification

## What was delivered
| File | Change |
|---|---|
| `STAFFADMIN/sponsorDanBeasiswa/manajemenSponsorBeasiswa.js` | Rewired from in-memory arrays to **Supabase CRUD** via `BK.api`. Active `requireRole('staff')` guard. Seed arrays renamed `*Seed` (fallback only). New `loadData()` + DB↔UI mappers. create/update/delete now call `BK.api.createSponsor/updateSponsor/deleteSponsor` and `…Beasiswa`, then reload. Logout → `BK.session.clearSession()`. |
| `STAFFADMIN/dashboardStaffAdmin.js` | Active `requireRole('staff')` guard; removed inline SUPABASE placeholders; logout → `clearSession()`. (Summary stats left as-is — not over-built.) |
| `…/manajemenSponsorBeasiswa.html`, `dashboardStaffAdmin.html` | Shared layer script tags added (correct depth: `../../shared/` and `../shared/`). |
| `FRONTEND/SPONSOR/sponsor.{html,js,css}` | **Removed** (`git rm`) — 0-byte, unreferenced (audit C3). |
| `DATABASE/supabase_schema.sql` + `migrations/2026-06-22-sponsor-fields.sql` | sponsors gains `tagline, tentang, narahubung, email, warna, is_aktif`. |

## Verification done
- `node --check` PASSED for `manajemenSponsorBeasiswa.js` and `dashboardStaffAdmin.js`.
- `FRONTEND/SPONSOR/` confirmed removed.

## Mapping decisions (UI shape ≠ DB columns)
- **sponsors:** UI `industri/kontak/alamat` ↔ DB `jenis_industri/kontak_perusahaan/alamat_perusahaan`. UI `inisial` derived from name (not stored); `jumlah_beasiswa`/`total_kuota` derived from the beasiswa list. The richer UI fields (`tagline/tentang/narahubung/email/warna/is_aktif`) are persisted via the new sponsor columns (migration above).
- **beasiswa:** UI `kuota_penerima` ↔ DB `kuota`; UI status `buka/tutup` ↔ DB `aktif/nonaktif` (so the mahasiswa catalog, which filters `status='aktif'`, stays consistent). `icon/iconColor/bg` are presentation-only, derived per kategori (not stored).

## Assumptions / notes
- **Extended the sponsors schema** beyond the 4-column base (added 6 columns) so the existing rich admin/profile UI persists fully — mirrors the beasiswa extension in 01-02. A separate `2026-06-22-sponsor-fields.sql` migration is provided; the live DB must run it.
- `delay()` and `updateSponsorKuota()` remain defined but unused (harmless dead code).
- `profilPerusahaanBeasiswa` (mahasiswa company profile) still uses its own local data — out of 01-03 scope; wire in a later phase.

## Requires (Supabase dashboard) before verification
- Run `migrations/2026-06-22-sponsor-fields.sql` (+ the beasiswa-fields + dokumen-mahasiswa migrations from 01-01/01-02) or the full updated `supabase_schema.sql`.
- Sign in as a `staff`-role account to exercise CRUD; created beasiswa with status `aktif` appear in the mahasiswa `daftarBeasiswa` catalog.
