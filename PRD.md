# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Project Name:** Sistem Informasi Manajemen Beasiswa
**Tech Stack:** JavaScript, Supabase (PostgreSQL, Auth, Storage)

## 1. TIM PENGEMBANG
* Project Manager: Ahmad Riza Hafiz
* Back-End: Raffa Whisandewa Wibowo
* Front-End: Muhammad Luthfi
* QA/Tester: Agil Kurniawan

## 2. PROBLEM & OBJECTIVES
* **Problem:** Verifikasi dokumen beasiswa masih manual (PDF/kertas), memakan waktu hingga 8 minggu, rentan data ganda (10% error), dan menyulitkan pelaporan ke sponsor.
* **Target (Success Metrics):** - Durasi seleksi turun dari 56 hari menjadi maksimal 28 hari.
  - 0% data ganda (integritas database).
  - Waktu rekapitulasi laporan akhir menjadi < 2 hari.
  - Efisiensi verifikasi berkas oleh admin menjadi <= 5 menit per berkas.

## 3. FUNCTIONAL REQUIREMENTS (FR) & FITUR DASHBOARD

### 3.1. Aktor: Mahasiswa (Prioritas: Must Have)
* **FR-001:** Mahasiswa login menggunakan NIM dan Password (Auth via Supabase).
* **FR-002 & FR-003 (E-Pendaftaran):** Sistem menampilkan beasiswa aktif. Mahasiswa mengisi form dan mengunggah dokumen (Transkrip/Sertifikat) berformat PDF (Maks 2MB).
* **FR-004 & FR-005 (Status Aplikasi):** Menampilkan status pendaftaran (Pending, Verified, Rejected) dan mengirim notifikasi perubahan status.
* **FR-06 & FR-07 (Status Pencairan):** Menampilkan status dana (Paid/Unpaid) dan tombol unduh bukti transfer.

### 3.2. Aktor: Staff Admin (Prioritas: Must Have)
* **FR-08 & FR-09 (Verifikasi & Validasi):** Dashboard real-time untuk melihat pendaftar, memvalidasi kelengkapan berkas, dan mengubah status menjadi "Verified" atau "Rejected".
* **FR-11 & FR-12 (Kelola Penyaluran Dana):** Mengubah status pencairan menjadi "Paid" dan mengunggah dokumen bukti transfer.

### 3.3. Aktor: Tim Seleksi (Prioritas: Must Have)
* **FR-13 (Daftar Kandidat):** Menampilkan daftar mahasiswa "Verified" yang masuk tahap wawancara.
* **FR-14 & FR-15 (Input Hasil Seleksi):** Form input skor wawancara (0-100) dan kalkulasi otomatis bobot akhir IPK + Wawancara untuk menentukan peringkat.

### 3.4. Aktor: Kabag Kemahasiswaan (Prioritas: Should Have)
* **FR-16 & FR-17 (Monitoring & Keputusan):** Dashboard real-time untuk memantau sisa kuota, melihat peringkat akhir, dan hak khusus mengubah status final mahasiswa menjadi "Approved" (Penerima Beasiswa).

### 3.5. Aktor: Wakil Rektor Keuangan (Prioritas: Must Have)
* **FR-18 & FR-19 (Dashboard Finansial):** Menampilkan grafik realisasi anggaran dan fitur Export otomatis (PDF/Excel) laporan rekapitulasi pembayaran untuk sponsor.

## 4. WORKFLOW EDGE CASES (BATASAN SISTEM)
1. **Validasi File:** Jika mahasiswa mengunggah file > 2MB, sistem otomatis menolak dan memunculkan error "Maksimal 2MB".
2. **Timeout:** Jika sesi login habis saat mahasiswa mengisi form, sistem mengarahkan ke halaman login tanpa menghapus isian data form (State preservation).
3. **Validasi Kredensial:** Jika NIM/Password tidak sesuai dengan database, tampilkan error yang relevan ("NIM tidak terdaftar" atau "Password salah").