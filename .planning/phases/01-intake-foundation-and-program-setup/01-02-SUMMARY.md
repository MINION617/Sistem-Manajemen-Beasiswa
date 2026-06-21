# 01-02 SUMMARY — Mahasiswa Vertical Slice (real Supabase)

**Plan:** 01-02 (wave 3) · **Executed:** 2026-06-22 · **Status:** code complete; needs live-data verification

## What was delivered
| File | Change |
|---|---|
| `profilMahasiswa.js` + `.html` | **Readiness gate built** (audit M2): missing profile/doc feedback, core-document upload to storage (`BK.api.uploadDokumenMahasiswa`), profile persists via `BK.api.updateProfile`, stats from real pendaftaran. Uses `BK.session`. New "Kesiapan Pendaftaran" card. |
| `daftarBeasiswa.js` + `.html` | Beasiswa loaded from Supabase (`BK.api.listBeasiswa`, kategori→visual map; seed kept as fallback). **Submit fixed (audit C4)**: apply blocked unless `isReadyToApply`; on submit creates a real `pendaftaran` (`menunggu_verifikasi`); duplicate prevented; `?id=` deep-link (audit N2). Search/filter preserved. |
| `pendaftaranSaya.js` + `.html` | Reads real pendaftaran via `BK.api.listMyPendaftaran`; maps rows into the existing card/timeline UI (timeline synthesized from status). **Submit→tracking now connected.** |
| `shared/api.js` | `listMyPendaftaran` select widened (kuota, kategori, tanggal_tutup, sponsor industri). |
| `DATABASE/supabase_schema.sql` + `migrations/2026-06-22-beasiswa-fields.sql` | beasiswa gains `tanggal_buka`, `tanggal_tutup`, `persyaratan[]`. |

## Verification done
- `node --check` passes on profilMahasiswa.js, daftarBeasiswa.js, pendaftaranSaya.js, api.js.
- Readiness logic unit-tested in 01-01 (`BK.rules`).

## Behavioral flow now (once live data + accounts exist)
1. Login → profil: complete fields + upload transkrip & berkas → readiness banner turns green.
2. daftarBeasiswa → "Daftar Sekarang" blocked with reasons until ready; then creates `pendaftaran` (menunggu_verifikasi); duplicate to same beasiswa rejected.
3. pendaftaranSaya shows the new application + status timeline.

## Requires (Supabase dashboard)
- Run `migrations/2026-06-22-add-dokumen-mahasiswa.sql` + `migrations/2026-06-22-beasiswa-fields.sql` (or the full updated `supabase_schema.sql`).
- Seed some `beasiswa` (+ sponsors) rows with `status='aktif'` so the catalog isn't empty.

## Notes / deferred
- Application-level document snapshots and a real timeline table are out of Phase-1 scope; per-application docs show empty in detail, timeline is synthesized from status. D-10 editability is enforced at the DB layer (RLS) and via duplicate-block.
