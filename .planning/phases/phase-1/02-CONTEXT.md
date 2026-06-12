# Phase 2 Context: Administrative Workflow & Monitoring

## Overview
Phase 2 berfokus pada transisi dari pengumpulan data (Fase 1) ke pengolahan data. Staff akan mulai melakukan verifikasi dokumen, pimpinan (Kabag) mendapatkan visibilitas melalui statistik, dan mahasiswa mendapatkan transparansi melalui notifikasi dan pusat aduan.

## Goals
- Membangun dashboard verifikasi PDF yang efisien untuk Staff (Target <= 5 menit per berkas).
- Implementasi dashboard statistik real-time untuk Kabag Kemahasiswaan.
- Mengaktifkan notifikasi real-time untuk perubahan status pendaftaran mahasiswa.
- Membangun pusat aduan (Complaint Center) untuk komunikasi teknis mahasiswa-staff.

## Tech Stack (Extended)
- **Real-time Engine:** Supabase Realtime (Postgres Changes).
- **PDF Viewer:** `react-pdf-viewer` (based on `pdf.js`).
- **Data Agregation:** MySQL Views/Queries for statistics.
- **UI Components:** Lucide Icons & Tailwind Progress Bars.

## Requirements Covered
- **FR-004:** Track selection status.
- **FR-005:** Receive real-time notifications for status changes.
- **FR-006:** Submit technical or non-technical issue reports/complaints.
- **FR-008:** Validate applicant documents and update status (Verified/Rejected).
- **FR-009:** Read, process, and update the resolution status of student complaints.
- **FR-013:** View real-time lists and statistics of active applicants.

## Success Metrics
- Waktu render PDF di dashboard admin <= 5 detik.
- Notifikasi muncul di portal mahasiswa < 2 detik setelah status diubah oleh staff.
- Statistik di dashboard Kabag mencerminkan data terbaru (live sync).

## Boundaries & Constraints
- Notifikasi saat ini terbatas pada *in-app notifications* (belum termasuk email/WA).
- Verifikasi dilakukan per dokumen, namun status akhir adalah tingkat aplikasi (Verify/Reject Application).
