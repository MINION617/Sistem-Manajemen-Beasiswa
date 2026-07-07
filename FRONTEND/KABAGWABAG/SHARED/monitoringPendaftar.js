/* ============================================================
   MONITORINGPENDAFTAR.JS
   Beasiswa Kampus — Role: Kabag (khusus)
   Read-only monitoring, tidak ada aksi approve / reject

   Catatan: file ini ada di folder /SHARED/ tapi secara navigasi
   nyata hanya diakses Kabag — sidebar dan link "Dashboard" di
   seluruh /KABAG/ mengarah ke sini, sementara /WABAG/ punya
   halamannya sendiri dan tidak pernah menautkan ke folder ini.
   ============================================================ */


/* ============================================================
   01. KONFIGURASI
   ============================================================ */



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

/* Demo session fallback */
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
  /* Cabang ini tidak pernah tercapai lewat navigasi manapun saat ini —
     tidak ada halaman di /WABAG/ yang menautkan ke folder /SHARED/.
     Dipertahankan (bukan dihapus) supaya halaman ini tetap berfungsi
     benar kalau suatu saat memang dibuka lewat sesi wabag. */
  wabag : {
    label        : 'Wabag',
    dashboardUrl : '../WABAG/dashboardWabag.html',
  },
};

const roleCfg = ROLE_CFG[ROLE] || ROLE_CFG.kabag;
const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));


/* ============================================================
   03. DUMMY DATA
   ============================================================ */

const dummyPendaftar = [
  {
    id               : 'p-001',
    nama             : 'Bagas Pratama Wijaya',
    nim              : '2021410043',
    beasiswa         : 'Beasiswa Mandiri Prestasi',
    nilai_tes        : 88,
    nilai_wawancara  : 85,
    ipk              : 3.82,
    status           : 'wawancara',
    tgl              : '2026-06-01',
  },
  {
    id               : 'p-002',
    nama             : 'Cahaya Nur Aisyah',
    nim              : '2021220032',
    beasiswa         : 'Pertamina Sobat Bumi',
    nilai_tes        : 91,
    nilai_wawancara  : 89,
    ipk              : 3.91,
    status           : 'wawancara',
    tgl              : '2026-05-28',
  },
  {
    id               : 'p-003',
    nama             : 'Dimas Surya Atmaja',
    nim              : '2020130021',
    beasiswa         : 'Beasiswa Mandiri Prestasi',
    nilai_tes        : 79,
    nilai_wawancara  : null,
    ipk              : 3.65,
    status           : 'lolos_berkas',
    tgl              : '2026-06-03',
  },
  {
    id               : 'p-004',
    nama             : 'Elisa Rahayu Putri',
    nim              : '2022510017',
    beasiswa         : 'Telkom Digital Talent',
    nilai_tes        : 85,
    nilai_wawancara  : 87,
    ipk              : 3.77,
    status           : 'wawancara',
    tgl              : '2026-05-30',
  },
  {
    id               : 'p-005',
    nama             : 'Fadhlan Rizki Maulana',
    nim              : '2021410043',
    beasiswa         : 'Beasiswa Mandiri Prestasi',
    nilai_tes        : 93,
    nilai_wawancara  : 91,
    ipk              : 3.95,
    status           : 'lolos_final',
    tgl              : '2026-05-20',
  },
  {
    id               : 'p-006',
    nama             : 'Gita Safira Dewi',
    nim              : '2023110029',
    beasiswa         : 'Pertamina Sobat Bumi',
    nilai_tes        : 72,
    nilai_wawancara  : null,
    ipk              : 3.50,
    status           : 'lolos_berkas',
    tgl              : '2026-06-05',
  },
  {
    id               : 'p-007',
    nama             : 'Hendra Kurniawan',
    nim              : '2020240015',
    beasiswa         : 'Telkom Digital Talent',
    nilai_tes        : null,
    nilai_wawancara  : null,
    ipk              : 3.40,
    status           : 'menunggu_verifikasi',
    tgl              : '2026-06-10',
  },
  {
    id               : 'p-008',
    nama             : 'Indira Sari Dewi',
    nim              : '2022310044',
    beasiswa         : 'Beasiswa Mandiri Prestasi',
    nilai_tes        : null,
    nilai_wawancara  : null,
    ipk              : 3.55,
    status           : 'menunggu_verifikasi',
    tgl              : '2026-06-11',
  },
];

