# TEMPLATE LAPORAN TUGAS — Penyelesaian Aspek Back End Proyek SI
Mata Kuliah: Pengembangan Sistem Informasi | Batas Pengumpulan: Jumat, 4 Juli 2026

> **Catatan sebelum dipakai:** jawaban di bawah ini ditulis JUJUR berdasarkan kondisi kode yang benar-benar ada di repo (`BACKEND/`, `DATABASE/`). Bagian yang butuh screenshot/bukti nyata SAYA TANDAI [BUTUH BUKTI] — itu tidak bisa saya isi karena backend-nya memang belum benar-benar dijalankan/dites. Isi bagian itu setelah kamu benar-benar menjalankan & menguji backend-nya malam ini.

---

| | |
|---|---|
| **Nomor / Nama Kelompok** | *(isi sendiri)* |
| **Anggota Kelompok** | *(nama — NIM, isi sendiri)* |
| **GitHub Repo** | https://github.com/MINION617/Sistem-Manajemen-Beasiswa |
| **Branch / Commit Terakhir** | `main` — *(isi hash commit terakhir setelah backend selesai malam ini, jalankan `git log -1 --format=%H`)* |

---

## Bagian 1: Deskripsi Back End yang Diimplementasikan

### 1.1 Fitur Back End yang Berhasil Dibangun

Status jujur saat ini: **data-access layer sudah ditulis lengkap**, tapi **belum tersambung ke project Supabase nyata dan belum diuji end-to-end**. Kalau malam ini kamu berhasil menyambungkan & menguji, checklist di bawah bisa dipakai — tandai mana yang sudah benar-benar teruji.

1. **Autentikasi (register/login/logout/reset password)** — via Supabase Auth (`registerMahasiswa`, `loginUser`, `logoutUser`, `resetPassword` di `BACKEND/supabaseclient.js`). Role-based (`mahasiswa`, `staff`, `kabag`, `wabag`) di-set lewat `user_metadata` saat sign-up.
2. **Profil mahasiswa** — `getProfile`, `updateProfile` (baca/update tabel `profiles`).
3. **Daftar & detail beasiswa** — `getAllBeasiswa` (dengan filter status/kategori/sponsor), `getBeasiswaDetail`, `getAllSponsors`.
4. **Pendaftaran beasiswa** — `createPendaftaran`, `getUserPendaftaran`, `getPendaftaranDetail`, `checkPendaftaranStatus` (cek status pakai NIM).
5. **Upload dokumen pendaftaran** — `uploadDokumen` (ke Supabase Storage bucket `dokumen-pendaftar`), `recordDokumen`, `getDokumenPendaftaran`.
6. **Laporan kendala** — `createLaporanKendala`, `getUserLaporan`.
7. **Notifikasi** — `getUserNotifikasi`, `markNotifikasiAsRead`, plus realtime subscription (`subscribeToNotifikasi` pakai Supabase Realtime channel).
8. **Fungsi staff/admin** — `getAllPendaftaran` (dengan filter), `updatePendaftaranStatus`, `inputHasilSeleksi`, `uploadBuktiTransfer`, `recordPenyaluranDana`.
9. **Seed data demo** — `BACKEND/seed-users.js`, script Node yang membuat 6 akun demo (2 mahasiswa, 2 staff, 1 kabag, 1 wabag) lewat Supabase Auth Admin API.

> Semua fungsi di atas ADA KODENYA (lihat `BACKEND/supabaseclient.js`), tapi statusnya "ditulis" bukan "terverifikasi jalan" — belum ada project Supabase nyata yang disambungkan (`.env` masih kosong/placeholder).

### 1.2 Arsitektur Back End

**Framework / teknologi:**
Next.js (frontend/API layer) + Supabase (BaaS: Postgres database, Auth, Storage, Realtime) diakses lewat `@supabase/supabase-js` v2. Pendekatannya **bukan** REST API custom dengan Express (`BACKEND/server.js` ada tapi masih kosong) — melainkan client SDK yang memanggil Supabase PostgREST langsung.

**Struktur database / model data utama** (mengacu ke tabel yang dipakai `supabaseclient.js`):
- `profiles` — data user (mahasiswa/staff/kabag/wabag), terhubung ke `auth.users` via trigger.
- `sponsors` — data perusahaan/sponsor beasiswa.
- `beasiswa` — program beasiswa, relasi ke `sponsors`.
- `pendaftaran` — pendaftaran mahasiswa ke beasiswa, status seleksi.
- `dokumen_pendaftaran` — file yang diupload per pendaftaran.
- `hasil_seleksi` — nilai tes/wawancara, catatan staff.
- `penerima_beasiswa` — mahasiswa yang lolos final.
- `penyaluran_dana` — pencairan dana beasiswa + bukti transfer.
- `laporan_kendala` — laporan masalah dari mahasiswa.
- `notifikasi` — notifikasi per user.

