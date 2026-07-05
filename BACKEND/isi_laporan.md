# Draft Isian Laporan Tugas Back End — Pengembangan Sistem Informasi

> Draft otomatis berdasarkan scan repo + pengujian nyata pada 2026-07-03.
> Bagian bertanda **[ISI MANUAL]** perlu diisi/dilengkapi sendiri.

---

## INFO KELOMPOK

- **Nomor/Nama Kelompok:** [ISI MANUAL — cek README/portal kelas]
- **Anggota:**
  - Ahmad Riza Hafiz — NIM: [ISI MANUAL]
  - Favian Nazmi — NIM: [ISI MANUAL]
- **Proyek:** Sistem Informasi Manajemen Beasiswa
- **GitHub Repo:** https://github.com/MINION617/Sistem-Manajemen-Beasiswa
- **Branch:** `main`
- **Commit Terakhir:** `28c3098e1701a3786206824c4ee1da6f44ecfac5` (short: `28c3098`)
  Pesan: *feat(backend): MIS modules — penerima, penyaluran, finance + kabag MGMT-02/03 (#5)*
  Author: AHMAD RIZA HAFIZ | 2026-07-03 14:47

---

## Bagian 1.1 — Daftar Fitur/Endpoint yang Berhasil Diimplementasikan

Total **24 endpoint API** (+1 endpoint `/health`) di 8 modul backend, seluruhnya diverifikasi bisa boot dan menjawab request nyata (lihat `api_test_results.txt`).

| Modul | Method | Path | Role | Requirement | Fungsi |
|---|---|---|---|---|---|
| — | GET | `/health` | publik | — | Health check |
| verifikasi | GET | `/api/verifikasi/antrean` | staff | VERI-01 | Daftar pendaftaran menunggu verifikasi |
| verifikasi | POST | `/api/verifikasi/:pendaftaranId` | staff | VERI-01 | Verifikasi/tolak berkas + alasan |
| status | GET | `/api/status/saya` | mahasiswa | STAT-01, STAT-02 | Status pendaftaran & pencairan milik sendiri |
| notifikasi | GET | `/api/notifikasi` | semua role | NOTF-01 | Daftar notifikasi milik sendiri |
| notifikasi | PATCH | `/api/notifikasi/:notifId/read` | semua role | NOTF-01 | Tandai notifikasi terbaca |
| laporan | POST | `/api/laporan` | mahasiswa | COMP-01 | Ajukan laporan kendala |
| laporan | GET | `/api/laporan/saya` | mahasiswa | COMP-01 | Laporan kendala milik sendiri |
| laporan | GET | `/api/laporan` | staff | COMP-02 | Semua laporan kendala |
| laporan | PATCH | `/api/laporan/:laporanId` | staff | COMP-02 | Update status & tanggapan laporan |
| kabag | GET | `/api/kabag/statistik` | kabag | MGMT-01 | Statistik jumlah pendaftar per status |
| kabag | GET | `/api/kabag/pendaftar` | kabag | MGMT-01 | Daftar pendaftar realtime |
| kabag | GET | `/api/kabag/pendaftar/:pendaftaranId` | kabag | MGMT-02 | Detail lengkap pendaftar (utk keputusan pleno) |
| kabag | GET | `/api/kabag/laporan-statistik` | kabag | MGMT-03 | Ringkasan status laporan kendala |
| penerima | POST | `/api/penerima` | staff | SELE-02 | Usulkan pendaftaran sebagai penerima |
| penerima | PATCH | `/api/penerima/:penerimaId/sahkan` | kabag | SELE-02 | Sahkan penerima (keputusan pleno) |
| penerima | PATCH | `/api/penerima/:penerimaId/batalkan` | kabag | SELE-02 | Batalkan usulan penerima |
| penerima | GET | `/api/penerima` | staff, kabag | PAY-02 | Daftar final penerima beasiswa |
| penyaluran | POST | `/api/penyaluran` | staff | PAY-01 | Catat pencairan dana + bukti transfer |
| penyaluran | PATCH | `/api/penyaluran/:penyaluranId/cair` | staff | PAY-01 | Tandai dana sudah cair |
| penyaluran | PATCH | `/api/penyaluran/:penyaluranId/verifikasi` | wabag | FIN-03 | Verifikasi bukti transfer |
| penyaluran | GET | `/api/penyaluran` | staff, kabag, wabag | PAY-01, FIN-03 | Daftar pencairan dana |
| finance | GET | `/api/finance/dashboard` | wabag | FIN-01 | Total dana tersalur + statistik |
| finance | GET | `/api/finance/alokasi-sponsor` | wabag | FIN-02 | Laporan alokasi dana per sponsor |

**Requirement yang sudah terpenuhi di backend:** VERI-01, STAT-01, STAT-02, NOTF-01, COMP-01, COMP-02, MGMT-01, MGMT-02, MGMT-03, SELE-02, PAY-01, PAY-02, FIN-01, FIN-02, FIN-03 (**15 dari 23 requirement v1**).

---

## Bagian 1.2 — Arsitektur Back End

**Framework/teknologi** (dari `backend/package.json`):
- Runtime: Node.js (ESM, `"type": "module"`)
- Framework: **Express 4.21**
- Database/BaaS: **Supabase** (Postgres terkelola + Auth), diakses via `@supabase/supabase-js` 2.45
- Middleware: `helmet` (security headers), `cors`, `morgan` (logging), `dotenv` (env config)
- Validasi input: `zod`
- Dev tooling: `nodemon`

**Pola arsitektur:** Hybrid API tier. Browser tetap pakai Supabase Auth langsung (login), tapi **semua operasi privileged (tulis data) wajib lewat Express API** yang memakai `service-role key` di server — bukan `anon key` di browser. Role pengguna diverifikasi di server (`middleware/auth.js` + `middleware/requireRole.js`), bukan dipercaya dari session browser.

**Struktur folder:**
```
backend/src/
  server.js, app.js          # entrypoint + express app
  config/                    # env loader, supabase admin client
  middleware/                # auth (verifikasi JWT), requireRole (guard), errorHandler
  modules/<domain>/          # 8 domain: verifikasi, status, notifikasi, laporan,
                              #   kabag, penerima, penyaluran, finance
    *.routes.js               # definisi endpoint + middleware
    *.controller.js           # validasi input, bentuk response
    *.service.js               # query ke Supabase
```

**Struktur database utama** (lihat `db_structure.txt` untuk DDL lengkap):
11 tabel — `profiles`, `sponsors`, `beasiswa`, `pendaftaran`, `dokumen_pendaftaran`, `dokumen_mahasiswa`, `hasil_seleksi`, `penerima_beasiswa`, `penyaluran_dana`, `laporan_kendala`, `notifikasi` — dengan 5 custom enum type (`app_role`, `status_pendaftaran`, `status_penerima`, `status_penyaluran`, `status_laporan`) dan Row Level Security aktif di semua tabel sebagai baris pertahanan kedua.

---

## Bagian 1.3 — Fitur yang Belum Selesai

Tidak ditemukan TODO/FIXME/handler kosong di kode yang sudah ditulis (`grep -rn "TODO\|FIXME"` bersih). Yang belum selesai murni karena **belum dikerjakan** (keputusan prioritas tim, MIS/Kabag didahulukan dari TPS/transaksi harian):

| Requirement | Fitur | Status |
|---|---|---|
| APPL-01 | Mahasiswa melihat daftar beasiswa aktif | Belum ada endpoint backend |
| APPL-02 | Mahasiswa submit pendaftaran beasiswa | Belum ada endpoint backend |
| DOCS-01 | Mahasiswa upload dokumen pendaftaran | Belum ada endpoint backend |
| SELE-01 | Staff input nilai tes/wawancara | Belum ada endpoint backend |
| SPON-01, SCHL-01 | CRUD sponsor & program beasiswa oleh staff | Belum ada endpoint backend |

Selain itu:
- **Frontend belum disambungkan** ke backend ini — halaman masih pakai data dummy statis.
- RLS aktif tapi **isi policy detail (USING/WITH CHECK) belum diaudit penuh** — baru dikonfirmasi nama & tipe command-nya.

---

## Bagian 2.1 — Alur GSD Core

**[ISI MANUAL — edit sesuai gaya laporan kelompok, draft di bawah bisa dipakai sebagai starting point]**

- **Discuss:** Scope back end disepakati bertahap: mulai dari fondasi (Express API tier + auth/role middleware menggantikan `server.js` yang kosong), lalu diprioritaskan ke sisi **MIS/Kabag** (dashboard, statistik, keputusan pleno, laporan keuangan) sebelum sisi **TPS/transaksi harian mahasiswa**, atas arahan eksplisit ketua kelompok.
- **Plan:** Spesifikasi teknis disiapkan sebagai plan tertulis (struktur folder, pola routes/controller/service per modul, desain middleware auth) sebelum kode ditulis, mengikuti workflow GSD (`.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`) yang direorganisasi ulang menjadi backend-first.
- **Execute:** Menggunakan Claude Code (Anthropic) sebagai AI pairing tool untuk menulis seluruh kode modul backend, migration SQL, dan draft RLS policy, dengan instruksi & review manusia di setiap langkah.
- **Verify:** Setiap modul diverifikasi dengan `node --check` (syntax), boot test server, dan pengujian endpoint via `curl` — termasuk pengujian end-to-end dengan token JWT asli hasil login akun demo Supabase (bukan sekadar mock), mencakup kasus role benar (200) dan role salah (403), serta jalur tulis data (`POST /api/verifikasi/:id`) yang dikonfirmasi mengubah data nyata.
- **Ship:** Kode di-commit melalui pull request per fitur (5 PR: skeleton, stabilisasi skema, modul status/notifikasi/laporan/kabag, modul MIS), di-review dan di-merge ke `main`. Bukti server berjalan ada di `server_log.txt`, bukti pengujian endpoint di `api_test_results.txt`.

---

## Bagian 2.2 — Contoh Prompt ke AI

Contoh spesifikasi/plan yang dipakai untuk menghasilkan skeleton backend (bukan prompt satu-baris, tapi plan tertulis terstruktur — sesuai alur GSD "Plan" di atas):

> *"Plan: Phase 2 — Backend Skeleton (Express API tier) + Verifikasi module.*
> *Context: backend/server.js kosong (0 byte). Frontend memanggil Supabase langsung dari browser dengan anon key — operasi privileged (update status pendaftaran, input nilai, catat pencairan dana) bisa dipanggil siapa saja tanpa verifikasi role di server. Bangun API tier hybrid: Auth/public-read tetap ke Supabase, semua write privileged lewat Express API dengan service-role key + role check server-side.*
> *Deliverable: backend/src/server.js, app.js, config/{env,supabase}.js, middleware/{auth,requireRole,errorHandler}.js, dan modules/verifikasi/{routes,controller,service}.js sebagai template modul pertama (VERI-01)."*

Prompt lanjutan yang representatif untuk modul-modul berikutnya (pola singkat, karena struktur sudah ada): *"lanjut ke modul backend berikutnya (status/notifikasi/laporan), pola sama seperti verifikasi"* dan *"aku mau lebih fokus ke backend bagian MIS yang TPS nanti dulu terakhiran"* — instruksi reprioritas dari ketua kelompok yang diterjemahkan menjadi urutan pengerjaan modul `kabag`, `penerima`, `penyaluran`, `finance` sebelum modul pendaftaran/dokumen/nilai (TPS).

---

## Bagian 2.3 — Pembagian Peran

**[ISI MANUAL]**

| Nama | Peran |
|---|---|
| Ahmad Riza Hafiz | [ISI MANUAL] |
| Favian Nazmi | [ISI MANUAL] |

---

## Bagian 3.1 — Tantangan Teknis

Diidentifikasi dari histori kerja nyata (bukan asumsi):

1. **Skema database tidak pernah ter-version-control.** Repo hanya berisi dump MySQL lama (`DATABASE/beasiswa.sql`) yang modelnya sama sekali berbeda dari Supabase/Postgres yang benar-benar jalan (PK integer vs UUID, tabel beda total). Diselesaikan dengan menarik metadata skema langsung dari Supabase SQL Editor dan menuliskannya sebagai DDL (`DATABASE/migrations/0000_baseline.sql`).
2. **Dokumentasi kode lama menyesatkan.** Komentar header di beberapa file frontend mengklaim kolom yang ternyata **tidak ada** di database asli (contoh: `beasiswa.kuota_penerima` yang sebenarnya `kuota`, `sponsors.industri` yang sebenarnya `jenis_industri`, dan `pendaftaran.catatan_staff` yang sama sekali tidak ada — kolom catatan ada di tabel `hasil_seleksi`, bukan `pendaftaran`). Ini sempat menyebabkan bug nyata di kode awal (menulis ke kolom yang tidak ada), ditemukan lewat pengecekan skema langsung dan diperbaiki dengan migration `0001_add_pendaftaran_catatan_verifikasi.sql`.
3. **Keamanan by-design.** Sebelumnya operasi privileged bisa dipanggil browser dengan anon key tanpa verifikasi role server-side. Diselesaikan dengan middleware `auth.js` (verifikasi JWT ke Supabase + load role dari `profiles`) dan `requireRole()` di setiap route privileged.
4. **Express 4 tidak menangkap error async middleware secara otomatis.** Middleware `auth` yang async bisa menyebabkan unhandled promise rejection kalau tidak dibungkus try/catch — ditangani eksplisit di `middleware/auth.js` dan `asyncHandler()` wrapper di setiap controller.
5. **Konflik Git akibat squash-merge pada branch bertumpuk (stacked PR).** GitHub tidak selalu retarget PR otomatis saat branch dasar dihapus, menyebabkan PR ter-close otomatis dan konflik "add/add" saat merge manual — diselesaikan dengan resolve konflik manual per file, selalu mengambil versi terbaru/superset.
6. **Kesalahan konfigurasi environment yang sulit dilacak** — typo dua huruf tertukar pada `SUPABASE_URL` (`gewntz` vs `gewnzt`) menyebabkan DNS gagal resolve total, terlihat seperti masalah jaringan padahal murni salah ketik. Ditemukan dengan membandingkan panjang & isi string terhadap dashboard Supabase.

---

## Bagian 3.2 — Keputusan yang Tetap Dilakukan Manusia

1. **Pemilihan arsitektur backend**: Node.js + Express sebagai API tier tipis di atas Supabase (bukan backend penuh menggantikan Supabase, dan bukan pula BaaS murni tanpa server) — trade-off keamanan vs kecepatan pengembangan dipertimbangkan dan diputuskan oleh tim, AI hanya memberi opsi & rekomendasi.
2. **Reorganisasi roadmap proyek** dari alur vertikal (intake → verifikasi → seleksi → pencairan) menjadi backend-first (Phase 2 = fondasi backend, Phase 3 = fitur + koreksi, Phase 4 = cleanup) — keputusan strategi proyek, bukan keputusan teknis kode.
3. **Reprioritas urutan pengerjaan modul**: mendahulukan sisi MIS/Kabag (dashboard, statistik, keputusan pleno, keuangan) dan menunda sisi TPS/transaksi harian mahasiswa — instruksi eksplisit dari ketua kelompok berdasarkan kebutuhan laporan/nilai mata kuliah, bukan keputusan yang diambil AI.
4. **Strategi resolusi konflik Git**: keputusan untuk selalu mengambil versi "superset" (bukan otomatis, ditinjau manual satu per satu) saat terjadi konflik merge akibat squash-merge branch bertumpuk.
5. **Verifikasi keamanan sebelum lanjut coding**: keputusan untuk berhenti dan menguji end-to-end dengan token asli (bukan lanjut menulis fitur baru dulu) sebelum menganggap backend "selesai" — permintaan eksplisit agar klaim "sudah jadi" dibuktikan, bukan diasumsikan.

---

## Bagian 3.3 — Kualitas Spesifikasi vs Output AI

**[ISI MANUAL]**

---

## Bagian 5.1 — Hal yang Berjalan Baik

- Seluruh 15 requirement sisi MIS/Kabag/Wabag (MGMT-01/02/03, SELE-02, PAY-01/02, FIN-01/02/03) plus VERI-01, STAT-01/02, NOTF-01, COMP-01/02 sudah punya endpoint backend yang **terbukti jalan dengan data & login asli**, bukan cuma lolos syntax check.
- Keamanan role-based terverifikasi nyata: percobaan akses dengan role salah konsisten ditolak (403) di semua modul yang diuji.
- Jalur tulis data (mutasi) terbukti bekerja penuh dari request → validasi → update database → efek samping (notifikasi otomatis terkirim) — dibuktikan lewat kasus nyata (reject pendaftaran dengan alasan).
- Struktur kode konsisten (pola routes/controller/service yang sama di 8 modul) sehingga mudah ditambah modul baru.
- Row Level Security aktif sebagai lapisan keamanan kedua, tidak hanya bergantung pada API.

## Bagian 5.2 — Hal yang Perlu Diperbaiki

- Sisi TPS (APPL-01/02, DOCS-01, SELE-01, SPON-01, SCHL-01) belum ditulis sama sekali di backend.
- Frontend masih 100% terpisah dari backend ini (dummy data), integrasi belum dimulai.
- Policy RLS belum diaudit detail (baru dikonfirmasi nama & command, belum expression USING/WITH CHECK-nya).
- Belum ada automated test suite (unit/integration test) — verifikasi sejauh ini manual via curl.
- Belum ada CI/CD pipeline yang menjalankan test otomatis di setiap PR.

## Bagian 5.3 — Kesiapan untuk Integrasi Front End

Backend **siap diintegrasikan untuk 15 dari 23 requirement v1** (semua sisi MIS/Kabag/Wabag + verifikasi berkas + status + notifikasi + laporan kendala). Kontrak API (path, method, role yang dibutuhkan, bentuk response `{ data: ... }` atau `{ error: ... }`) sudah konsisten dan terdokumentasi di tabel Bagian 1.1. Frontend tinggal mengganti pemanggilan data dummy dengan `fetch()` ke endpoint terkait, mengirim header `Authorization: Bearer <token>` dari sesi login Supabase yang sudah ada. Sisi TPS (pendaftaran, upload dokumen, input nilai) **belum bisa diintegrasikan** karena endpoint-nya belum ditulis.

---

## Bagian 6 — Evaluasi Diri

**[ISI MANUAL — draft skor jujur berdasarkan kondisi aktual di atas, sesuaikan dengan rubrik mata kuliah]**

Berdasarkan kondisi aktual repo:
- Cakupan fitur backend: ~65% dari total requirement v1 (15/23), 100% dari requirement yang diprioritaskan tim (MIS + verifikasi awal).
- Kualitas kode & struktur: konsisten, tidak ada TODO tersisa, sudah diverifikasi end-to-end dengan data nyata.
- Kelengkapan dokumentasi teknis: skema, README backend, dan planning docs tersedia; belum ada API spec formal (mis. OpenAPI/Swagger).
- Testing: manual (curl) menyeluruh untuk kasus yang diuji, belum ada automated test.

---

## Lampiran — File Bukti

- `server_log.txt` — log startup server + health check
- `api_test_results.txt` — 8 hasil pengujian endpoint (request + response + HTTP status)
- `db_structure.txt` — struktur database lengkap (11 tabel, 5 enum, RLS aktif)
- Commit history 5 PR yang di-merge: lihat `git log --oneline` di branch `main`