const STATUS_CFG = {
  menunggu_verifikasi : {
    label  : 'Menunggu Verifikasi',
    cls    : 'status-menunggu',
    accent : '#d97706',
    icon   : 'solar:inbox-in-bold-duotone',
  },
  lolos_berkas : {
    label  : 'Lolos Berkas',
    cls    : 'status-lolos',
    accent : '#2563eb',
    icon   : 'solar:check-circle-bold-duotone',
  },
  wawancara : {
    label  : 'Wawancara',
    cls    : 'status-wawancara',
    accent : '#7c3aed',
    icon   : 'solar:microphone-bold-duotone',
  },
  lolos_final : {
    label  : 'Lolos Final',
    cls    : 'status-final',
    accent : '#059669',
    icon   : 'solar:cup-star-bold-duotone',
  },
  ditolak_berkas : {
    label  : 'Ditolak',
    cls    : 'status-ditolak',
    accent : '#e11d48',
    icon   : 'solar:close-circle-bold-duotone',
  },
};


/* ── DATA (real backend, falls back to dummy above) ── */
let pendaftarData = dummyPendaftar;

async function loadData() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/kabag/pendaftar');
      pendaftarData = data.map(mapKabagApplicantRow);
    } catch (err) {
      console.warn('Gagal memuat data pendaftar, pakai data contoh:', err);
      pendaftarData = dummyPendaftar;
    }
  }
  loadStats();
  populateFilterBeasiswa();
  renderList();
}

/* Dropdown filter sebelumnya HARDCODE 3 nama program dummy lama di HTML —
   begitu data asli dimuat (nama program berbeda), memilih opsi apa pun
   tidak pernah cocok dengan d.beasiswa manapun (lihat perbaikan sama di
   penerima.js). Sekarang diisi ulang dari data yang benar-benar dimuat. */
function populateFilterBeasiswa() {
  const sel = document.getElementById('filterBeasiswa');
  if (!sel) return;
  const uniq = [...new Set(pendaftarData.map(d => d.beasiswa).filter(Boolean))];
  sel.innerHTML = '<option value="all">Semua Beasiswa</option>' +
    uniq.map(nama => `<option value="${nama}">${nama}</option>`).join('');
  filterBeasiswa = 'all';
}


/* ============================================================
   04. STATE FILTER
   ============================================================ */

let activeTab      = 'all';
let filterBeasiswa = 'all';
let sortBy         = 'nilai_desc';
let searchQ        = '';


