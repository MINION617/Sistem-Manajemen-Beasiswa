# 01-04 SUMMARY — Supabase Foundation

**Plan:** 01-04 (wave 1) · **Executed:** 2026-06-21 · **Status:** code artifacts complete, pending user Supabase setup

## What was delivered

| Task | Artifact | Status |
|---|---|---|
| Task 1 — repo hygiene | `.gitignore`, `BACKEND/.env.example`, untrack `BACKEND/.env` | ✅ Done (committed earlier as the hygiene step) |
| Task 2 — canonical schema | `DATABASE/supabase_schema.sql`: 4 status enums + `app_role`, 10 tables, FKs, `handle_new_user()` profile trigger | ✅ Done |
| Task 3 — RLS + storage | RLS enabled on all 10 tables, per-role policies (mahasiswa/staff/kabag/wabag), 2 private storage buckets + object policies | ✅ Done |
| Task 4 — single client | `FRONTEND/shared/supabaseConfig.js` (one `createClient`, runtime-overridable config) | ✅ Done |

## Key design notes
- **Reconciled with the client:** table/column names match `BACKEND/supabaseclient.js` (`nama_program`, `nominal_dana`, `mahasiswa_id`, `pendaftaran` join graph, etc.), not the legacy MySQL dump.
- **KD-3 baked in:** `penerima_beasiswa` has `diusulkan_oleh`/`tanggal_usul` (Staff) and `disahkan_oleh`/`tanggal_acc` (Kabag) + `status_penerima` enum (`diusulkan`→`disahkan`). RLS: staff insert/propose, kabag update/ACC.
- **D-10 editability** enforced at the DB layer: `pendaftaran_update_owner` policy only allows a mahasiswa to update their row while `status = 'menunggu_verifikasi'`.
- **Anti-duplicate (C4):** `unique (mahasiswa_id, beasiswa_id)` on `pendaftaran`.
- **RLS recursion avoided:** `current_role()` is `SECURITY DEFINER` so role lookups don't re-trigger the profiles policy.
- **Upload security:** documents bucket scoped to `<auth.uid()>/...`; transfer-proof bucket staff-write / finance-read.

## ⚠️ Remaining USER SETUP before 01-01/02/03 can run + verify
1. Create a Supabase project; put real `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `BACKEND/.env` (now gitignored) and/or `FRONTEND/shared/supabaseConfig.js`.
2. Run `DATABASE/supabase_schema.sql` in the SQL editor.
3. Create the two private buckets `dokumen-pendaftar` and `bukti-transfer` (the policy SQL is in the schema file; uncomment the `insert into storage.buckets` lines or create via dashboard).
4. Seed campus-provisioned accounts (auth.users + profiles) for the 4 roles.

## Not done here (by design)
- Per-page rewiring from inline placeholders → `supabaseConfig.js` happens in 01-01 (auth/core) and 01-02/01-03 (slices).
- No end-to-end verification yet — requires the live project from the setup steps above.
