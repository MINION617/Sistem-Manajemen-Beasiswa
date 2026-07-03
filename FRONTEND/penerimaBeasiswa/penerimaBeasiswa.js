/* ============================================================
   PENERIMABEASISWA.JS — Beasiswa Kampus
   Ikon  : Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di STATUS_CFG, data & render diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
            Struktur kode vertikal (satu properti per baris).
   ============================================================ */



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
  nama_lengkap : 'Rizky Firmansyah',
  nim_nip      : '2021310045',
  role         : 'mahasiswa',
  id           : 'demo-uuid',
};

// Jumlah notifikasi belum dibaca — dipakai untuk titik merah di lonceng
// notifikasi & badge di dropdown profil. TODO: ganti dengan hitungan asli
// dari data notifikasi saat sudah terhubung ke backend.
const dummyNotifUnread = 2;

// Jumlah pendaftaran yang sedang diproses — dipakai untuk badge
// "Pendaftaran Saya" di navbar. TODO: ganti dengan hitungan asli dari
// data pendaftaran saat sudah terhubung ke backend.
const dummyPendaftaranProses = 2;


/* ============================================================
   STATUS CONFIG — icon: Iconify icon name + iconColor
   menggantikan emoji string di aslinya
   ============================================================ */
const STATUS_CFG = {
  pending: {
    label    : 'Pending',
    cls      : 's-pending',
    icon     : 'solar:pause-circle-bold-duotone',
    iconColor: '#fbbf24',
    progress : 10,
    color    : '#fbbf24',
  },
  sedang_diproses: {
    label    : 'Sedang Diproses',
    cls      : 's-proses',
    icon     : 'solar:settings-bold-duotone',
    iconColor: '#3b82f6',
    progress : 55,
    color    : '#3b82f6',
  },
  sudah_cair: {
    label    : 'Sudah Cair',
    cls      : 's-cair',
    icon     : 'solar:check-circle-bold-duotone',
    iconColor: '#34d399',
    progress : 100,
    color    : '#34d399',
  },
};


/* ============================================================
   DUMMY DATA
   emoji field diganti: icon + iconColor (bg tetap)
   ============================================================ */
const dummyDana = [
  {
    id                 : 'd-001',
    pendaftaran_id     : 'p-001',
    nominal            : 5000000,
    bukti_transfer_url : '#',
    status             : 'sudah_cair',
    tanggal_pencairan  : '2026-06-01T10:00:00Z',
    created_at         : '2026-05-25T08:00:00Z',
    pendaftaran: {
      beasiswa: {
        nama_program : 'Beasiswa Mandiri Prestasi',
        sponsors     : { nama_perusahaan: 'Bank Mandiri' },
      },
    },
    icon     : 'solar:cup-star-bold-duotone',
    iconColor: '#d97706',
    bg       : '#fef3c7',
  },
  {
    id                 : 'd-002',
    pendaftaran_id     : 'p-002',
    nominal            : 7500000,
    bukti_transfer_url : null,
    status             : 'sedang_diproses',
    tanggal_pencairan  : null,
    created_at         : '2026-05-28T09:00:00Z',
    pendaftaran: {
      beasiswa: {
        nama_program : 'Pertamina Sobat Bumi',
        sponsors     : { nama_perusahaan: 'Pertamina' },
      },
    },
    icon     : 'solar:globus-bold-duotone',
    iconColor: '#059669',
    bg       : '#fee2e2',
  },
  {
    id                 : 'd-003',
    pendaftaran_id     : 'p-003',
    nominal            : 4500000,
    bukti_transfer_url : null,
    status             : 'pending',
    tanggal_pencairan  : null,
    created_at         : '2026-06-05T11:00:00Z',
    pendaftaran: {
      beasiswa: {
        nama_program : 'Beasiswa Djarum Plus',
        sponsors     : { nama_perusahaan: 'Djarum Foundation' },
      },
    },
    icon     : 'solar:star-bold-duotone',
    iconColor: '#8b5cf6',
    bg       : '#ede9fe',
  },
];


/* ============================================================
   STATE
   ============================================================ */
let activeFilter = 'all';
let allData      = [...dummyDana];


/* ============================================================
   UTILS
   ============================================================ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatRupiah(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', {
    day   : 'numeric',
    month : 'long',
    year  : 'numeric',
  });
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) {
    el.textContent = '0';
    return;
  }
  const dur = 900, t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3); // easeOutCubic — melambat di ujung
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * ease(p));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}


/* ============================================================
   USER INFO
   ============================================================ */
function initUserInfo() {
  const s     = demoSession;
  const nama  = s?.nama_lengkap || 'Mahasiswa';
  const nim   = s?.nim_nip      || '—';
  const init  = nama.charAt(0).toUpperCase();

  setEl('navUsername',  nama);
  setEl('topbarAvatar', init);
  setEl('mobileName',   nama);
  setEl('mobileNim',    'NIM: ' + nim);
  setEl('mobileAvatar', init);
}


