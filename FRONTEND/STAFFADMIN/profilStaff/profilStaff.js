/* ============================================================
   PROFILSTAFF.JS — Beasiswa Kampus
   Role : Staff Admin

   STRUKTUR FILE:
   01. Konfigurasi & Session
   02. State
   03. Inisialisasi User Info
   04. Render Info Rows (view mode)
   05. Toggle Edit Informasi Pribadi
   06. Simpan Informasi Pribadi
   07. Toggle Edit Password
   08. Password Strength Meter
   09. Simpan Password
   10. Toggle Eye (show/hide password)
   11. Avatar — Buka Modal & Render Warna
   12. Avatar — Preview & Konfirmasi
   13. Aktivitas Sesi
   14. Background Canvas (identik dashboard)
   15. Floating Particles (identik dashboard)
   16. Scroll Reveal
   17. Sidebar Mobile
   18. Modal Logout
   19. Toast Helper
   20. Init (DOMContentLoaded)
   ============================================================ */


/* ============================================================
   01. KONFIGURASI & SESSION
   ============================================================ */

function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}

function saveSession(data) {
  const inSession = !!sessionStorage.getItem('bk_user');
  const inLocal   = !!localStorage.getItem('bk_user');
  if (inSession) sessionStorage.setItem('bk_user', JSON.stringify(data));
  if (inLocal)   localStorage.setItem('bk_user', JSON.stringify(data));
}

const session = getSession();

/* Guard — aktifkan di production */
// if (!session || session.role !== 'staff') {
//   window.location.href = '../../LOGIN/login.html';
// }

/* Dummy session untuk development */
const demoSession = session || {
  id             : 'demo-staff-198801',
  role           : 'staff',
  nama_lengkap   : 'Rangga Adi Nugroho',
  nim_nip        : '198801',
  email          : 'rangga@staff.kampus.ac.id',
  jabatan        : 'Staff Bagian Beasiswa',
  unit           : 'Bagian Kemahasiswaan',
  nomor_whatsapp : '081220001001',
  alamat         : 'Jl. Kampus Merdeka No. 1, Jakarta',
};


const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

/* ============================================================
   02. STATE
   ============================================================ */

let profileData = { ...demoSession };

async function loadProfile() {
  if (!isRealSession) return;
  try {
    const { data } = await api.get('/profil');
    profileData = { ...profileData, ...data };
    initUserInfo();
    renderInfoRows();
  } catch (err) {
    console.warn('Gagal memuat profil, pakai data sesi:', err);
  }
}

/* Warna avatar yang tersedia */
const AVATAR_COLORS = [
  { label: 'Biru',      from: '#3b82f6', to: '#1d4ed8' },
  { label: 'Ungu',      from: '#a78bfa', to: '#7c3aed' },
  { label: 'Hijau',     from: '#34d399', to: '#059669' },
  { label: 'Merah',     from: '#fb7185', to: '#be123c' },
  { label: 'Oranye',    from: '#fb923c', to: '#c2410c' },
  { label: 'Kuning',    from: '#fbbf24', to: '#b45309' },
  { label: 'Tosca',     from: '#38bdf8', to: '#0284c7' },
  { label: 'Navy',      from: '#60a5fa', to: '#1e3a8a' },
  { label: 'Pink',      from: '#f472b6', to: '#be185d' },
  { label: 'Abu',       from: '#94a3b8', to: '#475569' },
];

let selectedColor = AVATAR_COLORS[0]; /* default biru */


/* ============================================================
   03. INISIALISASI USER INFO
   ============================================================ */

function initUserInfo() {
  const inisial = getInisial(profileData.nama_lengkap);

  /* Sidebar */
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarName   = document.getElementById('sidebarName');
  if (sidebarAvatar) sidebarAvatar.textContent = inisial;
  if (sidebarName)   sidebarName.textContent   = profileData.nama_lengkap || '—';

  /* Topbar */
  const topbarAvatar = document.getElementById('topbarAvatar');
  if (topbarAvatar) topbarAvatar.textContent = inisial;

  /* Hero */
  const heroAvatar = document.getElementById('heroAvatar');
  const heroName   = document.getElementById('heroName');
  const heroUnit   = document.getElementById('heroUnit');
  const heroNip    = document.getElementById('heroNip');

  if (heroAvatar) heroAvatar.textContent = inisial;
  if (heroName)   heroName.textContent   = profileData.nama_lengkap || '—';
  if (heroUnit)   heroUnit.textContent   = profileData.unit         || '—';
  if (heroNip)    heroNip.textContent    = profileData.nim_nip      || '—';
}

