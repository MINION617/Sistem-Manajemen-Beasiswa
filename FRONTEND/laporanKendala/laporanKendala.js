/* ============================================
   LAPORANKENDALA.JS — Beasiswa Kampus
   Ikon: Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di STATUS_CFG, data, & render diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
   ============================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

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

// ===== STATUS CONFIG =====
// icon: Iconify icon name + iconColor menggantikan emoji string
const STATUS_CFG = {
  masuk:    { label: 'Masuk',    cls: 's-masuk',    icon: 'solar:inbox-in-bold-duotone',      iconColor: '#d97706' },
  diproses: { label: 'Diproses', cls: 's-diproses', icon: 'solar:settings-bold-duotone',      iconColor: '#2563eb' },
  selesai:  { label: 'Selesai',  cls: 's-selesai',  icon: 'solar:check-circle-bold-duotone',  iconColor: '#059669' },
};

// ===== BEASISWA LIST =====
const beasiswaOptions = [
  { id: 'b-001', nama_program: 'Beasiswa Mandiri Prestasi' },
  { id: 'b-002', nama_program: 'Pertamina Sobat Bumi' },
  { id: 'b-003', nama_program: 'Telkom Digital Talent' },
  { id: 'b-004', nama_program: 'Astra Future Leader' },
];

// ===== DUMMY DATA =====
const dummyLaporan = [
  {
    id: 'l-001',
    judul_laporan: 'Upload sertifikat gagal terus',
    deskripsi: 'Saya sudah mencoba upload sertifikat prestasi beberapa kali tapi selalu gagal dengan pesan "file tidak didukung". Padahal formatnya PDF sesuai syarat.',
    status: 'selesai',
    tanggapan_staff: 'Halo! Masalah ini sudah kami perbaiki. Coba upload ulang menggunakan browser Chrome terbaru. Jika masih bermasalah, hubungi kami kembali.',
    tanggal_lapor: '2026-05-10T09:00:00Z',
    tanggal_selesai: '2026-05-11T14:00:00Z',
    beasiswa: { nama_program: 'Beasiswa Mandiri Prestasi' },
  },
  {
    id: 'l-002',
    judul_laporan: 'Status pendaftaran tidak berubah',
    deskripsi: 'Sudah 2 minggu sejak upload dokumen tapi status saya masih "Menunggu Verifikasi". Apakah ada masalah dengan pendaftaran saya?',
    status: 'diproses',
    tanggapan_staff: null,
    tanggal_lapor: '2026-05-20T14:00:00Z',
    tanggal_selesai: null,
    beasiswa: { nama_program: 'Pertamina Sobat Bumi' },
  },
  {
    id: 'l-003',
    judul_laporan: 'Dana beasiswa belum cair',
    deskripsi: 'Jadwal pencairan dana seharusnya tanggal 1 Juni 2026, tapi sampai sekarang belum masuk ke rekening saya.',
    status: 'masuk',
    tanggapan_staff: null,
    tanggal_lapor: '2026-06-07T10:00:00Z',
    tanggal_selesai: null,
    beasiswa: null,
  },
];

let activeFilter = 'all';
let allData = [...dummyLaporan];

// Jumlah notifikasi belum dibaca — dipakai untuk titik merah di lonceng
// notifikasi & badge di dropdown profil. TODO: ganti dengan hitungan asli
// dari data notifikasi saat sudah terhubung ke backend.
const dummyNotifUnread = 2;

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
  const first = nama.split(' ')[0];
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('navUsername',  nama);
  el('topbarAvatar', init);
  el('mobileName',   nama);
  el('mobileNim',    'NIM: ' + nim);
  el('mobileAvatar', init);
}

// ===== INIT NOTIF BADGES (lonceng navbar + dropdown profil) =====
function initNotifBadges() {
  const dot   = document.getElementById('notifDot');
  const badge = document.getElementById('badgeNotif');
  if (dot && dummyNotifUnread > 0) dot.classList.add('show');
  if (badge && dummyNotifUnread > 0) { badge.textContent = dummyNotifUnread; badge.classList.add('show'); }
}

// ===== INIT PENDAFTARAN BADGE (nav-pill "Pendaftaran Saya") =====
function initPendaftaranBadge() {
  const bp = document.getElementById('badgePendaftaran');
  if (bp && dummyPendaftaranProses > 0) { bp.textContent = dummyPendaftaranProses; bp.classList.add('show'); }
}

// ===== POPULATE BEASISWA SELECT =====
function populateBeasiswaSelect() {
  const select = document.getElementById('beasiswaSelect');
  if (!select) return;
  beasiswaOptions.forEach(b => {
    const opt = document.createElement('option');
    opt.value       = b.id;
    opt.textContent = b.nama_program;
    select.appendChild(opt);
  });
}

// ===== ANIMATE NUMBER (easeOutCubic) =====
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
  animateNum('heroBadgeNum', allData.length);
}

// ===== CHAR COUNT =====
document.getElementById('deskripsiLaporan')?.addEventListener('input', (e) => {
  const el = document.getElementById('charCount');
  if (el) el.textContent = e.target.value.length;
});

// ===== RENDER LIST =====
// Ganti cfg.icon (emoji string) → <iconify-icon>
// Ganti 🎓 label beasiswa → <iconify-icon>
// Ganti 💬 tanggapan badge → <iconify-icon>
// Semua HTML struktur lain identik asli
function renderList() {
  const listEl  = document.getElementById('listLaporan');
  const emptyEl = document.getElementById('emptyState');
  if (!listEl) return;

  let data = activeFilter === 'all'
    ? allData
    : allData.filter(d => d.status === activeFilter);

  if (!data.length) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map(d => {
    const cfg = STATUS_CFG[d.status] || STATUS_CFG.masuk;
    const beasiswaLabel = d.beasiswa?.nama_program
      ? `<iconify-icon icon="solar:diploma-bold-duotone" width="13" style="color:#2563eb;vertical-align:middle;margin-right:3px"></iconify-icon>${d.beasiswa.nama_program}`
      : '';

    return `
    <div class="laporan-card reveal" onclick="openModal('${d.id}')">
      <div class="laporan-top">
        <div class="laporan-judul">${d.judul_laporan}</div>
        <span class="status-pill ${cfg.cls}">
          <iconify-icon icon="${cfg.icon}" width="12" style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"></iconify-icon>
          ${cfg.label}
        </span>
      </div>
      ${beasiswaLabel ? `<div class="laporan-beasiswa">${beasiswaLabel}</div>` : ''}
      <div class="laporan-desc">${d.deskripsi}</div>
      <div class="laporan-footer">
        <span class="laporan-tanggal">${formatTanggal(d.tanggal_lapor)}</span>
        ${d.tanggapan_staff
          ? `<span class="tanggapan-badge">
               <iconify-icon icon="solar:chat-round-dots-bold-duotone" width="13" style="vertical-align:middle;margin-right:3px;color:#2563eb"></iconify-icon>Ada tanggapan
             </span>`
          : ''}
      </div>
    </div>`;
  }).join('');

  setTimeout(applyScrollReveal, 50);
}

// ===== SCROLL REVEAL =====
function applyScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        /* Hapus transitionDelay setelah animasi masuk selesai,
           supaya hover sesudahnya tidak ikut kena delay */
        const delay = parseFloat(e.target.style.transitionDelay || 0) * 1000;
        setTimeout(() => { e.target.style.transitionDelay = '0s'; }, delay + 650);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 0.05}s`;
    observer.observe(el);
  });
}

// ===== FILTER =====
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
});

// ===== MODAL DETAIL =====
// Ganti cfg.icon (emoji) → <iconify-icon>
// Ganti 🎓 di modal body → <iconify-icon>
// Ganti ⏳ belum tanggapan → <iconify-icon>
// Ganti 💬 tanggapan label → <iconify-icon>
// Semua HTML struktur lain identik asli
const modal = document.getElementById('modalLaporan');

function openModal(id) {
  const d = allData.find(x => x.id === id);
  if (!d) return;

  const cfg = STATUS_CFG[d.status] || STATUS_CFG.masuk;

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-header-detail">
      <div class="modal-header-left">
        <h3>${d.judul_laporan}</h3>
        <span class="status-pill ${cfg.cls}">
          <iconify-icon icon="${cfg.icon}" width="12" style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"></iconify-icon>
          ${cfg.label}
        </span>
      </div>
    </div>
    <div class="modal-body-detail">
      ${d.beasiswa ? `
      <div>
        <div class="detail-section-label">Terkait Beasiswa</div>
        <div style="font-size:13px;font-weight:600;color:var(--blue-700)">
          <iconify-icon icon="solar:diploma-bold-duotone" width="14" style="vertical-align:middle;margin-right:4px;color:#2563eb"></iconify-icon>
          ${d.beasiswa.nama_program}
        </div>
      </div>` : ''}

      <div>
        <div class="detail-section-label">Deskripsi Masalah</div>
        <div class="detail-desc">${d.deskripsi}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div style="background:var(--bg);border-radius:var(--radius-sm);padding:12px;">
          <div class="detail-section-label" style="margin-bottom:4px">Tanggal Lapor</div>
          <div style="font-size:13px;font-weight:600">${formatTanggal(d.tanggal_lapor)}</div>
        </div>
        <div style="background:var(--bg);border-radius:var(--radius-sm);padding:12px;">
          <div class="detail-section-label" style="margin-bottom:4px">Tanggal Selesai</div>
          <div style="font-size:13px;font-weight:600">${d.tanggal_selesai ? formatTanggal(d.tanggal_selesai) : '—'}</div>
        </div>
      </div>

      <div>
        <div class="detail-section-label">Tanggapan Staff</div>
        ${d.tanggapan_staff ? `
          <div class="tanggapan-box">
            <div class="tanggapan-label">
              <iconify-icon icon="solar:chat-round-dots-bold-duotone" width="14" style="vertical-align:middle;margin-right:4px;color:#2563eb"></iconify-icon>
              Respons dari Tim Kami
            </div>
            <div class="tanggapan-text">${d.tanggapan_staff}</div>
          </div>` : `
          <div class="belum-tanggapan">
            <iconify-icon icon="solar:clock-circle-bold-duotone" width="14" style="vertical-align:middle;margin-right:4px;color:#d97706"></iconify-icon>
            Laporan sedang ditinjau oleh staff kami. Kami akan merespons dalam 1–2 hari kerja.
          </div>`}
      </div>
    </div>`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

