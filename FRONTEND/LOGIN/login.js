/* ============================================================
   LOGIN.JS — Beasiswa Kampus (Multi-Role)
   ============================================================

   Auth: REAL Supabase Auth via window.BK (shared/supabaseConfig.js +
   shared/api.js + shared/session.js). Dummy accounts removed.

   ALUR REDIRECT PER ROLE:
     mahasiswa → ../dashboard/dashboard.html
     staff     → ../STAFFADMIN/dashboardStaffAdmin.html
     kabag     → ../KABAGWABAG/KABAG/dashboardKabag.html
     wabag     → ../KABAGWABAG/WABAG/dashboardWabag.html

   CATATAN:
     - Registrasi mandiri DIHAPUS. Akun dibuat admin kampus (NIM/NIP + password).
     - Login pakai NIM/NIP; email auth memakai konvensi <nim>@kampus.ac.id
       (lihat BK.config.emailFromIdentifier).
   ============================================================ */


/* ============================================================
   01. KONFIGURASI ROLE
   Mengatur tampilan panel kiri + form sesuai role yang dipilih.
   (Konfigurasi Supabase ada di shared/supabaseConfig.js → window.BK.)
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
    demoHint    : 'Gunakan NIM dan password dari kampus.',
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
    demoHint    : 'Gunakan NIP dan password dari kampus.',
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
    demoHint    : 'Gunakan NIP dan password dari kampus.',
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
    demoHint    : 'Gunakan NIP dan password dari kampus.',
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

  /* ── Kabag / Wabag gabungan — dibedakan dari role profil saat login ── */
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
    demoHint    : 'Gunakan NIP dan password dari kampus.',
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
   02. STATE
   ============================================================ */

let activeRole = 'mahasiswa';


/* ============================================================
   03. AUTO-REDIRECT JIKA SUDAH LOGIN
   ============================================================ */

(function autoRedirect() {
  const existing = (window.BK && BK.session) ? BK.session.getSession() : null;
  if (existing && ROLE_CONFIG[existing.role] && ROLE_CONFIG[existing.role].redirect) {
    window.location.href = ROLE_CONFIG[existing.role].redirect;
  }
})();


/* ============================================================
   04. RENDER KONTEN SESUAI ROLE
   ============================================================ */

function applyRole(role) {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return;

  activeRole = role;
  document.body.dataset.role = role;

  setHTML('infoBadge', cfg.badge);
  setHTML('infoTitle', cfg.title);
  setText('infoDesc',  cfg.desc);
  renderFeatures(cfg.features);
  renderStats(cfg.stats);

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
  clearErrors();

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
   05. PEMILIH ROLE
   ============================================================ */

document.getElementById('roleGrid')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.role-btn');
  if (!btn) return;
  applyRole(btn.dataset.role);
});


/* ============================================================
   06. TOGGLE TAMPIL / SEMBUNYIKAN PASSWORD
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
   07. SUBMIT LOGIN — REAL SUPABASE AUTH
   ============================================================ */

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const identifier = document.getElementById('identifierInput').value.trim();
  const password   = document.getElementById('passwordInput').value;
  const cfg        = ROLE_CONFIG[activeRole];
  let valid        = true;

  if (!identifier) { showError('identifierInput', 'identifierError', `${cfg.idLabel} wajib diisi`); valid = false; }
  if (!password)   { showError('passwordInput', 'passwordError', 'Password wajib diisi'); valid = false; }
  if (!valid) return;

  if (!window.BK || !BK.sb || !BK.api) {
    showMsg('error', '✗ Supabase belum dikonfigurasi. Hubungi admin.');
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await BK.api.signIn(identifier, password);

    if (error || !data) {
      showMsg('error', `✗ ${cfg.idLabel} atau password salah.`);
      return;
    }

    const profile = data.profile;
    if (!profile) {
      showMsg('error', '✗ Profil tidak ditemukan. Hubungi admin.');
      await BK.api.signOut();
      return;
    }

    /* Untuk kabag_wabag: terima role kabag atau wabag */
    const allowedRoles = activeRole === 'kabag_wabag' ? ['kabag', 'wabag'] : [activeRole];
    if (allowedRoles.indexOf(profile.role) === -1) {
      showMsg('error', '✗ Akun ini tidak sesuai dengan portal yang dipilih.');
      await BK.api.signOut();
      return;
    }

    const redirect = (ROLE_CONFIG[profile.role] && ROLE_CONFIG[profile.role].redirect) || cfg.redirect;
    const remember = document.getElementById('rememberMe')?.checked;

    BK.session.saveSession({
      id             : profile.id,
      role           : profile.role,
      nama_lengkap   : profile.nama_lengkap,
      nim_nip        : profile.nim_nip,
      email          : profile.email,
      program_studi  : profile.program_studi || null,
      ipk            : profile.ipk            || null,
      nomor_whatsapp : profile.nomor_whatsapp || null,
      alamat         : profile.alamat         || null,
      jabatan        : profile.jabatan        || null,
      unit           : profile.unit           || null,
      access_token   : (data.session && data.session.access_token) || null,
    }, remember);

    const firstName = (profile.nama_lengkap || 'Pengguna').split(' ')[0];
    showMsg('success', `✓ Selamat datang, ${firstName}! Mengarahkan ke dashboard...`);
    setTimeout(() => { window.location.href = redirect; }, 700);

  } catch (err) {
    showMsg('error', '✗ Gagal terhubung ke server. Coba lagi.');
    console.error(err);
  } finally {
    setLoading(false);
  }
});


/* ============================================================
   08. UI HELPERS
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


/* ============================================================
   09. MODAL — LUPA PASSWORD (Supabase reset)
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

  try {
    const email = BK.config.emailFromIdentifier(val);
    const { error } = await BK.sb.auth.resetPasswordForEmail(email);
    if (msg) msg.textContent = error
      ? '✗ Gagal mengirim link reset. Coba lagi.'
      : '✓ Link reset dikirim! Cek email terdaftar kamu.';
  } catch {
    if (msg) msg.textContent = '✗ Gagal mengirim link reset. Coba lagi.';
  }

  setTimeout(() => {
    closeModal(forgotModal);
    e.target.reset();
    if (msg) msg.className = 'form-message';
  }, 2500);
});


/* ============================================================
   10. MODAL HELPERS
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
   11. INIT
   ============================================================ */

applyRole('mahasiswa');
console.log('🔐 login.js loaded — Supabase auth mode');
