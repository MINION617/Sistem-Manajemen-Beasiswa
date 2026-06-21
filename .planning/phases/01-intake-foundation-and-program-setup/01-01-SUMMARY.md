# 01-01 SUMMARY — Shared Foundation + Real Supabase Login

**Plan:** 01-01 (wave 2) · **Executed:** 2026-06-22 · **Status:** code complete; login flow needs live-account verification

## What was delivered
| Artifact | Purpose |
|---|---|
| `FRONTEND/shared/supabaseConfig.js` | ONE Supabase client (`window.BK.sb`) + config; real creds via gitignored `config.local.js` (override) with hardcoded publishable fallback. Replaces 16 inline placeholders. |
| `FRONTEND/shared/session.js` | `BK.session` — `getSession/saveSession/clearSession/requireRole` on the `bk_user` contract (centralizes copy-pasted logic). |
| `FRONTEND/shared/applicationRules.js` | `BK.rules` — canonical KD-4 status enum + labels, `isProfileComplete`, `areCoreDocsComplete`, `isReadyToApply`, `initialStatus` (=`menunggu_verifikasi`), `isApplicationEditable` (D-10 cutoff). |
| `FRONTEND/shared/api.js` | `BK.api` — Supabase-backed data layer (auth, profile, dokumen_mahasiswa, beasiswa/sponsor read + CRUD, pendaftaran with anti-duplicate). |
| `FRONTEND/shared/config.local.example.js` | Tracked template; real `config.local.js` is gitignored. |
| `FRONTEND/LOGIN/login.js` | Rewired to **real Supabase Auth** via `BK.api.signIn`; dummy accounts removed; **4-role routing preserved**; forgot-password uses `resetPasswordForEmail`. |
| `FRONTEND/LOGIN/login.html` | Loads supabase-js CDN + shared layer (ordered) before `login.js`. |
| `DATABASE/migrations/2026-06-22-add-dokumen-mahasiswa.sql` | Delta to add `dokumen_mahasiswa` (added after the initial schema run). |

## Verification done
- `node --check` passes on all shared modules + login.js.
- Node smoke test of `BK.rules`: initial status, profile/doc completeness, `isReadyToApply` missing-lists, and editability all correct.

## Decisions / conventions
- **Login = email auth** with campus convention `<NIM/NIP>@kampus.ac.id` (`BK.config.emailFromIdentifier`). Seeded auth users MUST use this email pattern.
- **No dummy login** — Supabase is the only auth path (per "supabase live, pakai saja").
- Real creds are hardcoded (publishable key, public-safe) in `supabaseConfig.js` AND in gitignored `config.local.js`; override wins when present.

## Remaining USER SETUP for end-to-end login (Supabase dashboard)
1. Run `DATABASE/supabase_schema.sql` (if not yet) + `DATABASE/migrations/2026-06-22-add-dokumen-mahasiswa.sql`.
2. Create private buckets `dokumen-pendaftar` + `bukti-transfer`.
3. Seed 4-role accounts: Auth users with email `<NIM/NIP>@kampus.ac.id`, and `profiles.role` set (or role in user metadata so the bootstrap trigger sets it).
4. **Disable email confirmation** (Auth → Settings) or pre-confirm users — otherwise `signInWithPassword` fails with "Email not confirmed".

## Not done here
- Other mahasiswa/admin pages still consume their own inline data — migrated in 01-02 (mahasiswa) and 01-03 (admin).
