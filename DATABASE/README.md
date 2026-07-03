# DATABASE

- `SCHEMA_NOTES.md` — reconstructed schema reference (tables/columns/enums), assembled from
  frontend/backend code since no real schema dump exists yet. Read the caveats at the top.
- `legacy/beasiswa.sql` — archived MySQL dump from an early design; does not match the running
  system, kept for history only.
- `migrations/` — empty, waiting for a real Supabase schema dump (see below).
- `policies/0001_rls_policies.sql` — draft RLS policies (default-deny, second line of defense
  behind the Express API). **Not yet applied to the live project.**

## Phase 2 Stabilization Checklist

Tracked from `.planning/ROADMAP.md` Phase 2 "Foundation work". Status as of 2026-07-03:

- [ ] **S1 — Rotate Supabase keys.** Requires dashboard access (Project Settings > API >
      regenerate anon + service-role keys), which this environment does not have. Action for
      the project owner:
      1. Regenerate both keys in the Supabase dashboard.
      2. Update `backend/.env` (service-role + JWT secret) and `frontend/shared/supabaseConfig.js`
         (anon key) — both are gitignored, safe to edit locally.
      3. Confirm `.env` is not tracked: `git ls-files | grep -i '\.env$'` should print nothing.
      4. If the old key was ever committed, treat it as compromised even after rotation —
         check `git log --all -p -- backend/.env` for any historical commit that included it.
- [ ] **S2 — Dump live schema.** Requires Supabase CLI or dashboard SQL editor access. Run
      `supabase db dump --schema public -f DATABASE/migrations/0000_baseline.sql` (or export via
      the dashboard), then reconcile every open question in `SCHEMA_NOTES.md` against it and
      delete this note once done.
- [ ] **S3 — Enable + apply RLS.** Review `policies/0001_rls_policies.sql` against the real
      schema from S2, adjust table/column names if they differ, then run it in the Supabase SQL
      editor (or via `supabase db push` once it's a tracked migration).
- [x] **S4 — Unify frontend Supabase config.** Done in this branch: all 21 pages now load
      `frontend/shared/supabaseConfig.js` (gitignored; copy from `supabaseConfig.example.js`)
      instead of each declaring its own `SUPABASE_URL`/`SUPABASE_ANON_KEY`.
- [x] **Express skeleton + auth/role middleware.** Done in `feat/phase-02-backend-skeleton`
      (PR #2) — `backend/src/middleware/auth.js` + `requireRole.js`, `modules/verifikasi/` as
      the template module.
