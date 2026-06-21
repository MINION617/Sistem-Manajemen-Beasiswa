# Stack Research

## Current Stack Signals

- Frontend is organized as static HTML, CSS, and vanilla JavaScript pages under `FRONTEND/`.
- Existing client integration uses Supabase JS v2 from ESM CDN for authentication, relational queries, file storage, and realtime notifications.
- Backend footprint is minimal today; `BACKEND/server.js` is currently empty while `BACKEND/supabaseclient.js` contains most operational logic.
- A legacy MySQL schema exists in `DATABASE/beasiswa.sql`, which indicates an earlier relational model and should be treated as migration/reference material rather than the live source of truth.

## Recommended Working Stack

- **UI**: Existing HTML/CSS/JS pages evolved into a consistent role-based web application.
- **Backend platform**: Supabase for auth, Postgres data model, storage buckets, row-level security, and realtime.
- **Reporting/export**: Server-side or edge-function-backed report generation may be needed later for sponsor and finance exports.
- **File handling**: Supabase Storage for applicant documents and transfer proofs with strict path policies by role and resource owner.

## Key Technical Themes

- Role-aware access control across mahasiswa, staff, kabag, and keuangan.
- Status-driven workflows for pendaftaran, verifikasi, seleksi, penerima, and penyaluran.
- Audit-friendly data model for approvals, score entries, and transfer proofs.
- Responsive experience because scope explicitly excludes native mobile apps.
