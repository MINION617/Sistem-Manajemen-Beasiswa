/* ============================================================
   LOGIN.JS — Beasiswa Kampus (Multi-Role)
   ============================================================

   STRUKTUR FILE:
   01. Konfigurasi Supabase
   02. Konfigurasi Role (ROLE_CONFIG)
   03. Akun Dummy — hanya untuk development
   04. State
   05. Auto-redirect jika sudah login
   06. Render konten sesuai role
   07. Pemilih role (role switcher)
   08. Toggle tampil/sembunyikan password
   09. Submit login
   10. Supabase helpers (produksi)
   11. Session helpers
   12. UI helpers
   13. Modal — Lupa Password
   14. Modal helpers
   15. Init

   ALUR REDIRECT PER ROLE:
     mahasiswa → ../dashboard/dashboard.html
     staff     → ../STAFFADMIN/dashboardStaffAdmin.html
     kabag     → ../KABAGWABAG/KABAG/dashboardKabag.html
     wabag     → ../KABAGWABAG/WABAG/dashboardWabag.html

   CATATAN:
     - Registrasi mandiri DIHAPUS. Akun mahasiswa dibuat oleh
       admin kampus dari data akademik (NIM + password sistem).
     - hasRegister dihapus dari ROLE_CONFIG karena tidak relevan.
   ============================================================ */


/* ============================================================
   01. KONFIGURASI SUPABASE
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';


/* ============================================================
   02. KONFIGURASI ROLE
   Mengatur tampilan panel kiri + form sesuai role yang dipilih.
   ============================================================ */

