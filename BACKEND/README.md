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

1. Frontend authenticates via the Supabase SDK and gets a JWT.
2. Every API call sends `Authorization: Bearer <token>`.
3. `middleware/auth.js` verifies the token with Supabase and loads the role from `profiles`.
4. `middleware/requireRole(...roles)` guards routes that only certain roles may call.

## Known gaps (tracked in `.planning/`)

- The exact Postgres schema (enum values, column names) isn't dumped into git yet — see
  `TODO(schema)` markers in service files. Confirm against `DATABASE/schema.sql` once the
  stabilization step (dump live Supabase schema) lands.
- RLS policies are not yet documented/audited; this API is the first line of defense today,
  RLS is meant to be the second.
