# Walking Skeleton - Sistem Informasi Manajemen Beasiswa

**Phase:** 1
**Generated:** 2026-06-17

## Capability Proven End-to-End

> A campus-provisioned mahasiswa can sign in, satisfy profile/document readiness, browse scholarship offerings, and submit an application while the same app also exposes a minimal internal admin surface for sponsor and scholarship master data.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend structure | Preserve existing multi-page HTML/CSS/JS app | Brownfield repo already has usable flows and screens; Phase 1 should extend rather than rewrite |
| Data layer for Phase 1 | Shared JavaScript dummy data modules | User explicitly requested dummy JS data first; this is fastest while still allowing later Supabase alignment |
| Long-term backend direction | Keep Supabase client contract as future source of truth | Existing helpers already model the target auth/data/storage behavior |
| Auth shape | Single login surface with role-based routing | Locked by phase context and matches current app structure better than separate auth stacks |
| Directory layout | Add shared frontend state/helpers under the existing frontend tree | Lowest-disruption way to eliminate page-local dummy data duplication |

## Stack Touched in Phase 1

- [x] Project scaffold already exists in brownfield form
- [x] Routing via existing page navigation and role redirects
- [x] Data read/write through dummy JS state mutations
- [x] UI interaction via login, profile, filtering, and apply/admin forms
- [x] Local full-stack/dev run remains browser-driven with current static assets

## Out of Scope (Deferred to Later Slices)

- Applicant verification decisions
- Test and interview scoring
- Recipient assignment after plenary review
- Payout and transfer-proof workflow
- Complaint operations beyond preserving future hooks
- Live Supabase persistence as the mandatory execution path

## Subsequent Slice Plan

- Phase 2: verification, transparency, notifications, and complaint handling
- Phase 3: evaluation, scoring, and plenary recipient decisions
- Phase 4: disbursement, audit, and executive reporting