const ROLE_CONFIG = {

  mahasiswa: {
    logo        : '🎓',
    badge       : 'Portal Mahasiswa 2026/2027',
    title       : 'Masuk dan Kelola <span class="title-highlight">Beasiswa</span> Kamu Disini.',
    desc        : 'Pantau status seleksi, cek pencairan dana, dan terima notifikasi real-time — semua dalam satu platform.',
    formTitle   : 'Selamat Datang!',
    formSubtitle: 'Masuk ke portal mahasiswa Beasiswa Kampus',
    idLabel     : 'NIM',
    idPlaceholder: 'Masukkan NIM kamu',
    redirect    : '../dashboard/dashboard.html',
    demoHint    : 'Akun demo — NIM <code>2150001</code> · Password <code>demo1234</code>',
    features: [
      { icon: '🎓', title: 'Daftar Beasiswa',       sub: '9+ beasiswa aktif dari sponsor terpercaya' },
      { icon: '📊', title: 'Pantau Status Seleksi',  sub: 'Tracking real-time setiap tahap seleksi' },
      { icon: '🔔', title: 'Notifikasi Langsung',    sub: 'Update otomatis saat status berubah' },
      { icon: '💰', title: 'Cek Pencairan Dana',     sub: 'Lihat status transfer & riwayat penerimaan' },
    ],
    stats: [
      { num: '1.240', label: 'Mahasiswa aktif' },
      { num: '48',    label: 'Beasiswa tersedia' },
      { num: '32',    label: 'Sponsor mitra' },
    ],
  },

  staff: {
    logo        : '🗂️',
    badge       : 'Portal Staff Admin · Pelaksana',
    title       : 'Kelola Seluruh <span class="title-highlight">Proses</span> Beasiswa Kampus.',
    desc        : 'Atur sponsor, verifikasi pendaftar, input hasil seleksi, hingga kelola pencairan dana — dari satu dashboard terpadu.',
    formTitle   : 'Login Staff Admin',
    formSubtitle: 'Masuk ke dashboard pelaksana beasiswa',
    idLabel     : 'NIP',
    idPlaceholder: 'Masukkan NIP kamu',
    redirect    : '../STAFFADMIN/dashboardStaffAdmin.html',
    demoHint    : 'Akun demo — NIP <code>198801</code> · Password <code>demo1234</code>',
    features: [
      { icon: '🏢', title: 'Manajemen Sponsor & Beasiswa', sub: 'Tambah, ubah, hapus program & sponsor' },
      { icon: '✅', title: 'Verifikasi Pendaftar',          sub: 'Periksa berkas & seleksi administrasi' },
      { icon: '📝', title: 'Input Hasil Seleksi',           sub: 'Catat nilai tes & hasil wawancara' },
      { icon: '💸', title: 'Kelola Pencairan Dana',         sub: 'Unggah bukti transfer & ubah status' },
    ],
    stats: [
      { num: '326', label: 'Pendaftar masuk' },
      { num: '18',  label: 'Perlu verifikasi' },
      { num: '9',   label: 'Program aktif' },
    ],
  },

  kabag: {
    logo        : '📊',
    badge       : 'Portal Kabag · Monitoring & Keputusan',
    title       : 'Pantau & Putuskan <span class="title-highlight">Seleksi</span> Dengan Data.',
    desc        : 'Lihat statistik pendaftar, telaah kualifikasi mahasiswa, dan pantau penerima beasiswa untuk mendukung keputusan rapat.',
    formTitle   : 'Login Kabag Mahasiswa',
    formSubtitle: 'Masuk ke dashboard monitoring & keputusan',
    idLabel     : 'NIP',
    idPlaceholder: 'Masukkan NIP kamu',
    redirect    : '../KABAGWABAG/KABAG/dashboardKabag.html',
    demoHint    : 'Akun demo — NIP <code>197505</code> · Password <code>demo1234</code>',
    features: [
      { icon: '👀', title: 'Monitoring Pendaftar Aktif', sub: 'Statistik peserta seleksi berjalan' },
      { icon: '🏅', title: 'Review Kualifikasi',         sub: 'IPK, nilai tes, wawancara, sertifikat' },
      { icon: '🎯', title: 'E-Monitoring Penerima',      sub: 'Daftar final penerima & sponsornya' },
      { icon: '📋', title: 'Ringkasan Laporan Kendala',  sub: 'Rekap pengaduan & status penanganan' },
    ],
    stats: [
      { num: '1.240', label: 'Total pendaftar' },
      { num: '215',   label: 'Lolos seleksi' },
      { num: '92%',   label: 'Tahap diproses' },
    ],
  },

  wabag: {
    logo        : '💵',
    badge       : 'Portal Wakil Keuangan · Finansial',
    title       : 'Transparansi Penuh <span class="title-highlight">Dana</span> Beasiswa.',
    desc        : 'Awasi perputaran dana beasiswa, telusuri alokasi per sponsor, dan verifikasi bukti penyaluran secara transparan.',
    formTitle   : 'Login Wakil Keuangan',
    formSubtitle: 'Masuk ke dashboard keuangan beasiswa',
    idLabel     : 'NIP',
    idPlaceholder: 'Masukkan NIP kamu',
    redirect    : '../KABAGWABAG/WABAG/dashboardWabag.html',
    demoHint    : 'Akun demo — NIP <code>198003</code> · Password <code>demo1234</code>',
    features: [
      { icon: '📈', title: 'Ringkasan Keuangan',       sub: 'Grafik & total perputaran dana' },
      { icon: '🧾', title: 'Detail Alokasi & Sponsor', sub: 'Rincian dana per penerima & sponsor' },
      { icon: '🔍', title: 'Audit Bukti Penyaluran',   sub: 'Verifikasi bukti transfer dari staff' },
      { icon: '💼', title: 'Laporan Eksekutif',        sub: 'Rangkuman alokasi budget beasiswa' },
    ],
    stats: [
      { num: 'Rp 2,4 M', label: 'Dana tersalur' },
      { num: '215',       label: 'Penerima aktif' },
      { num: '32',        label: 'Sponsor mitra' },
    ],
  },

  /* ── Kabag / Wabag gabungan — dibedakan dari NIP saat login ── */
  kabag_wabag: {
    logo        : '📊',
    badge       : 'Portal Kabag & Wabag · Monitoring',
    title       : 'Pantau <span class="title-highlight">Seleksi</span> & Dana Beasiswa.',
    desc        : 'Masuk dengan NIP masing-masing. Kabag untuk monitoring seleksi, Wabag untuk monitoring keuangan beasiswa.',
    formTitle   : 'Login Kabag / Wabag',
    formSubtitle: 'Masuk dengan NIP Kabag atau Wabag',
    idLabel     : 'NIP',
    idPlaceholder: 'Masukkan NIP kamu',
    redirect    : null,
    demoHint    : 'Kabag — NIP <code>197505</code> &nbsp;|&nbsp; Wabag — NIP <code>198003</code> · Password <code>demo1234</code>',
    features: [
      { icon: '👀', title: 'Monitoring Pendaftar',   sub: 'Statistik peserta seleksi berjalan' },
      { icon: '🎯', title: 'Monitoring Penerima',    sub: 'Daftar final penerima & sponsornya' },
      { icon: '📈', title: 'Ringkasan Keuangan',     sub: 'Grafik & total perputaran dana beasiswa' },
      { icon: '📋', title: 'Laporan Kendala',        sub: 'Rekap pengaduan & status penanganan' },
    ],
    stats: [
      { num: '1.240',    label: 'Total pendaftar' },
      { num: '215',      label: 'Penerima aktif' },
      { num: 'Rp 2,4 M', label: 'Dana tersalur' },
    ],
  },

};


