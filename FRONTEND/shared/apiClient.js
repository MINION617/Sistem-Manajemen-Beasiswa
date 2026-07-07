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

function getAuthToken() {
  const raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw)?.access_token || null;
  } catch {
    return null;
  }
}

async function request(method, path, body) {
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

  if (!res.ok) {
    const message = json?.error || `Request gagal: ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, body: json });
  }

  return json ?? {};
}

/** Upload multipart (FormData) — tanpa Content-Type manual, biar browser
 * yang isi boundary-nya sendiri. */
async function uploadRequest(path, formData) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });

  let json = null;
  try { json = await res.json(); } catch { /* respons tanpa body */ }

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
