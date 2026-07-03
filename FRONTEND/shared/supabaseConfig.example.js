/* ============================================================
   SUPABASE CONFIG — single source of truth for the browser client.
   ============================================================
   Copy this file to `supabaseConfig.js` (gitignored) and fill in the
   real values from the Supabase project dashboard (Settings > API).

   The anon key is safe to expose in the browser — it has no power on
   its own, access is enforced by RLS policies on each table. NEVER put
   the service-role key here; that one only belongs in backend/.env.

   Load this script BEFORE a page's own script, e.g.:
     <script src="../shared/supabaseConfig.js"></script>
     <script src="dashboard.js"></script>
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
