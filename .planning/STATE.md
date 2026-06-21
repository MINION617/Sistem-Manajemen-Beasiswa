---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Phase 1 code-complete (4/4 plans) — pending live Supabase verification
last_updated: "2026-06-22T00:00:00.000Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 4
  completed_plans: 4
  percent: 20
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

## Execution Progress (all 4 plans code-complete, committed on branch `audit/phase1-corrections`)

- **01-04** (wave 1): canonical `supabase_schema.sql` (11 tables incl. dokumen_mahasiswa, 5 enums, RLS, storage, KD-3) + `shared/supabaseConfig.js` + hygiene.
- **01-01**: `window.BK` shared layer (config/session/rules/api) + `login.js` on real Supabase Auth (4-role routing preserved).
- **01-02**: mahasiswa slice — readiness gate (profilMahasiswa + doc upload), real persisted submission (daftarBeasiswa, menunggu_verifikasi, anti-duplicate, deep-link), connected tracking (pendaftaranSaya).
- **01-03**: admin master-data — sponsor + beasiswa CRUD on Supabase (manajemenSponsorBeasiswa), staff role guards, dead SPONSOR/ files removed.
- **Verification:** `node --check` clean on all changed JS; `BK.rules` unit-tested. **End-to-end NOT yet run** against the live DB.

## User Setup Required to verify live (Supabase dashboard)

1. Frontend creds: in `FRONTEND/shared/config.local.js` (gitignored) — already filled.
2. Run `DATABASE/supabase_schema.sql` (or the deltas in `DATABASE/migrations/2026-06-22-*.sql`: dokumen-mahasiswa, beasiswa-fields, sponsor-fields).
3. Create private buckets `dokumen-pendaftar` + `bukti-transfer`.
4. Seed 4-role accounts: Auth users with email `<NIM/NIP>@kampus.ac.id` + `profiles.role`; **disable email confirmation** (or pre-confirm).
5. Seed a few sponsors + `aktif` beasiswa so the catalog isn't empty.

## Next Command

- Verify Phase 1 live (login each role; complete profile+docs; submit; check pendaftaranSaya; staff CRUD), then proceed to Phase 2 (recommended framing: Verification + status/notifications/complaints on the real backend).
