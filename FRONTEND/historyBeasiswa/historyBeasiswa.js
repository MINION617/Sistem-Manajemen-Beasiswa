/* ============================================
   HISTORYBEASISWA.JS — Riwayat Beasiswa
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

/* STATUS_CFG — icon & group identik asli, emoji diganti Iconify icon name */
const STATUS_CFG = {
  menunggu_verifikasi: { label: 'Menunggu',     cls: 's-menunggu', icon: 'solar:clock-circle-bold-duotone',   iconColor: '#d97706', group: 'proses' },
  lolos_berkas:        { label: 'Lolos Berkas', cls: 's-proses',   icon: 'solar:folder-check-bold-duotone',   iconColor: '#2563eb', group: 'proses' },
  wawancara:           { label: 'Wawancara',    cls: 's-proses',   icon: 'solar:microphone-bold-duotone',     iconColor: '#7c3aed', group: 'proses' },
  lolos_final:         { label: 'Lolos Final',  cls: 's-lolos',    icon: 'solar:cup-star-bold-duotone',       iconColor: '#059669', group: 'lolos_final' },
  ditolak_berkas:      { label: 'Ditolak',      cls: 's-tolak',    icon: 'solar:close-circle-bold-duotone',   iconColor: '#be123c', group: 'tolak' },
  tidak_lolos_final:   { label: 'Tidak Lolos',  cls: 's-tolak',    icon: 'solar:close-circle-bold-duotone',   iconColor: '#be123c', group: 'tolak' },
};

/* dummyHistory — field emoji diganti: icon + iconColor, bg tetap sama */
const dummyHistory = [
  {
    id: 'p-001', status: 'lolos_final', tanggal_daftar: '2026-04-12',
    beasiswa: { nama_program: 'Beasiswa Mandiri Prestasi', tahun: '2026/2027', sponsors: { nama_perusahaan: 'Bank Mandiri' } },
    penyaluran_dana: { nominal: 5000000 },
    icon: 'solar:cup-star-bold-duotone', iconColor: '#d97706', bg: '#fef3c7',
  },
  {
    id: 'p-002', status: 'wawancara', tanggal_daftar: '2026-04-20',
    beasiswa: { nama_program: 'Pertamina Sobat Bumi', tahun: '2026/2027', sponsors: { nama_perusahaan: 'Pertamina' } },
    penyaluran_dana: null,
    icon: 'solar:globus-bold-duotone', iconColor: '#059669', bg: '#fee2e2',
  },
  {
    id: 'p-003', status: 'menunggu_verifikasi', tanggal_daftar: '2026-05-01',
    beasiswa: { nama_program: 'Telkom Digital Talent', tahun: '2026/2027', sponsors: { nama_perusahaan: 'Telkom Indonesia' } },
    penyaluran_dana: null,
    icon: 'solar:laptop-bold-duotone', iconColor: '#2563eb', bg: '#eff6ff',
  },
  {
    id: 'p-004', status: 'ditolak_berkas', tanggal_daftar: '2026-04-08',
    beasiswa: { nama_program: 'Astra Future Leader', tahun: '2026/2027', sponsors: { nama_perusahaan: 'Astra International' } },
    penyaluran_dana: null,
    icon: 'solar:rocket-bold-duotone', iconColor: '#10b981', bg: '#d1fae5',
  },
  {
    id: 'p-005', status: 'lolos_final', tanggal_daftar: '2025-03-10',
    beasiswa: { nama_program: 'Beasiswa BCA Finance', tahun: '2025/2026', sponsors: { nama_perusahaan: 'BCA' } },
    penyaluran_dana: { nominal: 4000000 },
    icon: 'solar:wallet-money-bold-duotone', iconColor: '#2563eb', bg: '#dbeafe',
  },
  {
    id: 'p-006', status: 'lolos_berkas', tanggal_daftar: '2025-02-15',
    beasiswa: { nama_program: 'Djarum Plus Scholarship', tahun: '2025/2026', sponsors: { nama_perusahaan: 'Djarum Foundation' } },
    penyaluran_dana: null,
    icon: 'solar:star-bold-duotone', iconColor: '#8b5cf6', bg: '#f3e8ff',
  },
];

let activeFilter = 'all';
let searchQuery  = '';
const allData    = [...dummyHistory];

// Jumlah notifikasi belum dibaca — dipakai untuk titik merah di lonceng
// notifikasi & badge di dropdown profil. TODO: ganti dengan hitungan asli
// dari data notifikasi saat sudah terhubung ke backend.
const dummyNotifUnread = 2;

