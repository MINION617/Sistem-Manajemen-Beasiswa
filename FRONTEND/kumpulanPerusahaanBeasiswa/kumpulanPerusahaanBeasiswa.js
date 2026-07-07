/* ============================================
   KUMPULANPERUSAHAANBEASISWA.JS
   Ikon: Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di data & render diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
   ============================================ */

function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session = getSession();
// if (!session || session.role !== 'mahasiswa') window.location.href = '../LOGIN/login.html';

const demoSession = session || {
  nama_lengkap: 'Rizky Firmansyah',
  nim_nip: '2021310045',
  role: 'mahasiswa',
  id: 'demo-uuid',
};

/* ===== DATA PERUSAHAAN =====
   Identik asli — tidak ada perubahan struktur data.
   Emoji industri di renderGrid diganti Iconify.
   ================================================================= */
const perusahaanList = [
  {
    id: 1, slug: 'bank-mandiri', nama_perusahaan: 'Bank Mandiri', jenis_industri: 'Perbankan',
    deskripsi: 'BUMN perbankan terbesar yang mendukung mahasiswa berprestasi melalui program beasiswa tahunan.',
    jumlah_program: 1, total_kuota: 25, penerima_aktif: 18, color: '#1d4ed8',
  },
  {
    id: 2, slug: 'pertamina', nama_perusahaan: 'Pertamina', jenis_industri: 'Energi',
    deskripsi: 'Perusahaan energi nasional dengan fokus beasiswa riset energi terbarukan dan kelestarian lingkungan.',
    jumlah_program: 1, total_kuota: 15, penerima_aktif: 11, color: '#dc2626',
  },
  {
    id: 3, slug: 'telkom-indonesia', nama_perusahaan: 'Telkom Indonesia', jenis_industri: 'Telekomunikasi',
    deskripsi: 'Penyedia layanan telekomunikasi yang membina talenta digital lewat program pengembangan teknologi.',
    jumlah_program: 1, total_kuota: 20, penerima_aktif: 14, color: '#ef4444',
  },
  {
    id: 4, slug: 'djarum-foundation', nama_perusahaan: 'Djarum Foundation', jenis_industri: 'Pendidikan',
    deskripsi: 'Yayasan yang konsisten memberikan beasiswa prestasi dan afirmasi disertai pelatihan soft skill.',
    jumlah_program: 2, total_kuota: 70, penerima_aktif: 52, color: '#f59e0b',
  },
  {
    id: 5, slug: 'bca', nama_perusahaan: 'BCA', jenis_industri: 'Perbankan',
    deskripsi: 'Bank swasta yang mendanai mahasiswa bidang Ekonomi, Akuntansi, dan Manajemen Keuangan.',
    jumlah_program: 1, total_kuota: 18, penerima_aktif: 12, color: '#2563eb',
  },
  {
    id: 6, slug: 'astra-international', nama_perusahaan: 'Astra International', jenis_industri: 'Otomotif',
    deskripsi: 'Grup otomotif dengan program pengembangan kepemimpinan dan ikatan dinas pasca lulus.',
    jumlah_program: 1, total_kuota: 12, penerima_aktif: 9, color: '#10b981',
  },
  {
    id: 7, slug: 'garuda-indonesia', nama_perusahaan: 'Garuda Indonesia', jenis_industri: 'Penerbangan',
    deskripsi: 'Maskapai nasional yang membuka beasiswa teknik penerbangan dan manajemen aviasi.',
    jumlah_program: 1, total_kuota: 8, penerima_aktif: 5, color: '#06b6d4',
  },
  {
    id: 8, slug: 'unilever', nama_perusahaan: 'Unilever', jenis_industri: 'FMCG',
    deskripsi: 'Perusahaan consumer goods yang mendukung riset sustainability dan inovasi produk.',
    jumlah_program: 1, total_kuota: 22, penerima_aktif: 16, color: '#8b5cf6',
  },
];

/* Map industri → Iconify icon (menggantikan emoji 🏭 sebelumnya) */
const INDUSTRI_ICON = {
  'Perbankan':      'solar:bank-bold-duotone',
  'Energi':         'solar:fire-bold-duotone',
  'Telekomunikasi': 'solar:wifi-bold-duotone',
  'Pendidikan':     'solar:diploma-bold-duotone',
  'Otomotif':       'solar:car-bold-duotone',
  'Penerbangan':    'solar:plain-bold-duotone',
  'FMCG':           'solar:shop-bold-duotone',
};

