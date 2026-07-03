/* ============================================
   NOTIFIKASI.JS — Beasiswa Kampus
   Ikon: Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di data & render diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
   ============================================ */


// ===== SESSION =====
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session = getSession();
if (!session || session.role !== 'mahasiswa') {
  // window.location.href = '../LOGIN/login.html'; // aktifkan di production
}

// Demo session fallback (hapus di production)
const demoSession = session || {
  nama_lengkap: 'Rizky Firmansyah',
  nim_nip: '2021310045',
  role: 'mahasiswa',
  id: 'demo-uuid',
};

// ===== DUMMY DATA =====
// field icon + iconColor menggantikan icon emoji string di data
const dummyNotifikasi = [
  {
    id: 'n-001',
    user_id: session?.id,
    judul: 'Selamat! Kamu Lolos Final',
    pesan: 'Pendaftaran Beasiswa Mandiri Prestasi kamu dinyatakan LOLOS FINAL. Selamat bergabung sebagai penerima beasiswa!',
    is_read: false,
    created_at: '2026-06-08T07:00:00Z',
    icon: 'solar:cup-star-bold-duotone', iconColor: '#d97706', bg: '#fef3c7',
  },
  {
    id: 'n-002',
    user_id: session?.id,
    judul: 'Dana Beasiswa Cair',
    pesan: 'Dana Beasiswa Mandiri Prestasi sebesar Rp 5.000.000 telah ditransfer ke rekening kamu. Cek halaman Penerimaan Dana untuk bukti transfer.',
    is_read: false,
    created_at: '2026-06-08T09:00:00Z',
    icon: 'solar:wallet-money-bold-duotone', iconColor: '#059669', bg: '#d1fae5',
  },
  {
    id: 'n-003',
    user_id: session?.id,
    judul: 'Jadwal Wawancara Pertamina',
    pesan: 'Kamu lolos seleksi berkas Pertamina Sobat Bumi! Jadwal wawancara: Rabu, 20 Mei 2026 pukul 13.00 WIB di Gedung A Lantai 3.',
    is_read: false,
    created_at: '2026-06-05T10:00:00Z',
    icon: 'solar:microphone-bold-duotone', iconColor: '#2563eb', bg: '#eff6ff',
  },
  {
    id: 'n-004',
    user_id: session?.id,
    judul: 'Berkas Telkom Diverifikasi',
    pesan: 'Berkas pendaftaran Telkom Digital Talent kamu sedang diverifikasi oleh tim kami. Proses berlangsung 3–5 hari kerja.',
    is_read: true,
    created_at: '2026-06-03T08:00:00Z',
    icon: 'solar:folder-check-bold-duotone', iconColor: '#dc2626', bg: '#fee2e2',
  },
  {
    id: 'n-005',
    user_id: session?.id,
    judul: 'Laporan Selesai Ditangani',
    pesan: 'Laporan kendala "Upload sertifikat gagal terus" telah selesai ditangani oleh staff kami. Silakan cek tanggapan di menu Laporan Kendala.',
    is_read: true,
    created_at: '2026-05-28T14:00:00Z',
    icon: 'solar:check-circle-bold-duotone', iconColor: '#059669', bg: '#d1fae5',
  },
  {
    id: 'n-006',
    user_id: session?.id,
    judul: 'Pendaftaran Berhasil Dikirim',
    pesan: 'Pendaftaran Telkom Digital Talent kamu berhasil terkirim dan menunggu verifikasi dari tim staff kami.',
    is_read: true,
    created_at: '2026-05-01T11:00:00Z',
    icon: 'solar:chat-round-like-bold-duotone', iconColor: '#7c3aed', bg: '#ede9fe',
  },
];

let activeFilter = 'all';
let allData = [...dummyNotifikasi];

