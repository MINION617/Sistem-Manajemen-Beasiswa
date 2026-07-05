/* ============================================================
   API CLIENT — single entry point for calls to the Express backend.
   ============================================================
   Load this AFTER supabaseConfig.js and BEFORE a page's own script:
     <script src="../shared/supabaseConfig.js"></script>
     <script src="../shared/apiClient.js"></script>
     <script src="dashboard.js"></script>

   Privileged/write operations (verification, scoring, disbursement,
   approvals) go through this client to backend/src — never straight
   to Supabase with the anon key. Read-only/public data may still use
   Supabase directly.
   ============================================================ */

const API_BASE_URL = 'http://localhost:4000/api';

class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function getStoredUser() {
  const raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return raw ? JSON.parse(raw) : null;
}

async function apiFetch(path, options = {}) {
  const user = getStoredUser();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (user?.access_token) {
    headers.Authorization = `Bearer ${user.access_token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  let body = null;
  const text = await res.text();
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }

  if (!res.ok) {
    if (res.status === 401) {
      sessionStorage.removeItem('bk_user');
      localStorage.removeItem('bk_user');
      window.location.href = '/LOGIN/login.html';
    }
    throw new ApiError(body?.error || `Request gagal (${res.status})`, res.status, body);
  }

  return body;
}

const api = {
  get: (path) => apiFetch(path, { method: 'GET' }),
  post: (path, data) => apiFetch(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: (path, data) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
};