/* ============================================================
   05. UTILS
   ============================================================ */

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function inisial(nama) {
  return nama
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatTgl(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('id-ID', {
    day   : 'numeric',
    month : 'long',
    year  : 'numeric',
  });
}

function avgNilai(d) {
  if (d.nilai_tes && d.nilai_wawancara) {
    return ((d.nilai_tes + d.nilai_wawancara) / 2).toFixed(1);
  }
  if (d.nilai_tes) return d.nilai_tes.toFixed(1);
  return null;
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }

  let cur       = 0;
  const step    = Math.max(1, Math.ceil(target / 22));
  const timer   = setInterval(() => {
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
  const pageTitle = document.getElementById('pageTitle');
  const bannerTitle = document.getElementById('bannerTitle');
  if (pageTitle)   pageTitle.textContent   = `${roleCfg.label} — Monitoring Pendaftar`;
  if (bannerTitle) bannerTitle.textContent = `${roleCfg.label} — Monitoring Pendaftar`;
}


/* ============================================================
   07. LOAD STATS
   ============================================================ */

function loadStats() {
  const menunggu    = pendaftarData.filter(d => d.status === 'menunggu_verifikasi').length;
  const lolosBerkas = pendaftarData.filter(d => d.status === 'lolos_berkas').length;
  const wawancara   = pendaftarData.filter(d => d.status === 'wawancara').length;
  const lolosFinal  = pendaftarData.filter(d => d.status === 'lolos_final').length;
  const total       = pendaftarData.length;

  animateNum('statMenunggu',    menunggu);
  animateNum('statLolosBerkas', lolosBerkas);
  animateNum('statWawancara',   wawancara);
  animateNum('statLolosFinal',  lolosFinal);

  setEl('bannerTotal', total);
  setEl('bannerLolos', lolosFinal);

  setEl('tcAll',       total);
  setEl('tcMenunggu',  menunggu);
  setEl('tcLolos',     lolosBerkas);
  setEl('tcWawancara', wawancara);
  setEl('tcFinal',     lolosFinal);

  updateLaporanBadge();
}

/* Badge laporan kendala — dihitung dari laporan status 'masuk' yang BELUM
   PERNAH dilihat (bukan status mentah), sinkron dengan mekanisme yang sama
   di laporanKendala.js: 'bk_laporan_seen_<role>'. */
async function updateLaporanBadge() {
  const badge    = document.getElementById('badgeLaporan');
  const notifDot = document.getElementById('notifDot');
  if (!isRealSession) {
    if (badge) { badge.textContent = '0'; badge.classList.remove('show'); }
    if (notifDot) notifDot.style.display = 'none';
    return;
  }
  try {
    const { data } = await api.get('/laporan');
    const masuk = data.filter(d => d.status === 'masuk').length;
    const seen  = Number(localStorage.getItem('bk_laporan_seen_' + ROLE) || 0);
    const belumDilihat = Math.max(0, masuk - seen);
    if (badge) {
      badge.textContent = belumDilihat;
      badge.classList.toggle('show', belumDilihat > 0);
    }
    if (notifDot) notifDot.style.display = belumDilihat > 0 ? 'block' : 'none';
  } catch (err) {
    console.warn('Gagal memuat badge laporan:', err);
  }
}


/* ============================================================
   08. RENDER LIST PENDAFTAR
   ============================================================ */

function renderList() {
  const listEl  = document.getElementById('pendaftarList');
  const emptyEl = document.getElementById('emptyState');
  if (!listEl) return;

  /* Filter data */
  let data = [...pendaftarData];

  if (activeTab !== 'all') {
    data = data.filter(d => d.status === activeTab);
  }

  if (filterBeasiswa !== 'all') {
    data = data.filter(d => d.beasiswa === filterBeasiswa);
  }

  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(d =>
      d.nama.toLowerCase().includes(q) ||
      d.beasiswa.toLowerCase().includes(q) ||
      d.nim.includes(q)
    );
  }

  /* Sorting */
  data.sort((a, b) => {
    const avg = d => parseFloat(avgNilai(d)) || 0;

    if (sortBy === 'nilai_desc') return avg(b) - avg(a);
    if (sortBy === 'nilai_asc')  return avg(a) - avg(b);
    if (sortBy === 'nama_asc')   return a.nama.localeCompare(b.nama);
    return new Date(b.tgl) - new Date(a.tgl);
  });

  setEl('panelCount', data.length + ' pendaftar');

  if (!data.length) {
    listEl.innerHTML       = '';
    emptyEl.style.display  = 'flex';
    return;
  }

  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const cfg = STATUS_CFG[d.status] || STATUS_CFG.menunggu_verifikasi;
    const avg = avgNilai(d);

    return `
      <div
        class="pendaftar-card"
        style="--card-accent:${cfg.accent}; animation-delay:${i * 0.05}s"
        onclick="openDetail('${d.id}')"
      >
        <div class="card-head">
          <div class="card-avatar">${inisial(d.nama)}</div>
          <div class="card-main">
            <div class="card-nama">${d.nama}</div>
            <div class="card-meta">
              <span class="card-meta-item">
                <iconify-icon icon="solar:document-text-bold-duotone" width="10"></iconify-icon>
                NIM: ${d.nim}
              </span>
              <span class="card-meta-item">
                <iconify-icon icon="solar:diploma-bold-duotone" width="10"></iconify-icon>
                ${d.beasiswa}
              </span>
              <span class="card-meta-item">
                <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
                ${formatTgl(d.tgl)}
              </span>
            </div>
          </div>
          <div class="card-right">
            <span class="status-pill ${cfg.cls}">
              <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
              ${cfg.label}
            </span>
          </div>
        </div>
        <div class="card-nilai-wrap">
          <div class="nilai-chip ${d.nilai_tes ? '' : 'kosong'}">
            <div class="nilai-chip-num">${d.nilai_tes ?? '—'}</div>
            <div class="nilai-chip-label">Nilai Tes</div>
          </div>
          <div class="nilai-chip ${d.nilai_wawancara ? '' : 'kosong'}">
            <div class="nilai-chip-num">${d.nilai_wawancara ?? '—'}</div>
            <div class="nilai-chip-label">Wawancara</div>
          </div>
          <div class="nilai-chip ipk">
            <div class="nilai-chip-num">${d.ipk}</div>
            <div class="nilai-chip-label">IPK</div>
          </div>
          ${avg ? `
            <div class="nilai-chip" style="background:var(--purple-soft);border-color:#c4b5fd">
              <div class="nilai-chip-num" style="color:#6d28d9">${avg}</div>
              <div class="nilai-chip-label">Rata-rata</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}


/* ============================================================
   09. MODAL DETAIL (READ-ONLY)
   ============================================================ */

const modalDetail = document.getElementById('modalDetail');

function openDetail(id) {
  const d = pendaftarData.find(x => x.id === id);
  if (!d) return;

  const cfg = STATUS_CFG[d.status] || STATUS_CFG.menunggu_verifikasi;
  const avg = avgNilai(d);

  document.getElementById('modalDetailContent').innerHTML = `
    <div class="detail-head">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px">
        <span class="status-pill ${cfg.cls}">
          <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
          ${cfg.label}
        </span>
        <span style="font-size:11px; color:var(--text-4)">${formatTgl(d.tgl)}</span>
      </div>
      <div class="detail-judul">${d.nama}</div>
      <div class="detail-meta">
        <span class="detail-meta-item">NIM: ${d.nim}</span>
        <span class="detail-meta-item">
          <iconify-icon icon="solar:diploma-bold-duotone" width="11"></iconify-icon>
          ${d.beasiswa}
        </span>
      </div>
    </div>

    <div class="detail-section-title">Hasil Seleksi</div>
    <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:4px">
      <div class="nilai-chip ${d.nilai_tes ? '' : 'kosong'}" style="min-width:80px">
        <div class="nilai-chip-num" style="font-size:22px">${d.nilai_tes ?? '—'}</div>
        <div class="nilai-chip-label">Nilai Tes</div>
      </div>
      <div class="nilai-chip ${d.nilai_wawancara ? '' : 'kosong'}" style="min-width:80px">
        <div class="nilai-chip-num" style="font-size:22px">${d.nilai_wawancara ?? '—'}</div>
        <div class="nilai-chip-label">Wawancara</div>
      </div>
      <div class="nilai-chip ipk" style="min-width:80px">
        <div class="nilai-chip-num" style="font-size:22px">${d.ipk}</div>
        <div class="nilai-chip-label">IPK</div>
      </div>
      ${avg ? `
        <div class="nilai-chip" style="background:var(--purple-soft);border-color:#c4b5fd;min-width:80px">
          <div class="nilai-chip-num" style="font-size:22px;color:#6d28d9">${avg}</div>
          <div class="nilai-chip-label">Rata-rata</div>
        </div>
      ` : ''}
    </div>

    <div class="detail-section-title">Data Pendaftar</div>
    <div class="detail-desc">
      <strong>Nama Lengkap :</strong> ${d.nama}<br>
      <strong>NIM           :</strong> ${d.nim}<br>
      <strong>Beasiswa       :</strong> ${d.beasiswa}<br>
      <strong>Tanggal Daftar :</strong> ${formatTgl(d.tgl)}
    </div>

    <div class="info-notice">
      <iconify-icon icon="solar:eye-bold-duotone" width="14"></iconify-icon>
      Anda hanya dapat melihat data ini. Penanganan dilakukan oleh Staff Admin.
    </div>
  `;

  modalDetail?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  modalDetail?.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modalDetailClose')?.addEventListener('click', closeDetail);
document.getElementById('modalDetailOverlay')?.addEventListener('click', closeDetail);


/* ============================================================
   10. TABS, FILTER, SEARCH
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

document.getElementById('sortSelect')?.addEventListener('change', e => {
  sortBy = e.target.value;
  renderList();
});

document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQ = e.target.value.trim();
  renderList();
});


/* ============================================================
   11. SIDEBAR & LOGOUT
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
    closeDetail();
    logoutModal?.classList.remove('active');
    closeSidebar();
    document.body.style.overflow = '';
  }
});


/* ============================================================
   12. BACKGROUND CANVAS
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

      if (o.x < -o.r)              o.x = canvas.width  + o.r;
      if (o.x > canvas.width  + o.r) o.x = -o.r;
      if (o.y < -o.r)              o.y = canvas.height + o.r;
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
   13. PARTICLES
   ============================================================ */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const icons = [
    ['solar:cup-star-bold-duotone',                     'rgba(37, 99, 235, 0.16)'],
    ['solar:diploma-bold-duotone',                      'rgba(37, 99, 235, 0.14)'],
    ['solar:users-group-two-rounded-bold-duotone',      'rgba(5, 150, 105, 0.14)'],
    ['solar:chart-bold-duotone',                        'rgba(124, 58, 237, 0.14)'],
    ['solar:star-bold-duotone',                         'rgba(251, 191, 36, 0.16)'],
  ];

  for (let i = 0; i < 14; i++) {
    const [icon, color] = icons[i % icons.length];

    const p   = document.createElement('iconify-icon');
    const dur = 7  + Math.random() * 8;
    const dl  = Math.random() * 10;

    p.setAttribute('icon', icon);
    p.className = 'particle';
    p.style.cssText = [
      `left       : ${Math.random() * 100}%`,
      `bottom     : -40px`,
      `font-size  : ${12 + Math.random() * 10}px`,
      `color      : ${color}`,
      `--dur      : ${dur}s`,
      `--delay    : ${dl}s`,
      `animation-delay : ${dl}s`,
    ].join('; ');

    container.appendChild(p);
  }
}


/* ============================================================
   14. INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadData();

  console.log(`👥 monitoringPendaftar.js loaded | Role: ${ROLE} | User: ${demoSession.nama_lengkap}`);
});