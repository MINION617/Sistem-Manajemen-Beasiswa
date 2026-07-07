/* ============================================================
   apiClient.js — Shared authenticated fetch helper
   Dipakai oleh halaman staff/kabag/wabag yang terhubung ke
   backend Express (BACKEND/src/app.js, jalan di localhost:4000).

   Interface: window.api.get(path) / .post(path, body) / .patch(path, body)
   Semua method mengembalikan body JSON hasil parse (biasanya
   berbentuk { data: ... } sesuai kontrak controller di backend).
   Token diambil dari sesi login (bk_user di sessionStorage/localStorage).
   ============================================================ */

const API_BASE = 'http://localhost:4000/api';

function getSession() {
  const raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthToken() {
  return getSession()?.access_token || null;
}

/* Supabase access tokens expire after ~1 hour; without this, every write
 * after that point fails with "Unauthorized: missing or invalid token"
 * even though the user never logged out (reported during long sessions
 * of manual data entry). One in-flight refresh is shared across
 * concurrent 401s so simultaneous requests don't each trigger their own. */
let refreshPromise = null;

async function refreshAccessToken() {
  const session = getSession();
  if (!session?.refresh_token || typeof SUPABASE_URL === 'undefined') return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.access_token) return null;
        const updated = { ...session, access_token: data.access_token, refresh_token: data.refresh_token };
        const store = sessionStorage.getItem('bk_user') ? sessionStorage : localStorage;
        store.setItem('bk_user', JSON.stringify(updated));
        return updated.access_token;
      })
      .catch(() => null)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function request(method, path, body, isRetry) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try { json = await res.json(); } catch { /* respons tanpa body (mis. 204) */ }

  if (res.status === 401 && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) return request(method, path, body, true);
  }

  if (!res.ok) {
    const message = json?.error || `Request gagal: ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, body: json });
  }

  return json ?? {};
}

/** Upload multipart (FormData) — tanpa Content-Type manual, biar browser
 * yang isi boundary-nya sendiri. */
async function uploadRequest(path, formData, isRetry) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });

  let json = null;
  try { json = await res.json(); } catch { /* respons tanpa body */ }

  if (res.status === 401 && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) return uploadRequest(path, formData, true);
  }

  if (!res.ok) {
    const message = json?.error || `Upload gagal: ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, body: json });
  }

  return json ?? {};
}

window.api = {
  get:    (path)           => request('GET',   path),
  post:   (path, body)     => request('POST',  path, body),
  patch:  (path, body)     => request('PATCH', path, body),
  delete: (path)           => request('DELETE', path),
  upload: (path, formData) => uploadRequest(path, formData),
};