/* ============================================================
   NOTIFIKASI & BADGE PENDAFTARAN — navbar
   ============================================================ */
function initNavbarBadges() {
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
   STATS
   ============================================================ */
function renderStats() {
  const cair         = allData.filter(d => d.status === 'sudah_cair');
  const proses       = allData.filter(d => d.status === 'sedang_diproses');
  const totalNominal = cair.reduce((s, d) => s + d.nominal, 0);

  setEl('statTotalDana', formatRupiah(totalNominal));
  animateNum('statCair',     cair.length);
  animateNum('statProses',   proses.length);
  animateNum('statBeasiswa', allData.length);
  setEl('heroBadgeNum', allData.length);

  document.querySelectorAll('.stat-tile').forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('shimmer');
      setTimeout(() => tile.classList.remove('shimmer'), 1100);
    }, i * 100);
  });
}


/* ============================================================
   RENDER LIST — Dana Cards
   Ganti d.emoji → <iconify-icon> (d.icon + d.iconColor)
   Ganti cfg.icon (emoji) → <iconify-icon> dalam status-pill
   Semua HTML struktur lain identik asli
   ============================================================ */
function renderList() {
  const listEl  = document.getElementById('listDana');
  const emptyEl = document.getElementById('emptyState');

  const data = activeFilter === 'all'
    ? allData
    : allData.filter(d => d.status === activeFilter);

  if (!data.length) {
    if (listEl)  listEl.innerHTML        = '';
    if (emptyEl) emptyEl.style.display   = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const cfg     = STATUS_CFG[d.status] || STATUS_CFG.pending;
    const nama    = d.pendaftaran?.beasiswa?.nama_program                  || '—';
    const sponsor = d.pendaftaran?.beasiswa?.sponsors?.nama_perusahaan     || '—';
    const tanggal = d.tanggal_pencairan
      ? 'Cair: '   + formatTanggal(d.tanggal_pencairan)
      : 'Dibuat: ' + formatTanggal(d.created_at);

    return `
      <div
        class="dana-card reveal"
        style="animation-delay: ${i * 0.08}s"
        onclick="openModal('${d.id}')"
      >
        <div class="dana-emoji" style="background: ${d.bg}">
          <iconify-icon
            icon="${d.icon}"
            width="28"
            style="color:${d.iconColor}"
          ></iconify-icon>
        </div>
        <div class="dana-main">
          <div class="dana-nama">${nama}</div>
          <div class="dana-sponsor">${sponsor}</div>
          <div class="dana-progress-wrap">
            <div class="dana-progress-bar">
              <div
                class="dana-progress-fill${cfg.progress < 100 ? ' in-progress' : ''}"
                style="width: ${cfg.progress}%; background: ${cfg.color};"
              ></div>
            </div>
            <div class="dana-progress-label">${cfg.label}</div>
          </div>
        </div>
        <div class="dana-right">
          <div class="dana-nominal">${formatRupiah(d.nominal)}</div>
          <div class="dana-tanggal">${tanggal}</div>
          <span class="status-pill ${cfg.cls}">
            <iconify-icon
              icon="${cfg.icon}"
              width="12"
              style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"
            ></iconify-icon>
            ${cfg.label}
          </span>
        </div>
      </div>
    `;
  }).join('');

  /* Trigger reveal animation */
  requestAnimationFrame(() => {
    document.querySelectorAll('.dana-card.reveal').forEach(el => {
      el.classList.add('visible');
    });
  });
}


/* ============================================================
   FILTER TABS
   ============================================================ */
function initFilterTabs() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderList();
    });
  });
}


/* ============================================================
   MODAL DETAIL DANA
   Ganti d.emoji → <iconify-icon>
   Ganti cfg.icon → <iconify-icon> dalam status-pill
   Ganti 🧾 bukti transfer icon → Iconify
   Ganti ⏳ belum tersedia → Iconify
   Ganti 📣 lapor kendala → Iconify
   Semua HTML struktur lain identik asli
   ============================================================ */
const modal = document.getElementById('modalDana');

