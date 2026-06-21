/* ============================================================
   session.js — shared session helpers (centralizes the `bk_user`
   contract previously copy-pasted across ~11 pages — audit M3)
   ============================================================
   Exposes window.BK.session:
     getSession()              -> the stored user object or null
     saveSession(user, remember) -> persist to sessionStorage (+localStorage if remember)
     clearSession()            -> remove from both stores
     requireRole(role|roles)   -> redirect to login if not signed in / wrong role
   ============================================================ */
(function (global) {
  var BK = (global.BK = global.BK || {});
  var KEY = 'bk_user';

  function loginPath() {
    // Resolve ../LOGIN/login.html relative to nesting depth of the page.
    var p = global.location ? global.location.pathname : '';
    // Pages live at FRONTEND/<page>/file.html or FRONTEND/<A>/<B>/file.html
    if (/\/FRONTEND\/[^/]+\/[^/]+\/[^/]+$/.test(p)) return '../../LOGIN/login.html';
    return '../LOGIN/login.html';
  }

  function getSession() {
    try {
      var s = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(user, remember) {
    var json = JSON.stringify(user);
    sessionStorage.setItem(KEY, json);
    if (remember) localStorage.setItem(KEY, json);
  }

  function clearSession() {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  }

  function requireRole(role) {
    var allowed = Array.isArray(role) ? role : [role];
    var s = getSession();
    if (!s || allowed.indexOf(s.role) === -1) {
      global.location.href = loginPath();
      return null;
    }
    return s;
  }

  BK.session = {
    KEY: KEY,
    getSession: getSession,
    saveSession: saveSession,
    clearSession: clearSession,
    requireRole: requireRole,
  };
})(typeof window !== 'undefined' ? window : globalThis);
