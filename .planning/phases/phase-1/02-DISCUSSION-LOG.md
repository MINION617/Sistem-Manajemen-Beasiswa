# Phase 2 Discussion Log

## Assumptions Analysis
Hasil analisis asumsi untuk alur kerja dan monitoring:

| Asumsi | Risiko | Mitigasi |
| :--- | :--- | :--- |
| **PDF Rendering:** Browser mampu merender PDF 2MB secara instan. | Lag pada dashboard admin saat memproses volume besar. | Menggunakan `react-pdf-viewer` dengan lazy loading dan side-by-side layout. |
| **Live Stats:** Query MySQL cukup cepat untuk statistik real-time. | Performa menurun seiring pertumbuhan data. | Optimasi index pada kolom status dan penggunaan cached aggregation jika diperlukan. |
| **Real-time Sync:** Supabase Realtime dapat diandalkan untuk notifikasi. | Koneksi terputus (websocket drop). | Implementasi mekanisme *polling* cadangan atau *refresh* otomatis saat *re-connect*. |

## Decision Matrix

### 1. Real-time Notifications Engine
- **Pilihan:** Supabase Realtime vs Socket.io vs SSE.
- **Keputusan:** **Supabase Realtime**.
- **Alasan:** Terintegrasi langsung dengan ekosistem database (Postgres Changes) dan tidak memerlukan infrastruktur server tambahan di Docker.

### 2. PDF Preview Strategy
- **Pilihan:** Native Iframe vs pdf.js (react-pdf-viewer).
- **Keputusan:** **pdf.js (react-pdf-viewer)**.
- **Alasan:** Memberikan kontrol UI yang lebih baik (zoom, rotate, text selection) dan performa render yang lebih konsisten di berbagai browser untuk mencapai target < 5 detik.

### 3. Notification Scope
- **Pilihan:** In-app only vs Multi-channel (Email/WA).
- **Keputusan:** **In-app only (Phase 2)**.
- **Alasan:** Fokus pada kecepatan integrasi sistem internal. Multi-channel dapat dipertimbangkan di fase pemeliharaan atau jika ada permintaan khusus.

## Final Approval
- **Status:** APPROVED
- **Approver:** User
- **Date:** 2024-06-12
