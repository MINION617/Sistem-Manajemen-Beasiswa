-- Migration delta — REQUIRED. Run this in the Supabase SQL editor.
-- The custom public.* tables were created without role grants, so queries
-- fail with "permission denied for table ..." (code 42501) even when RLS
-- would allow the row. These grants give the Supabase roles table-level
-- access; RLS policies still enforce row-level rules.

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated, service_role;
grant select on all tables in schema public to anon;

-- future tables inherit these grants
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public grant select on tables to anon;
