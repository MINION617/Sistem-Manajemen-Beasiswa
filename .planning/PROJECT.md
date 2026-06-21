# Sistem Informasi Manajemen Beasiswa

## What This Is

Sistem Informasi Manajemen Beasiswa adalah aplikasi web terpusat untuk mengelola siklus beasiswa kampus dari pendaftaran mahasiswa sampai pencairan dana dan pelaporan. Sistem ini melayani mahasiswa, staff admin, Kabag Kemahasiswaan, dan Wakil Bagian Keuangan agar proses seleksi, verifikasi, keputusan, dan audit berjalan lebih cepat dan transparan.

## Core Value

Setiap pihak harus bisa melihat status dan keputusan beasiswa secara akurat, transparan, dan dapat ditindaklanjuti tanpa proses manual yang tercerai-berai.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet - ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Mahasiswa bisa login, melengkapi profil, mengunggah dokumen, dan mendaftar beasiswa secara online.
- [ ] Staff bisa mengelola sponsor dan program beasiswa serta memverifikasi berkas pendaftar.
- [ ] Pengelola bisa menjalankan penilaian, menetapkan penerima, dan memantau hasil secara terpusat.
- [ ] Bagian keuangan bisa merekam pencairan, memverifikasi bukti transfer, dan membuat laporan alokasi dana.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Integrasi payment gateway atau API perbankan otomatis - pencairan tetap dilakukan manual oleh bagian keuangan.
- Mesin ujian seleksi online - sistem hanya menyimpan dan menampilkan skor hasil seleksi.
- Aplikasi mobile native Android/iOS - ruang lingkup saat ini adalah web responsif.

## Context

- Workspace ini sudah berisi prototipe brownfield dengan banyak halaman frontend HTML/CSS/JS untuk mahasiswa, sponsor, dashboard, notifikasi, riwayat, dan laporan kendala.
- Integrasi data aplikasi mengarah ke Supabase untuk auth, database, storage, dan realtime notification; terdapat juga dump MySQL lama yang menunjukkan model data awal yang masih lebih sederhana.
- Brief menekankan masalah utama pada transparansi status, verifikasi dokumen yang lambat, rekap wawancara manual, dan pelaporan penyaluran dana yang belum efisien.
- Sistem perlu mendukung empat peran utama dengan alur status yang konsisten dari pendaftaran sampai pencairan dan audit.

## Constraints

- **Platform**: Web responsive - solusi harus berjalan baik di browser desktop dan mobile tanpa aplikasi native.
- **Auth**: Supabase Auth - brief dan prototipe sudah mengarah ke auth terpusat berbasis Supabase.
- **Disbursement**: Manual payout recording - sistem hanya mencatat status pencairan dan menyimpan bukti transfer.
- **Selection**: No online testing engine - nilai tes dan wawancara diinput oleh staff dari proses eksternal.
- **Auditability**: Status dan bukti keputusan harus terlacak - karena melibatkan persetujuan, pencairan dana, dan laporan sponsor/keuangan.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Bangun di atas pola web app dengan frontend HTML/CSS/JS dan layanan backend Supabase | Sudah ada prototipe dan helper client Supabase di repo, sehingga lebih cepat dilanjutkan daripada memulai stack baru | - Pending |
| Struktur roadmap mengikuti alur operasional beasiswa end-to-end | Brief sudah membagi kebutuhan ke fase intake, verifikasi, seleksi, dan pencairan | - Pending |
| Anggap proyek ini sebagai brownfield yang perlu dirapikan, bukan greenfield murni | Repo sudah mengandung UI, skema data, dan integrasi awal yang harus diakui dalam perencanaan | - Pending |

---
*Last updated: 2026-06-17 after initial project bootstrap*
