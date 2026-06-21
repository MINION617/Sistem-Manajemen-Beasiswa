/* ============================================================
   PENERIMA.JS
   Beasiswa Kampus — Role: Kabag / Wabag (SHARED)
   Daftar penerima beasiswa, nominal dana, sponsor (read-only)
   ============================================================ */


/* ============================================================
   01. KONFIGURASI
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';


/* ============================================================
   02. SESSION & ROLE
   ============================================================ */

function getSession() {
  const raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return raw ? JSON.parse(raw) : null;
}

const session = getSession();

/* Guard login — aktifkan saat sudah ada halaman login */
// if (!session || !['kabag', 'wabag'].includes(session.role)) {
//   window.location.href = '../../LOGIN/login.html';
// }

const demoSession = session || {
  nama_lengkap : 'Dr. Suharto, M.Pd.',
  role         : 'kabag',
  id           : 'demo-kabag-uuid',
};

const ROLE = demoSession.role;

const ROLE_CFG = {
  kabag : {
    label        : 'Kabag',
    dashboardUrl : '../KABAG/dashboardKabag.html',
  },
  wabag : {
    label        : 'Wabag',
    dashboardUrl : '../WABAG/dashboardWabag.html',
  },
};

const roleCfg = ROLE_CFG[ROLE] || ROLE_CFG.kabag;


/* ============================================================
   03. DUMMY DATA
   ============================================================ */

const dummyPenerima = [
  {
    id       : 'r-001',
    nama     : 'Fadhlan Rizki Maulana',
    nim      : '2021410043',
    beasiswa : 'Beasiswa Mandiri Prestasi',
    sponsor  : 'Bank Mandiri',
    nominal  : 5000000,
    status   : 'sudah_cair',
    tgl      : '2026-06-11',
  },
  {
    id       : 'r-002',
    nama     : 'Cahaya Nur Aisyah',
    nim      : '2021220032',
    beasiswa : 'Pertamina Sobat Bumi',
    sponsor  : 'Pertamina',
    nominal  : 7500000,
    status   : 'sudah_cair',
    tgl      : '2026-06-10',
  },
  {
    id       : 'r-003',
    nama     : 'Elisa Rahayu Putri',
    nim      : '2022510017',
    beasiswa : 'Telkom Digital Talent',
    sponsor  : 'Telkom',
    nominal  : 6000000,
    status   : 'proses_transfer',
    tgl      : '2026-06-15',
  },
  {
    id       : 'r-004',
    nama     : 'Bagas Pratama Wijaya',
    nim      : '2021410043',
    beasiswa : 'Beasiswa Mandiri Prestasi',
    sponsor  : 'Bank Mandiri',
    nominal  : 5000000,
    status   : 'proses_transfer',
    tgl      : '2026-06-16',
  },
  {
    id       : 'r-005',
    nama     : 'Dimas Surya Atmaja',
    nim      : '2020130021',
    beasiswa : 'Beasiswa Mandiri Prestasi',
    sponsor  : 'Bank Mandiri',
    nominal  : 5000000,
    status   : 'belum_cair',
    tgl      : null,
  },
  {
    id       : 'r-006',
    nama     : 'Gita Safira Dewi',
    nim      : '2023110029',
    beasiswa : 'Pertamina Sobat Bumi',
    sponsor  : 'Pertamina',
    nominal  : 7500000,
    status   : 'belum_cair',
    tgl      : null,
  },
];

const STATUS_CFG = {
  sudah_cair      : {
    cls   : 'pill-cair',
    label : 'Sudah Cair',
    icon  : 'solar:check-circle-bold-duotone',
  },
  proses_transfer : {
    cls   : 'pill-proses',
    label : 'Proses Transfer',
    icon  : 'solar:transfer-horizontal-bold-duotone',
  },
  belum_cair      : {
    cls   : 'pill-belum',
    label : 'Belum Cair',
    icon  : 'solar:clock-circle-bold-duotone',
  },
};


/* ============================================================
   04. STATE FILTER
   ============================================================ */

let activeTab      = 'all';
let filterBeasiswa = 'all';
let searchQ        = '';


/* ============================================================
   05. UTILS
   ============================================================ */

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }

  let cur     = 0;
  const step  = Math.max(1, Math.ceil(target / 22));
  const timer = setInterval(() => {
    cur += step;
    if (cur >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = cur;
    }
  }, 35);
}


/* ============================================================
   06. INIT USER INFO
   ============================================================ */

function initUserInfo() {
  const nama        = demoSession.nama_lengkap || 'Pengguna';
  const inisialUser = nama.charAt(0).toUpperCase();

  setEl('sidebarName',      nama);
  setEl('sidebarRoleLabel', roleCfg.label);

  const sidebarAv = document.getElementById('sidebarAvatar');
  const topbarAv  = document.getElementById('topbarAvatar');
  if (sidebarAv) sidebarAv.textContent = inisialUser;
  if (topbarAv)  topbarAv.textContent  = inisialUser;

  const navDash = document.getElementById('navDashboard');
  if (navDash) navDash.href = roleCfg.dashboardUrl;

  /* Update judul halaman dengan label role */
  const pageTitle   = document.getElementById('pageTitle');
  const bannerTitle = document.getElementById('bannerTitle');
  if (pageTitle)   pageTitle.textContent   = `${roleCfg.label} — Penerima Beasiswa`;
  if (bannerTitle) bannerTitle.textContent = `${roleCfg.label} — Penerima Beasiswa`;
}


/* ============================================================
   07. LOAD STATS
   ============================================================ */

