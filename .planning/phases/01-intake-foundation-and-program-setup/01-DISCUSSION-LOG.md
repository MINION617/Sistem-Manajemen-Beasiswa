# Phase 1: Intake Foundation and Program Setup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 1-Intake Foundation and Program Setup
**Areas discussed:** Admin surface, Student account model, Student readiness, Application documents, Admin access, CRUD scope, Initial status, Student edit policy, Scholarship list UI, Data source

---

## Admin Surface

| Option | Description | Selected |
|--------|-------------|----------|
| Focus mahasiswa, admin minimal/internal | Mahasiswa flow is primary; admin only as needed for master data | ✓ |
| Admin with full menu skeleton | Build broader admin surface early, but activate little | |
| Mahasiswa-only now | Defer most admin work | |

**User's choice:** Focus mahasiswa first, with minimal/internal admin support.
**Notes:** User clarified that broader operational features like verification, scoring, recipient assignment, payout, and complaints belong in later phases, not Phase 1.

---

## Student Account Model

| Option | Description | Selected |
|--------|-------------|----------|
| Self registration | Mahasiswa creates their own account | |
| Campus-provisioned accounts | Accounts are prepared by campus; students log in/reset via NIM | ✓ |
| Mixed validation | Self registration but matched against campus data | |

**User's choice:** Campus-provisioned accounts.
**Notes:** This rules out Phase 1 self-signup as the primary path.

---

## Application Documents

| Option | Description | Selected |
|--------|-------------|----------|
| Per-scholarship dynamic requirements | Each beasiswa defines its own document set | |
| Standard package for all scholarships | One shared required package in Phase 1 | ✓ |
| Mixed global + per-program extras | Shared core docs plus optional custom docs | |

**User's choice:** Standard package for all scholarships.
**Notes:** Simplifies early intake implementation and admin setup.

---

## Student Readiness

| Option | Description | Selected |
|--------|-------------|----------|
| Profile optional at first | Students can proceed before full completion | |
| Profile required before applying | Complete profile first | |
| Profile plus core docs required before applying | Students must complete profile and upload core docs before applying | ✓ |

**User's choice:** Profile and core documents must be completed before application submission.
**Notes:** This creates a clear readiness gate in the mahasiswa flow.

---

## Admin Access

| Option | Description | Selected |
|--------|-------------|----------|
| Separate admin login page | Dedicated login surface for admin users | |
| One shared login page with role routing | Same login surface, then route by role | ✓ |
| Temporary internal page without proper auth | Minimal stopgap admin access | |

**User's choice:** Shared login page with role-based routing.
**Notes:** This should remain consistent with the existing brownfield auth surface.

---

## CRUD Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full CRUD sponsor and beasiswa | Create, read, update, delete both entities | ✓ |
| Create/edit only | Avoid delete in Phase 1 | |
| Mixed CRUD and active-toggle | Different depth for sponsor vs beasiswa | |

**User's choice:** Full CRUD for sponsor and beasiswa.
**Notes:** Even with minimal/internal admin scope, master data management must be complete.

---

## Initial Status

| Option | Description | Selected |
|--------|-------------|----------|
| `Menunggu verifikasi` | Immediate waiting-for-verification state after submit | ✓ |
| Draft then final submit | Separate draft stage first | |
| `Terkirim` | Generic sent state before review | |

**User's choice:** `Menunggu verifikasi`.
**Notes:** Downstream modeling should keep this as the first post-submit status.

---

## Student Edit Policy

| Option | Description | Selected |
|--------|-------------|----------|
| No edits after submit | Lock immediately | |
| Can edit until admin verifies | Flexible until review begins | ✓ |
| Edit only when returned for revision | Revision-driven unlock | |

**User's choice:** Students may edit until admin verification starts.
**Notes:** Planning should define what event ends the editable window.

---

## Scholarship List UI

| Option | Description | Selected |
|--------|-------------|----------|
| Pure card-first presentation | Keep current visual emphasis | |
| Dense table/list | Prioritize compactness | |
| Cards with stronger filter/search utility | Keep cards, but utility matters more | ✓ |

**User's choice:** Keep cards, but prioritize filtering and search usefulness.
**Notes:** Existing prototype structure can be reused, but UX priorities should shift toward finding relevant scholarships quickly.

---

## Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase as immediate source of truth | Build directly on live integration | |
| Legacy MySQL as main source | Follow old schema first | |
| Hybrid migration-first | Balance both sources | |
| JS dummy data | Start with JavaScript dummy data for implementation flow | ✓ |

**User's choice:** Use JS dummy data.
**Notes:** User explicitly said `make data dummy dari js`.

---

## the agent's Discretion

- Exact dummy data structure and normalization strategy.
- The lightest acceptable internal admin UI shape for Phase 1.

## Deferred Ideas

- Verification and validation workflow beyond initial submission.
- Test/interview scoring.
- Recipient assignment after plenary decisions.
- Fund disbursement execution and transfer proof workflow.
- Complaint handling operations.