// Jumlah pendaftaran yang sedang diproses — dipakai untuk badge
// "Pendaftaran Saya" di navbar. TODO: ganti dengan hitungan asli dari
// data pendaftaran saat sudah terhubung ke backend.
const dummyPendaftaranProses = 2;

// ===== INIT USER INFO =====
function initUserInfo() {
  const s    = demoSession;
  const nama = s?.nama_lengkap || 'Mahasiswa';
  const nim  = s?.nim_nip      || '—';
  const init = nama.charAt(0).toUpperCase();
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('navUsername',  nama);
  el('topbarAvatar', init);
  el('mobileName',   nama);
  el('mobileNim',    'NIM: ' + nim);
  el('mobileAvatar', init);
}

// ===== ANIMATED COUNTER (easeOutCubic) =====
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

// ===== UPDATE HERO BADGE =====
function updateBadge() {
  const unread = allData.filter(n => !n.is_read).length;
  animateNum('heroBadgeNum', unread);

  // Navbar: notif dot + dropdown badge — pakai unread count asli halaman ini
  const dot = document.getElementById('notifDot');
  if (dot) { if (unread > 0) dot.classList.add('show'); else dot.classList.remove('show'); }
  const badgeNotif = document.getElementById('badgeNotif');
  if (badgeNotif) {
    if (unread > 0) { badgeNotif.textContent = unread; badgeNotif.classList.add('show'); }
    else { badgeNotif.textContent = ''; badgeNotif.classList.remove('show'); }
  }
}

// ===== NAVBAR: BADGE PENDAFTARAN SAYA =====
function updateBadgePendaftaran() {
  const bp = document.getElementById('badgePendaftaran');
  if (bp && dummyPendaftaranProses > 0) {
    bp.textContent = dummyPendaftaranProses;
    bp.classList.add('show');
  }
}

// ===== RENDER =====
// Ganti n.icon (emoji string) → <iconify-icon> menggunakan n.icon & n.iconColor
// Semua HTML struktur lain identik asli
function renderList() {
  const listEl  = document.getElementById('listNotifikasi');
  const emptyEl = document.getElementById('emptyState');
  const unreadLabelEl = document.getElementById('unreadLabel');

  let data = activeFilter === 'all' ? allData
    : activeFilter === 'unread' ? allData.filter(n => !n.is_read)
    : allData.filter(n => n.is_read);

  const unread = allData.filter(n => !n.is_read).length;
  if (unreadLabelEl) {
    unreadLabelEl.textContent = unread > 0
      ? `${unread} notifikasi belum dibaca`
      : 'Semua notifikasi sudah dibaca';
  }

  if (!data.length) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  const groups = groupByDate(data);

  listEl.innerHTML = Object.entries(groups).map(([label, items]) => `
    <div>
      <div class="notif-group-label">${label}</div>
      ${items.map(n => `
        <div class="notif-item ${n.is_read ? 'read' : 'unread'}" onclick="markRead('${n.id}')">
          <div class="notif-dot-wrap">
            <div class="notif-dot-indicator"></div>
          </div>
          <div class="notif-icon" style="background:${n.bg}">
            <iconify-icon icon="${n.icon}" width="22" style="color:${n.iconColor}"></iconify-icon>
          </div>
          <div class="notif-content">
            <div class="notif-judul">${n.judul}</div>
            <div class="notif-pesan">${n.pesan}</div>
            <div class="notif-time">${timeAgo(n.created_at)}</div>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

// ===== MARK AS READ =====
function markRead(id) {
  const item = allData.find(n => n.id === id);
  if (item && !item.is_read) {
    item.is_read = true;
    updateBadge();
    renderList();
  }
}

// ===== TANDAI SEMUA DIBACA =====
document.getElementById('btnBacaSemua')?.addEventListener('click', () => {
  allData.forEach(n => n.is_read = true);
  updateBadge();
  renderList();
});

// ===== FILTER =====
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
});

// ===== NAVBAR SCROLL =====
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }, { passive: true });
}
initNavbarScroll();