document.getElementById('modalOverlay')?.addEventListener('click', closeModal);
document.getElementById('modalClose')?.addEventListener('click', closeModal);

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== FORM SUBMIT =====
document.getElementById('formLaporan')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const judul = document.getElementById('judulLaporan').value.trim();
  const desk  = document.getElementById('deskripsiLaporan').value.trim();
  const bsId  = document.getElementById('beasiswaSelect').value;
  let valid = true;

  if (!judul) { showError('errJudul',     'Judul laporan wajib diisi');                                    valid = false; }
  if (!desk)  { showError('errDeskripsi', 'Deskripsi masalah wajib diisi');                               valid = false; }
  if (desk.length < 20) { showError('errDeskripsi', 'Deskripsi terlalu singkat (min. 20 karakter)');      valid = false; }
  if (!valid) return;

  setLoading(true);
  await delay(1200);

  const newLaporan = {
    id: 'l-' + Date.now(),
    judul_laporan: judul,
    deskripsi: desk,
    status: 'masuk',
    tanggapan_staff: null,
    tanggal_lapor: new Date().toISOString(),
    tanggal_selesai: null,
    beasiswa: bsId ? beasiswaOptions.find(b => b.id === bsId) : null,
  };

  allData.unshift(newLaporan);
  updateBadge();
  renderList();

  e.target.reset();
  document.getElementById('charCount').textContent = '0';

  setLoading(false);
  document.getElementById('modalSukses').classList.add('active');
  document.body.style.overflow = 'hidden';
});

