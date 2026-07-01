/* ============================================
   DASHBOARD.JS v2 — Beasiswa Kampus (Mahasiswa)
   Layout: Top Navbar
   Ikon: Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di data & render diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
   ============================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const STATUS_LABEL = {
  menunggu_verifikasi: 'Menunggu Verifikasi',
  ditolak_berkas:      'Ditolak Berkas',
  lolos_berkas:        'Lolos Berkas',
  wawancara:           'Wawancara',
  lolos_final:         'Lolos Final',
  tidak_lolos_final:   'Tidak Lolos',
};
const STATUS_CLASS = {
  menunggu_verifikasi: 'status-pending',
  ditolak_berkas:      'status-rejected',
  lolos_berkas:        'status-verified',
  wawancara:           'status-wawancara',
  lolos_final:         'status-approved',
  tidak_lolos_final:   'status-rejected',
};

/* ===== SESSION ===== */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session = getSession();
if (!session || session.role !== 'mahasiswa') {
  // DEV: comment out redirect to preview in browser without session
  // window.location.href = '../LOGIN/login.html';
}

/* ===== DEMO SESSION (remove in production) ===== */
const demoSession = session || {
  nama_lengkap: 'Rizky Firmansyah',
  nim_nip: '2021310045',
  role: 'mahasiswa',
  id: 'demo-uuid',
};

/* ===== DUMMY DATA =====
   icon: nama Iconify icon menggantikan emoji field
*/
const dummyPendaftaran = [
  {
    id: 'uuid-1',
    status: 'lolos_final',
    tanggal_daftar: '2026-04-12',
    beasiswa: {
      nama_program: 'Beasiswa Mandiri Prestasi',
      sponsors: { nama_perusahaan: 'Bank Mandiri' },
    },
    icon: 'solar:cup-star-bold-duotone',
    iconColor: '#d97706',
  },
  {
    id: 'uuid-2',
    status: 'lolos_berkas',
    tanggal_daftar: '2026-04-20',
    beasiswa: {
      nama_program: 'Pertamina Sobat Bumi',
      sponsors: { nama_perusahaan: 'Pertamina' },
    },
    icon: 'solar:globus-bold-duotone',
    iconColor: '#059669',
  },
  {
    id: 'uuid-3',
    status: 'menunggu_verifikasi',
    tanggal_daftar: '2026-05-01',
    beasiswa: {
      nama_program: 'Telkom Digital Talent',
      sponsors: { nama_perusahaan: 'Telkom Indonesia' },
    },
    icon: 'solar:laptop-bold-duotone',
    iconColor: '#2563eb',
  },
];

const dummyNotifikasi = [
  { id: 'n1', judul: 'Pendaftaran Disetujui', pesan: 'Beasiswa Mandiri Prestasi kamu telah lolos final!', is_read: false, created_at: '2026-06-08T07:00:00Z' },
  { id: 'n2', judul: 'Berkas Diverifikasi',   pesan: 'Berkas kamu sedang diverifikasi oleh tim staff.',   is_read: false, created_at: '2026-06-07T10:00:00Z' },
  { id: 'n3', judul: 'Jadwal Wawancara',      pesan: 'Wawancara Pertamina Sobat Bumi: 15 Juni 2026.',     is_read: true,  created_at: '2026-06-05T09:00:00Z' },
];

const dummyBeasiswa = [
  { id: 'b1', nama_program: 'Beasiswa Mandiri Prestasi', kuota_penerima: 25, sponsors: { nama_perusahaan: 'Bank Mandiri' },      icon: 'solar:cup-star-bold-duotone',  iconColor: '#d97706' },
  { id: 'b2', nama_program: 'Pertamina Sobat Bumi',      kuota_penerima: 15, sponsors: { nama_perusahaan: 'Pertamina' },         icon: 'solar:globus-bold-duotone',    iconColor: '#059669' },
  { id: 'b3', nama_program: 'Beasiswa Djarum Plus',      kuota_penerima: 30, sponsors: { nama_perusahaan: 'Djarum Foundation' }, icon: 'solar:star-bold-duotone',      iconColor: '#7c3aed' },
];

