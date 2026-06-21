/* ============================================================
   DASHBOARDSTAFFADMIN.JS
   Beasiswa Kampus — Role: Staff Admin
   ============================================================

   STRUKTUR FILE:
   01. Konfigurasi & Session
   02. Konstanta — Data Dummy
   03. Utilitas (helper functions)
   04. Init User Info
   05. Stats & Badge
   06. Render Pipeline
   07. Render Antrian Verifikasi
   08. Render Laporan Kendala
   09. Render Quick Actions
   10. Background Canvas
   11. Floating Particles
   12. Scroll Reveal
   13. Sidebar Mobile
   14. Modal Logout
   15. Init (DOMContentLoaded)

   PATH NAVIGASI (dari posisi STAFFADMIN/):
     sponsorDanBeasiswa/manajemenSponsorBeasiswa.html
     verifikasiPendaftaran/verifikasiPendaftar.html
     inputHasilSeleksi/inputHasilSeleksi.html
     penetapanPenerima/penetapanPenerima.html
     PencairanDana/pencairanDana.html
     pusatLaporanKendala/pusatLaporanKendala.html
   ============================================================ */


/* ============================================================
   01. KONFIGURASI & SESSION
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}

const session = getSession();

if (!session || session.role !== 'staff') {
  // Aktifkan di production:
  // window.location.href = '../LOGIN/login.html';
}

/* Demo session — hapus di production */
const demoSession = session || {
  nama_lengkap : 'Rangga Adi Nugroho',
  role         : 'staff',
  id           : 'demo-staff-uuid',
};


/* ============================================================
   02. KONSTANTA — DATA DUMMY
   ============================================================ */

/* ── Statistik utama ── */
const dummyStats = {
  perluVerifikasi : 18,
  sedangProses    : 47,
  penerima        : 215,
  pencairan       :  6,
};

/* ── Pipeline alur seleksi ──
   href menuju subfolder masing-masing halaman
   (nama file = nama yang dipakai user, tidak berubah)          */
const dummyPipeline = [
  {
    icon  : 'solar:inbox-in-bold-duotone',
    color : '#d97706',
    count : 18,
    name  : 'Verifikasi Berkas',
    href  : 'verifikasiPendaftaran/verifikasiPendaftar.html',
  },
  {
    icon  : 'solar:document-add-bold-duotone',
    color : '#2563eb',
    count : 47,
    name  : 'Tes &amp; Wawancara',
    href  : 'inputHasilSeleksi/inputHasilSeleksi.html',
  },
  {
    icon  : 'solar:cup-star-bold-duotone',
    color : '#059669',
    count : 12,
    name  : 'Penetapan Penerima',
    href  : 'penetapanPenerima/penetapanPenerima.html',
  },
  {
    icon  : 'solar:card-transfer-bold-duotone',
    color : '#7c3aed',
    count :  6,
    name  : 'Pencairan Dana',
    href  : 'PencairanDana/pencairanDana.html',
  },
];

/* ── Antrian verifikasi (preview 4 item) ── */
const dummyVerifikasi = [
  {
    id         : 'p-101',
    nama       : 'Adinda Putri Lestari',
    program    : 'Teknik Informatika',
    beasiswa   : 'Beasiswa Mandiri Prestasi',
    created_at : '2026-06-18T07:30:00Z',
  },
  {
    id         : 'p-102',
    nama       : 'Cahaya Nur Aisyah',
    program    : 'Akuntansi',
    beasiswa   : 'Beasiswa Djarum Plus',
    created_at : '2026-06-18T06:10:00Z',
  },
  {
    id         : 'p-103',
    nama       : 'Dimas Surya Atmaja',
    program    : 'Teknik Elektro',
    beasiswa   : 'Pertamina Sobat Bumi',
    created_at : '2026-06-17T15:45:00Z',
  },
  {
    id         : 'p-104',
    nama       : 'Bagas Pratama Wijaya',
    program    : 'Manajemen',
    beasiswa   : 'Beasiswa BCA Finance',
    created_at : '2026-06-17T11:20:00Z',
  },
];

/* ── Laporan kendala terbaru (preview 3 item) ── */
const dummyLaporan = [
  {
    id         : 'l-01',
    judul      : 'Bukti transfer belum muncul',
    pelapor    : 'Bagas Pratama',
    status     : 'new',
    created_at : '2026-06-18T08:00:00Z',
  },
  {
    id         : 'l-02',
    judul      : 'Status seleksi tidak berubah',
    pelapor    : 'Cahaya Nur Aisyah',
    status     : 'proses',
    created_at : '2026-06-17T13:30:00Z',
  },
  {
    id         : 'l-03',
    judul      : 'Gagal unggah berkas KTM',
    pelapor    : 'Dimas Surya',
    status     : 'new',
    created_at : '2026-06-17T09:15:00Z',
  },
];

