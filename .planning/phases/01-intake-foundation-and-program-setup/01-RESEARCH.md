# Phase 1 Research: Intake Foundation and Program Setup

**Date:** 2026-06-17
**Phase:** 1
**Mode:** MVP walking skeleton

## Objective

Find the safest implementation direction for a brownfield scholarship web app that must deliver a working mahasiswa intake flow first, keep admin minimal/internal, and start from JavaScript dummy data while preserving an easy path toward Supabase-backed production behavior.

## Codebase Findings

### Existing strengths

- `FRONTEND/LOGIN/login.js` already supports a dummy-account approach, session persistence, and login using email or `nim_nip`.
- `FRONTEND/profilMahasiswa/profilMahasiswa.js` already has a profile editing surface that can become the readiness gate before application submission.
- `FRONTEND/daftarBeasiswa/daftarBeasiswa.js` already has scholarship cards, filtering, detail modal, file upload UI, and an application submit flow.
- `BACKEND/supabaseclient.js` already defines the long-term operations needed for profiles, scholarships, sponsors, applications, and document uploads.

### Current gaps

- There is no real shared domain module for dummy data; dummy lists are embedded inside pages, which will make cross-role consistency brittle.
- Role routing is incomplete; the current login script is mahasiswa-only and redirects straight to `dashboard.html`.
- `FRONTEND/SPONSOR/sponsor.js` is empty, so sponsor/program master data is not yet operational.
- The current form flow assumes one-off page-local state instead of a shared source of truth for applications and sponsor/program data.

## Recommended Direction

### 1. Normalize JS dummy data into shared modules first

Create shared JavaScript seed/state modules for:
- campus-provisioned users and roles
- mahasiswa profiles
- sponsor records
- scholarship programs
- application records
- standard document requirements

This makes student and admin screens consistent now and gives a cleaner migration path to Supabase later.

### 2. Keep the existing multi-page frontend structure

Do not rewrite the app into a new framework in Phase 1. Reuse the brownfield HTML/CSS/JS layout, but factor out data/state logic into shared scripts to reduce duplication.

### 3. Treat profile readiness as the phase gate

The user decision is clear: mahasiswa must complete profile data and upload core documents before applying. That gate should be enforced in both:
- the mahasiswa profile page
- the scholarship application entry point

### 4. Use one shared login surface with role routing

The login page should authenticate against dummy campus-provisioned accounts and then route by role:
- mahasiswa -> student dashboard / scholarship flow
- admin -> minimal internal sponsor/program management surface

### 5. Limit admin scope to master data only

Admin Phase 1 should not absorb verification, scoring, or finance work. A compact internal CRUD surface is enough if it fully manages sponsor and scholarship records.

## Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Page-local dummy data divergence | Student and admin pages may disagree on sponsor/beasiswa/application state | Centralize dummy data into shared JS modules |
| Shared login regression | Existing mahasiswa login flow may break when role routing is introduced | Keep one session contract and add role-aware redirects incrementally |
| Readiness gate confusion | Students may not understand why apply actions are blocked | Show explicit missing-profile / missing-document reasons in the UI |
| Overplanning admin | Phase 1 could expand into back-office complexity | Keep CRUD-only admin scope in plans and defer everything else |

## Planning Implications

- Use **3 plans** total for coarse granularity.
- Plan 1 should create the shared walking-skeleton foundation.
- Plan 2 should deliver the mahasiswa vertical slice on top of that foundation.
- Plan 3 should deliver the minimal internal admin slice in parallel after the shared foundation exists.

## Recommended File Targets

### Shared foundation

- `FRONTEND/shared/` or equivalent new shared JS modules for session, dummy data, and application helpers
- `BACKEND/supabaseclient.js` only if adapters or comments need alignment with the new dummy-data contract

### Mahasiswa flow

- `FRONTEND/LOGIN/login.js`
- `FRONTEND/profilMahasiswa/profilMahasiswa.js`
- `FRONTEND/daftarBeasiswa/daftarBeasiswa.js`
- related HTML/CSS files where gating or status messaging must surface

### Admin flow

- `FRONTEND/SPONSOR/sponsor.js`
- related sponsor HTML/CSS files
- any shared routing/session helpers needed for admin access

## Outcome Sought

At the end of Phase 1, the project should prove one full end-to-end capability using dummy JS data: a campus-provisioned mahasiswa can sign in, complete required profile/doc state, browse scholarships, and submit an application; an internal admin can manage sponsor and scholarship master data through the same app surface.
