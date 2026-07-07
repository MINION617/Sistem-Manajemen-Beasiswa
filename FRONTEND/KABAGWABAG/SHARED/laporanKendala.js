/* ============================================================
   LAPORANKENDALA.JS
   Beasiswa Kampus — Role: Kabag / Wabag (SHARED)
   Monitoring laporan kendala mahasiswa — read-only,
   tidak bisa menangani (hanya Staff Admin yang bisa)
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
const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

/* GET /api/laporan row -> shape this page renders (mirrors kabagMapper.js style) */
function mapLaporanRow(row) {
  return {
    id: row.id,
    judul: row.judul,
    deskripsi: row.deskripsi,
    kategori: row.kategori,
    status: row.status,
    tgl: row.tanggal_lapor,
    mahasiswa: {
      nama: row.profiles?.nama_lengkap ?? '—',
      nim: row.profiles?.nim_nip ?? '—',
    },
    beasiswa: row.beasiswa?.nama_program ?? null,
    tanggapan_staff: row.tanggapan_staff,
  };
}


/* ============================================================
   03. DUMMY DATA
   ============================================================ */

const dummyLaporan = [
  {
    id         : 'l-001',
    judul      : 'Bukti transfer belum muncul di dashboard',
    deskripsi  : 'Sudah 3 hari sejak jadwal pencairan tapi status di dashboard masih "Menunggu". Saya sudah cek rekening tapi dana belum masuk juga.',
    kategori   : 'dana',
    status     : 'masuk',
    tgl        : '2026-06-20T08:00:00Z',
    mahasiswa  : {
      nama : 'Bagas Pratama Wijaya',
      nim  : '2021410043',
    },
    beasiswa         : 'Beasiswa Mandiri Prestasi',
    tanggapan_staff  : null,
  },
  {
    id         : 'l-002',
    judul      : 'Status seleksi tidak berubah setelah wawancara',
    deskripsi  : 'Saya sudah mengikuti wawancara pada 20 Mei 2026 tapi status di halaman Pendaftaran Saya masih "Wawancara" dan belum berubah.',
    kategori   : 'status',
    status     : 'masuk',
    tgl        : '2026-06-19T14:00:00Z',
    mahasiswa  : {
      nama : 'Cahaya Nur Aisyah',
      nim  : '2021220032',
    },
    beasiswa         : 'Pertamina Sobat Bumi',
    tanggapan_staff  : null,
  },
  {
    id         : 'l-003',
    judul      : 'Gagal upload berkas KTM',
    deskripsi  : 'Saya mencoba upload KTM dalam format JPG ukuran 2MB tapi terus muncul error "format tidak didukung". Sudah dicoba beberapa kali tetap gagal.',
    kategori   : 'teknis',
    status     : 'diproses',
    tgl        : '2026-06-18T09:15:00Z',
    mahasiswa  : {
      nama : 'Dimas Surya Atmaja',
      nim  : '2020130021',
    },
    beasiswa         : null,
    tanggapan_staff  : 'Halo! Kami sedang menginvestigasi masalah upload ini. Mohon coba gunakan format PNG atau ubah ukuran file menjadi di bawah 1MB.',
  },
  {
    id         : 'l-004',
    judul      : 'Nilai tes tidak sesuai dengan yang disampaikan penguji',
    deskripsi  : 'Pada saat tes, penguji menyampaikan nilai saya sekitar 85, namun yang tertera di sistem hanya 76. Mohon dikonfirmasi kembali.',
    kategori   : 'status',
    status     : 'diproses',
    tgl        : '2026-06-17T13:30:00Z',
    mahasiswa  : {
      nama : 'Elisa Rahayu Putri',
      nim  : '2022510017',
    },
    beasiswa         : 'Telkom Digital Talent',
    tanggapan_staff  : 'Kami akan konfirmasi ke tim penguji dalam 2-3 hari kerja. Terima kasih atas laporannya.',
  },
  {
    id         : 'l-005',
    judul      : 'Upload sertifikat prestasi gagal terus',
    deskripsi  : 'Sudah mencoba berkali-kali upload sertifikat dalam format PDF tapi selalu gagal dengan pesan "server error". Mohon bantuannya.',
    kategori   : 'dokumen',
    status     : 'selesai',
    tgl        : '2026-06-10T09:00:00Z',
    mahasiswa  : {
      nama : 'Fadhlan Rizki Maulana',
      nim  : '2021410043',
    },
    beasiswa         : 'Beasiswa Mandiri Prestasi',
    tanggapan_staff  : 'Masalah ini sudah kami perbaiki pada server. Silakan coba upload kembali, seharusnya sudah bisa berjalan normal.',
  },
  {
    id         : 'l-006',
    judul      : 'Tidak bisa login ke portal beasiswa',
    deskripsi  : 'Sejak kemarin saya tidak bisa login. Sudah coba reset password tapi email verifikasi tidak masuk-masuk ke inbox maupun spam.',
    kategori   : 'teknis',
    status     : 'selesai',
    tgl        : '2026-06-08T11:00:00Z',
    mahasiswa  : {
      nama : 'Gita Safira Dewi',
      nim  : '2023110029',
    },
    beasiswa         : null,
    tanggapan_staff  : 'Akun Anda sudah kami buka kuncinya dan email verifikasi sudah dikirim ulang. Silakan cek inbox Anda.',
  },
];

