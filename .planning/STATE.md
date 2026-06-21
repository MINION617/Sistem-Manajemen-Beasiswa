---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 1 wave-1 (01-04) artifacts authored — pending user Supabase setup, then 01-01
last_updated: "2026-06-21T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 4
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-17)

**Core value:** Setiap pihak harus bisa melihat status dan keputusan beasiswa secara akurat, transparan, dan dapat ditindaklanjuti tanpa proses manual yang tercerai-berai.
**Current focus:** Phase 1 - Intake Foundation and Program Setup (re-planned after audit)

## Status

- Project initialized on 2026-06-17.
- Requirements defined and mapped to roadmap phases.
- **2026-06-21: Phase 1 audit completed** → `.planning/AUDIT-PHASE1.md`. Found the plan stale vs prototype 1.2, no real Supabase backend, broken mahasiswa submit, and a redundant sponsor task. Plans rebaselined.

## Locked Decisions (post-audit)

- **KD-1 = Opsi A (Supabase nyata sekarang).** SUPERSEDES D-12 (dummy-first). Phase 1 builds a real Supabase schema + RLS + storage; dummy data is seed/fallback only.
- **KD-2:** role model = {mahasiswa, staff, kabag, wabag} (+ kabag_wabag login mode), not binary admin.
- **KD-3 (resolved 2026-06-21):** recipient decision is a **two-step flow** — Staff marks `lolos_final`, Kabag gives final ACC. Both actions recorded for audit. Applies in Phase 3 (SELE-02).
- **KD-4:** canonical status vocabulary = snake_case enums (menunggu_verifikasi, lolos_berkas, ditolak_berkas, wawancara, lolos_final, tidak_lolos_final, …) + display-label map.

## Phase 1 Plan Set (4 plans)

- **01-04** (wave 1, NEW): Supabase foundation — schema/RLS/storage + .gitignore/.env.example + shared/supabaseConfig.js.
- **01-01** (wave 2): shared session/seed/rules; wire login.js (existing 4-role router) to real Supabase Auth.
- **01-02** (wave 3): mahasiswa readiness gate + real persisted submission + connected tracking.
- **01-03** (wave 3): harden existing manajemenSponsorBeasiswa.js (persist + role guard); remove dead SPONSOR files.

## Follow-ups (applied 2026-06-21)

- ✅ `01-CONTEXT.md` D-12 marked SUPERSEDED by KD-1; `PROJECT.md` + `ROADMAP.md` updated with KD-1/KD-3.
- ✅ KD-3 resolved (two-step Staff→Kabag ACC).
- ✅ Repo hygiene applied: `.gitignore` added, `BACKEND/.env` untracked, `BACKEND/.env.example` added.

## Execution Progress

- **01-04 (wave 1): artifacts authored & committed** — `DATABASE/supabase_schema.sql` (10 tables, 5 enums, 28 RLS/storage policies, profile trigger, KD-3 baked in) + `FRONTEND/shared/supabaseConfig.js` + hygiene files. See `01-04-SUMMARY.md`. **Not yet verified end-to-end** (needs live project).
- 01-01 / 01-02 / 01-03: not started — blocked on the user Supabase setup below.

## User Setup Required (before 01-01 can run + verify)

1. Create a Supabase project; put real keys in `BACKEND/.env` (gitignored) and/or `FRONTEND/shared/supabaseConfig.js`.
2. Run `DATABASE/supabase_schema.sql` in the SQL editor.
3. Create the two private buckets `dokumen-pendaftar` + `bukti-transfer` (policies are in the schema file).
4. Seed campus-provisioned accounts (4 roles).

## Next Command

- After setup: execute `01-01` (shared session/seed/rules + wire login to Supabase Auth), then wave-3 `01-02` + `01-03`.