/* ── Quick actions — 6 aksi cepat ── */
const dummyActions = [
  {
    icon  : 'solar:buildings-2-bold-duotone',
    color : '#2563eb',
    label : 'Sponsor & Beasiswa',
    desc  : 'Kelola data program',
    href  : 'sponsorDanBeasiswa/manajemenSponsorBeasiswa.html',
  },
  {
    icon  : 'solar:check-circle-bold-duotone',
    color : '#059669',
    label : 'Verifikasi Pendaftar',
    desc  : 'Periksa berkas masuk',
    href  : 'verifikasiPendaftaran/verifikasiPendaftar.html',
  },
  {
    icon  : 'solar:document-add-bold-duotone',
    color : '#2563eb',
    label : 'Input Hasil Seleksi',
    desc  : 'Nilai tes & wawancara',
    href  : 'inputHasilSeleksi/inputHasilSeleksi.html',
  },
  {
    icon  : 'solar:cup-star-bold-duotone',
    color : '#d97706',
    label : 'Penetapan Penerima',
    desc  : 'Tetapkan yang lolos',
    href  : 'penetapanPenerima/penetapanPenerima.html',
  },
  {
    icon  : 'solar:card-transfer-bold-duotone',
    color : '#7c3aed',
    label : 'Pencairan Dana',
    desc  : 'Unggah bukti transfer',
    href  : 'PencairanDana/pencairanDana.html',
  },
  {
    icon  : 'solar:chat-round-like-bold-duotone',
    color : '#fb923c',
    label : 'Laporan Kendala',
    desc  : 'Tangani keluhan',
    href  : 'pusatLaporanKendala/pusatLaporanKendala.html',
  },
];

/* ── Status laporan ── */
const STATUS_LAPORAN = {
  new    : { label: 'Baru',     cls: 'status-new' },
  proses : { label: 'Diproses', cls: 'status-proses' },
  done   : { label: 'Selesai',  cls: 'status-done' },
};


/* ============================================================
   03. UTILITAS
   ============================================================ */

/** Set textContent elemen berdasarkan id */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/** Buat inisial 2 huruf dari nama lengkap */
function inisial(nama) {
  return nama
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Format waktu relatif */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return 'baru saja';
  if (m < 60) return m + ' menit lalu';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' jam lalu';
  return Math.floor(h / 24) + ' hari lalu';
}

/** Animasi counter angka */
function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }

  let cur        = 0;
  const step     = Math.max(1, Math.ceil(target / 22));
  const interval = setInterval(() => {
    cur += step;
    if (cur >= target) {
      el.textContent = target;
      clearInterval(interval);
    } else {
      el.textContent = cur;
    }
  }, 35);
}


/* ============================================================
   04. INIT USER INFO
   ============================================================ */

function initUserInfo() {
  const nama  = demoSession?.nama_lengkap || 'Staff Admin';
  const first = nama.split(' ')[0];
  const init  = nama.charAt(0).toUpperCase();

  setEl('sidebarName',    nama);
  setEl('sidebarAvatar',  init);
  setEl('topbarAvatar',   init);
  setEl('welcomeTitle',   `Halo, ${first}! 👋`);
  setEl('welcomeSubtitle',
    `Ada ${dummyStats.perluVerifikasi} pendaftar menunggu verifikasi ` +
    `dan ${dummyStats.pencairan} dana perlu dicairkan hari ini.`
  );
}


/* ============================================================
   05. STATS & BADGE
   ============================================================ */

function loadStats() {
  /* Angka statistik utama */
  animateNum('statVerifikasi', dummyStats.perluVerifikasi);
  animateNum('statProses',     dummyStats.sedangProses);
  animateNum('statPenerima',   dummyStats.penerima);
  animateNum('statPencairan',  dummyStats.pencairan);

  /* Shimmer effect saat load */
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('shimmer');
      setTimeout(() => card.classList.remove('shimmer'), 1100);
    }, i * 100);
  });

  /* Badge sidebar — Verifikasi */
  const bv = document.getElementById('badgeVerifikasi');
  if (bv && dummyStats.perluVerifikasi > 0) {
    bv.textContent = dummyStats.perluVerifikasi;
    bv.classList.add('show');
  }

  /* Badge sidebar — Laporan */
  const laporanOpen = dummyLaporan.filter(l => l.status !== 'done').length;
  const bl          = document.getElementById('badgeLaporan');
  if (bl && laporanOpen > 0) {
    bl.textContent = laporanOpen;
    bl.classList.add('show');
  }

  /* Titik notif di topbar */
  const dot = document.getElementById('notifDot');
  if (dot && laporanOpen > 0) dot.style.display = 'block';
}


/* ============================================================
   06. RENDER PIPELINE
   ============================================================ */

function renderPipeline() {
  const el = document.getElementById('pipeline');
  if (!el) return;

  el.innerHTML = dummyPipeline
    .map(s => `
      <a class="pipeline-stage" href="${s.href}" title="Tindak lanjut ${s.name}">
        <div class="pipeline-bubble">
          <iconify-icon icon="${s.icon}" style="color:${s.color}" width="22"></iconify-icon>
        </div>
        <div class="pipeline-count">${s.count}</div>
        <div class="pipeline-name">${s.name}</div>
      </a>
    `)
    .join('');
}