const STATUS_CFG = {
  masuk : {
    label  : 'Baru Masuk',
    cls    : 'pill-masuk',
    accent : '#e11d48',
    icon   : 'solar:chat-round-unread-bold-duotone',
  },
  diproses : {
    label  : 'Diproses',
    cls    : 'pill-diproses',
    accent : '#d97706',
    icon   : 'solar:hourglass-bold-duotone',
  },
  selesai : {
    label  : 'Selesai',
    cls    : 'pill-selesai',
    accent : '#059669',
    icon   : 'solar:check-circle-bold-duotone',
  },
};

const KATEGORI_CFG = {
  dokumen  : { label : 'Dokumen & Berkas',   icon : 'solar:document-text-bold-duotone' },
  status   : { label : 'Status Pendaftaran', icon : 'solar:diploma-bold-duotone' },
  dana     : { label : 'Dana & Transfer',    icon : 'solar:banknote-bold-duotone' },
  teknis   : { label : 'Masalah Teknis',     icon : 'solar:laptop-bold-duotone' },
  lainnya  : { label : 'Lainnya',            icon : 'solar:info-circle-bold-duotone' },
};

/* ── DATA (real backend, falls back to dummy above) ── */
let laporanData = dummyLaporan;

async function loadData() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/laporan');
      laporanData = data.map(mapLaporanRow);
    } catch (err) {
      console.warn('Gagal memuat data laporan, pakai data contoh:', err);
      laporanData = dummyLaporan;
    }
  }
  loadStats();
  renderList();
}


/* ============================================================
   04. STATE FILTER
   ============================================================ */

let activeTab  = 'all';
let filterKat  = 'all';
let searchQ    = '';


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

function timeAgo(str) {
  if (!str) return '—';
  const diff = Date.now() - new Date(str).getTime();
  const m    = Math.floor(diff / 60000);

  if (m < 1)  return 'baru saja';
  if (m < 60) return m + ' menit lalu';

  const h = Math.floor(m / 60);
  if (h < 24) return h + ' jam lalu';

  return Math.floor(h / 24) + ' hari lalu';
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
  if (pageTitle)   pageTitle.textContent   = `${roleCfg.label} — Laporan Kendala`;
  if (bannerTitle) bannerTitle.textContent = `${roleCfg.label} — Laporan Kendala`;
}


/* ============================================================
   07. LOAD STATS
   ============================================================ */

