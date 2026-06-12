# Phase 1 Discussion Log

## Assumptions Analysis
Hasil analisis asumsi untuk fondasi sistem:

| Asumsi | Risiko | Mitigasi |
| :--- | :--- | :--- |
| **Auth Sync:** Supabase Auth UUID akan dipetakan ke record user di MySQL. | Ketidaksesuaian role antara Supabase dan MySQL. | Menggunakan Supabase JWT sebagai *source of truth* untuk role di backend Node.js. |
| **Direct Upload:** Mahasiswa unggah langsung ke Supabase Storage. | Akses dokumen oleh pihak tidak berwenang. | Implementasi Row Level Security (RLS) yang ketat pada bucket Supabase. |
| **Data Integrity:** MySQL unik konstrain akan mencegah aplikasi ganda. | Error pada level aplikasi yang membingungkan user. | Validasi backend sebelum *insert* dan penanganan error DB yang deskriptif. |
| **Connectivity:** Docker network menghubungkan Node, MySQL, dan Nginx. | Konfigurasi hostname yang salah di `docker-compose`. | Penggunaan `depends_on` dan environment variables yang terpusat. |

## Decision Matrix
Berdasarkan hasil diskusi `/gsd-discuss-phase 1 --batch`:

### 1. Database Migration Strategy
- **Pilihan:** ORM Migration Tool (Sequelize).
- **Keputusan:** **Sequelize Migrations**.
- **Alasan:** Menjamin konsistensi skema database di antara 4 pengembang (PM, BE, FE, QA) dan mendukung target "0% data ganda".

### 2. API Authentication Flow
- **Pilihan:** Supabase Admin SDK (`getUser`) vs JWKS Verification.
- **Keputusan:** **Supabase Admin SDK (`getUser`)**.
- **Alasan:** Keamanan lebih tinggi dengan verifikasi validitas sesi secara langsung, sangat krusial untuk manajemen dokumen sensitif dan finansial.

### 3. Frontend-Backend Communication
- **Pilihan:** Central Axios Client (Interceptors) vs Fetch API.
- **Keputusan:** **Central Axios Client (Interceptors)**.
- **Alasan:** Efisiensi dalam menyuntikkan JWT ke setiap request dan standarisasi penanganan error di seluruh dashboard.

## Final Approval
- **Status:** APPROVED
- **Approver:** User
- **Date:** 2024-06-12