const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

let activeFilter = 'all';
let searchTerm   = '';

/* ── LOAD DATA ──
   sponsors table tidak punya kolom slug — untuk sesi asli, link ke profil
   pakai id (UUID) sponsor lewat query param yang sama (?sponsor=). */
async function loadSponsors() {
  if (!isRealSession) return;
  try {
    const { data } = await api.get('/sponsors?aktif=true&withStats=true');
    perusahaanList.length = 0;
    data.forEach(s => perusahaanList.push({
      id: s.id,
      slug: s.id,
      nama_perusahaan: s.nama_perusahaan,
      jenis_industri: s.jenis_industri || 'Lainnya',
      deskripsi: s.tagline || s.tentang || '',
      jumlah_program: s.stats?.jumlahProgram || 0,
      total_kuota: s.stats?.totalKuota || 0,
      penerima_aktif: s.stats?.penerimaAktif || 0,
      color: s.warna || '#2563eb',
    }));
    renderIntroStats();
    renderFilterTabs();
    renderGrid();
  } catch (err) {
    console.warn('Gagal memuat daftar sponsor, pakai data contoh:', err);
  }
}

/* ===== UTILS ===== */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  const dur = 900, t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3); // easeOutCubic — melambat di ujung
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round(target * ease(p));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
function inisial(nama) {
  return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ===== USER INFO ===== */
function initUserInfo() {
  const s    = demoSession;
  const nama = s?.nama_lengkap || 'Mahasiswa';
  const nim  = s?.nim_nip      || '—';
  const init = nama.charAt(0).toUpperCase();
  setEl('navUsername',  nama);
  setEl('topbarAvatar', init);
  setEl('mobileName',   nama);
  setEl('mobileNim',    'NIM: ' + nim);
  setEl('mobileAvatar', init);
}

/* ===== NOTIFIKASI & BADGE NAVBAR ===== */
// Jumlah notifikasi belum dibaca — dipakai untuk titik merah di lonceng
// notifikasi & badge di dropdown profil. TODO: ganti dengan hitungan asli
// dari data notifikasi saat sudah terhubung ke backend.
const dummyNotifUnread = 2;

// Jumlah pendaftaran yang sedang diproses — dipakai untuk badge
// "Pendaftaran Saya" di navbar. Dummy dipakai kalau belum ada sesi asli;
// kalau ada, diganti hitungan asli lewat updatePendaftaranBadge().
const dummyPendaftaranProses = 2;

function initNavbarBadges() {
  const dot = document.getElementById('notifDot');
  const badge = document.getElementById('badgeNotif');
  if (!isRealSession && dot && dummyNotifUnread > 0) dot.classList.add('show');
  if (!isRealSession && badge && dummyNotifUnread > 0) {
    badge.textContent = dummyNotifUnread;
    badge.classList.add('show');
  }

  const bp = document.getElementById('badgePendaftaran');
  if (!isRealSession && bp && dummyPendaftaranProses > 0) {
    bp.textContent = dummyPendaftaranProses;
    bp.classList.add('show');
  }
}

/* Badge "Pendaftaran Saya" — hitungan asli (sinkron dengan dashboard.js/
   pendaftaranSaya.js/historyBeasiswa.js: status menunggu_verifikasi/
   lolos_berkas/wawancara dianggap "sedang diproses"). */
async function updateNotifBadge() {
  if (!isRealSession) return;
  const dot = document.getElementById('notifDot');
  const badge = document.getElementById('badgeNotif');
  try {
    const { data } = await api.get('/notifikasi');
    const unread = data.filter(n => !n.is_read).length;
    if (dot) dot.classList.toggle('show', unread > 0);
    if (badge) {
      badge.textContent = unread;
      badge.classList.toggle('show', unread > 0);
    }
  } catch (err) {
    console.warn('Gagal memuat notifikasi untuk badge:', err);
  }
}

async function updatePendaftaranBadge() {
  if (!isRealSession) return;
  const bp = document.getElementById('badgePendaftaran');
  try {
    const { data } = await api.get('/status/saya');
    const proses = data.filter(d => ['menunggu_verifikasi', 'lolos_berkas', 'wawancara'].includes(d.status)).length;
    if (bp) {
      bp.textContent = proses;
      bp.classList.toggle('show', proses > 0);
    }
  } catch (err) {
    console.warn('Gagal memuat status pendaftaran untuk badge:', err);
  }
}

/* ===== INTRO STATS ===== */
function renderIntroStats() {
  const totalProgram = perusahaanList.reduce((s, p) => s + p.jumlah_program, 0);
  const totalKuota   = perusahaanList.reduce((s, p) => s + p.total_kuota,    0);
  const industriSet  = new Set(perusahaanList.map(p => p.jenis_industri));

  animateNum('introPerusahaan', perusahaanList.length);
  animateNum('introProgram',    totalProgram);
  animateNum('introKuota',      totalKuota);
  animateNum('introIndustri',   industriSet.size);
  animateNum('heroBadgeNum',    perusahaanList.length);

  // Shimmer sweep pas stat tile muncul pertama kali
  document.querySelectorAll('.intro-stat').forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('shimmer');
      setTimeout(() => tile.classList.remove('shimmer'), 1100);
    }, i * 100);
  });
}

