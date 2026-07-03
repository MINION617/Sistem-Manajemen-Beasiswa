# Roadmap: Sistem Informasi Manajemen Beasiswa

**Created:** 2026-06-17
**Reorganized:** 2026-07-03
**Project Mode:** mvp
**Total Phases:** 4
**Total v1 Requirements:** 23

## Reorganization Note (2026-07-03)

The original roadmap was a pure vertical slice (intake → verification → evaluation →
disbursement). In practice the team built the **frontend far ahead of plan** while the
**backend was never stood up** (`backend/server.js` is empty; the app talked to Supabase
directly from the browser, with no server-side role enforcement and no schema in git).

The roadmap is therefore re-sequenced to **backend-first reality**:

- **Phase 2 = Backend Foundation & Integration** — stabilize, stand up a real API tier
  (Node.js + Express, hybrid with Supabase), and make the already-built pages actually work.
- **Phase 3 = Feature Completion & Correction** — add the remaining features (evaluation,
  disbursement, finance) and fix what was implemented off-plan.
- **Phase 4 = Hardening & Code Cleanup** — pay down tech debt, dedupe, tests, docs.

Requirement coverage is unchanged: all 23 v1 requirements remain mapped to exactly one phase.

## Architecture Baseline (decided 2026-07-03)

- **Hybrid API tier.** Browser keeps using Supabase for Auth, public reads, and Realtime
  (guarded by RLS). All **write / privileged operations** (verification, scoring,
  disbursement) go through an **Express API** using the service-role key server-side, where
  role is verified. Role is no longer trusted from `localStorage`.
- **Schema lives in git.** The real Supabase schema is dumped to `DATABASE/schema.sql` with a
  `DATABASE/migrations/` folder. The legacy MySQL `beasiswa.sql` is archived (it does not
  match the running system).

## Coverage Summary

All v1 requirements are mapped to exactly one phase. Phase 4 carries no new functional
requirements — it is a quality/tech-debt phase.

### Phase 1: Intake Foundation and Program Setup
**Goal:** Deliver the minimum end-to-end foundation so mahasiswa can authenticate, maintain required profile data, discover scholarships, submit applications, and staff can manage sponsor and scholarship master data.
**Mode:** mvp
**Status:** UI prototype delivered ahead of plan. Real backend wiring and auth/role
enforcement are folded into Phase 2.
**Requirements:** AUTH-01, PROF-01, DOCS-01, APPL-01, APPL-02, SPON-01, SCHL-01
**UI hint:** yes (pages already exist under `frontend/`)
**Success Criteria**:
1. Mahasiswa can sign in, complete profile data, upload required documents, and submit at least one scholarship application from the web interface.
2. Staff can create and maintain sponsor records and active scholarship programs without direct database edits.
3. Submitted applications persist with enough structure to support downstream verification and status tracking.
4. Role-aware navigation separates student and administrative entry points clearly.

### Phase 2: Backend Foundation and Feature Integration
**Goal:** Stand up a real, secure backend (Node.js + Express API tier over Supabase), close the security gap where privileged operations were callable from the browser, and make the already-built verification/status/notification/complaint pages work end-to-end against it.
**Mode:** mvp
**Requirements:** VERI-01, STAT-01, STAT-02, NOTF-01, COMP-01, COMP-02, MGMT-01
**UI hint:** yes (wire existing pages, do not rebuild)
**Foundation work (stabilization, precedes feature wiring):**
- Rotate Supabase keys; confirm `.env` is untracked and scrub secrets from history if present.
- Dump the live Supabase schema to `DATABASE/schema.sql`; create `DATABASE/migrations/`; archive the legacy MySQL `beasiswa.sql`.
- Enable and audit RLS (default-deny) on every table with a documented role→table→action matrix.
- Unify frontend Supabase config into one `frontend/shared/supabaseClient.js`; remove the duplicated placeholder config in `login.js` and `daftarBeasiswa.js`.
- Stand up the Express skeleton (`backend/src/server.js` + `/health`) with `auth` and `requireRole` middleware; deploy it.
**Success Criteria**:
1. Express API is live with JWT verification and server-side role guards; no privileged mutation is callable with the anon key from the browser.
2. RLS is enabled default-deny on all tables and verified against the role matrix (second line of defense).
3. Staff can review applicant submissions and move them to Verified or Rejected via the API, with status updates visible to students.
4. Mahasiswa can see current application and disbursement status without contacting staff manually.
5. Realtime notifications are delivered for major status changes and payout updates.
6. Complaint submission and resolution tracking are visible to both students and staff.
7. Kabag can view current applicant counts and active pipeline statistics from a dedicated dashboard.

