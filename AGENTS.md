# Project Guide

## Scope

This repository is for the `Sistem Informasi Manajemen Beasiswa` project, a web-based scholarship management system for mahasiswa, staff admin, Kabag Kemahasiswaan, and Wakil Bagian Keuangan.

## Planning Source Of Truth

- Read `.planning/PROJECT.md` for product context and constraints.
- Read `.planning/REQUIREMENTS.md` for active scope and requirement IDs.
- Read `.planning/ROADMAP.md` for phase boundaries and success criteria.
- Read `.planning/STATE.md` for current project status and next step.

## Working Rules

- Preserve the brownfield reality of this repo; build on existing frontend pages and Supabase direction unless a later plan explicitly changes it.
- Keep role boundaries explicit across mahasiswa, staff, kabag, and finance.
- Treat workflow status, uploaded documents, and payout proofs as auditable records.
- Do not expand into payment gateway integration, online test delivery, or native mobile apps unless scope changes in planning docs.

## Next Step

Phase 1 delivered as frontend prototype. Roadmap reorganized backend-first on 2026-07-03.
Run `$gsd-discuss-phase 2 --auto` to plan Phase 2 (Backend Foundation and Feature Integration).