/* ============================================================
   03. AKUN DUMMY — hanya untuk development
   Hapus seluruh blok ini saat production!
   ============================================================ */

const DUMMY_ACCOUNTS = {

  mahasiswa: [
    {
      email          : 'adinda@mahasiswa.com',
      nim_nip        : '2150001',
      password       : 'demo1234',
      role           : 'mahasiswa',
      nama_lengkap   : 'Adinda Putri Lestari',
      program_studi  : 'Teknik Informatika',
      ipk            : 3.85,
      nomor_whatsapp : '081210001001',
      alamat         : 'Jl. Mawar No. 10, Bandung',
    },
    {
      email          : 'bagas@mahasiswa.com',
      nim_nip        : '2150042',
      password       : 'demo1234',
      role           : 'mahasiswa',
      nama_lengkap   : 'Bagas Pratama Wijaya',
      program_studi  : 'Manajemen',
      ipk            : 3.62,
      nomor_whatsapp : '081210002002',
      alamat         : 'Jl. Melati No. 5, Surabaya',
    },
  ],

  staff: [
    {
      email          : 'rangga@staff.kampus.ac.id',
      nim_nip        : '198801',
      password       : 'demo1234',
      role           : 'staff',
      nama_lengkap   : 'Rangga Adi Nugroho',
      jabatan        : 'Staff Bagian Beasiswa',
      unit           : 'Bagian Kemahasiswaan',
      nomor_whatsapp : '081220001001',
    },
    {
      email          : 'sari@staff.kampus.ac.id',
      nim_nip        : '199002',
      password       : 'demo1234',
      role           : 'staff',
      nama_lengkap   : 'Sari Wulandari',
      jabatan        : 'Staff Administrasi Beasiswa',
      unit           : 'Bagian Kemahasiswaan',
      nomor_whatsapp : '081220002002',
    },
  ],

  kabag: [
    {
      email          : 'bambang@kampus.ac.id',
      nim_nip        : '197505',
      password       : 'demo1234',
      role           : 'kabag',
      nama_lengkap   : 'Dr. Bambang Sutejo, M.M.',
      jabatan        : 'Kepala Bagian Kemahasiswaan',
      unit           : 'Bagian Kemahasiswaan',
      nomor_whatsapp : '081230001001',
    },
  ],

  wabag: [
    {
      email          : 'hartini@kampus.ac.id',
      nim_nip        : '198003',
      password       : 'demo1234',
      role           : 'wabag',
      nama_lengkap   : 'Dra. Hartini, M.M.',
      jabatan        : 'Wakil Bagian Keuangan',
      unit           : 'Bagian Keuangan',
      nomor_whatsapp : '081240001001',
    },
  ],

};