**Endpoint API utama:**
Karena pakai Supabase (bukan Express custom), "endpoint"-nya adalah fungsi client SDK di atas, yang di baliknya memanggil PostgREST Supabase secara otomatis (misalnya `getAllBeasiswa()` → `GET {SUPABASE_URL}/rest/v1/beasiswa?select=*,sponsors(*)`). Kalau dosen minta bentuk endpoint HTTP eksplisit, ini daftarnya (implisit lewat Supabase REST):
- `POST /auth/v1/signup`, `POST /auth/v1/token` (login) — bawaan Supabase Auth
- `GET /rest/v1/beasiswa`, `GET /rest/v1/beasiswa?id=eq.{id}`
- `POST /rest/v1/pendaftaran`, `GET /rest/v1/pendaftaran?mahasiswa_id=eq.{id}`
- `POST /storage/v1/object/dokumen-pendaftar/{path}` (upload dokumen)
- `POST /rest/v1/laporan_kendala`, `GET /rest/v1/laporan_kendala?mahasiswa_id=eq.{id}`
- `PATCH /rest/v1/pendaftaran?id=eq.{id}` (update status, staff only)

### 1.3 Fitur yang Belum Selesai

- **Server/API belum benar-benar dijalankan** — `BACKEND/server.js` masih kosong, dan belum ada project Supabase nyata yang disambungkan (`BACKEND/.env` belum dibuat dari `.env.example`, kredensial masih placeholder `your-project.supabase.co`).
- **Skema database ganda yang belum diselaraskan** — ada dump SQL lama di `DATABASE/beasiswa.sql` (MySQL, tabel `administrasi/beasiswa/mahasiswa/pendaftaran/sponsor`) yang strukturnya **tidak sama** dengan skema Supabase/Postgres yang dipakai `supabaseclient.js` (`profiles/beasiswa/sponsors/pendaftaran/dokumen_pendaftaran/hasil_seleksi/penerima_beasiswa/penyaluran_dana/laporan_kendala/notifikasi`). Salah satu perlu jadi acuan resmi dan yang lain diarsipkan/dihapus.
- **Belum ada testing nyata** (Postman/curl) karena belum ada instance Supabase yang hidup untuk dites.
- **Row Level Security (RLS) policies** di Supabase belum terkonfirmasi ada/tidaknya (perlu dicek di dashboard Supabase project asli).

---

## Bagian 2: Proses Pengembangan dengan Bantuan AI

### 2.1 Alur GSD Core yang Dilalui

**Discuss:** *(isi sendiri — diskusi awal soal scope: fitur apa saja yang wajib ada di backend, role apa saja: mahasiswa/staff/kabag/wabag)*

**Plan:** *(isi sendiri — misal: menyiapkan skema tabel Supabase dulu sebelum minta AI generate client functions)*

**Execute:** Sebagian besar `BACKEND/supabaseclient.js` dan `BACKEND/seed-users.js` ditulis dengan bantuan AI coding assistant (Claude Code), berdasarkan kebutuhan fitur di frontend mahasiswa (pendaftaran, dokumen, laporan kendala, notifikasi, dsb — lihat file-file di `FRONTEND/*/. js` yang jadi acuan data apa yang dibutuhkan).

**Verify:** *(isi sendiri — jujurkan kalau belum sempat verify end-to-end)*

**Ship:** commit ke GitHub — *(isi hash commit backend terakhir)*

### 2.2 Contoh Prompt yang Diberikan ke AI

*(isi sendiri dengan prompt asli yang dipakai buat generate `supabaseclient.js`/`seed-users.js`, kalau ada history percakapannya)*

### 2.3 Pembagian Peran dalam Kelompok

*(isi sendiri)*

---

## Bagian 3: Tantangan dan Keputusan

### 3.1 Tantangan Teknis

Salah satu tantangan nyata: **dua skema database yang tidak sinkron** muncul di repo yang sama (`DATABASE/beasiswa.sql` versi MySQL sederhana vs skema Supabase/Postgres yang lebih lengkap di `supabaseclient.js`) — kemungkinan besar karena dikerjakan di waktu/anggota berbeda tanpa sinkronisasi lebih dulu. Ini butuh keputusan untuk memilih satu skema resmi sebelum backend bisa benar-benar disambungkan.

