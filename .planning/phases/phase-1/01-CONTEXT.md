# Phase 1 Context: Foundation & Initial Setup

## Overview
Phase 1 berfokus pada pembangunan fondasi infrastruktur sistem, manajemen data master sponsor, dan memungkinkan mahasiswa untuk mulai melengkapi profil serta mendaftar beasiswa. Ini adalah fase kritikal yang menentukan integritas data untuk seluruh siklus hidup beasiswa.

## Goals
- Setup proyek awal dengan arsitektur hybrid (Node.js, MySQL, Supabase, Docker).
- Implementasi sistem autentikasi terpusat (NIM/Password) untuk 4 role.
- Pembangunan modul manajemen data master (Sponsor & Program Beasiswa).
- Penyediaan portal pendaftaran mandiri untuk mahasiswa.

## Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** MySQL (Core Data) + Supabase Auth (Identity)
- **Storage:** Supabase Storage (PDF Documents)
- **Frontend:** React.js (Vite) + Tailwind CSS
- **Infrastructure:** Docker Compose + Nginx

## Requirements Covered
- **FR-001:** Login using NIM and Password via Supabase Auth.
- **FR-014:** View detailed applicant data (Inisialisasi skema data untuk mendukung ini).
- **FR-015:** View summary dashboard (Inisialisasi skema data untuk mendukung ini).
*Catatan: Meskipun FR-014/015 berfokus pada Kabag, skema data dasarnya harus disiapkan di Fase 1 agar data pendaftaran mahasiswa tersimpan dengan benar.*

## Success Metrics
- Struktur Docker Compose berjalan lancar (Frontend, Backend, DB, Nginx).
- Mahasiswa dapat login dan mengunggah PDF (Max 2MB).
- 0% duplikasi data pendaftaran pada level database (MySQL Unique Constraints).

## Boundaries & Constraints
- Tidak ada integrasi Payment Gateway (Status manual).
- Fokus pada validasi dokumen secara digital (PDF Only).
- Keamanan data mahasiswa diisolasi menggunakan Supabase JWT & MySQL Logic.
