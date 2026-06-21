# Research Summary

## Stack

The current repo is a brownfield web prototype: static HTML/CSS/JS pages, Supabase client logic for auth/data/storage/realtime, and a legacy MySQL schema that likely predates the current Supabase direction. The practical delivery path is to keep Supabase as the operational backend and treat the SQL dump as reference material to reconcile.

## Table Stakes

- Mahasiswa login, profile/document management, scholarship browsing, application submission, and status tracking.
- Staff sponsor/program CRUD, document verification, complaint handling, score entry, recipient updates, and payout recording.
- Management dashboards for applicant oversight, decision review, recipients, budgets, and sponsor allocation reports.
- Realtime notifications and auditable status changes across the workflow.

## Watch Out For

- Reconcile role names and permissions before expanding features.
- Define one canonical status model for applications, complaints, and payouts.
- Lock down storage access for sensitive uploads.
- Preserve auditability from the start so phase 4 reporting is credible.