/* ===== UTILS ===== */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function formatRupiah(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
function initNavbarBadges() {
  const dot = document.getElementById('notifDot');
  const badge = document.getElementById('badgeNotif');
  if (dot && dummyNotifUnread > 0) dot.classList.add('show');
  if (badge && dummyNotifUnread > 0) { badge.textContent = dummyNotifUnread; badge.classList.add('show'); }

  const prosesCount = allData.filter(d => STATUS_CFG[d.status]?.group === 'proses').length;
  const bp = document.getElementById('badgePendaftaran');
  if (bp && prosesCount > 0) { bp.textContent = prosesCount; bp.classList.add('show'); }
}

/* ===== STATS ===== */
function renderStats() {
  const total   = allData.length;
  const lolos   = allData.filter(d => d.status === 'lolos_final').length;
  const proses  = allData.filter(d => ['menunggu_verifikasi','lolos_berkas','wawancara'].includes(d.status)).length;
  const tolak   = allData.filter(d => ['ditolak_berkas','tidak_lolos_final'].includes(d.status)).length;

  animateNum('statTotal',    total);
  animateNum('statLolos',    lolos);
  animateNum('statProses',   proses);
  animateNum('statTolak',    tolak);
  animateNum('heroBadgeNum', total);

  /* Shimmer effect saat load — sama seperti dashboard */
  document.querySelectorAll('.stat-tile').forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('shimmer');
      setTimeout(() => tile.classList.remove('shimmer'), 1100);
    }, i * 100);
  });
}

/* ===== RENDER LIST =====
   Ganti d.emoji → <iconify-icon> (d.icon + d.iconColor)
   Ganti cfg.icon (lama emoji string) → <iconify-icon>
   Label tahun "📅 Tahun Akademik…" → iconify
   Semua HTML struktur lain identik asli
   ================================================================= */
function renderList() {
  const listEl  = document.getElementById('listHistory');
  const emptyEl = document.getElementById('emptyState');

  const data = allData.filter(d => {
    const cfg = STATUS_CFG[d.status];
    const filterMatch = activeFilter === 'all'
      || activeFilter === cfg?.group
      || (activeFilter === 'proses' && cfg?.group === 'proses');
    const searchMatch = !searchQuery
      || d.beasiswa.nama_program.toLowerCase().includes(searchQuery)
      || d.beasiswa.sponsors.nama_perusahaan.toLowerCase().includes(searchQuery);
    return filterMatch && searchMatch;
  });

  if (!data.length) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  // Group by tahun akademik
  const groups = {};
  data.forEach(d => {
    const tahun = d.beasiswa?.tahun || String(new Date(d.tanggal_daftar).getFullYear());
    if (!groups[tahun]) groups[tahun] = [];
    groups[tahun].push(d);
  });

  listEl.innerHTML = Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([tahun, items]) => `
      <div>
        <div class="history-year-label">
          <iconify-icon icon="solar:calendar-bold-duotone" width="15" style="vertical-align:middle;margin-right:5px;color:#2563eb"></iconify-icon>
          Tahun Akademik ${tahun}
        </div>
        ${items.map((d, i) => {
          const cfg = STATUS_CFG[d.status] || STATUS_CFG.menunggu_verifikasi;
          const nominal = d.penyaluran_dana?.nominal
            ? `<span class="history-nominal">${formatRupiah(d.penyaluran_dana.nominal)}</span>`
            : `<span class="history-nominal empty">—</span>`;
          return `
            <div class="history-card" style="animation-delay:${i * 0.08}s">
              <div class="history-emoji" style="background:${d.bg}">
                <iconify-icon icon="${d.icon}" width="24" style="color:${d.iconColor}"></iconify-icon>
              </div>
              <div class="history-main">
                <div class="history-nama">${d.beasiswa.nama_program}</div>
                <div class="history-sponsor">${d.beasiswa.sponsors.nama_perusahaan}</div>
                <div class="history-meta">
                  <span class="history-tanggal">Daftar: ${formatTanggal(d.tanggal_daftar)}</span>
                  <span class="status-pill ${cfg.cls}">
                    <iconify-icon icon="${cfg.icon}" width="12" style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"></iconify-icon>
                    ${cfg.label}
                  </span>
                </div>
              </div>
              <div class="history-right">${nominal}</div>
            </div>`;
        }).join('')}
      </div>`
    ).join('');
}

/* ===== FILTER & SEARCH ===== */
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
});
document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderList();
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
    ['solar:calendar-bold-duotone',       'rgba(37,99,235,0.55)'],
    ['solar:book-2-bold-duotone',         'rgba(99,102,241,0.50)'],
    ['solar:diploma-bold-duotone',        'rgba(37,99,235,0.52)'],
    ['solar:cup-star-bold-duotone',       'rgba(245,158,11,0.55)'],
    ['solar:star-bold-duotone',           'rgba(245,158,11,0.50)'],
    ['solar:document-text-bold-duotone',  'rgba(37,99,235,0.48)'],
    ['solar:target-bold-duotone',         'rgba(16,185,129,0.50)'],
    ['solar:lightbulb-bold-duotone',      'rgba(245,158,11,0.55)'],
    ['solar:microscope-bold-duotone',     'rgba(16,185,129,0.48)'],
    ['solar:pen-bold-duotone',            'rgba(139,92,246,0.48)'],
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

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        /* Hapus transitionDelay setelah animasi masuk selesai,
           supaya hover sesudahnya tidak ikut kena delay */
        const delay = parseFloat(e.target.style.transitionDelay || 0) * 1000;
        setTimeout(() => { e.target.style.transitionDelay = '0s'; }, delay + 650);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.06}s`;
    obs.observe(el);
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  initNavbarBadges();
  renderStats();
  renderList();
  initNavbarScroll();
  initMobileNav();
  initLogout();
  setTimeout(initScrollReveal, 80);
  console.log('📅 historyBeasiswa loaded');
});