/* ============================================================
   04. STATE
   ============================================================ */

let activeRole = 'mahasiswa';


/* ============================================================
   05. AUTO-REDIRECT JIKA SUDAH LOGIN
   ============================================================ */

function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}

(function autoRedirect() {
  const existing = getSession();
  if (existing && ROLE_CONFIG[existing.role]) {
    window.location.href = ROLE_CONFIG[existing.role].redirect;
  }
})();


/* ============================================================
   06. RENDER KONTEN SESUAI ROLE
   ============================================================ */

function applyRole(role) {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return;

  activeRole = role;

  /* Ubah atribut [data-role] → CSS variables ikut berubah */
  document.body.dataset.role = role;

  /* Panel kiri */
  setHTML('infoBadge', cfg.badge);
  setHTML('infoTitle', cfg.title);
  setText('infoDesc',  cfg.desc);
  renderFeatures(cfg.features);
  renderStats(cfg.stats);

  /* Form kanan */
  setText('formLogo',     cfg.logo);
  setText('formTitle',    cfg.formTitle);
  setText('formSubtitle', cfg.formSubtitle);
  setText('identifierLabel', cfg.idLabel);

  const idInput = document.getElementById('identifierInput');
  if (idInput) {
    idInput.placeholder = cfg.idPlaceholder;
    idInput.value       = '';
  }

  setHTML('demoHint', cfg.demoHint);

  /* Reset error & pesan */
  clearErrors();

  /* Update tombol role aktif */
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });
}

function renderFeatures(features) {
  const el = document.getElementById('infoFeatures');
  if (!el) return;

  el.innerHTML = features
    .map((f, i) => `
      <li style="animation-delay:${i * 0.07}s">
        <span class="feature-icon">${f.icon}</span>
        <div>
          <strong>${f.title}</strong>
          <span>${f.sub}</span>
        </div>
      </li>
    `)
    .join('');
}

function renderStats(stats) {
  const el = document.getElementById('infoStats');
  if (!el) return;

  el.innerHTML = stats
    .map((s, i) => `
      ${i > 0 ? '<div class="mini-stat-divider"></div>' : ''}
      <div class="mini-stat">
        <div class="mini-stat-num">${s.num}</div>
        <div class="mini-stat-label">${s.label}</div>
      </div>
    `)
    .join('');
}


/* ============================================================
   07. PEMILIH ROLE
   ============================================================ */

document.getElementById('roleGrid')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.role-btn');
  if (!btn) return;
  applyRole(btn.dataset.role);
});


/* ============================================================
   08. TOGGLE TAMPIL / SEMBUNYIKAN PASSWORD
   ============================================================ */

const toggleBtn = document.getElementById('togglePwd');
const pwdInput  = document.getElementById('passwordInput');

toggleBtn?.addEventListener('click', () => {
  const show = pwdInput.type === 'password';

  pwdInput.type = show ? 'text' : 'password';

  toggleBtn.querySelector('.eye-open').style.display   = show ? 'none' : '';
  toggleBtn.querySelector('.eye-closed').style.display = show ? ''     : 'none';
});