function getInisial(nama) {
  if (!nama) return '?';
  const parts = nama.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}


/* ============================================================
   04. RENDER INFO ROWS (view mode)
   ============================================================ */

const INFO_FIELDS = [
  { key: 'nama_lengkap',   label: 'Nama Lengkap',   icon: 'solar:user-bold-duotone',               color: 'var(--accent)' },
  { key: 'nim_nip',        label: 'NIP',             icon: 'solar:card-bold-duotone',               color: '#7c3aed' },
  { key: 'email',          label: 'Email',           icon: 'solar:letter-bold-duotone',             color: 'var(--orange)' },
  { key: 'nomor_whatsapp', label: 'No. WhatsApp',    icon: 'solar:phone-bold-duotone',              color: '#059669' },
  { key: 'jabatan',        label: 'Jabatan',         icon: 'solar:buildings-2-bold-duotone',        color: '#0284c7' },
  { key: 'unit',           label: 'Unit Kerja',      icon: 'solar:folder-with-files-bold-duotone',  color: '#be123c' },
  { key: 'alamat',         label: 'Alamat',          icon: 'solar:map-point-bold-duotone',          color: '#d97706' },
];

function renderInfoRows() {
  const list = document.getElementById('infoRowList');
  if (!list) return;

  list.innerHTML = INFO_FIELDS.map(f => {
    const val = profileData[f.key];
    const display = val
      ? `<span class="info-val">${escHtml(val)}</span>`
      : `<span class="info-val empty">Belum diisi</span>`;

    return `
      <div class="info-row">
        <span class="info-label">
          <iconify-icon icon="${f.icon}" style="color:${f.color}"></iconify-icon>
          ${f.label}
        </span>
        ${display}
      </div>
    `;
  }).join('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


/* ============================================================
   05. TOGGLE EDIT INFORMASI PRIBADI
   ============================================================ */

const btnToggleEditInfo = document.getElementById('btnToggleEditInfo');
const formEditInfo      = document.getElementById('formEditInfo');
const viewInfo          = document.getElementById('viewInfo');
const btnCancelInfo     = document.getElementById('btnCancelInfo');

/* Tombol Edit di hero juga trigger toggle info */
document.getElementById('btnEditProfil')?.addEventListener('click', () => {
  openEditInfo();
});

btnToggleEditInfo?.addEventListener('click', () => {
  const isEditing = formEditInfo.style.display !== 'none';
  if (isEditing) closeEditInfo();
  else openEditInfo();
});

btnCancelInfo?.addEventListener('click', closeEditInfo);

function openEditInfo() {
  /* Isi form dengan data saat ini — Nama/NIP/Email/Jabatan/Unit cuma buat
     referensi (input-nya readonly), yang benar-benar bisa diubah cuma
     No. WhatsApp dan Alamat. */
  document.getElementById('editNama').value     = profileData.nama_lengkap   || '';
  document.getElementById('editNip').value      = profileData.nim_nip        || '';
  document.getElementById('editEmail').value    = profileData.email          || '';
  document.getElementById('editWa').value       = profileData.nomor_whatsapp || '';
  document.getElementById('editJabatan').value  = profileData.jabatan        || '';
  document.getElementById('editUnit').value     = profileData.unit           || '';
  document.getElementById('editAlamat').value   = profileData.alamat         || '';

  viewInfo.style.display    = 'none';
  formEditInfo.style.display = '';
  btnToggleEditInfo.textContent = 'Batal Edit';
  clearMsg('msgInfo');
}

function closeEditInfo() {
  viewInfo.style.display    = '';
  formEditInfo.style.display = 'none';
  btnToggleEditInfo.innerHTML = '<iconify-icon icon="solar:pen-bold-duotone" width="14"></iconify-icon> Edit';
  clearMsg('msgInfo');
}


/* ============================================================
   06. SIMPAN INFORMASI PRIBADI
   ============================================================ */

formEditInfo?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('msgInfo');

  /* Nama/NIP/Email/Jabatan/Unit sengaja tidak diikutkan — field-nya
     readonly (lihat HTML) dan backend juga menolaknya untuk role staff
     (BACKEND/src/modules/profil/profil.controller.js, LOCKED_FIELDS_BY_ROLE).
     Cuma No. WhatsApp dan Alamat yang boleh diubah sendiri oleh staff. */
  const wa     = document.getElementById('editWa').value.trim();
  const alamat = document.getElementById('editAlamat').value.trim();

  if (isRealSession) {
    try {
      const { data } = await api.patch('/profil', {
        nomor_whatsapp: wa,
        alamat,
      });
      profileData = { ...profileData, ...data };
    } catch (err) {
      showMsg('msgInfo', 'error', '⚠ ' + (err?.message || 'Gagal menyimpan profil.'));
      return;
    }
  } else {
    /* Update state & session (dummy fallback) */
    profileData.nomor_whatsapp = wa;
    profileData.alamat         = alamat;
  }

  saveSession(profileData);

  /* Update tampilan */
  initUserInfo();
  renderInfoRows();
  closeEditInfo();
  showToast('✓ Informasi profil berhasil diperbarui!');
});