/* ===== UTIL ===== */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return m + ' menit lalu';
  const h = Math.floor(m / 60);
  if (h < 24)  return h + ' jam lalu';
  return Math.floor(h / 24) + ' hari lalu';
}
function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur = 0;
  const step = Math.ceil(target / 20);
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { el.textContent = target; clearInterval(t); }
    else el.textContent = cur;
  }, 40);
}

/* ===== USER INFO ===== */
function initUserInfo() {
  const s    = demoSession;
  const nama = s?.nama_lengkap || 'Mahasiswa';
  const nim  = s?.nim_nip      || '—';
  const init = nama.charAt(0).toUpperCase();
  const first = nama.split(' ')[0];

  setEl('navUsername',  first);
  setEl('topbarAvatar', init);
  setEl('mobileName',   nama);
  setEl('mobileNim',    'NIM: ' + nim);
  setEl('mobileAvatar', init);
  setEl('welcomeTitle', `Hai, ${first}! 🎓`);
}

/* ===== STATS ===== */
function loadStats() {
  const total    = dummyPendaftaran.length;
  const proses   = dummyPendaftaran.filter(p => ['menunggu_verifikasi','lolos_berkas','wawancara'].includes(p.status)).length;
  const diterima = dummyPendaftaran.filter(p => p.status === 'lolos_final').length;
  const dana     = diterima > 0 ? 'Rp 5 jt' : 'Rp 0';

  animateNum('statPendaftaran', total);
  animateNum('statProses',      proses);
  animateNum('statDiterima',    diterima);
  setEl('statDana', dana);

  setEl('heroBadgeNum', total);

  const bp = document.getElementById('badgePendaftaran');
  if (bp && proses > 0) { bp.textContent = proses; bp.classList.add('show'); }

  /* Shimmer effect saat load — sama seperti dashboard staff admin */
  document.querySelectorAll('.stat-tile').forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('shimmer');
      setTimeout(() => tile.classList.remove('shimmer'), 1100);
    }, i * 100);
  });
}

/* ===== RENDER PENDAFTARAN =====
   Ganti p.emoji → <iconify-icon> menggunakan p.icon & p.iconColor
   Semua HTML struktur lain identik asli
*/
function renderPendaftaran() {
  const el = document.getElementById('listPendaftaran');
  if (!el || !dummyPendaftaran.length) return;
  el.innerHTML = dummyPendaftaran.map((p, i) => {
    const namaProgram    = p.beasiswa?.nama_program              || '—';
    const namaPerusahaan = p.beasiswa?.sponsors?.nama_perusahaan || '—';
    const cls   = STATUS_CLASS[p.status] || 'status-pending';
    const label = STATUS_LABEL[p.status] || p.status;
    return `
      <div class="pendaftaran-item" style="animation-delay:${i * 0.08}s">
        <div class="pendaftaran-emoji">
          <iconify-icon icon="${p.icon}" width="20" style="color:${p.iconColor}"></iconify-icon>
        </div>
        <div class="pendaftaran-info">
          <div class="pendaftaran-nama">${namaProgram}</div>
          <div class="pendaftaran-sponsor">${namaPerusahaan}</div>
        </div>
        <span class="status-pill ${cls}">${label}</span>
      </div>`;
  }).join('');
}

/* ===== RENDER NOTIFIKASI ===== */
function renderNotifikasi() {
  const el    = document.getElementById('listNotifikasi');
  const unread = dummyNotifikasi.filter(n => !n.is_read).length;

  const dot   = document.getElementById('notifDot');
  const badge = document.getElementById('badgeNotif');
  const dropBadge = document.getElementById('badgeNotif');
  if (dot && unread > 0) dot.classList.add('show');
  if (badge && unread > 0) { badge.textContent = unread; badge.classList.add('show'); }

  if (!el || !dummyNotifikasi.length) return;
  el.innerHTML = dummyNotifikasi.map((n, i) => `
    <div class="notif-item ${n.is_read ? '' : 'unread'}" style="animation-delay:${i * 0.08}s">
      <div class="notif-dot-indicator" style="${n.is_read ? 'opacity:0' : ''}"></div>
      <div>
        <div class="notif-text"><strong>${n.judul}</strong> — ${n.pesan}</div>
        <div class="notif-time">${timeAgo(n.created_at)}</div>
      </div>
    </div>`).join('');
}

