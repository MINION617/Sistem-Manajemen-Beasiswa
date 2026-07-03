-- ============================================================================
-- Add catatan_verifikasi to pendaftaran
-- ============================================================================
-- Why: backend/src/modules/verifikasi (VERI-01) requires staff to give a
-- reason when rejecting an application (AGENTS.md: "Treat workflow status,
-- uploaded documents, and payout proofs as auditable records"). The
-- baseline schema has no column for this on `pendaftaran` — the only
-- staff-notes column that exists (`hasil_seleksi.catatan_staff`) belongs
-- to a different table created later in the flow (test/interview scoring),
-- not the initial document-verification step.
--
-- ACTION REQUIRED: run this in the Supabase SQL editor (or via CLI once
-- linked) before deploying backend/src/modules/verifikasi against the real
-- database — verifikasi.service.js writes to this column.
-- ============================================================================

alter table public.pendaftaran
  add column if not exists catatan_verifikasi text;

comment on column public.pendaftaran.catatan_verifikasi is
  'Staff note explaining a document verification decision (required on ditolak_berkas).';