/* ===== FILTER TABS ===== */
function renderFilterTabs() {
  const wrap = document.getElementById('filterTabs');
  if (!wrap) return;
  const industri = [...new Set(perusahaanList.map(p => p.jenis_industri))].sort();
  wrap.innerHTML =
    `<button class="filter-tab active" data-filter="all">Semua</button>` +
    industri.map(i => {
      const icon = INDUSTRI_ICON[i] || 'solar:buildings-2-bold-duotone';
      return `<button class="filter-tab" data-filter="${i}">
        <iconify-icon icon="${icon}" width="13" style="vertical-align:middle;margin-right:3px"></iconify-icon>${i}
      </button>`;
    }).join('');
  wrap.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderGrid();
    });
  });
}

/* ===== RENDER GRID =====
   Ganti emoji 🏭 di company-industri span → <iconify-icon>
   Semua HTML struktur lain identik asli
   ================================================================= */
function getFiltered() {
  return perusahaanList.filter(p => {
    const matchFilter = activeFilter === 'all' || p.jenis_industri === activeFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term
      || p.nama_perusahaan.toLowerCase().includes(term)
      || p.jenis_industri.toLowerCase().includes(term)
      || p.deskripsi.toLowerCase().includes(term);
    return matchFilter && matchSearch;
  });
}