/* ============================================================
   07. TOGGLE EDIT PASSWORD
   ============================================================ */

const btnToggleEditPwd = document.getElementById('btnToggleEditPwd');
const formEditPwd      = document.getElementById('formEditPwd');
const viewSecurity     = document.getElementById('viewSecurity');
const btnCancelPwd     = document.getElementById('btnCancelPwd');

btnToggleEditPwd?.addEventListener('click', () => {
  const isEditing = formEditPwd.style.display !== 'none';
  if (isEditing) closeEditPwd();
  else openEditPwd();
});

btnCancelPwd?.addEventListener('click', closeEditPwd);

function openEditPwd() {
  viewSecurity.style.display  = 'none';
  formEditPwd.style.display   = '';
  btnToggleEditPwd.textContent = 'Batal';
  clearMsg('msgPwd');

  /* Reset field */
  ['pwdLama', 'pwdBaru', 'pwdKonfirmasi'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  resetPwdMeter();
}

function closeEditPwd() {
  viewSecurity.style.display  = '';
  formEditPwd.style.display   = 'none';
  btnToggleEditPwd.innerHTML  =
    '<iconify-icon icon="solar:pen-bold-duotone" width="14"></iconify-icon> Ubah Password';
  clearMsg('msgPwd');
}


/* ============================================================
   08. PASSWORD STRENGTH METER
   ============================================================ */

document.getElementById('pwdBaru')?.addEventListener('input', (e) => {
  updatePwdMeter(e.target.value);
});

function updatePwdMeter(pwd) {
  const fill  = document.getElementById('pwdMeterFill');
  const label = document.getElementById('pwdMeterLabel');
  if (!fill || !label) return;

  if (!pwd) { resetPwdMeter(); return; }

  const score = calcPwdStrength(pwd);
  fill.className = 'pwd-meter-fill';

  if (score < 2) {
    fill.classList.add('weak');
    label.className   = 'pwd-meter-label weak';
    label.textContent = 'Lemah';
  } else if (score < 4) {
    fill.classList.add('medium');
    label.className   = 'pwd-meter-label medium';
    label.textContent = 'Sedang';
  } else {
    fill.classList.add('strong');
    label.className   = 'pwd-meter-label strong';
    label.textContent = 'Kuat';
  }
}

function calcPwdStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)                score++;
  if (pwd.length >= 12)               score++;
  if (/[A-Z]/.test(pwd))             score++;
  if (/[0-9]/.test(pwd))             score++;
  if (/[^A-Za-z0-9]/.test(pwd))      score++;
  return score;
}

function resetPwdMeter() {
  const fill  = document.getElementById('pwdMeterFill');
  const label = document.getElementById('pwdMeterLabel');
  if (fill)  { fill.className = 'pwd-meter-fill'; fill.style.width = '0%'; }
  if (label) { label.className = 'pwd-meter-label'; label.textContent = ''; }
}


/* ============================================================
   09. SIMPAN PASSWORD
   ============================================================ */

