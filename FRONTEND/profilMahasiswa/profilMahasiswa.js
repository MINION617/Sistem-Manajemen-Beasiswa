/* ============================================================
   PROFILMAHASISWA.JS — Beasiswa Kampus
   Ikon  : Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di particles & showFormMsg diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
            Struktur kode vertikal (satu properti per baris).
   ============================================================ */


// Jumlah notifikasi belum dibaca — dipakai untuk titik merah di lonceng
// notifikasi & badge di dropdown profil. TODO: ganti dengan hitungan asli
// dari data notifikasi saat sudah terhubung ke backend.
const dummyNotifUnread = 2;

// Jumlah pendaftaran yang sedang diproses — dipakai untuk badge
// "Pendaftaran Saya" di navbar. TODO: ganti dengan hitungan asli dari
// data pendaftaran saat sudah terhubung ke backend.
const dummyPendaftaranProses = 2;


/* ============================================================
   SESSION
   ============================================================ */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}

const session = getSession();

if (!session || session.role !== 'mahasiswa') {
  // Uncomment saat production:
  // window.location.href = '../LOGIN/login.html';
}

/* Demo session untuk preview tanpa login */
const demoSession = session || {
  nama_lengkap   : 'Rizky Firmansyah',
  nim_nip        : '2021310045',
  program_studi  : 'Teknik Informatika',
  ipk            : 3.85,
  alamat         : 'Jl. Merdeka No. 12, Jakarta Pusat',
  nomor_whatsapp : '081234567890',
  email          : 'rizky@mahasiswa.ac.id',
  role           : 'mahasiswa',
  id             : 'demo-uuid',
};


/* ============================================================
   UTILS
   ============================================================ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) {
    el.textContent = '0';
    return;
  }
  const dur  = 900;
  const t0   = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3); // easeOutCubic — melambat di ujung
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * ease(p));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}


/* ============================================================
   USER INFO — navbar + hero + form
   ============================================================ */
function initUserInfo() {
  const s      = demoSession;
  const nama   = s?.nama_lengkap   || 'Mahasiswa';
  const nim    = s?.nim_nip         || '—';
  const prodi  = s?.program_studi   || '—';
  const ipk    = s?.ipk             || '—';
  const email  = s?.email           || '—';
  const wa     = s?.nomor_whatsapp  || '';
  const alamat = s?.alamat          || '';
  const init   = nama.charAt(0).toUpperCase();
  const first  = nama.split(' ')[0];

  /* Navbar */
  setEl('navUsername',  nama);
  setEl('topbarAvatar', init);

  /* Mobile nav */
  setEl('mobileName',   nama);
  setEl('mobileNim',    'NIM: ' + nim);
  setEl('mobileAvatar', init);

  /* Hero */
  setEl('heroTitle',  `Profil ${first} 👤`);
  setEl('heroAvatar', init);
  setEl('heroNama',   nama);
  setEl('heroNim',    'NIM: ' + nim);

  /* Avatar Card kiri */
  setEl('bigAvatar',   init);
  setEl('profilNama',  nama);
  setEl('profilNim',   'NIM: ' + nim);
  setEl('profilProdi', prodi !== '—' ? prodi : 'Program Studi belum diisi');
  setEl('profilIpk',   'IPK: ' + ipk);

  /* Form fields */
  setVal('fNama',   nama);
  setVal('fNim',    nim);
  setVal('fProdi',  prodi !== '—' ? prodi : '');
  setVal('fIpk',    ipk !== '—' ? ipk : '');
  setVal('fAlamat', alamat);
  setVal('fWa',     wa);
  setVal('fEmail',  email);
}


/* ============================================================
   MINI STATS
   ============================================================ */
function initMiniStats() {
  animateNum('statTotal',  4);
  animateNum('statLolos',  2);
  animateNum('statProses', 1);
  setEl('statDana', 'Rp 9 jt');

  /* Hero badges */
  setEl('heroBadgeDaftar', '4');
  setEl('heroBadgeLolos',  '2');
  setEl('heroBadgeDana',   'Rp 9 jt');
}


/* ============================================================
   NAVBAR BADGES — notifikasi & pendaftaran diproses
   ============================================================ */
function initNavBadges() {
  const dot = document.getElementById('notifDot');
  const badge = document.getElementById('badgeNotif');
  if (dot && dummyNotifUnread > 0) dot.classList.add('show');
  if (badge && dummyNotifUnread > 0) {
    badge.textContent = dummyNotifUnread;
    badge.classList.add('show');
  }

  const bp = document.getElementById('badgePendaftaran');
  if (bp && dummyPendaftaranProses > 0) {
    bp.textContent = dummyPendaftaranProses;
    bp.classList.add('show');
  }
}


/* ============================================================
   EDIT MODE
   ============================================================ */
let isEditing        = false;
const editableFields = ['fNama', 'fProdi', 'fIpk', 'fAlamat', 'fWa'];

