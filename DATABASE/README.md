# DATABASE

- `SCHEMA_NOTES.md` — confirmed schema summary + corrections vs. the earlier code-archaeology
  guesswork. Read this first.
- `migrations/0000_baseline.sql` — the real schema (tables/columns/types/enums/FKs),
  reconstructed from a live metadata query. Reference snapshot, not meant to be re-run.
- `migrations/0001_add_pendaftaran_catatan_verifikasi.sql` — **needs to be run** (see
  checklist below); adds the column `backend/src/modules/verifikasi` writes to.
- `legacy/beasiswa.sql` — archived MySQL dump from an early design; does not match the running
  system, kept for history only.
- `policies/0001_rls_policies.sql` — **superseded**, do not run. Written before we knew RLS was
  already enabled live with its own policies. Kept as a design-reasoning reference only.

## Phase 2 Stabilization Checklist

Tracked from `.planning/ROADMAP.md` Phase 2 "Foundation work". Status as of 2026-07-03:

- [x] **S1 — Rotate Supabase keys.** Done (project owner, via dashboard).
- [x] **S2 — Dump live schema.** `supabase db dump` wasn't usable in this environment
      (commonly needs Docker Desktop running, or hits IPv6-only direct-connection issues on
      Windows). Used a read-only `information_schema`/`pg_catalog` query in the Supabase SQL
      Editor instead — equivalent ground truth, captured in `migrations/0000_baseline.sql` and
      `SCHEMA_NOTES.md`.
- [x] **S3 — RLS.** Turned out to already be enabled on every table with policies in place
      (not something this repo did — discovered via the same query). Exact `USING`/`WITH CHECK`
      logic isn't captured yet; see "Still open" in `SCHEMA_NOTES.md` if a full policy audit is
      needed later. `policies/0001_rls_policies.sql` is superseded, not applied.
- [x] **S4 — Unify frontend Supabase config.** All 21 pages now load
      `frontend/shared/supabaseConfig.js` (gitignored; copy from `supabaseConfig.example.js`)
      instead of each declaring its own `SUPABASE_URL`/`SUPABASE_ANON_KEY`.
- [x] **Express skeleton + auth/role middleware.** `backend/src/middleware/auth.js` +
      `requireRole.js`, `modules/verifikasi/` as the template module.

## Action needed before verifikasi goes live

Run `migrations/0001_add_pendaftaran_catatan_verifikasi.sql` in the Supabase SQL editor.
`pendaftaran` has no notes/reason column in the baseline schema; `verifikasi.service.js`
(VERI-01) needs one to record why an application was rejected.