formEditPwd?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const lama       = document.getElementById('pwdLama').value;
  const baru       = document.getElementById('pwdBaru').value;
  const konfirmasi = document.getElementById('pwdKonfirmasi').value;

  /* Validasi */
  if (!lama) {
    showMsg('msgPwd', 'error', '⚠ Masukkan password lama.');
    return;
  }

  if (baru.length < 8) {
    showMsg('msgPwd', 'error', '⚠ Password baru minimal 8 karakter.');
    return;
  }

  if (baru !== konfirmasi) {
    showMsg('msgPwd', 'error', '⚠ Konfirmasi password tidak cocok.');
    return;
  }

  if (isRealSession) {
    try {
      await api.patch('/profil/password', { oldPassword: lama, newPassword: baru });
    } catch (err) {
      showMsg('msgPwd', 'error', '⚠ ' + (err?.message || 'Gagal mengubah password.'));
      return;
    }
  } else {
    /* Dev: dummy password lama = demo1234 */
    if (lama !== 'demo1234' && lama !== (profileData.password || '')) {
      showMsg('msgPwd', 'error', '⚠ Password lama tidak sesuai.');
      return;
    }
    profileData.password = baru;
    saveSession(profileData);
  }

  /* Update tampilan "Terakhir Diubah" */
  const lastChange = document.getElementById('lastPwdChange');
  if (lastChange) {
    const now = new Date();
    lastChange.textContent = now.toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  closeEditPwd();
  showToast('🔒 Password berhasil diperbarui!');
});


/* ============================================================
   10. TOGGLE EYE — show/hide password
   ============================================================ */

document.querySelectorAll('.toggle-eye').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input    = document.getElementById(targetId);
    if (!input) return;

    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';

    btn.querySelector('.eye-show').style.display = isText ? '' : 'none';
    btn.querySelector('.eye-hide').style.display = isText ? 'none' : '';
  });
});


/* ============================================================
   11. AVATAR — BUKA MODAL & RENDER WARNA
   ============================================================ */

const avatarModal   = document.getElementById('avatarModal');
const avatarOverlay = document.getElementById('avatarOverlay');

document.getElementById('btnChangeAvatar')?.addEventListener('click', openAvatarModal);
document.getElementById('avatarOverlay')?.addEventListener('click', closeAvatarModal);
document.getElementById('avatarClose')?.addEventListener('click', closeAvatarModal);

function openAvatarModal() {
  renderColorGrid();
  avatarModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAvatarModal() {
  avatarModal?.classList.remove('active');
  document.body.style.overflow = '';
}

function renderColorGrid() {
  const grid = document.getElementById('avatarColorGrid');
  if (!grid) return;

  const inisial = getInisial(profileData.nama_lengkap);

  grid.innerHTML = AVATAR_COLORS.map((c, i) => `
    <button
      type="button"
      class="avatar-color-btn ${selectedColor === c ? 'selected' : ''}"
      data-index="${i}"
      style="background: linear-gradient(135deg, ${c.from}, ${c.to})"
      title="${c.label}"
    >${inisial}</button>
  `).join('');

  grid.querySelectorAll('.avatar-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = AVATAR_COLORS[+btn.dataset.index];
      grid.querySelectorAll('.avatar-color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateAvatarPreview();
    });
  });

  updateAvatarPreview();
}

function updateAvatarPreview() {
  const preview = document.getElementById('avatarPreview');
  if (!preview) return;
  preview.style.background = `linear-gradient(135deg, ${selectedColor.from}, ${selectedColor.to})`;
  preview.textContent = getInisial(profileData.nama_lengkap);
}


/* ============================================================
   12. AVATAR — PREVIEW & KONFIRMASI
   ============================================================ */

document.getElementById('confirmAvatar')?.addEventListener('click', () => {
  applyAvatarColor(selectedColor);
  closeAvatarModal();
  showToast('🎨 Warna avatar berhasil diperbarui!');
});

function applyAvatarColor(color) {
  const gradient = `linear-gradient(135deg, ${color.from}, ${color.to})`;

  /* Terapkan ke semua elemen avatar */
  ['heroAvatar', 'sidebarAvatar', 'topbarAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.background = gradient;
  });

  /* Simpan ke profile data (untuk persistensi) */
  profileData.avatarFrom = color.from;
  profileData.avatarTo   = color.to;
  saveSession(profileData);
}

/* Terapkan warna avatar yang tersimpan saat load */
function restoreAvatarColor() {
  if (profileData.avatarFrom && profileData.avatarTo) {
    const color = { from: profileData.avatarFrom, to: profileData.avatarTo };
    applyAvatarColor(color);
    const match = AVATAR_COLORS.find(c => c.from === color.from && c.to === color.to);
    if (match) selectedColor = match;
  }
}