// ===== MODAL SUKSES =====
document.getElementById('suksesOverlay')?.addEventListener('click', closeSukses);
document.getElementById('btnTutupSukses')?.addEventListener('click', closeSukses);
function closeSukses() {
  document.getElementById('modalSukses')?.classList.remove('active');
  document.body.style.overflow = '';
}

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
  if (e.key === 'Escape') { closeModal(); closeSukses(); }
});

// ===== HELPERS =====
function setLoading(on) {
  const btn    = document.getElementById('btnKirim');
  const text   = btn?.querySelector('.btn-text');
  const loader = document.getElementById('kirimLoader');
  if (btn) btn.disabled = on;
  if (text)   text.style.display   = on ? 'none' : 'flex';
  if (loader) loader.style.display = on ? 'flex' : 'none';
}
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = '⚠ ' + msg;
}
function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}
function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    ['solar:chat-round-like-bold-duotone',  'rgba(37,99,235,0.55)'],
    ['solar:chat-round-dots-bold-duotone',  'rgba(99,102,241,0.50)'],
    ['solar:document-text-bold-duotone',    'rgba(37,99,235,0.48)'],
    ['solar:diploma-bold-duotone',          'rgba(139,92,246,0.48)'],
    ['solar:check-circle-bold-duotone',     'rgba(16,185,129,0.50)'],
    ['solar:book-2-bold-duotone',           'rgba(37,99,235,0.48)'],
    ['solar:target-bold-duotone',           'rgba(239,68,68,0.48)'],
    ['solar:lightbulb-bold-duotone',        'rgba(245,158,11,0.55)'],
    ['solar:microscope-bold-duotone',       'rgba(16,185,129,0.48)'],
    ['solar:pen-bold-duotone',              'rgba(139,92,246,0.48)'],
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
  initNotifBadges();
  initPendaftaranBadge();
  populateBeasiswaSelect();
  updateBadge();
  renderList();
  console.log('📣 laporanKendala.js loaded — user:', demoSession?.nama_lengkap);
});