function loadStats() {
  const masuk    = laporanData.filter(d => d.status === 'masuk').length;
  const diproses = laporanData.filter(d => d.status === 'diproses').length;
  const selesai  = laporanData.filter(d => d.status === 'selesai').length;
  const total    = laporanData.length;

  animateNum('statMasuk',    masuk);
  animateNum('statDiproses', diproses);
  animateNum('statSelesai',  selesai);
  animateNum('statTotal',    total);

  setEl('bannerMasuk',    masuk);
  setEl('bannerDiproses', diproses);

  setEl('tcAll',      total);
  setEl('tcMasuk',    masuk);
  setEl('tcDiproses', diproses);
  setEl('tcSelesai',  selesai);

  /* Kabag/Wabag cuma bisa memonitor (tidak bisa mengubah status — itu
     wewenang Staff), jadi begitu halaman ini dibuka, tandai semua laporan
     'masuk' yang sedang tampil sebagai "sudah dilihat". Badge di halaman
     lain (dashboard, dll) akan mengikuti angka ini, bukan status mentah,
     supaya tidak nyala terus selama Staff belum memproses. */
  localStorage.setItem('bk_laporan_seen_' + ROLE, String(masuk));

  /* Badge sidebar & notif dot — 0 karena baru saja ditandai "dilihat" */
  const badge = document.getElementById('badgeLaporan');
  if (badge) {
    badge.textContent = '0';
    badge.classList.remove('show');
  }

  const notifDot = document.getElementById('notifDot');
  if (notifDot) notifDot.style.display = 'none';
}


/* ============================================================
   08. RENDER LIST LAPORAN
   ============================================================ */

