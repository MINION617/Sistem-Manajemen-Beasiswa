/* ============================================================
   supabaseConfig.js — single Supabase client for the whole frontend
   ============================================================
   Classic <script> (no bundler). Creates ONE Supabase client on the
   shared `window.BK` namespace, replacing the 16 duplicated placeholder
   `const SUPABASE_URL = '...'` blocks (audit M3 / 3.1).

   Required load order per page:
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="../shared/config.local.js"></script>        (gitignored, real creds)
     <script src="../shared/supabaseConfig.js"></script>
     <script src="../shared/applicationRules.js"></script>
     <script src="../shared/session.js"></script>
     <script src="../shared/api.js"></script>
     <script src="thePage.js"></script>
   ============================================================ */
(function (global) {
  var BK = (global.BK = global.BK || {});
  var cfg = global.__SUPABASE_CONFIG__ || {};

  var URL_ = cfg.url || 'https://dogehaapwppntxgewnzt.supabase.co';
  var ANON = cfg.anonKey || 'sb_publishable_R8WNFfaIFXWe4YMjt4I7Qg_3Q73wXHb';

  var configured =
    !!URL_ && !!ANON &&
    URL_.indexOf('your-project') === -1 &&
    URL_.toUpperCase().indexOf('sistem-informasi-manajemen-beasiswa') === -1 &&
    ANON.indexOf('your-anon-key') === -1 &&
    ANON.toUpperCase().indexOf('sb_publishable_R8WNFfaIFXWe4YMjt4I7Qg_3Q73wXHb') === -1;

  BK.config = {
    SUPABASE_URL: URL_,
    SUPABASE_ANON_KEY: ANON,
    isConfigured: configured,
    // login uses email auth; campus accounts use this NIM/NIP email convention
    emailFromIdentifier: function (identifier) {
      return identifier && identifier.indexOf('@') !== -1
        ? identifier
        : identifier + '@kampus.ac.id';
    },
  };

  // The supabase-js UMD global is named `supabase`; our client is BK.sb.
  if (!configured) {
    console.warn(
      '[BK] Supabase not configured — fill FRONTEND/shared/config.local.js with your project URL + anon key.'
    );
    BK.sb = null;
  } else if (!global.supabase || !global.supabase.createClient) {
    console.error(
      '[BK] supabase-js not loaded. Add the CDN <script> before supabaseConfig.js.'
    );
    BK.sb = null;
  } else {
    BK.sb = global.supabase.createClient(URL_, ANON, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