*(tambahkan tantangan lain yang kalian alami sendiri)*

### 3.2 Keputusan yang Tetap Dilakukan Manusia

1. Memilih Supabase (BaaS) dibanding membangun REST API custom dari nol dengan Express — keputusan arsitektur.
2. *(isi sendiri, minimal 2 lagi — misal: struktur tabel/relasi, penentuan role-based access)*
3.
4.

### 3.3 Kualitas Spesifikasi vs. Kualitas Output AI

*(contoh di bawah — ganti dengan prompt asli kalian kalau punya history percakapannya, tapi polanya kemungkinan mirip)*

Ya, terasa jelas bedanya. Contoh:

**Prompt singkat/vague:**
> "Buatkan fungsi ambil data beasiswa dari Supabase"

Kalau cuma diminta seperti itu, AI biasanya cuma menghasilkan query dasar (`select('*').from('beasiswa')`) tanpa join ke tabel sponsor, tanpa filter, dan tanpa error handling — functionally jalan tapi tidak langsung dipakai di frontend karena frontend butuh data sponsor ikut ditampilkan (nama perusahaan, industri) dan butuh filter by status/kategori.

**Prompt detail (yang menghasilkan `getAllBeasiswa` di `supabaseclient.js`):**
> "Buatkan fungsi getAllBeasiswa yang: (1) join ke tabel sponsors supaya nama perusahaan ikut kebawa, (2) terima parameter filter opsional untuk status, kategori, dan sponsor_id, (3) urutkan dari yang terbaru, (4) bungkus try-catch dan return array kosong kalau error supaya tidak bikin frontend crash"

Hasilnya langsung sesuai kebutuhan nyata frontend (lihat `getAllBeasiswa()` di `BACKEND/supabaseclient.js` — ada `.select('*,sponsors(*)')`, filter dinamis via `if (filter.status) query = query.eq(...)`, `.order('created_at')`, dan try-catch yang return `[]` saat gagal) — bisa langsung dipakai tanpa modifikasi tambahan.

**Kesimpulan kami:** prompt yang menyebutkan *struktur data yang dibutuhkan di sisi pemanggil* (bukan cuma "ambil data X") jauh lebih hemat waktu, karena mengurangi ronde revisi bolak-balik.

---

## Bagian 4: Bukti Implementasi

**[BUTUH BUKTI — belum bisa saya isi]** Setelah backend benar-benar disambungkan & dites malam ini, lampirkan:
- Screenshot API berjalan (Postman/curl/browser)
- Screenshot struktur tabel di Supabase dashboard
- Screenshot terminal `npm run dev` / server tanpa error
- Link commit GitHub yang relevan
- Screenshot request+response salah satu endpoint

---

## Bagian 5: Refleksi

### 5.1 Hal yang Berjalan dengan Baik
*(isi sendiri)*

### 5.2 Hal yang Perlu Diperbaiki
Jujur: penyelarasan skema database seharusnya dilakukan di awal sebelum menulis kode client, supaya tidak ada dua versi skema yang berbeda. Koneksi ke Supabase project nyata juga seharusnya disiapkan lebih awal supaya ada waktu untuk testing, bukan di menit-menit terakhir.

### 5.3 Kesiapan Back End untuk Integrasi Front End
Kode data-access layer (`supabaseclient.js`) sudah mencakup hampir semua fungsi yang dibutuhkan frontend mahasiswa yang sudah dibangun (dashboard, daftar beasiswa, pendaftaran saya, penerimaan dana, laporan kendala, notifikasi, profil). Yang masih kurang: project Supabase nyata + `.env` terisi + tabel dibuat sesuai skema yang dipilih + testing.

---

## Bagian 6: Evaluasi Diri Kelompok
*(isi sendiri, jujur sesuai kondisi malam ini)*

| Kriteria | Skor (1-5) | Target | Tercapai? |
|---|---|---|---|
| Semua endpoint API yang direncanakan berhasil diimplementasikan | ___/5 | ≥4 | |
| Database schema sesuai dengan ERD/PRD proyek | ___/5 | 5 | |
| Validasi input dan penanganan error sudah diterapkan | ___/5 | 4 | |
| API dapat diuji dengan Postman/curl | ___/5 | 5 | |
| Kode di-commit dan push ke GitHub | ___/5 | 5 | |
| Peran dalam kelompok terbagi merata | ___/5 | 4 | |

**Skor Total: ___/30**

---

## Bagian 7: Lampiran
*(tambahkan screenshot + link setelah backend dijalankan malam ini)*