/* ============================================================
   13. AKTIVITAS SESI
   ============================================================ */

const DUMMY_SESI = [
  {
    device    : 'Chrome · Windows 11',
    detail    : 'Jakarta, Indonesia · Sesi ini',
    icon      : 'solar:monitor-bold-duotone',
    status    : 'active',
    statusLabel: 'Aktif',
  },
  {
    device    : 'Safari · iPhone 15',
    detail    : 'Bandung, Indonesia · 2 hari lalu',
    icon      : 'solar:smartphone-2-bold-duotone',
    status    : 'inactive',
    statusLabel: '2 hari lalu',
  },
  {
    device    : 'Chrome · macOS',
    detail    : 'Surabaya, Indonesia · 5 hari lalu',
    icon      : 'solar:laptop-bold-duotone',
    status    : 'inactive',
    statusLabel: '5 hari lalu',
  },
];

function renderSesi() {
  const list = document.getElementById('sesiList');
  if (!list) return;

  list.innerHTML = DUMMY_SESI.map((s, i) => `
    <div class="sesi-item" style="animation-delay:${i * 0.07}s">
      <div class="sesi-icon">
        <iconify-icon icon="${s.icon}" width="18"></iconify-icon>
      </div>
      <div class="sesi-main">
        <div class="sesi-device">${s.device}</div>
        <div class="sesi-detail">${s.detail}</div>
      </div>
      <span class="sesi-tag ${s.status}">${s.statusLabel}</span>
    </div>
  `).join('');
}


/* ============================================================
   14. BACKGROUND CANVAS — identik dashboard
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
   15. FLOATING PARTICLES — identik dashboard
   ============================================================ */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const symbols = ['👤', '🔒', '📋', '✅', '⚙️', '🏅', '📝', '🔑', '💼', '⭐'];
  const COUNT   = 16;

  for (let i = 0; i < COUNT; i++) {
    const p       = document.createElement('div');
    p.className   = 'particle';
    p.textContent = symbols[i % symbols.length];

    const dur   = 7 + Math.random() * 8;
    const delay = Math.random() * 10;
    const left  = Math.random() * 100;
    const size  = 12 + Math.random() * 10;

    p.style.cssText = `
      left: ${left}%;
      bottom: -40px;
      font-size: ${size}px;
      --dur: ${dur}s;
      --delay: ${delay}s;
      animation-delay: ${delay}s;
    `;

    container.appendChild(p);
  }
}


/* ============================================================
   16. SCROLL REVEAL
   ============================================================ */

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');

  targets.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.06}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          setTimeout(() => {
            e.target.style.transitionDelay = '0s';
          }, (parseFloat(e.target.style.transitionDelay || 0) * 1000) + 600);
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  targets.forEach(el => observer.observe(el));
}


/* ============================================================
   17. SIDEBAR MOBILE
   ============================================================ */

const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar?.classList.add('open');
  sidebarOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar?.classList.remove('open');
  sidebarOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);


/* ============================================================
   18. MODAL LOGOUT
   ============================================================ */

const logoutModal = document.getElementById('logoutModal');

function showLogout() {
  logoutModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideLogout() {
  logoutModal?.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('btnLogout')?.addEventListener('click', showLogout);
document.getElementById('cancelLogout')?.addEventListener('click', hideLogout);
document.getElementById('logoutOverlay')?.addEventListener('click', hideLogout);

document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user');
  localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hideLogout();
    closeSidebar();
    closeAvatarModal();
    if (formEditInfo.style.display !== 'none') closeEditInfo();
    if (formEditPwd.style.display  !== 'none') closeEditPwd();
  }
});


/* ============================================================
   19. TOAST HELPER
   ============================================================ */

let toastTimer = null;

function showToast(msg) {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function showMsg(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className   = 'form-msg ' + type;
  el.textContent = msg;
}

function clearMsg(id) {
  const el = document.getElementById(id);
  if (el) { el.className = 'form-msg'; el.textContent = ''; }
}


/* ============================================================
   20. INIT — DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  restoreAvatarColor();
  renderInfoRows();
  renderSesi();
  loadProfile();

  /* Scroll reveal setelah paint */
  setTimeout(initScrollReveal, 80);

  console.log('👤 profilStaff.js loaded | Staff:', demoSession?.nama_lengkap);
});