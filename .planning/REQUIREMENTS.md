# Requirements: Sistem Informasi Manajemen Beasiswa
Problem Statement

Pengelolaan program beasiswa saat ini masih tersebar dan kurang transparan. Mahasiswa kesulitan melacak status pendaftaran dan memastikan pencairan dana, sementara pihak kampus membutuhkan waktu lama untuk memverifikasi dokumen persyaratan secara manual, merekap hasil wawancara, serta menyusun laporan penyaluran dana. Institusi membutuhkan sistem berbasis web yang terpusat agar mahasiswa dapat mendaftar secara online, dan pihak pengelola dapat melakukan verifikasi, penilaian, hingga pelaporan finansial dengan efisien.
Target Users

    Mahasiswa — Mencari dan mendaftar program beasiswa, melacak status aplikasi, menerima notifikasi real-time, melihat status pencairan dana, dan mengajukan laporan kendala.

    Staff (Admin) — Mengelola data master sponsor, memverifikasi kelengkapan dokumen mahasiswa, menginput skor tes/wawancara, mengunggah bukti transfer pencairan dana, dan merespons keluhan mahasiswa.

    Kabag Kemahasiswaan — Memantau statistik pendaftar aktif secara real-time, meninjau detail kualifikasi mahasiswa untuk rapat pleno, dan memberikan persetujuan final (ACC) penerima beasiswa.

    Wakil Bagian Keuangan — Memantau dashboard realisasi anggaran, melakukan audit terhadap dokumen bukti transfer, dan mengekspor laporan alokasi dana untuk sponsor.
## Functional Requirements

### 1. Student Features (Mahasiswa)
| ID | Requirement | Priority | Phase | Status |
|----|-------------|----------|-------|--------|
| FR-001 | Login using NIM and Password via Supabase Auth | Must Have | 1 | Pending |
| FR-002 | Manage personal data, academic history (GPA), and upload documents | Must Have | 1 | Pending |
| FR-003 | View available scholarships and submit applications via interactive form | Must Have | 1 | Pending |
| FR-004 | Track selection status and monitor fund disbursement status | Must Have | 2 | Pending |
| FR-005 | Receive real-time notifications for status changes and fund transfers | Must Have | 2 | Pending |
| FR-006 | Submit technical or non-technical issue reports/complaints to Staff | Should Have | 2 | Pending |

### 2. Staff Admin Features (Aktor Pelaksana)
| ID | Requirement | Priority | Phase | Status |
|----|-------------|----------|-------|--------|
| FR-007 | Create, Read, Update, Delete (CRUD) sponsor data and active scholarship details | Must Have | 1 | Pending |
| FR-008 | Validate applicant documents and update status to Verified/Rejected | Must Have | 2 | Pending |
| FR-009 | Read, process, and update the resolution status of student complaints | Should Have | 2 | Pending |
| FR-010 | Input test scores and interview results for verified applicants | Must Have | 3 | Pending |
| FR-011 | Update applicant status to "Penerima Beasiswa" based on plenary decisions | Must Have | 3 | Pending |
| FR-012 | Upload proof of transfer and update disbursement status to "Paid" | Must Have | 4 | Pending |

### 3. Management Features (Kabag Kemahasiswaan)
| ID | Requirement | Priority | Phase | Status |
|----|-------------|----------|-------|--------|
| FR-013 | View real-time lists and statistics of active applicants | Must Have | 2 | Pending |
| FR-014 | View detailed applicant data (Scores, GPA, Certificates) for meeting references | Must Have | 3 | Pending |
| FR-015 | View a summary dashboard of student complaints and resolution status | Should Have | 3 | Pending |
| FR-016 | View the final list of recipients, selected scholarships, and sponsors | Must Have | 4 | Pending |

### 4. Executive Features (Wakil Bagian Keuangan)
| ID | Requirement | Priority | Phase | Status |
|----|-------------|----------|-------|--------|
| FR-017 | View financial dashboard with charts detailing total disbursed funds | Must Have | 4 | Pending |
| FR-018 | Generate and view detailed fund allocation reports based on sponsors | Must Have | 4 | Pending |
| FR-019 | Monitor and verify the proof of transfer documents uploaded by Staff | Must Have | 4 | Pending |

```

## Out of Scope
- **Payment Gateway:** Tidak ada integrasi API perbankan otomatis. Pencairan dana dilakukan secara manual oleh bagian keuangan, sistem hanya berfungsi untuk mencatat status dan menyimpan bukti transfer.
- **Online Testing Engine:** Sistem tidak menyediakan fitur ujian/tes seleksi *online*. Sistem hanya berfungsi menampung/menginput skor hasil akhir dari proses seleksi.
- **Mobile Native Apps:** Tidak ada pengembangan aplikasi *mobile* berbasis Android/iOS. Sistem dikembangkan sebagai aplikasi berbasis *web responsive*.

## Tech Stack
- **Backend:** Node.js (dengan Express.js atau NestJS sebagai framework)
- **Frontend:** React.js
- **Database:** MySQL (Data Aplikasi) & Supabase (Auth, RLS)
- **Infrastructure:** Docker (Containerized Services) & Nginx

## Constraints & Requirements
- **Development Lifecycle:** Proyek dibagi menjadi 4 fase pengembangan:
  1. **Phase 1:** Foundation & Initial Setup
  2. **Phase 2:** Administrative Workflow & Monitoring
  3. **Phase 3:** Selection, Review & Final Approval
  4. **Phase 4:** Disbursement, Audit & Financial Reporting
- **Deployment:** Sistem wajib mendukung *deployment* pada infrastruktur server *existing* yang memiliki *environment* Docker.
- **Data Privacy:** Menerapkan *Row Level Security* (RLS) via Supabase untuk memisahkan akses data antar peran pengguna.

---

## Milestone Overview

| Phase | Name | Focus | Requirements |
| :--- | :--- | :--- | :--- |
| 1 | Foundation & Initial Setup | Data master, portal pendaftaran, profil | FR-001, FR-014, FR-015 |
| 2 | Admin Workflow & Monitoring | Verifikasi, monitoring pendaftar, aduan | FR-002, FR-006, FR-007, FR-016, FR-017, FR-018 |