// ===== MOBILE NAV =====
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');

  function open() {
    mobileNav?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburger?.classList.add('open');
  }
  function close() {
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    hamburger?.classList.remove('open');
  }

  hamburger?.addEventListener('click', () => mobileNav?.classList.contains('open') ? close() : open());
  overlay?.addEventListener('click', close);
  document.getElementById('mobileBtnLogout')?.addEventListener('click', () => {
    close();
    setTimeout(() => showLogoutModal(), 200);
  });
}
initMobileNav();

// ===== LOGOUT =====
function showLogoutModal() {
  document.getElementById('logoutModal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function hideLogoutModal() {
  document.getElementById('logoutModal')?.classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('btnLogout')?.addEventListener('click', showLogoutModal);
document.getElementById('cancelLogout')?.addEventListener('click', hideLogoutModal);
document.getElementById('logoutOverlay')?.addEventListener('click', hideLogoutModal);
document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user');
  window.location.href = '../LOGIN/login.html';
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideLogoutModal();
});

// ===== UTILS =====
function timeAgo(str) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Baru saja';
  if (m < 60) return m + ' menit lalu';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' jam lalu';
  const d = Math.floor(h / 24);
  if (d < 7)  return d + ' hari lalu';
  return formatTanggal(str);
}

function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function groupByDate(items) {
  const now    = new Date();
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const week   = today - 7 * 86400000;

  const groups = { 'Hari Ini': [], 'Minggu Ini': [], 'Sebelumnya': [] };
  items.forEach(n => {
    const t = new Date(n.created_at).getTime();
    if (t >= today)     groups['Hari Ini'].push(n);
    else if (t >= week) groups['Minggu Ini'].push(n);
    else                groups['Sebelumnya'].push(n);
  });

  return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0));
}

// ===== BG CANVAS =====
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const orbs = Array.from({ length: 5 }, () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    r: 100 + Math.random() * 160,
    dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
    hue: 210 + Math.random() * 30, alpha: 0.04 + Math.random() * 0.04,
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(o => {
      o.x += o.dx; o.y += o.dy;
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

// ===== PARTICLES — ganti emoji → iconify-icon =====
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const iconSet = [
    ['solar:bell-bold-duotone',             'rgba(37,99,235,0.55)'],
    ['solar:document-text-bold-duotone',    'rgba(37,99,235,0.48)'],
    ['solar:diploma-bold-duotone',          'rgba(99,102,241,0.50)'],
    ['solar:cup-star-bold-duotone',         'rgba(245,158,11,0.55)'],
    ['solar:star-bold-duotone',             'rgba(245,158,11,0.50)'],
    ['solar:wallet-money-bold-duotone',     'rgba(16,185,129,0.50)'],
    ['solar:target-bold-duotone',           'rgba(16,185,129,0.48)'],
    ['solar:lightbulb-bold-duotone',        'rgba(245,158,11,0.55)'],
    ['solar:chat-round-like-bold-duotone',  'rgba(139,92,246,0.48)'],
    ['solar:pen-bold-duotone',              'rgba(139,92,246,0.50)'],
  ];
  for (let i = 0; i < 18; i++) {
    const [iconName, color] = iconSet[i % iconSet.length];
    const p = document.createElement('iconify-icon');
    p.setAttribute('icon', iconName);
    p.className = 'particle';
    const dur   = 7 + Math.random() * 8;
    const delay = Math.random() * 12;
    p.style.cssText = `left:${Math.random()*100}%;bottom:-40px;font-size:${12+Math.random()*10}px;color:${color};--dur:${dur}s;--delay:${delay}s;animation-delay:${delay}s`;
    container.appendChild(p);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  updateBadge();
  updateBadgePendaftaran();
  renderList();
  console.log('🔔 notifikasi.js loaded — user:', demoSession?.nama_lengkap);
});