function renderGrid() {
  const grid  = document.getElementById('companyGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  const data = getFiltered();
  if (!data.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const industIcon = (industri) => {
    const icon = INDUSTRI_ICON[industri] || 'solar:buildings-2-bold-duotone';
    return `<iconify-icon icon="${icon}" width="13" style="vertical-align:middle;margin-right:3px"></iconify-icon>`;
  };

  grid.innerHTML = data.map(p => `
    <a class="company-card"
       style="--accent:${p.color}"
       href="../profilPerusahaanBeasiswa/profilPerusahaanBeasiswa.html?sponsor=${p.slug}"
       title="Lihat profil ${p.nama_perusahaan}">
      <div class="company-card-top">
        <div class="company-logo" style="background:${p.color}">${inisial(p.nama_perusahaan)}</div>
        <div class="company-head">
          <div class="company-name">${p.nama_perusahaan}</div>
          <span class="company-industri">${industIcon(p.jenis_industri)}${p.jenis_industri}</span>
        </div>
      </div>
      <p class="company-desc">${p.deskripsi}</p>
      <div class="company-stats">
        <div class="company-stat">
          <span class="company-stat-num">${p.jumlah_program}</span>
          <div class="company-stat-label">Program</div>
        </div>
        <div class="company-stat">
          <span class="company-stat-num">${p.total_kuota}</span>
          <div class="company-stat-label">Total Kuota</div>
        </div>
        <div class="company-stat">
          <span class="company-stat-num">${p.penerima_aktif}</span>
          <div class="company-stat-label">Penerima</div>
        </div>
      </div>
      <div class="company-footer">
        <span class="company-active-tag">
          <span class="dot"></span>
          Mitra Aktif
        </span>
        <span class="company-cta">
          Lihat Profil
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
    </a>
  `).join('');

  // Staggered reveal animation — identik asli, + reset transitionDelay
  // biar delay bawaan entrance nggak nempel selamanya & bikin hover jadi lag.
  grid.querySelectorAll('.company-card').forEach((c, i) => {
    c.style.transitionDelay = `${i * 0.06}s`;
    setTimeout(() => {
      c.classList.add('visible');
      setTimeout(() => { c.style.transitionDelay = '0s'; }, 550);
    }, i * 60);
  });
}

/* ===== SEARCH & RESET ===== */
document.getElementById('searchInput')?.addEventListener('input', e => {
  searchTerm = e.target.value.trim();
  renderGrid();
});
document.getElementById('btnReset')?.addEventListener('click', () => {
  searchTerm = '';
  activeFilter = 'all';
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');
  renderGrid();
});

/* ===== NAVBAR SCROLL ===== */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* ===== MOBILE NAV ===== */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');
  const open  = () => { mobileNav?.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow='hidden'; hamburger?.classList.add('open'); };
  const close = () => { mobileNav?.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow=''; hamburger?.classList.remove('open'); };
  hamburger?.addEventListener('click', () => mobileNav?.classList.contains('open') ? close() : open());
  overlay?.addEventListener('click', close);
  document.getElementById('mobileBtnLogout')?.addEventListener('click', () => { close(); setTimeout(showLogoutModal, 200); });
}

/* ===== LOGOUT ===== */
function showLogoutModal() {
  document.getElementById('logoutModal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function hideLogoutModal() {
  document.getElementById('logoutModal')?.classList.remove('active');
  document.body.style.overflow = '';
}
function initLogout() {
  document.getElementById('btnLogout')?.addEventListener('click', showLogoutModal);
  document.getElementById('cancelLogout')?.addEventListener('click', hideLogoutModal);
  document.getElementById('logoutOverlay')?.addEventListener('click', hideLogoutModal);
  document.getElementById('confirmLogout')?.addEventListener('click', () => {
    sessionStorage.removeItem('bk_user');
    localStorage.removeItem('bk_user');
    window.location.href = '../LOGIN/login.html';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideLogoutModal(); });
}

/* ===== BG CANVAS ===== */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const orbs = Array.from({ length: 5 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    r: 100 + Math.random() * 160,
    dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
    hue: 210 + Math.random() * 30, alpha: 0.04 + Math.random() * 0.04,
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(o => {
      o.x += o.dx; o.y += o.dy;
      if (o.x < -o.r) o.x = canvas.width + o.r;
      if (o.x > canvas.width + o.r) o.x = -o.r;
      if (o.y < -o.r) o.y = canvas.height + o.r;
      if (o.y > canvas.height + o.r) o.y = -o.r;
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.hue},80%,60%,${o.alpha})`);
      g.addColorStop(1, `hsla(${o.hue},80%,60%,0)`);
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ===== PARTICLES — ganti emoji → iconify-icon ===== */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const iconSet = [
    ['solar:buildings-2-bold-duotone',  'rgba(37,99,235,0.55)'],
    ['solar:bag-bold-duotone',          'rgba(99,102,241,0.50)'],
    ['solar:diploma-bold-duotone',      'rgba(139,92,246,0.48)'],
    ['solar:star-bold-duotone',         'rgba(245,158,11,0.55)'],
    ['solar:rocket-bold-duotone',       'rgba(37,99,235,0.48)'],
    ['solar:lightbulb-bold-duotone',    'rgba(245,158,11,0.55)'],
    ['solar:wrench-bold-duotone',       'rgba(16,185,129,0.48)'],
    ['solar:chart-2-bold-duotone',      'rgba(37,99,235,0.50)'],
    ['solar:target-bold-duotone',       'rgba(16,185,129,0.50)'],
    ['solar:cup-star-bold-duotone',     'rgba(245,158,11,0.50)'],
  ];
  for (let i = 0; i < 18; i++) {
    const [iconName, color] = iconSet[i % iconSet.length];
    const p = document.createElement('iconify-icon');
    p.setAttribute('icon', iconName);
    p.className = 'particle';
    const dur = 7 + Math.random() * 8;
    const delay = Math.random() * 12;
    p.style.cssText = `left:${Math.random()*100}%;bottom:-40px;font-size:${12+Math.random()*10}px;color:${color};--dur:${dur}s;--delay:${delay}s;animation-delay:${delay}s`;
    container.appendChild(p);
  }
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  initNavbarBadges();
  renderIntroStats();
  renderFilterTabs();
  renderGrid();
  initNavbarScroll();
  initMobileNav();
  initLogout();
  loadSponsors();
  updatePendaftaranBadge();
  updateNotifBadge();
  console.log('🏢 kumpulanPerusahaanBeasiswa loaded');
});