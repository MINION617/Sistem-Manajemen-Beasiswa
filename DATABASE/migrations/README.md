# Migrations

Empty until the live Supabase schema is dumped (Stabilization step S2, see
`DATABASE/README.md`). Once `supabase db dump` (or an equivalent pg_dump against the project)
produces a baseline, commit it as `0000_baseline.sql` here and switch to the Supabase CLI
migration workflow (`supabase migration new <name>`) for every schema change from then on —
schema changes should never again be dashboard-only edits with no record in git.
