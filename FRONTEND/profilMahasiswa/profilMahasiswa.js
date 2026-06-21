/* ============================================================
   PROFILMAHASISWA.JS — Beasiswa Kampus
   Ikon  : Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di particles & showFormMsg diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
            Struktur kode vertikal (satu properti per baris).
   ============================================================ */

/* ============================================================
   SHARED LAYER — BK.session / BK.api / BK.rules
   (dimuat via <script> sebelum file ini; lihat profilMahasiswa.html)
   ============================================================ */
const session = (window.BK && BK.session) ? BK.session.requireRole('mahasiswa') : null;

/* State profil + dokumen */
let demoSession = session || {};
let myDocs = [];


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
  let cur        = 0;
  const step     = Math.ceil(target / 20);
  const t        = setInterval(() => {
    cur += step;
    if (cur >= target) {
      el.textContent = target;
      clearInterval(t);
    } else {
      el.textContent = cur;
    }
  }, 40);
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
  setEl('navUsername',  first);
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
function initMiniStats() { loadStats(); }

async function loadStats() {
  if (!session || !window.BK || !BK.api || !BK.sb) return;
  const { data, error } = await BK.api.listMyPendaftaran(session.id);
  if (error || !data) return;
  const total  = data.length;
  const lolos  = data.filter(p => p.status === 'lolos_final').length;
  const proses = data.filter(p => ['menunggu_verifikasi', 'lolos_berkas', 'wawancara'].indexOf(p.status) !== -1).length;
  setEl('statTotal', total);
  setEl('statLolos', lolos);
  setEl('statProses', proses);
  setEl('heroBadgeDaftar', String(total));
  setEl('heroBadgeLolos',  String(lolos));
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

  const patch = {
    nama_lengkap   : namaVal,
    program_studi  : prodiVal,
    ipk            : ipkVal,
    alamat         : alamatVal,
    nomor_whatsapp : waVal,
  };

  try {
    if (window.BK && BK.api && BK.sb && session && session.id) {
      const { error } = await BK.api.updateProfile(session.id, patch);
      if (error) {
        showFormMsg('error', '✗ Gagal menyimpan: ' + (error.message || 'coba lagi'));
        setLoading(false);
        return;
      }
    }

    /* Sinkronkan session lokal */
    demoSession = { ...demoSession, ...patch };
    const remember = !!localStorage.getItem('bk_user');
    if (window.BK && BK.session) BK.session.saveSession(demoSession, remember);

    initUserInfo();
    disableEdit();
    renderReadiness();
    showFormMsg('success', '✓ Profil berhasil diperbarui!');
  } catch (err) {
    showFormMsg('error', '✗ Gagal terhubung ke server.');
    console.error(err);
  } finally {
    setLoading(false);
  }

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
    if (window.BK && BK.session) BK.session.clearSession();
    else { sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user'); }
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
    ['solar:user-bold-duotone',          'rgba(37,99,235,0.22)'],
    ['solar:pen-bold-duotone',           'rgba(99,102,241,0.20)'],
    ['solar:diploma-bold-duotone',       'rgba(37,99,235,0.18)'],
    ['solar:cup-star-bold-duotone',      'rgba(251,191,36,0.22)'],
    ['solar:star-bold-duotone',          'rgba(251,191,36,0.20)'],
    ['solar:lightbulb-bold-duotone',     'rgba(251,191,36,0.20)'],
    ['solar:key-bold-duotone',           'rgba(37,99,235,0.18)'],
    ['solar:document-text-bold-duotone', 'rgba(37,99,235,0.20)'],
    ['solar:star-bold-duotone',          'rgba(251,191,36,0.20)'],
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
   READINESS GATE + DOKUMEN (Phase 1 — D-06/D-07/D-08)
   ============================================================ */
async function loadDocs() {
  if (session && window.BK && BK.api && BK.sb && session.id) {
    const { data, error } = await BK.api.listDokumenMahasiswa(session.id);
    myDocs = (!error && data) ? data : [];
  }
  renderDocList();
  renderReadiness();
}

function renderDocList() {
  const wrap = document.getElementById('docList');
  if (!wrap || !window.BK || !BK.rules) return;
  wrap.innerHTML = BK.rules.CORE_DOCS.map(d => {
    const have = myDocs.some(x => x.jenis_dokumen === d.key);
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #eef2f7">
        <div>
          <strong>${d.label}</strong> ${d.required ? '<span style="color:#dc2626">*</span>' : '<span style="color:#94a3b8">(opsional)</span>'}
          <div style="font-size:12px;color:${have ? '#059669' : '#dc2626'}">${have ? '✓ Terunggah' : 'Belum diunggah'}</div>
        </div>
        <label class="btn-edit" style="cursor:pointer;white-space:nowrap">
          ${have ? 'Ganti' : 'Unggah'}
          <input type="file" data-doc="${d.key}" accept=".pdf,.jpg,.jpeg,.png" style="display:none" />
        </label>
      </div>`;
  }).join('');
  wrap.querySelectorAll('input[type=file]').forEach(inp => {
    inp.addEventListener('change', e => handleUpload(e.target.dataset.doc, e.target.files[0]));
  });
}

async function handleUpload(jenis, file) {
  const msg = document.getElementById('docMsg');
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    if (msg) { msg.className = 'form-message error'; msg.textContent = '⚠ Ukuran maksimal 5MB.'; }
    return;
  }
  if (!session || !window.BK || !BK.api || !BK.sb) {
    if (msg) { msg.className = 'form-message error'; msg.textContent = '⚠ Supabase belum siap.'; }
    return;
  }
  if (msg) { msg.className = 'form-message success'; msg.textContent = '⏳ Mengunggah...'; }
  const { error } = await BK.api.uploadDokumenMahasiswa(session.id, jenis, file);
  if (error) {
    if (msg) { msg.className = 'form-message error'; msg.textContent = '✗ Gagal unggah: ' + (error.message || ''); }
    return;
  }
  if (msg) msg.textContent = '✓ Dokumen tersimpan.';
  await loadDocs();
  setTimeout(() => { if (msg) { msg.className = 'form-message'; msg.textContent = ''; } }, 2500);
}

function renderReadiness() {
  const el = document.getElementById('readyBanner');
  if (!el || !window.BK || !BK.rules) return;
  const r = BK.rules.isReadyToApply(demoSession, myDocs);
  if (r.ready) {
    el.innerHTML = `<div style="background:#d1fae5;color:#065f46;padding:12px 14px;border-radius:10px;font-size:14px">
      ✓ Profil &amp; dokumen lengkap. Kamu siap
      <a href="../daftarBeasiswa/daftarBeasiswa.html" style="color:#065f46;font-weight:800">mendaftar beasiswa →</a>
    </div>`;
  } else {
    const items = []
      .concat(r.missingProfile.map(x => 'Profil: ' + x), r.missingDocs.map(x => 'Dokumen: ' + x))
      .map(x => `<li>${x}</li>`).join('');
    el.innerHTML = `<div style="background:#fef3c7;color:#92400e;padding:12px 14px;border-radius:10px;font-size:14px">
      <strong>Lengkapi dulu sebelum bisa mendaftar:</strong>
      <ul style="margin:6px 0 0 18px">${items}</ul>
    </div>`;
  }
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
  loadDocs();
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