function loadStats() {
  const total      = dummyPenerima.length;
  const sudahCair  = dummyPenerima.filter(d => d.status === 'sudah_cair').length;
  const proses     = dummyPenerima.filter(d => d.status === 'proses_transfer').length;
  const belumCair  = dummyPenerima.filter(d => d.status === 'belum_cair').length;
  const totalDana  = dummyPenerima.reduce((sum, d) => sum + d.nominal, 0);
  const juta       = (totalDana / 1000000).toLocaleString('id-ID');

  animateNum('statTotalPenerima', total);
  animateNum('statSudahCair',     sudahCair);
  animateNum('statProses',        proses);
  animateNum('statBelumCair',     belumCair);

  setEl('bannerPenerima', total);

  const elDana = document.getElementById('bannerDana');
  if (elDana) elDana.textContent = `Rp ${juta} Jt`;

  setEl('tcAll',    total);
  setEl('tcCair',   sudahCair);
  setEl('tcProses', proses);
  setEl('tcBelum',  belumCair);

  /* Badge laporan (dummy) */
  const badge = document.getElementById('badgeLaporan');
  if (badge) {
    badge.textContent = '2';
    badge.classList.add('show');
  }

  const notifDot = document.getElementById('notifDot');
  if (notifDot) notifDot.style.display = 'block';
}


/* ============================================================
   08. RENDER TABEL PENERIMA
   ============================================================ */

function renderList() {
  const tableEl   = document.getElementById('tablePenerima');
  const tableWrap = document.getElementById('tableWrap');
  const emptyEl   = document.getElementById('emptyState');
  if (!tableEl) return;

  /* Filter data */
  let data = [...dummyPenerima];

  if (activeTab !== 'all') {
    data = data.filter(d => d.status === activeTab);
  }

  if (filterBeasiswa !== 'all') {
    data = data.filter(d => d.beasiswa === filterBeasiswa);
  }

  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(d =>
      d.nama.toLowerCase().includes(q)     ||
      d.nim.includes(q)                    ||
      d.beasiswa.toLowerCase().includes(q) ||
      d.sponsor.toLowerCase().includes(q)
    );
  }

  setEl('panelCount', data.length + ' penerima');

  if (!data.length) {
    if (tableWrap) tableWrap.style.display = 'none';
    emptyEl.style.display = 'flex';
    return;
  }

  if (tableWrap) tableWrap.style.display = 'block';
  emptyEl.style.display = 'none';

  tableEl.innerHTML = data.map((d, i) => {
    const cfg = STATUS_CFG[d.status] || STATUS_CFG.belum_cair;

    return `
      <tr style="animation: itemReveal 0.3s ${i * 0.05}s both">
        <td>${i + 1}</td>
        <td class="td-nama">${d.nama}</td>
        <td class="td-nim">${d.nim}</td>
        <td>${d.beasiswa}</td>
        <td>${d.sponsor}</td>
        <td class="td-dana">${formatRupiah(d.nominal)}</td>
        <td>
          <span class="status-pill-sm ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
            ${cfg.label}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}


/* ============================================================
   09. TABS, FILTER, SEARCH
   ============================================================ */

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderList();
  });
});

document.getElementById('filterBeasiswa')?.addEventListener('change', e => {
  filterBeasiswa = e.target.value;
  renderList();
});

document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQ = e.target.value.trim();
  renderList();
});


/* ============================================================
   10. SIDEBAR & LOGOUT
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

const logoutModal = document.getElementById('logoutModal');

document.getElementById('btnLogout')?.addEventListener('click', () => {
  logoutModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
});

document.getElementById('cancelLogout')?.addEventListener('click', () => {
  logoutModal?.classList.remove('active');
  document.body.style.overflow = '';
});

document.getElementById('logoutOverlay')?.addEventListener('click', () => {
  logoutModal?.classList.remove('active');
  document.body.style.overflow = '';
});

document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user');
  localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    logoutModal?.classList.remove('active');
    closeSidebar();
    document.body.style.overflow = '';
  }
});


/* ============================================================
   11. BACKGROUND CANVAS
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

      if (o.x < -o.r)                o.x = canvas.width  + o.r;
      if (o.x > canvas.width  + o.r) o.x = -o.r;
      if (o.y < -o.r)                o.y = canvas.height + o.r;
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
   12. PARTICLES
   ============================================================ */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const icons = [
    ['solar:wallet-money-bold-duotone',            'rgba(5, 150, 105, 0.18)'],
    ['solar:banknote-bold-duotone',                'rgba(37, 99, 235, 0.16)'],
    ['solar:buildings-2-bold-duotone',             'rgba(124, 58, 237, 0.14)'],
    ['solar:transfer-horizontal-bold-duotone',     'rgba(5, 150, 105, 0.14)'],
    ['solar:cup-star-bold-duotone',                'rgba(251, 191, 36, 0.18)'],
  ];

  for (let i = 0; i < 14; i++) {
    const [icon, color] = icons[i % icons.length];

    const p   = document.createElement('iconify-icon');
    const dur = 7  + Math.random() * 8;
    const dl  = Math.random() * 10;

    p.setAttribute('icon', icon);
    p.className = 'particle';
    p.style.cssText = [
      `left            : ${Math.random() * 100}%`,
      `bottom          : -40px`,
      `font-size       : ${12 + Math.random() * 10}px`,
      `color           : ${color}`,
      `--dur           : ${dur}s`,
      `--delay         : ${dl}s`,
      `animation-delay : ${dl}s`,
    ].join('; ');

    container.appendChild(p);
  }
}


/* ============================================================
   13. INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadStats();
  renderList();

  console.log(`🏆 penerima.js loaded | Role: ${ROLE} | User: ${demoSession.nama_lengkap}`);
});