### Phase 3: Feature Completion and Correction
**Goal:** Add the remaining scholarship-lifecycle features (evaluation/scoring, recipient decisions, disbursement, and finance oversight) on top of the Phase 2 backend, and correct features that were implemented off-plan or against the mismatched data model.
**Mode:** mvp
**Requirements:** SELE-01, SELE-02, MGMT-02, MGMT-03, PAY-01, PAY-02, FIN-01, FIN-02, FIN-03
**UI hint:** yes
**Correction work (alongside new features):**
- Reconcile any frontend built against the stale/mismatched schema with the canonical Supabase model.
- Replace remaining direct-Supabase privileged calls left over from prototypes with API calls.
**Success Criteria**:
1. Staff can record test and interview outcomes for verified applicants in a structured way.
2. Kabag can review complete applicant context (GPA, certificates, scores) before plenary decisions, and see complaint trends.
3. Final recipient decisions can be recorded and reflected in recipient-facing and management-facing views.
4. Staff can upload transfer proof and mark recipient disbursements as paid.
5. Kabag can review final recipients grouped by scholarship and sponsor.
6. Wakil Bagian Keuangan can inspect transfer proof and verify payout records for audit purposes.
7. Finance dashboards show total disbursed funds and sponsor-based allocation summaries derived from live system data.

### Phase 4: Hardening and Code Cleanup
**Goal:** Pay down the tech debt accumulated during the frontend-ahead build so the codebase is consistent, maintainable, and safe to extend. No new functional requirements.
**Mode:** mvp
**Requirements:** (none — quality/tech-debt phase)
**UI hint:** no
**Scope:**
- Remove dead code (unused `backend/supabaseclient.js` remnants after migration) and duplicated logic across pages.
- Clean frontend dependencies to match the actual stack (drop unused `react-router-dom`/`axios`; fill the empty `frontend/package.json`).
- Standardize backend module structure (routes/controller/service), error handling, and input validation across all modules.
- Add a baseline test layer (API smoke/integration) and wire CI.
- Document setup, environment, schema, and the role/RLS matrix.
**Success Criteria**:
1. No duplicated Supabase configuration or dead privileged helpers remain in the frontend.
2. Frontend and backend dependency manifests reflect only what is actually used.
3. All backend modules follow one consistent structure with centralized error handling and input validation.
4. CI runs lint plus API smoke tests on every PR and blocks merge on failure.
5. A developer can set up and run the full stack from documentation alone.

## Phase Table

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Intake Foundation and Program Setup | Authentication, student intake, application submission, sponsor/program master data (UI prototype delivered) | 7 | 4 |
| 2 | Backend Foundation and Feature Integration | Stand up secure Express API tier + RLS; wire verification, status, notifications, complaints, kabag stats | 7 | 7 |
| 3 | Feature Completion and Correction | Add evaluation, decisions, disbursement, finance; correct off-plan features | 9 | 7 |
| 4 | Hardening and Code Cleanup | Remove tech debt, standardize structure, add tests/CI/docs | 0 | 5 |

---
*Last updated: 2026-07-03 after backend-first roadmap reorganization*