function renderList() {
  const listEl  = document.getElementById('laporanList');
  const emptyEl = document.getElementById('emptyState');
  if (!listEl) return;

  /* Filter data */
  let data = [...laporanData];

  if (activeTab !== 'all') {
    data = data.filter(d => d.status === activeTab);
  }

  if (filterKat !== 'all') {
    data = data.filter(d => d.kategori === filterKat);
  }

  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(d =>
      d.judul.toLowerCase().includes(q)         ||
      d.mahasiswa.nama.toLowerCase().includes(q) ||
      d.mahasiswa.nim.includes(q)
    );
  }

  /* Urutkan terbaru dulu */
  data.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));

  setEl('panelCount', data.length + ' laporan');

  if (!data.length) {
    listEl.innerHTML      = '';
    emptyEl.style.display = 'flex';
    return;
  }

  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const cfg    = STATUS_CFG[d.status]       || STATUS_CFG.masuk;
    const katCfg = KATEGORI_CFG[d.kategori]  || KATEGORI_CFG.lainnya;

    return `
      <div
        class="laporan-card"
        style="--card-accent:${cfg.accent}; animation-delay:${i * 0.05}s"
        onclick="openDetail('${d.id}')"
      >
        <div class="laporan-head">
          <div class="laporan-avatar">${inisial(d.mahasiswa.nama)}</div>
          <div class="laporan-head-main">
            <div class="laporan-judul">${d.judul}</div>
            <div class="laporan-meta">
              <span class="laporan-meta-item">
                <iconify-icon icon="solar:user-bold-duotone" width="10"></iconify-icon>
                ${d.mahasiswa.nama}
              </span>
              <span class="laporan-meta-item">
                NIM: ${d.mahasiswa.nim}
              </span>
              ${d.beasiswa ? `
                <span class="laporan-meta-item">
                  <iconify-icon icon="solar:diploma-bold-duotone" width="10"></iconify-icon>
                  ${d.beasiswa}
                </span>
              ` : ''}
              <span class="laporan-meta-item">
                <iconify-icon icon="solar:clock-circle-bold-duotone" width="10"></iconify-icon>
                ${timeAgo(d.tgl)}
              </span>
            </div>
          </div>
          <span class="status-pill ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
            ${cfg.label}
          </span>
        </div>

        <div class="laporan-body">${d.deskripsi}</div>

        ${d.tanggapan_staff ? `
          <div class="tanggapan-preview">
            <iconify-icon
              icon="solar:chat-round-dots-bold-duotone"
              width="14"
              style="color:#059669; flex-shrink:0"
            ></iconify-icon>
            <div class="tanggapan-preview-text">${d.tanggapan_staff}</div>
          </div>
        ` : ''}

        <div class="laporan-footer">
          <div class="laporan-tags">
            <span class="laporan-tag">
              <iconify-icon icon="${katCfg.icon}" width="10"></iconify-icon>
              ${katCfg.label}
            </span>
            <span class="laporan-tag">
              <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
              ${formatTgl(d.tgl)}
            </span>
          </div>
          <span class="badge-readonly">
            <iconify-icon icon="solar:eye-bold-duotone" width="12"></iconify-icon>
            Monitoring
          </span>
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
  const d = laporanData.find(x => x.id === id);
  if (!d) return;

  const cfg    = STATUS_CFG[d.status]       || STATUS_CFG.masuk;
  const katCfg = KATEGORI_CFG[d.kategori]  || KATEGORI_CFG.lainnya;

  document.getElementById('modalDetailContent').innerHTML = `
    <div class="detail-head">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px">
        <span class="status-pill ${cfg.cls}">
          <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
          ${cfg.label}
        </span>
        <span style="font-size:11px; color:var(--text-4)">${timeAgo(d.tgl)}</span>
      </div>
      <div class="detail-judul">${d.judul}</div>
      <div class="detail-meta">
        <span class="detail-meta-item">
          <iconify-icon icon="solar:user-bold-duotone" width="11"></iconify-icon>
          ${d.mahasiswa.nama}
        </span>
        <span class="detail-meta-item">NIM: ${d.mahasiswa.nim}</span>
        ${d.beasiswa ? `
          <span class="detail-meta-item">
            <iconify-icon icon="solar:diploma-bold-duotone" width="11"></iconify-icon>
            ${d.beasiswa}
          </span>
        ` : ''}
        <span class="detail-meta-item">
          <iconify-icon icon="${katCfg.icon}" width="11"></iconify-icon>
          ${katCfg.label}
        </span>
        <span class="detail-meta-item">
          <iconify-icon icon="solar:calendar-bold-duotone" width="11"></iconify-icon>
          ${formatTgl(d.tgl)}
        </span>
      </div>
    </div>

    <div class="detail-section-title">Deskripsi Masalah</div>
    <div class="detail-desc">${d.deskripsi}</div>

    <div class="detail-section-title">Tanggapan Staff Admin</div>
    ${d.tanggapan_staff
      ? `
        <div class="tanggapan-item">
          <div class="tanggapan-item-header">
            <span class="tanggapan-item-role">
              <iconify-icon icon="solar:user-id-bold-duotone" width="12"></iconify-icon>
              Staff Admin
            </span>
            <span class="tanggapan-item-tgl">${formatTgl(d.tgl)}</span>
          </div>
          <div class="tanggapan-item-text">${d.tanggapan_staff}</div>
        </div>
      `
      : `
        <div class="belum-tanggapan">
          <iconify-icon
            icon="solar:hourglass-bold-duotone"
            width="20"
            style="color:var(--text-4); display:block; margin:0 auto 6px"
          ></iconify-icon>
          Menunggu tanggapan dari Staff Admin.
        </div>
      `
    }

    <div class="info-notice">
      <iconify-icon icon="solar:eye-bold-duotone" width="14"></iconify-icon>
      Anda hanya dapat memonitor laporan ini. Penanganan dilakukan oleh Staff Admin.
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
document.getElementById('closeDetail')?.addEventListener('click', closeDetail);


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

document.getElementById('filterKategori')?.addEventListener('change', e => {
  filterKat = e.target.value;
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
   13. PARTICLES
   ============================================================ */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const icons = [
    ['solar:chat-round-like-bold-duotone',     'rgba(251, 146, 60, 0.18)'],
    ['solar:chat-round-unread-bold-duotone',   'rgba(225, 29, 72, 0.14)'],
    ['solar:check-circle-bold-duotone',        'rgba(5, 150, 105, 0.16)'],
    ['solar:hourglass-bold-duotone',           'rgba(217, 119, 6, 0.14)'],
    ['solar:diploma-bold-duotone',             'rgba(37, 99, 235, 0.14)'],
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
   14. INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadData();

  console.log(`📋 laporanKendala.js loaded | Role: ${ROLE} | User: ${demoSession.nama_lengkap}`);
});