/* Tombol Edit di form header */
document.getElementById('btnEdit')?.addEventListener('click', () => {
  if (!isEditing) enableEdit();
});

/* Tombol Edit di hero */
document.getElementById('heroEditBtn')?.addEventListener('click', () => {
  document.getElementById('formProfil')?.scrollIntoView({
    behavior : 'smooth',
    block    : 'center',
  });
  setTimeout(() => {
    if (!isEditing) enableEdit();
  }, 500);
});

function enableEdit() {
  isEditing = true;

  editableFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  });

  document.getElementById('formActions').style.display = 'flex';
  document.getElementById('btnEdit').style.display     = 'none';
  document.getElementById('fNama').focus();
}

function disableEdit() {
  isEditing = false;

  editableFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });

  document.getElementById('formActions').style.display = 'none';
  document.getElementById('btnEdit').style.display     = '';
}

/* Tombol Batal */
document.getElementById('btnBatal')?.addEventListener('click', () => {
  initUserInfo();
  disableEdit();
  clearFormMsg();
});


/* ============================================================
   FORM SIMPAN
   ============================================================ */
document.getElementById('formProfil')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const namaVal   = document.getElementById('fNama').value.trim();
  const prodiVal  = document.getElementById('fProdi').value.trim();
  const ipkVal    = parseFloat(document.getElementById('fIpk').value) || null;
  const alamatVal = document.getElementById('fAlamat').value.trim();
  const waVal     = document.getElementById('fWa').value.trim();

  /* Validasi */
  if (!namaVal) {
    showFormMsg('error', '⚠ Nama lengkap wajib diisi');
    return;
  }

  if (ipkVal !== null && (ipkVal < 0 || ipkVal > 4)) {
    showFormMsg('error', '⚠ IPK harus antara 0.00 – 4.00');
    return;
  }

  setLoading(true);
  await delay(1000);

  /* Update session lokal */
  const updated = {
    ...demoSession,
    nama_lengkap   : namaVal,
    program_studi  : prodiVal,
    ipk            : ipkVal,
    alamat         : alamatVal,
    nomor_whatsapp : waVal,
  };

  sessionStorage.setItem('bk_user', JSON.stringify(updated));

  if (localStorage.getItem('bk_user')) {
    localStorage.setItem('bk_user', JSON.stringify(updated));
  }

  initUserInfo();
  disableEdit();
  showFormMsg('success', '✓ Profil berhasil diperbarui!');
  setLoading(false);

  setTimeout(() => clearFormMsg(), 3500);
});


/* ============================================================
   MODAL GANTI PASSWORD
   ============================================================ */
const modalPwd   = document.getElementById('modalPwd');
const pwdOverlay = document.getElementById('pwdOverlay');

function openPwdModal() {
  modalPwd?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePwdModal() {
  modalPwd?.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('btnGantiPwd')?.addEventListener('click',    openPwdModal);
document.getElementById('heroGantiPwdBtn')?.addEventListener('click', openPwdModal);
document.getElementById('pwdClose')?.addEventListener('click',        closePwdModal);
pwdOverlay?.addEventListener('click', closePwdModal);

document.getElementById('formPwd')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const baru    = document.getElementById('pwdBaru').value;
  const konfirm = document.getElementById('pwdKonfirm').value;
  let valid     = true;

  const err1 = document.getElementById('errPwdBaru');
  const err2 = document.getElementById('errPwdKonfirm');

  if (err1) err1.textContent = '';
  if (err2) err2.textContent = '';

  if (!baru || baru.length < 8) {
    if (err1) err1.textContent = '⚠ Password minimal 8 karakter';
    valid = false;
  }
  if (baru !== konfirm) {
    if (err2) err2.textContent = '⚠ Password tidak cocok';
    valid = false;
  }
  if (!valid) return;

  const msg = document.getElementById('pwdMsg');
  if (msg) {
    msg.className     = 'form-message success';
    msg.textContent   = '⏳ Menyimpan...';
    msg.style.display = 'block';
  }

  await delay(1200);

  /* Production: supabase.auth.updateUser({ password: baru }) */

  if (msg) msg.textContent = '✓ Password berhasil diubah!';

  setTimeout(() => {
    closePwdModal();
    e.target.reset();
    if (msg) {
      msg.style.display = 'none';
      msg.textContent   = '';
    }
  }, 2000);
});


/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });
}


/* ============================================================
   MOBILE NAV
   ============================================================ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');

  function openNav() {
    mobileNav?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburger?.classList.add('open');
  }

  function closeNav() {
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    hamburger?.classList.remove('open');
  }

  hamburger?.addEventListener('click', () => {
    if (mobileNav?.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  overlay?.addEventListener('click', closeNav);

  document.getElementById('mobileBtnLogout')?.addEventListener('click', () => {
    closeNav();
    setTimeout(() => openLogoutModal(), 200);
  });
}


/* ============================================================
   LOGOUT
   ============================================================ */
const logoutModal   = document.getElementById('logoutModal');
const logoutOverlay = document.getElementById('logoutOverlay');