/* ============================================================
   07. RENDER ANTRIAN VERIFIKASI
   ============================================================ */

function renderVerifikasi() {
  const el = document.getElementById('listVerifikasi');
  if (!el) return;

  el.innerHTML = dummyVerifikasi
    .map((p, i) => `
      <a
        class="queue-item"
        href="verifikasiPendaftaran/verifikasiPendaftar.html"
        style="animation-delay:${i * 0.08}s"
      >
        <div class="queue-avatar">${inisial(p.nama)}</div>
        <div class="queue-main">
          <div class="queue-name">${p.nama}</div>
          <div class="queue-meta">${p.program} · ${p.beasiswa}</div>
        </div>
        <div class="queue-right">
          <span class="status-pill status-pending">Menunggu</span>
          <div class="queue-time">${timeAgo(p.created_at)}</div>
        </div>
      </a>
    `)
    .join('');
}


/* ============================================================
   08. RENDER LAPORAN KENDALA
   ============================================================ */

function renderLaporan() {
  const el = document.getElementById('listLaporan');
  if (!el) return;

  el.innerHTML = dummyLaporan
    .map((l, i) => {
      const st = STATUS_LAPORAN[l.status] || STATUS_LAPORAN.new;
      return `
        <a
          class="report-item"
          href="pusatLaporanKendala/pusatLaporanKendala.html"
          style="animation-delay:${i * 0.08}s"
        >
          <div class="report-icon">
            <iconify-icon
              icon="solar:chat-round-like-bold-duotone"
              style="color:#fb923c"
            ></iconify-icon>
          </div>
          <div class="report-main">
            <div class="report-title">${l.judul}</div>
            <div class="report-meta">oleh ${l.pelapor} · ${timeAgo(l.created_at)}</div>
          </div>
          <span class="status-pill ${st.cls}">${st.label}</span>
        </a>
      `;
    })
    .join('');
}


/* ============================================================
   09. RENDER QUICK ACTIONS
   ============================================================ */

function renderActions() {
  const el = document.getElementById('actionsGrid');
  if (!el) return;

  el.innerHTML = dummyActions
    .map(a => `
      <a href="${a.href}" class="action-card">
        <span class="action-icon">
          <iconify-icon icon="${a.icon}" style="color:${a.color}" width="22"></iconify-icon>
        </span>
        <div class="action-text">
          <div class="action-label">${a.label}</div>
          <div class="action-desc">${a.desc}</div>
        </div>
      </a>
    `)
    .join('');
}


/* ============================================================
   10. BACKGROUND CANVAS
   Orb biru mengambang — identik dengan dashboard mahasiswa
   Hue: 210–240 (biru)
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
      /* Gerakkan orb */
      o.x += o.dx;
      o.y += o.dy;

      /* Wrap-around */
      if (o.x < -o.r)               o.x = canvas.width  + o.r;
      if (o.x > canvas.width  + o.r) o.x = -o.r;
      if (o.y < -o.r)               o.y = canvas.height + o.r;
      if (o.y > canvas.height + o.r) o.y = -o.r;

      /* Gambar gradient radial */
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
   11. FLOATING PARTICLES
   Emoji / ikon mengambang dari bawah layar
   ============================================================ */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const symbols = ['🎓', '📋', '✅', '📊', '🏆', '📝', '💼', '🔍', '📑', '⭐'];
  const COUNT   = 18;

  for (let i = 0; i < COUNT; i++) {
    const p   = document.createElement('div');
    p.className = 'particle';
    p.textContent = symbols[i % symbols.length];

    const dur   = 7 + Math.random() * 8;
    const delay = Math.random() * 10;
    const left  = Math.random() * 100;
    const size  = 12 + Math.random() * 10;

    p.style.cssText = `
      left:             ${left}%;
      bottom:           -40px;
      font-size:        ${size}px;
      --dur:            ${dur}s;
      --delay:          ${delay}s;
      animation-delay:  ${delay}s;
    `;

    container.appendChild(p);
  }
}


/* ============================================================
   12. SCROLL REVEAL
   Elemen fade-in saat masuk viewport
   ============================================================ */

function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.card, .stat-card, .action-card, .pipeline-stage, .workflow'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.04}s`;
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


/* ============================================================
   13. SIDEBAR MOBILE
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
   14. MODAL LOGOUT
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
  window.location.href = '../LOGIN/login.html';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hideLogout();
    closeSidebar();
  }
});


/* ============================================================
   15. INIT — DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadStats();
  renderPipeline();
  renderVerifikasi();
  renderLaporan();
  renderActions();

  /* Scroll reveal dipanggil setelah paint */
  setTimeout(initScrollReveal, 80);

  console.log('🗂️ dashboardStaffAdmin.js loaded | Staff:', demoSession?.nama_lengkap);
});