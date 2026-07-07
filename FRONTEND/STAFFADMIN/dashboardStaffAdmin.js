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

/* Sesi asli (bukan akun demo hardcode) → punya access_token asli dari Supabase,
   bukan 'dummy-token-...' dari DUMMY_ACCOUNTS di login.js */
const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));


/* ============================================================
   02. KONSTANTA — DATA DUMMY
   ============================================================ */

/* ── Statistik utama ──
   `let` (bukan `const`) supaya bisa diganti data asli oleh loadStaffDashboardData() */
let dummyStats = {
  perluVerifikasi : 18,
  sedangProses    : 47,
  penerima        : 215,
  pencairan       :  6,
};

/* ── Pipeline alur seleksi ──
   href menuju subfolder masing-masing halaman
   (nama file = nama yang dipakai user, tidak berubah)          */
let dummyPipeline = [
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
let dummyVerifikasi = [
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
let dummyLaporan = [
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

/* Jumlah laporan belum selesai — dipisah dari dummyLaporan karena
   dummyLaporan (di atas atau hasil real fetch) dipotong ke 3 item untuk
   panel preview, sedangkan badge butuh hitungan penuh. */
let laporanOpenCount = dummyLaporan.filter(l => l.status !== 'done').length;

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

/* Terjemahan status laporan dari enum backend (masuk/diproses/selesai)
   ke key yang dipakai STATUS_LAPORAN di atas (new/proses/done). */
const LAPORAN_STATUS_BACKEND_TO_DASHBOARD = {
  masuk    : 'new',
  diproses : 'proses',
  selesai  : 'done',
};


/* ============================================================
   02b. LOAD DATA ASLI (backend) — fallback ke dummy di atas
   kalau bukan real session atau salah satu request gagal.
   ============================================================ */

async function loadStaffDashboardData() {
  if (!isRealSession) return; // tetap pakai data dummy yang sudah di-define di atas

  try {
    const [antrean, seleksi, penetapan, penerimaDisahkan, penyaluranPending, laporan] = await Promise.all([
      api.get('/verifikasi/antrean'),
      api.get('/seleksi'),
      api.get('/penetapan'),
      api.get('/penerima?status=disahkan'),
      api.get('/penyaluran?status=pending'),
      api.get('/laporan'),
    ]);

    const jumlahVerifikasi = antrean.data.length;
    const jumlahSeleksi    = seleksi.data.length;
    /* "Siap ditetapkan" (status wawancara) — sinkron dengan tab default
       "Siap Ditetapkan" di penetapanPenerima.js. Sebelumnya di sini malah
       menghitung /penerima?status=diusulkan (yang artinya "sudah diputuskan
       staff, sedang nunggu Kabag" — itu sudah lewat titik kerja staff),
       jadi angkanya beda dengan halaman aslinya begitu ada aktivitas. */
    const jumlahPenetapan  = penetapan.data.filter(p => p.status === 'wawancara').length;
    const jumlahPencairan  = penyaluranPending.data.length;

    dummyStats = {
      perluVerifikasi : jumlahVerifikasi,
      sedangProses    : jumlahSeleksi,
      penerima        : penerimaDisahkan.data.length,
      pencairan       : jumlahPencairan,
    };

    dummyPipeline = [
      { icon: 'solar:inbox-in-bold-duotone',      color: '#d97706', count: jumlahVerifikasi, name: 'Verifikasi Berkas',   href: 'verifikasiPendaftaran/verifikasiPendaftar.html' },
      { icon: 'solar:document-add-bold-duotone',  color: '#2563eb', count: jumlahSeleksi,    name: 'Tes &amp; Wawancara', href: 'inputHasilSeleksi/inputHasilSeleksi.html' },
      { icon: 'solar:cup-star-bold-duotone',       color: '#059669', count: jumlahPenetapan,  name: 'Penetapan Penerima', href: 'penetapanPenerima/penetapanPenerima.html' },
      { icon: 'solar:card-transfer-bold-duotone',  color: '#7c3aed', count: jumlahPencairan,  name: 'Pencairan Dana',     href: 'PencairanDana/pencairanDana.html' },
    ];

    dummyVerifikasi = antrean.data.slice(0, 4).map(p => ({
      id         : p.id,
      nama       : p.profiles?.nama_lengkap  || '—',
      program    : p.profiles?.program_studi || '—',
      beasiswa   : p.beasiswa?.nama_program   || '—',
      created_at : p.tanggal_daftar,
    }));

    dummyLaporan = laporan.data.slice(0, 3).map(l => ({
      id         : l.id,
      judul      : l.judul_laporan,
      pelapor    : l.profiles?.nama_lengkap || '—',
      status     : LAPORAN_STATUS_BACKEND_TO_DASHBOARD[l.status] || 'new',
      created_at : l.tanggal_lapor,
    }));
    /* Hitungan penuh (bukan cuma 3 item preview di atas) — dipakai badge
       sidebar supaya sinkron dengan pusatLaporanKendala.js yang menghitung
       dari seluruh data, bukan potongan buat panel "terbaru". */
    laporanOpenCount = laporan.data.filter(l => l.status !== 'selesai').length;
  } catch (err) {
    console.warn('Gagal memuat data dashboard staff dari backend, pakai data contoh:', err);
    /* dummyStats / dummyPipeline / dummyVerifikasi / dummyLaporan tetap nilai dummy di atas */
  }
}


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

  /* Badge sidebar — Laporan (hitungan penuh, lihat laporanOpenCount) */
  const bl = document.getElementById('badgeLaporan');
  if (bl && laporanOpenCount > 0) {
    bl.textContent = laporanOpenCount;
    bl.classList.add('show');
  }

  /* Titik notif di topbar */
  const dot = document.getElementById('notifDot');
  if (dot && laporanOpenCount > 0) dot.style.display = 'block';
}


/* ============================================================
   06. RENDER PIPELINE
   ============================================================ */

function renderPipeline() {
  const el = document.getElementById('pipeline');
  if (!el) return;

  /* ── Warna per stage (untuk gradient & ring) ── */
  const stageColors = ['#d97706', '#2563eb', '#059669', '#7c3aed'];

  el.innerHTML = dummyPipeline
    .map((s, i) => `
      <a class="pipeline-stage" href="${s.href}" title="Tindak lanjut ${s.name}">
        <div class="pipeline-bubble" style="--ring-color:${stageColors[i]}40">
          <iconify-icon icon="${s.icon}" style="color:${s.color}" width="22"></iconify-icon>
        </div>
        <div class="pipeline-count">${s.count}</div>
        <div class="pipeline-name">${s.name}</div>
      </a>
    `)
    .join('');

  /* ── Buat SVG connector overlay ── */
  requestAnimationFrame(() => {
    setTimeout(() => {
      const stages = el.querySelectorAll('.pipeline-stage');
      if (stages.length < 2) return;

      /* Hapus connector lama jika ada */
      el.querySelector('.pipeline-connectors')?.remove();

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('pipeline-connectors');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

      /* Gradient untuk tiap segmen */
      for (let i = 0; i < stages.length - 1; i++) {
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.id = `pipeGrad${i}`;
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', stageColors[i]);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', stageColors[i + 1]);

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
      }
      svg.appendChild(defs);

      const containerRect = el.getBoundingClientRect();

      for (let i = 0; i < stages.length - 1; i++) {
        const bubbleA = stages[i].querySelector('.pipeline-bubble');
        const bubbleB = stages[i + 1].querySelector('.pipeline-bubble');
        const rA = bubbleA.getBoundingClientRect();
        const rB = bubbleB.getBoundingClientRect();

        const x1 = rA.right  - containerRect.left + 2;
        const x2 = rB.left   - containerRect.left - 2;
        const y  = rA.top + rA.height / 2 - containerRect.top;

        /* Update gradient positions */
        const grad = defs.querySelector(`#pipeGrad${i}`);
        grad.setAttribute('x1', x1);
        grad.setAttribute('y1', y);
        grad.setAttribute('x2', x2);
        grad.setAttribute('y2', y);

        /* Track (garis latar terang) */
        const track = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        track.classList.add('connector-track');
        track.setAttribute('x1', x1);
        track.setAttribute('y1', y);
        track.setAttribute('x2', x2);
        track.setAttribute('y2', y);
        svg.appendChild(track);

        /* Flow (garis animasi gradient) */
        const flow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        flow.classList.add('connector-flow');
        flow.setAttribute('x1', x1);
        flow.setAttribute('y1', y);
        flow.setAttribute('x2', x2);
        flow.setAttribute('y2', y);
        flow.setAttribute('stroke', `url(#pipeGrad${i})`);
        flow.style.animationDelay = `${i * -0.35}s`;
        svg.appendChild(flow);

        /* Partikel mengalir (2 per segmen, staggered) */
        for (let p = 0; p < 2; p++) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.classList.add('connector-particle');
          circle.setAttribute('r', '3.5');
          circle.setAttribute('fill', stageColors[i + 1]);

          /* Animate via SMIL for cross-browser path motion */
          const animCx = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animCx.setAttribute('attributeName', 'cx');
          animCx.setAttribute('from', x1);
          animCx.setAttribute('to', x2);
          animCx.setAttribute('dur', '2.2s');
          animCx.setAttribute('begin', `${p * 1.1}s`);
          animCx.setAttribute('repeatCount', 'indefinite');

          const animCy = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animCy.setAttribute('attributeName', 'cy');
          animCy.setAttribute('from', y);
          animCy.setAttribute('to', y);
          animCy.setAttribute('dur', '2.2s');
          animCy.setAttribute('begin', `${p * 1.1}s`);
          animCy.setAttribute('repeatCount', 'indefinite');

          const animOp = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animOp.setAttribute('attributeName', 'opacity');
          animOp.setAttribute('values', '0;0.85;0.85;0');
          animOp.setAttribute('keyTimes', '0;0.08;0.88;1');
          animOp.setAttribute('dur', '2.2s');
          animOp.setAttribute('begin', `${p * 1.1}s`);
          animOp.setAttribute('repeatCount', 'indefinite');

          circle.appendChild(animCx);
          circle.appendChild(animCy);
          circle.appendChild(animOp);
          svg.appendChild(circle);
        }
      }

      el.appendChild(svg);
    }, 60);
  });

  /* ── Recalculate on resize ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderPipeline(), 200);
  });
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
          /* Hapus transitionDelay setelah reveal selesai
             supaya hover tidak kena delay */
          setTimeout(() => {
            e.target.style.transitionDelay = '0s';
          }, (parseFloat(e.target.style.transitionDelay || 0) * 1000) + 650);
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

document.addEventListener('DOMContentLoaded', async () => {
  initBgCanvas();
  initParticles();

  await loadStaffDashboardData();

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