function openLogoutModal() {
  logoutModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLogoutModal() {
  logoutModal?.classList.remove('active');
  document.body.style.overflow = '';
}

function initLogout() {
  document.getElementById('btnLogout')?.addEventListener('click',     openLogoutModal);
  document.getElementById('btnLogoutMenu')?.addEventListener('click', openLogoutModal);
  document.getElementById('cancelLogout')?.addEventListener('click',  closeLogoutModal);
  logoutOverlay?.addEventListener('click', closeLogoutModal);

  document.getElementById('confirmLogout')?.addEventListener('click', () => {
    sessionStorage.removeItem('bk_user');
    localStorage.removeItem('bk_user');
    window.location.href = '../LOGIN/login.html';
  });
}


/* ============================================================
   BACKGROUND CANVAS
   ============================================================ */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const orbs = Array.from({ length: 5 }, () => ({
    x     : Math.random() * window.innerWidth,
    y     : Math.random() * window.innerHeight,
    r     : 100 + Math.random() * 160,
    dx    : (Math.random() - 0.5) * 0.3,
    dy    : (Math.random() - 0.5) * 0.3,
    hue   : 210 + Math.random() * 30,
    alpha : 0.04 + Math.random() * 0.04,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    orbs.forEach(o => {
      o.x += o.dx;
      o.y += o.dy;

      if (o.x < -o.r)               o.x = canvas.width  + o.r;
      if (o.x > canvas.width  + o.r) o.x = -o.r;
      if (o.y < -o.r)               o.y = canvas.height + o.r;
      if (o.y > canvas.height + o.r) o.y = -o.r;

      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.hue}, 80%, 60%, ${o.alpha})`);
      g.addColorStop(1, `hsla(${o.hue}, 80%, 60%, 0)`);

      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}


/* ============================================================
   FLOATING PARTICLES — Iconify menggantikan emoji
   ============================================================ */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const iconSet = [
    ['solar:diploma-bold-duotone',           'rgba(37,99,235,0.55)'],
    ['solar:book-2-bold-duotone',            'rgba(99,102,241,0.50)'],
    ['solar:pen-bold-duotone',               'rgba(139,92,246,0.48)'],
    ['solar:cup-star-bold-duotone',          'rgba(245,158,11,0.55)'],
    ['solar:star-bold-duotone',              'rgba(245,158,11,0.50)'],
    ['solar:document-text-bold-duotone',     'rgba(37,99,235,0.48)'],
    ['solar:target-bold-duotone',            'rgba(16,185,129,0.50)'],
    ['solar:lightbulb-bold-duotone',         'rgba(245,158,11,0.55)'],
    ['solar:microscope-bold-duotone',        'rgba(16,185,129,0.48)'],
    ['solar:graduation-cap-bold-duotone',    'rgba(37,99,235,0.52)'],
  ];
  const count = 16;

  for (let i = 0; i < count; i++) {
    const [iconName, color] = iconSet[i % iconSet.length];
    const p                 = document.createElement('iconify-icon');

    p.setAttribute('icon', iconName);
    p.className = 'particle';

    const dur   = 7 + Math.random() * 8;
    const delay = Math.random() * 10;
    const left  = Math.random() * 100;
    const size  = 12 + Math.random() * 10;

    p.style.cssText = `
      left: ${left}%;
      bottom: -40px;
      font-size: ${size}px;
      color: ${color};
      --dur: ${dur}s;
      --delay: ${delay}s;
      animation-delay: ${delay}s;
    `;

    container.appendChild(p);
  }
}


/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        const delay = parseFloat(e.target.style.transitionDelay || 0) * 1000;
        setTimeout(() => { e.target.style.transitionDelay = '0s'; }, delay + 650);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.05}s`;
    observer.observe(el);
  });
}


/* ============================================================
   HELPERS
   ============================================================ */
function setLoading(on) {
  const btn    = document.getElementById('btnSimpan');
  const text   = btn?.querySelector('.btn-text');
  const loader = document.getElementById('simpanLoader');

  if (btn)    btn.disabled         = on;
  if (text)   text.style.display   = on ? 'none' : '';
  if (loader) loader.style.display = on ? 'flex' : 'none';
}

function showFormMsg(type, msg) {
  const el = document.getElementById('formMsg');
  if (!el) return;
  el.className   = 'form-message ' + type;
  el.textContent = msg;
}

function clearFormMsg() {
  const el = document.getElementById('formMsg');
  if (!el) return;
  el.className   = 'form-message';
  el.textContent = '';
}


/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePwdModal();
    closeLogoutModal();
  }
});


/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  initMiniStats();
  initNavBadges();
  initNavbarScroll();
  initMobileNav();
  initLogout();

  setTimeout(initScrollReveal, 100);

  console.log(
    '👤 profilMahasiswa.js loaded | User:',
    demoSession?.nama_lengkap,
    '| NIM:',
    demoSession?.nim_nip
  );
});