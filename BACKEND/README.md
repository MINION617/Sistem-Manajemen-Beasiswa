# Backend — Express API tier

Thin API tier that sits between the frontend and Supabase. Public reads, auth, and realtime
stay on Supabase (guarded by RLS); **every privileged write goes through this API**, where the
caller's role is verified server-side against `public.profiles` — never trusted from the
browser or request body.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY with real values
npm run dev
```

`GET /health` should respond `{ "status": "ok" }` once running.

## Structure

```
src/
  server.js         entrypoint (app.listen)
  app.js            express app: middleware + route mounting
  config/           env loading, supabase admin client
  middleware/       auth (JWT verify + role lookup), requireRole guard, error handler
  modules/<domain>/ routes + controller + service, one folder per domain
```

Each new domain (status, notifikasi, laporan, seleksi, penyaluran, ...) follows the same
three-file pattern as `modules/verifikasi/`: `*.routes.js` wires middleware, `*.controller.js`
validates input and shapes the response, `*.service.js` holds the Supabase queries.

## Auth model

1. Frontend authenticates against Supabase's REST/Auth endpoints directly with `fetch()`
   (see `frontend/LOGIN/login.js`; no `@supabase/supabase-js` SDK is loaded in pages) and gets
   a JWT back.
2. Every API call sends `Authorization: Bearer <token>`.
3. `middleware/auth.js` verifies the token with Supabase and loads the role from `profiles`.
4. `middleware/requireRole(...roles)` guards routes that only certain roles may call.

## Known gaps (tracked in `.planning/`)

- The exact Postgres schema isn't dumped into git yet. `DATABASE/SCHEMA_NOTES.md` has a
  best-effort reconstruction from frontend/backend code — service files should match it, but
  treat both as unverified until a real schema dump lands (stabilization step S2).
- RLS policies are drafted (`DATABASE/policies/0001_rls_policies.sql`) but not yet applied to
  the live project; this API is the first line of defense today, RLS is meant to be the second.