function openModal(id) {
  const d = allData.find(x => x.id === id);
  if (!d) return;

  const cfg     = STATUS_CFG[d.status] || STATUS_CFG.pending;
  const nama    = d.pendaftaran?.beasiswa?.nama_program                 || '—';
  const sponsor = d.pendaftaran?.beasiswa?.sponsors?.nama_perusahaan    || '—';

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-dana-header">
      <div
        class="modal-dana-emoji"
        style="background:${d.bg}"
      >
        <iconify-icon
          icon="${d.icon}"
          width="40"
          style="color:${d.iconColor}"
        ></iconify-icon>
      </div>
      <div class="modal-dana-nama">${nama}</div>
      <div class="modal-dana-sub">
        ${sponsor} ·
        <span class="status-pill ${cfg.cls}">
          <iconify-icon
            icon="${cfg.icon}"
            width="12"
            style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"
          ></iconify-icon>
          ${cfg.label}
        </span>
      </div>
    </div>

    <div class="modal-body">

      <div class="nominal-big">
        <div class="nominal-big-label">Total Dana Beasiswa</div>
        <div class="nominal-big-num">${formatRupiah(d.nominal)}</div>
      </div>

      <div class="modal-section">
        <div class="modal-section-label">Detail Penyaluran</div>
        <div class="info-row">
          <span class="info-row-label">Status Dana</span>
          <span class="info-row-val">
            <span class="status-pill ${cfg.cls}">
              <iconify-icon
                icon="${cfg.icon}"
                width="12"
                style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"
              ></iconify-icon>
              ${cfg.label}
            </span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Tanggal Input</span>
          <span class="info-row-val">${formatTanggal(d.created_at)}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Tanggal Pencairan</span>
          <span class="info-row-val">
            ${d.tanggal_pencairan ? formatTanggal(d.tanggal_pencairan) : '—'}
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Nominal</span>
          <span class="info-row-val">${formatRupiah(d.nominal)}</span>
        </div>
      </div>

      ${d.bukti_transfer_url ? `
        <div class="modal-section">
          <div class="modal-section-label">Bukti Transfer</div>
          <div
            class="bukti-box"
            onclick="window.open('${d.bukti_transfer_url}', '_blank')"
          >
            <div class="bukti-icon">
              <iconify-icon
                icon="solar:receipt-bold-duotone"
                width="22"
                style="color:#2563eb"
              ></iconify-icon>
            </div>
            <div>
              <div class="bukti-label">Lihat Bukti Transfer</div>
              <div class="bukti-sub">Klik untuk membuka file</div>
            </div>
          </div>
        </div>
      ` : `
        <div class="modal-section">
          <div class="modal-section-label">Bukti Transfer</div>
          <div style="
            padding: 16px;
            background: #f8faff;
            border-radius: 10px;
            font-size: 13px;
            color: #64748b;
            text-align: center;
          ">
            <iconify-icon
              icon="solar:clock-circle-bold-duotone"
              width="16"
              style="color:#d97706;vertical-align:middle;margin-right:6px"
            ></iconify-icon>
            Bukti transfer belum tersedia. Staff sedang memproses.
          </div>
        </div>
      `}

      <a
        href="../laporanKendala/laporanKendala.html"
        class="lapor-link"
      >
        <iconify-icon
          icon="solar:chat-round-like-bold-duotone"
          width="14"
          style="vertical-align:middle;margin-right:5px;color:#2563eb"
        ></iconify-icon>
        Ada masalah? Lapor Kendala
      </a>

    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modalOverlay')?.addEventListener('click', closeModal);
document.getElementById('modalClose')?.addEventListener('click',   closeModal);


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
    setTimeout(() => showLogoutModal(), 200);
  });
}


/* ============================================================
   LOGOUT
   ============================================================ */
function showLogoutModal() {
  document.getElementById('logoutModal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideLogoutModal() {
  document.getElementById('logoutModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function initLogout() {
  document.getElementById('btnLogout')?.addEventListener('click',     showLogoutModal);
  document.getElementById('cancelLogout')?.addEventListener('click',  hideLogoutModal);
  document.getElementById('logoutOverlay')?.addEventListener('click', hideLogoutModal);

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
    ['solar:wallet-money-bold-duotone',  'rgba(37,99,235,0.55)'],
    ['solar:banknote-bold-duotone',      'rgba(124,58,237,0.50)'],
    ['solar:diploma-bold-duotone',       'rgba(37,99,235,0.48)'],
    ['solar:check-circle-bold-duotone',  'rgba(16,185,129,0.55)'],
    ['solar:document-text-bold-duotone', 'rgba(37,99,235,0.48)'],
    ['solar:cup-star-bold-duotone',      'rgba(245,158,11,0.55)'],
    ['solar:star-bold-duotone',          'rgba(245,158,11,0.50)'],
    ['solar:lightbulb-bold-duotone',     'rgba(245,158,11,0.52)'],
    ['solar:target-bold-duotone',        'rgba(16,185,129,0.50)'],
    ['solar:card-transfer-bold-duotone', 'rgba(37,99,235,0.52)'],
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
   LOAD DATA
   ============================================================ */
async function loadData() {
  /* Production Supabase query identik asli */
  allData = [...dummyDana];
  renderStats();
  renderList();
}


/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    hideLogoutModal();
  }
});


/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  initNavbarBadges();
  initFilterTabs();
  initNavbarScroll();
  initMobileNav();
  initLogout();
  loadData();

  console.log(
    '💰 penerimaBeasiswa.js loaded | User:',
    demoSession?.nama_lengkap,
    '| NIM:',
    demoSession?.nim_nip
  );
});