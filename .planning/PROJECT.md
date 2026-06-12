# Project: Sistem Informasi Manajemen Beasiswa (SIM-Beasiswa)

## Core Value
Memusatkan dan mendigitalkan seluruh siklus pengelolaan beasiswa—mulai dari pendaftaran mahasiswa, verifikasi berkas secara *online*, penetapan hasil seleksi, penanganan kendala, hingga audit pencairan dana—untuk meningkatkan transparansi, mempercepat waktu seleksi, dan mempermudah pelaporan kepada sponsor.

## Project Reference
  **Tech Stack:**
  - **Frontend:** React.js (Vite) + TypeScript + Central Axios Client (dengan Interceptors untuk JWT)
  - **Backend:** Node.js (Express.js)
  - **Database:** MySQL (Dikelola menggunakan Sequelize ORM & Migrations untuk menjaga integritas data)
  - **Auth & Security:** Supabase Auth (Verifikasi sesi di backend wajib via Supabase Admin SDK `getUser`)
  - **Storage:** Supabase Storage Buckets (dengan RLS ketat max 2MB PDF)
  - **Infrastructure:** Docker Compose & Nginx (sebagai Reverse Proxy & CORS handler)
- **Primary Goal:** Transisi dari pengelolaan beasiswa manual yang tersebar menjadi satu sistem terpadu yang memfasilitasi 4 hak akses utama secara spesifik (Mahasiswa, Staff, Kabag Kemahasiswaan, dan Wakil Bagian Keuangan).
- **Success Metrics:**
  - **Data Integrity:** 0% duplikasi data untuk form aplikasi mahasiswa dan rekam data sponsor.
  - **Performance:** Waktu proses render/buka dokumen PDF saat verifikasi <= 5 detik per file.
  - **Transparency:** Pembaruan status seleksi mahasiswa dan pencairan dana dapat dilacak dengan notifikasi *real-time*.

## Constraints
- **Document Limit:** Maksimal 2MB per file (wajib berformat PDF untuk dokumen pendukung dan bukti transfer).
- **Auth & Security:** Wajib menggunakan NIM/Password terintegrasi Supabase Auth, dengan penerapan *Row Level Security* (RLS) yang ketat untuk mengisolasi data antar ke-4 *role* pengguna.
- **Platform:** Berbasis *web responsive* (berfungsi penuh di *mobile/tablet* untuk mahasiswa, namun prioritas optimalisasi *desktop* untuk *dashboard* Staff, Kabag, dan Keuangan).
- **Deployment Lifecycle:** Pengembangan wajib diselesaikan berdasarkan urutan 4 fase (*Foundation, Admin Workflow, Selection, Disbursement*) dan siap di-*deploy* pada infrastruktur server *existing* yang mendukung *environment* Docker.