# Phase 1: Intake Foundation and Program Setup - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the initial working scholarship intake flow: mahasiswa log in with campus-provided accounts, complete required profile data, upload standard application documents, browse active scholarships, and submit applications; staff support in this phase stays minimal/internal and is limited to managing sponsor and scholarship master data.

</domain>

<decisions>
## Implementation Decisions

### Admin Surface
- **D-01:** Phase 1 prioritizes the mahasiswa experience; admin functionality should remain minimal/internal rather than a full admin product surface.
- **D-02:** Admin access should use the same login entry point as mahasiswa, with routing based on role after authentication.
- **D-03:** Admin Phase 1 still needs full CRUD for sponsor and scholarship master data.

### Student Account Model
- **D-04:** Mahasiswa accounts are pre-provisioned by campus; students do not self-register accounts in Phase 1.
- **D-05:** Login and password recovery should be centered on NIM-based identity, consistent with campus-managed accounts.

### Student Readiness Before Applying
- **D-06:** On first use, mahasiswa must complete profile data and upload the core required documents before they are allowed to submit any scholarship application.
- **D-07:** This readiness gate should be explicit in the UI so students know why application actions may be blocked.

### Application Documents and Submission Flow
- **D-08:** Phase 1 uses one standard document package shared by all scholarships rather than per-beasiswa document rules.
- **D-09:** A submitted application starts in `Menunggu verifikasi`.
- **D-10:** Mahasiswa may edit a submitted application until admin verification begins.

### Data and UI Direction
- **D-11:** Scholarship browsing should keep the current card-based presentation, but filtering and search should be prioritized over decorative presentation.
- **D-12:** ~~For Phase 1 planning and implementation, use JavaScript dummy data as the starting source for functional development rather than assuming the current MySQL dump or live Supabase data is authoritative on day one.~~ **[SUPERSEDED 2026-06-21 by KD-1 — see `.planning/AUDIT-PHASE1.md`]** Phase 1 now builds a real Supabase backend (schema + RLS + storage) per KD-1 = Opsi A; dummy JS data is downgraded to seed/fallback only.

### the agent's Discretion
- Exact data shape for dummy JS seed data may be normalized so it can later map cleanly onto Supabase tables and role-based screens.
- The internal admin surface can be implemented with the lightest structure that still supports reliable CRUD and future expansion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Sources
- `.planning/PROJECT.md` - product context, brownfield constraints, and the locked platform direction.
- `.planning/REQUIREMENTS.md` - Phase 1 requirement IDs `AUTH-01`, `PROF-01`, `DOCS-01`, `APPL-01`, `APPL-02`, `SPON-01`, and `SCHL-01`.
- `.planning/ROADMAP.md` - Phase 1 goal, boundary, and success criteria.
- `.planning/STATE.md` - current project status and workflow handoff point.

### Existing Code References
- `FRONTEND/LOGIN/login.js` - current login behavior, dummy account approach, and NIM/email handling.
- `FRONTEND/daftarBeasiswa/daftarBeasiswa.js` - current scholarship catalog, detail modal, and application submission flow.
- `FRONTEND/profilMahasiswa/profilMahasiswa.js` - current mahasiswa profile editing pattern.
- `BACKEND/supabaseclient.js` - existing client-side service layer for auth, profile, scholarship, sponsor, application, and document upload operations.
- `DATABASE/beasiswa.sql` - legacy schema reference only; useful for reconciling domain entities, but not the locked source of truth for Phase 1.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `FRONTEND/LOGIN/login.js`: already contains NIM-aware login handling and a dummy-account pattern that can be adapted to the locked campus-provisioned account model.
- `FRONTEND/daftarBeasiswa/daftarBeasiswa.js`: already has scholarship card rendering, filtering hooks, detail modal flow, and a staged application form.
- `FRONTEND/profilMahasiswa/profilMahasiswa.js`: already provides a profile edit surface that can become the required readiness gate before applying.
- `BACKEND/supabaseclient.js`: already exposes helper functions for profiles, scholarships, sponsors, applications, and document upload/recording.

### Established Patterns
- Session state is currently stored in `sessionStorage` / `localStorage` under `bk_user`.
- Frontend is organized as role-oriented HTML/CSS/JS pages rather than a component framework.
- Several screens already rely on dummy JavaScript data, which aligns with the Phase 1 decision to begin with JS dummy data.
- Supabase is the intended long-term integration pattern even where current pages still operate in demo mode.

### Integration Points
- Shared login entry can route users by role after authentication succeeds.
- Profile completeness checks should hook into the existing mahasiswa profile page and the application form entry point.
- Sponsor and scholarship CRUD can connect to the existing domain naming and helper functions in `BACKEND/supabaseclient.js`, even if the first pass uses dummy data.
- Scholarship list filtering/search should build on the existing `activeFilter` and `searchQuery` flow in `FRONTEND/daftarBeasiswa/daftarBeasiswa.js`.

</code_context>

<specifics>
## Specific Ideas

- The user explicitly wants one-pass answers and clear up-front questioning, which suggests future discussion/planning prompts should batch remaining product choices when practical.
- The user explicitly chose `make data dummy dari js`, so downstream plans should not assume immediate dependency on live backend readiness.

</specifics>

<deferred>
## Deferred Ideas

- Verifikasi dan validasi pendaftar belongs to Phase 2.
- Input hasil seleksi tes dan wawancara belongs to Phase 3.
- Penetapan penerima beasiswa belongs to Phase 3.
- Kelola penyaluran dan pencairan dana belongs to Phase 4.
- Pusat penanganan laporan kendala belongs to later operational phases, primarily Phase 2 and beyond.

</deferred>

---
*Phase: 1-Intake Foundation and Program Setup*
*Context gathered: 2026-06-17*
