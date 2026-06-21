/* ============================================================
   supabaseConfig.js — SINGLE source of the browser Supabase client
   ============================================================
   Replaces the 16 duplicated, non-functional placeholder blocks
   (`const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'`) scattered
   across the frontend (audit M3 / 3.1).

   USAGE (no bundler in this project, so load as an ES module):
     <script type="module">
       import { supabase } from '../shared/supabaseConfig.js';
       // ... use supabase.auth / supabase.from(...) ...
     </script>

   CONFIG: set the two PUBLIC values below for your Supabase project.
   They are the anon (publishable) key + project URL — safe for the browser.
   The service-role key must NEVER appear here; it stays server-side only.

   You can also override at runtime without editing this file by defining
   `window.__SUPABASE_CONFIG__ = { url, anonKey }` before this module loads.
   ============================================================ */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RUNTIME = (typeof window !== 'undefined' && window.__SUPABASE_CONFIG__) || {};

// TODO: paste your real project values (or set window.__SUPABASE_CONFIG__).
export const SUPABASE_URL =
  RUNTIME.url || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY =
  RUNTIME.anonKey || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