/* ===== RENDER BEASISWA =====
   Ganti b.emoji → <iconify-icon> menggunakan b.icon & b.iconColor
   Semua HTML struktur lain identik asli
*/
function renderBeasiswaPreview() {
  const el = document.getElementById('beasiswaPreview');
  if (!el) return;
  el.innerHTML = dummyBeasiswa.map(b => `
    <a class="beasiswa-card-link" href="../daftarBeasiswa/daftarBeasiswa.html">
      <span class="beasiswa-card-emoji">
        <iconify-icon icon="${b.icon}" width="32" style="color:${b.iconColor}"></iconify-icon>
      </span>
      <div class="beasiswa-card-nama">${b.nama_program}</div>
      <div class="beasiswa-card-sponsor">${b.sponsors?.nama_perusahaan || '—'}</div>
      <span class="beasiswa-card-kuota">
        <iconify-icon icon="solar:target-bold-duotone" width="12" style="color:#2563eb;margin-right:3px;vertical-align:middle"></iconify-icon>
        ${b.kuota_penerima} kuota tersedia
      </span>
    </a>`).join('');
}

/* ===== NAVBAR SCROLL ===== */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }, { passive: true });
}

/* ===== MOBILE NAV ===== */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');

  function open()  { mobileNav?.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; hamburger?.classList.add('open'); }
  function close() { mobileNav?.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow = ''; hamburger?.classList.remove('open'); }

  hamburger?.addEventListener('click', () => mobileNav?.classList.contains('open') ? close() : open());
  overlay?.addEventListener('click', close);

  document.getElementById('mobileBtnLogout')?.addEventListener('click', () => {
    close();
    setTimeout(() => showLogoutModal(), 200);
  });
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
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideLogoutModal();
  });
}

/* ===== BG CANVAS ANIMATION ===== */
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

  // Subtle floating orbs in blue palette
  const orbs = Array.from({ length: 5 }, (_, i) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 100 + Math.random() * 160,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3,
    hue: 210 + Math.random() * 30,
    alpha: 0.04 + Math.random() * 0.04,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(o => {
      o.x += o.dx;
      o.y += o.dy;
      if (o.x < -o.r) o.x = canvas.width + o.r;
      if (o.x > canvas.width + o.r)  o.x = -o.r;
      if (o.y < -o.r) o.y = canvas.height + o.r;
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

/* ===== FLOATING PARTICLES (education theme) =====
   Ganti emoji string → iconify-icon element
   Teknik & logika identik asli
*/
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  /* Pasangan: [icon-name, warna] menggantikan emoji */
  const iconSet = [
    ['solar:diploma-bold-duotone',        'rgba(59,130,246,0.22)'],
    ['solar:book-2-bold-duotone',         'rgba(99,102,241,0.20)'],
    ['solar:pen-bold-duotone',            'rgba(139,92,246,0.18)'],
    ['solar:cup-star-bold-duotone',       'rgba(251,191,36,0.22)'],
    ['solar:star-bold-duotone',           'rgba(251,191,36,0.20)'],
    ['solar:document-text-bold-duotone',  'rgba(59,130,246,0.18)'],
    ['solar:target-bold-duotone',         'rgba(239,68,68,0.18)'],
    ['solar:lightbulb-bold-duotone',      'rgba(251,191,36,0.22)'],
    ['solar:microscope-bold-duotone',     'rgba(16,185,129,0.18)'],
    ['solar:document-add-bold-duotone',   'rgba(59,130,246,0.20)'],
  ];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const [iconName, color] = iconSet[i % iconSet.length];
    const p = document.createElement('iconify-icon');
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

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const els = document.querySelectorAll('.content-card, .stat-tile, .beasiswa-card-link, .action-tile');
  els.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.04}s`;
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadStats();
  renderPendaftaran();
  renderNotifikasi();
  renderBeasiswaPreview();
  initNavbarScroll();
  initMobileNav();
  initLogout();

  // Scroll reveal with slight delay so page paints first
  setTimeout(initScrollReveal, 80);

  console.log('🏠 Dashboard v2 loaded | User:', demoSession?.nama_lengkap, '| NIM:', demoSession?.nim_nip);
});