/* ============================================================
   09. SUBMIT LOGIN
   ============================================================ */

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const identifier = document.getElementById('identifierInput').value.trim();
  const password   = document.getElementById('passwordInput').value;
  const cfg        = ROLE_CONFIG[activeRole];
  let valid        = true;

  /* Validasi field kosong */
  if (!identifier) {
    showError('identifierInput', 'identifierError', `${cfg.idLabel} wajib diisi`);
    valid = false;
  }
  if (!password) {
    showError('passwordInput', 'passwordError', 'Password wajib diisi');
    valid = false;
  }
  if (!valid) return;

  setLoading(true);

  try {

    /* ── Dummy login (development) ── */

    /* Untuk role kabag_wabag: cek ke pool kabag dulu, lalu wabag */
    let pool;
    if (activeRole === 'kabag_wabag') {
      pool = [
        ...(DUMMY_ACCOUNTS['kabag'] || []),
        ...(DUMMY_ACCOUNTS['wabag'] || []),
      ];
    } else {
      pool = DUMMY_ACCOUNTS[activeRole] || [];
    }

    const matched = pool.find(acc =>
      (acc.email === identifier || acc.nim_nip === identifier) &&
      acc.password === password
    );

    if (matched) {
      await delay(700);

      /* Redirect menggunakan ROLE_CONFIG role asli akun (kabag/wabag),
         bukan dari kabag_wabag yang redirect-nya null */
      const matchedRedirect = ROLE_CONFIG[matched.role]?.redirect || cfg.redirect;

      saveSession({
        id             : 'dummy-' + matched.role + '-' + matched.nim_nip,
        role           : matched.role,
        nama_lengkap   : matched.nama_lengkap,
        nim_nip        : matched.nim_nip,
        email          : matched.email,
        jabatan        : matched.jabatan        || null,
        unit           : matched.unit           || null,
        program_studi  : matched.program_studi  || null,
        ipk            : matched.ipk            || null,
        nomor_whatsapp : matched.nomor_whatsapp || null,
        alamat         : matched.alamat         || null,
        access_token   : 'dummy-token-' + matched.nim_nip,
      });

      const firstName = matched.nama_lengkap.split(' ')[0];
      showMsg('success', `✓ Selamat datang, ${firstName}! Mengarahkan ke dashboard...`);
      setTimeout(() => window.location.href = matchedRedirect, 900);
      return;
    }

    /* ── Fallback Supabase (produksi) ── */
    const email = identifier.includes('@')
      ? identifier
      : await nimToEmail(identifier);

    if (!email) {
      showMsg('error', `✗ ${cfg.idLabel} atau password salah.`);
      return;
    }

    const auth = await supabaseSignIn(email, password);
    if (auth.error) {
      showMsg('error', `✗ ${cfg.idLabel} atau password salah.`);
      return;
    }

    const profile = await fetchProfile(auth.access_token, auth.user.id);
    if (!profile) {
      showMsg('error', '✗ Profil tidak ditemukan. Hubungi admin.');
      return;
    }

    /* Untuk kabag_wabag: terima role kabag atau wabag */
    const allowedRoles = activeRole === 'kabag_wabag'
      ? ['kabag', 'wabag']
      : [activeRole];

    if (!allowedRoles.includes(profile.role)) {
      showMsg('error', `✗ Akun ini bukan akun ${cfg.formTitle.replace('Login ', '').toLowerCase()}.`);
      return;
    }

    /* Redirect sesuai role asli profil */
    const profileRedirect = ROLE_CONFIG[profile.role]?.redirect || cfg.redirect;

    saveSession({
      ...profile,
      access_token  : auth.access_token,
      refresh_token : auth.refresh_token,
    });

    showMsg('success', `✓ Selamat datang, ${profile.nama_lengkap}!`);
    setTimeout(() => window.location.href = profileRedirect, 900);

  } catch (err) {
    showMsg('error', '✗ Gagal terhubung ke server. Coba lagi.');
    console.error(err);
  } finally {
    setLoading(false);
  }
});


/* ============================================================
   10. SUPABASE HELPERS (referensi produksi)
   ============================================================ */

async function supabaseSignIn(email, password) {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method  : 'POST',
      headers : {
        'Content-Type' : 'application/json',
        'apikey'       : SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password }),
    }
  );
  const data = await res.json();
  return res.ok ? data : { error: data };
}

async function nimToEmail(nim) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?nim_nip=eq.${encodeURIComponent(nim)}&select=id`,
      { headers: { 'apikey': SUPABASE_ANON_KEY } }
    );
    const data = await res.json();
    if (!data?.length) return null;
    return `${nim}@kampus.ac.id`;
  } catch {
    return null;
  }
}

async function fetchProfile(accessToken, userId) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey'        : SUPABASE_ANON_KEY,
          'Authorization' : `Bearer ${accessToken}`,
        },
      }
    );
    const data = await res.json();
    return data?.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}


/* ============================================================
   11. SESSION HELPERS
   ============================================================ */

function saveSession(data) {
  sessionStorage.setItem('bk_user', JSON.stringify(data));
  if (document.getElementById('rememberMe')?.checked) {
    localStorage.setItem('bk_user', JSON.stringify(data));
  }
}


/* ============================================================
   12. UI HELPERS
   ============================================================ */

function setLoading(on) {
  const btn    = document.getElementById('btnLogin');
  const text   = btn?.querySelector('.btn-text');
  const loader = document.getElementById('btnLoader');
  const arrow  = btn?.querySelector('.btn-arrow');

  if (btn)    btn.disabled         = on;
  if (text)   text.style.display   = on ? 'none' : '';
  if (loader) loader.style.display = on ? 'flex'  : 'none';
  if (arrow)  arrow.style.display  = on ? 'none' : '';
}

function showMsg(type, msg) {
  const el = document.getElementById('formMessage');
  if (!el) return;
  el.className   = 'form-message ' + type;
  el.textContent = msg;
}

function showError(inputId, errorId, msg) {
  document.getElementById(inputId)?.classList.add('error');
  const el = document.getElementById(errorId);
  if (el) el.textContent = '⚠ ' + msg;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
  const msg = document.getElementById('formMessage');
  if (msg) { msg.className = 'form-message'; msg.textContent = ''; }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setHTML(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = val;
}

/* Bersihkan error saat user mengetik */
document.querySelectorAll('input').forEach(inp => {
  inp.addEventListener('input', () => {
    inp.classList.remove('error');
    const errId = inp.id.replace('Input', '') + 'Error';
    const err   = document.getElementById(errId)
               || document.getElementById(inp.id + 'Error');
    if (err) err.textContent = '';
  });
});

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}


/* ============================================================
   13. MODAL — LUPA PASSWORD
   ============================================================ */

const forgotModal = document.getElementById('forgotModal');

document.getElementById('btnForgotPwd')?.addEventListener('click', (e) => {
  e.preventDefault();
  openModal(forgotModal);
});
document.getElementById('forgotOverlay')?.addEventListener('click', () => closeModal(forgotModal));
document.getElementById('forgotClose')?.addEventListener('click',   () => closeModal(forgotModal));

document.getElementById('forgotForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const val = document.getElementById('forgotIdentifier').value.trim();
  const msg = document.getElementById('forgotMessage');

  if (!val) {
    if (msg) { msg.className = 'form-message error'; msg.textContent = '⚠ Masukkan NIM atau NIP kamu'; }
    return;
  }

  if (msg) { msg.className = 'form-message success'; msg.textContent = '⏳ Mengirimkan link reset...'; }
  await delay(1500);
  if (msg) { msg.textContent = '✓ Link reset dikirim! Cek email terdaftar kamu.'; }

  setTimeout(() => {
    closeModal(forgotModal);
    e.target.reset();
    if (msg) msg.className = 'form-message';
  }, 2500);
});


/* ============================================================
   14. MODAL HELPERS
   ============================================================ */

function openModal(m) {
  if (!m) return;
  m.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(m) {
  if (!m) return;
  m.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(closeModal);
  }
});


/* ============================================================
   15. INIT
   ============================================================ */

applyRole('mahasiswa');

console.log('🔐 login.js loaded — mode development, akun dummy aktif');