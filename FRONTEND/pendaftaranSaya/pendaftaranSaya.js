/* ============================================
   PENDAFTARANSAYA.JS — Beasiswa Kampus
   Ikon: Iconify (iconify-icon web component)
   CATATAN: Hanya emoji di STATUS_CFG, data, & render diganti Iconify.
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

// ===== STATUS CONFIG =====
// icon: Iconify icon name + iconColor menggantikan emoji string
const STATUS_CFG = {
  menunggu_verifikasi: { label: 'Menunggu Verifikasi', cls: 's-menunggu',       icon: 'solar:clock-circle-bold-duotone',     iconColor: '#d97706' },
  ditolak_berkas:      { label: 'Ditolak Berkas',      cls: 's-ditolak-berkas', icon: 'solar:close-circle-bold-duotone',     iconColor: '#be123c' },
  lolos_berkas:        { label: 'Lolos Berkas',        cls: 's-lolos-berkas',   icon: 'solar:folder-check-bold-duotone',     iconColor: '#2563eb' },
  wawancara:           { label: 'Wawancara',           cls: 's-wawancara',      icon: 'solar:microphone-bold-duotone',       iconColor: '#7c3aed' },
  lolos_final:         { label: 'Lolos Final',         cls: 's-lolos-final',    icon: 'solar:cup-star-bold-duotone',         iconColor: '#059669' },
  tidak_lolos_final:   { label: 'Tidak Lolos Final',   cls: 's-tidak-lolos',    icon: 'solar:close-circle-bold-duotone',     iconColor: '#be123c' },
};

// Urutan tahapan seleksi untuk progress bar — identik asli
const TAHAPAN = [
  { key: 'menunggu_verifikasi', label: 'Verifikasi' },
  { key: 'lolos_berkas',        label: 'Berkas' },
  { key: 'wawancara',           label: 'Wawancara' },
  { key: 'lolos_final',         label: 'Final' },
];
const TAHAPAN_IDX = {
  menunggu_verifikasi: 0,
  ditolak_berkas:      0,
  lolos_berkas:        1,
  wawancara:           2,
  lolos_final:         3,
  tidak_lolos_final:   3,
};
const IS_REJECTED = ['ditolak_berkas','tidak_lolos_final'];

// ===== DUMMY DATA =====
// field emoji diganti: icon + iconColor (+ emojiBg tetap di helper)
const dummyData = [
  {
    id: 'p-001',
    status: 'lolos_final',
    tanggal_daftar: '2026-04-12T08:30:00Z',
    updated_at:     '2026-05-20T10:00:00Z',
    beasiswa: {
      nama_program: 'Beasiswa Mandiri Prestasi',
      kuota_penerima: 25, nominal_dana: 5000000,
      tanggal_tutup: '2026-07-31',
      sponsors: { nama_perusahaan: 'Bank Mandiri', industri: 'Perbankan' },
    },
    icon: 'solar:cup-star-bold-duotone', iconColor: '#d97706', iconBg: '#fef3c7',
    hasil_seleksi: { nilai_tes: 87.5, nilai_wawancara: 91.0, catatan_staff: 'Mahasiswa sangat baik dalam presentasi dan komunikasi.' },
    dokumen: [
      { jenis_dokumen: 'sertifikat_prestasi', file_url: '#', nama_file: 'sertifikat_prestasi.pdf', status: 'verified' },
      { jenis_dokumen: 'berkas_pendukung',    file_url: '#', nama_file: 'berkas_pendukung.pdf',    status: 'verified' },
    ],
    timeline: [
      { step: 'menunggu_verifikasi', tanggal: '2026-04-12', catatan: 'Pendaftaran diterima sistem.' },
      { step: 'lolos_berkas',        tanggal: '2026-04-18', catatan: 'Berkas lengkap dan valid.' },
      { step: 'wawancara',           tanggal: '2026-05-05', catatan: 'Jadwal wawancara: 10 Mei 2026, 10.00 WIB.' },
      { step: 'lolos_final',         tanggal: '2026-05-20', catatan: 'Selamat! Kamu dinyatakan sebagai penerima beasiswa.' },
    ],
  },
  {
    id: 'p-002',
    status: 'wawancara',
    tanggal_daftar: '2026-04-20T09:00:00Z',
    updated_at:     '2026-05-10T14:00:00Z',
    beasiswa: {
      nama_program: 'Pertamina Sobat Bumi',
      kuota_penerima: 15, nominal_dana: 7500000,
      tanggal_tutup: '2026-07-15',
      sponsors: { nama_perusahaan: 'Pertamina', industri: 'Energi' },
    },
    icon: 'solar:globus-bold-duotone', iconColor: '#059669', iconBg: '#fee2e2',
    hasil_seleksi: { nilai_tes: 79.0, nilai_wawancara: null, catatan_staff: null },
    dokumen: [
      { jenis_dokumen: 'sertifikat_prestasi', file_url: '#', nama_file: 'sertifikat.pdf',  status: 'verified' },
      { jenis_dokumen: 'sertifikat_bahasa',   file_url: '#', nama_file: 'toefl.pdf',       status: 'verified' },
      { jenis_dokumen: 'berkas_pendukung',    file_url: '#', nama_file: 'berkas.pdf',      status: 'pending' },
    ],
    timeline: [
      { step: 'menunggu_verifikasi', tanggal: '2026-04-20', catatan: 'Pendaftaran diterima sistem.' },
      { step: 'lolos_berkas',        tanggal: '2026-04-28', catatan: 'Berkas dinyatakan lengkap.' },
      { step: 'wawancara',           tanggal: '2026-05-10', catatan: 'Jadwal wawancara: 20 Mei 2026, 13.00 WIB.' },
    ],
  },
  {
    id: 'p-003',
    status: 'menunggu_verifikasi',
    tanggal_daftar: '2026-05-01T11:00:00Z',
    updated_at:     '2026-05-01T11:00:00Z',
    beasiswa: {
      nama_program: 'Telkom Digital Talent',
      kuota_penerima: 20, nominal_dana: 4500000,
      tanggal_tutup: '2026-08-01',
      sponsors: { nama_perusahaan: 'Telkom Indonesia', industri: 'Telekomunikasi' },
    },
    icon: 'solar:laptop-bold-duotone', iconColor: '#2563eb', iconBg: '#fee2e2',
    hasil_seleksi: null,
    dokumen: [
      { jenis_dokumen: 'sertifikat_prestasi', file_url: '#', nama_file: 'sertifikat.pdf', status: 'pending' },
      { jenis_dokumen: 'berkas_pendukung',    file_url: '#', nama_file: 'berkas.pdf',     status: 'pending' },
    ],
    timeline: [
      { step: 'menunggu_verifikasi', tanggal: '2026-05-01', catatan: 'Pendaftaran diterima, menunggu verifikasi berkas.' },
    ],
  },
  {
    id: 'p-004',
    status: 'ditolak_berkas',
    tanggal_daftar: '2026-04-08T10:00:00Z',
    updated_at:     '2026-04-15T09:00:00Z',
    beasiswa: {
      nama_program: 'Astra Future Leader',
      kuota_penerima: 12, nominal_dana: 10000000,
      tanggal_tutup: '2026-06-30',
      sponsors: { nama_perusahaan: 'Astra International', industri: 'Otomotif' },
    },
    icon: 'solar:rocket-bold-duotone', iconColor: '#10b981', iconBg: '#d1fae5',
    hasil_seleksi: null,
    dokumen: [
      { jenis_dokumen: 'sertifikat_prestasi', file_url: '#', nama_file: 'sertifikat.pdf', status: 'rejected' },
      { jenis_dokumen: 'berkas_pendukung',    file_url: '#', nama_file: 'berkas.pdf',     status: 'pending' },
    ],
    timeline: [
      { step: 'menunggu_verifikasi', tanggal: '2026-04-08', catatan: 'Pendaftaran diterima sistem.' },
      { step: 'ditolak_berkas',      tanggal: '2026-04-15', catatan: 'Maaf, sertifikat prestasi tidak memenuhi syarat minimum. Silakan cek laporan kendala untuk info lebih lanjut.' },
    ],
  },
];

let activeFilter = 'all';
let allData = [...dummyData];

// Jumlah notifikasi belum dibaca — dipakai untuk titik merah di lonceng
// notifikasi & badge di dropdown profil. TODO: ganti dengan hitungan asli
// dari data notifikasi saat sudah terhubung ke backend.
const dummyNotifUnread = 2;

// ===== NOTIF BADGE (bell dot + dropdown badge) =====
function initNotifBadge() {
  const dot = document.getElementById('notifDot');
  const badge = document.getElementById('badgeNotif');
  if (dot && dummyNotifUnread > 0) dot.classList.add('show');
  if (badge && dummyNotifUnread > 0) { badge.textContent = dummyNotifUnread; badge.classList.add('show'); }
}

// ===== INIT USER INFO =====
function initUserInfo() {
  const s    = demoSession;
  const nama = s?.nama_lengkap || 'Mahasiswa';
  const nim  = s?.nim_nip      || '—';
  const init = nama.charAt(0).toUpperCase();
  const first = nama.split(' ')[0];
  const el   = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('navUsername',  nama);
  el('topbarAvatar', init);
  el('mobileName',   nama);
  el('mobileNim',    'NIM: ' + nim);
  el('mobileAvatar', init);
  el('welcomeTitle', 'Pendaftaran ' + first + ' 📋');
}

// ===== LOAD DATA =====
async function loadData() {
  /* Production: Supabase query identik asli */
  allData = [...dummyData];
  renderStats();
  renderList();
}

// ===== STATS =====
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

function renderStats() {
  const total  = allData.length;
  const proses = allData.filter(d => ['menunggu_verifikasi','lolos_berkas','wawancara'].includes(d.status)).length;
  const lolos  = allData.filter(d => d.status === 'lolos_final').length;
  const tolak  = allData.filter(d => IS_REJECTED.includes(d.status)).length;
  animateNum('statTotal',  total);
  animateNum('statProses', proses);
  animateNum('statLolos',  lolos);
  animateNum('statTolak',  tolak);
  const bp = document.getElementById('badgePendaftaran');
  if (bp && proses > 0) { bp.textContent = proses; bp.classList.add('show'); }
  setEl('heroBadgeNum', total - tolak > 0 ? total - tolak : total);

  /* Shimmer effect saat load — sama seperti dashboard */
  document.querySelectorAll('.stat-tile').forEach((tile, i) => {
    setTimeout(() => {
      tile.classList.add('shimmer');
      setTimeout(() => tile.classList.remove('shimmer'), 1100);
    }, i * 100);
  });
}

// ===== RENDER LIST =====
// Ganti d.emoji → <iconify-icon> (d.icon + d.iconColor + d.iconBg)
// Ganti cfg.icon (emoji) → <iconify-icon> dalam status-pill
// Ganti 📅 tanggal meta → <iconify-icon>
// Semua HTML struktur lain identik asli
function renderList() {
  const container = document.getElementById('listPendaftaran');
  const empty     = document.getElementById('emptyState');

  let filtered = activeFilter === 'all'
    ? allData
    : allData.filter(d => {
        if (activeFilter === 'ditolak') return IS_REJECTED.includes(d.status);
        return d.status === activeFilter;
      });

  if (!filtered.length) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  container.innerHTML = filtered.map(d => {
    const cfg     = STATUS_CFG[d.status] || STATUS_CFG.menunggu_verifikasi;
    const tgl     = formatTanggal(d.tanggal_daftar);
    const isReject = IS_REJECTED.includes(d.status);
    const progress = buildProgressHTML(d.status);

    return `
    <div class="pend-card" data-id="${d.id}">
      <div class="pend-emoji" style="background:${d.iconBg}">
        <iconify-icon icon="${d.icon}" width="28" style="color:${d.iconColor}"></iconify-icon>
      </div>
      <div class="pend-main">
        <div class="pend-top">
          <div>
            <div class="pend-nama">${d.beasiswa.nama_program}</div>
            <div class="pend-sponsor">${d.beasiswa.sponsors.nama_perusahaan} · ${d.beasiswa.sponsors.industri}</div>
          </div>
          <span class="status-pill ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="12" style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"></iconify-icon>
            ${cfg.label}
          </span>
        </div>
        ${!isReject ? progress : ''}
        <div class="pend-meta">
          <span class="pend-tanggal">
            <iconify-icon icon="solar:calendar-bold-duotone" width="13" style="vertical-align:middle;margin-right:3px;color:#64748b"></iconify-icon>
            Daftar: ${tgl}
          </span>
          ${isReject ? `<span class="status-pill ${cfg.cls}" style="font-size:10px;">Ditolak</span>` : ''}
        </div>
      </div>
      <div class="pend-actions">
        <button class="btn-detail" data-id="${d.id}">Lihat Detail</button>
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('.pend-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });
  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openDetail(btn.dataset.id); });
  });
}

function buildProgressHTML(status) {
  const idx      = TAHAPAN_IDX[status] ?? 0;
  const isReject = IS_REJECTED.includes(status);
  return `
  <div class="progress-track">
    ${TAHAPAN.map((t, i) => {
      let cls = 'pending';
      if (isReject && i === idx) cls = 'rejected';
      else if (i < idx)          cls = 'done';
      else if (i === idx)        cls = 'active';
      const icon = cls === 'done' ? '✓' : (cls === 'rejected' ? '✕' : (cls === 'active' ? '●' : ''));
      return `
      <div class="progress-step ${cls}">
        <div class="step-dot">${icon}</div>
        <div class="step-label">${t.label}</div>
      </div>`;
    }).join('')}
  </div>`;
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
// Ganti d.emoji → <iconify-icon> di modal head
// Ganti cfg.icon → <iconify-icon> di status-pill modal
// Ganti 📄 dok-icon → <iconify-icon>
// Ganti ✓ ✕ ⏳ di dok-status → Iconify
// Semua HTML struktur lain identik asli
const modal = document.getElementById('modalDetail');

function openDetail(id) {
  const d = allData.find(x => x.id === id);
  if (!d) return;

  const cfg = STATUS_CFG[d.status] || STATUS_CFG.menunggu_verifikasi;

  document.getElementById('modalHead').innerHTML = `
    <div class="modal-head-emoji" style="background:${d.iconBg}">
      <iconify-icon icon="${d.icon}" width="36" style="color:${d.iconColor}"></iconify-icon>
    </div>
    <div class="modal-head-nama">${d.beasiswa.nama_program}</div>
    <div class="modal-head-sub">
      <span>${d.beasiswa.sponsors.nama_perusahaan}</span>
      <span class="status-pill ${cfg.cls}">
        <iconify-icon icon="${cfg.icon}" width="12" style="color:${cfg.iconColor};vertical-align:middle;margin-right:3px"></iconify-icon>
        ${cfg.label}
      </span>
    </div>`;

  document.getElementById('modalTimeline').innerHTML = buildTimelineHTML(d);

  document.getElementById('modalInfoGrid').innerHTML = `
    <div class="info-item"><div class="info-label">Tanggal Daftar</div><div class="info-val">${formatTanggal(d.tanggal_daftar)}</div></div>
    <div class="info-item"><div class="info-label">Terakhir Update</div><div class="info-val">${formatTanggal(d.updated_at)}</div></div>
    <div class="info-item"><div class="info-label">Nominal Dana</div><div class="info-val">${formatRupiah(d.beasiswa.nominal_dana)}</div></div>
    <div class="info-item"><div class="info-label">Kuota Penerima</div><div class="info-val">${d.beasiswa.kuota_penerima} orang</div></div>`;

  const jenisLabel = {
    sertifikat_prestasi: 'Sertifikat Prestasi',
    sertifikat_bahasa:   'Sertifikat Bahasa Asing',
    berkas_pendukung:    'Berkas Pendukung',
  };
  document.getElementById('modalDokumen').innerHTML = d.dokumen.map(dok => {
    const stsCls  = dok.status === 'verified' ? 'dok-ok' : (dok.status === 'rejected' ? '' : 'dok-pending');
    let stsHTML;
    if (dok.status === 'verified') {
      stsHTML = `<span class="dok-status dok-ok"><iconify-icon icon="solar:check-circle-bold-duotone" width="12" style="vertical-align:middle;margin-right:3px;color:#059669"></iconify-icon>Terverifikasi</span>`;
    } else if (dok.status === 'rejected') {
      stsHTML = `<span class="dok-status"><iconify-icon icon="solar:close-circle-bold-duotone" width="12" style="vertical-align:middle;margin-right:3px;color:#be123c"></iconify-icon>Ditolak</span>`;
    } else {
      stsHTML = `<span class="dok-status dok-pending"><iconify-icon icon="solar:clock-circle-bold-duotone" width="12" style="vertical-align:middle;margin-right:3px;color:#d97706"></iconify-icon>Menunggu</span>`;
    }
    return `
    <div class="dok-item">
      <div class="dok-icon">
        <iconify-icon icon="solar:document-bold-duotone" width="20" style="color:#2563eb"></iconify-icon>
      </div>
      <div class="dok-info">
        <div class="dok-nama">${dok.nama_file}</div>
        <div class="dok-jenis">${jenisLabel[dok.jenis_dokumen] || dok.jenis_dokumen}</div>
      </div>
      ${stsHTML}
    </div>`;
  }).join('');

  const hs = d.hasil_seleksi;
  const sectionHasil = document.getElementById('sectionHasil');
  if (hs && (hs.nilai_tes || hs.nilai_wawancara)) {
    sectionHasil.style.display = 'block';
    document.getElementById('modalHasil').innerHTML = `
      <div class="hasil-item"><div class="hasil-label">Nilai Tes</div><div class="hasil-val">${hs.nilai_tes ?? '—'}</div></div>
      <div class="hasil-item"><div class="hasil-label">Nilai Wawancara</div><div class="hasil-val">${hs.nilai_wawancara ?? '—'}</div></div>`;
  } else {
    sectionHasil.style.display = 'none';
  }

  const sectionCatatan = document.getElementById('sectionCatatan');
  if (hs?.catatan_staff) {
    sectionCatatan.style.display = 'block';
    document.getElementById('modalCatatan').textContent = hs.catatan_staff;
  } else {
    sectionCatatan.style.display = 'none';
  }

  openModal();
}

function buildTimelineHTML(d) {
  const idx      = TAHAPAN_IDX[d.status] ?? 0;
  const isReject = IS_REJECTED.includes(d.status);

  const allSteps = [
    { key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
    ...(isReject && d.status === 'ditolak_berkas'
      ? [{ key: 'ditolak_berkas', label: 'Ditolak Berkas' }]
      : [{ key: 'lolos_berkas', label: 'Lolos Berkas' }]),
    { key: 'wawancara', label: 'Wawancara' },
    ...(isReject && d.status === 'tidak_lolos_final'
      ? [{ key: 'tidak_lolos_final', label: 'Tidak Lolos Final' }]
      : [{ key: 'lolos_final', label: 'Lolos Final' }]),
  ];

  return allSteps.map((step) => {
    const tlEntry  = d.timeline?.find(t => t.step === step.key);
    const isDone   = tlEntry && !IS_REJECTED.includes(step.key);
    const isActive = step.key === d.status;
    const isRej    = IS_REJECTED.includes(step.key) && step.key === d.status;
    const isPend   = !tlEntry;

    let cls = isPend ? 'pending' : (isRej ? 'rejected' : (isActive && !isDone ? 'active' : 'done'));
    const icon = cls === 'done' ? '✓' : (cls === 'rejected' ? '✕' : (cls === 'active' ? '●' : '○'));

    return `
    <div class="tl-item ${cls}">
      <div class="tl-line"></div>
      <div class="tl-icon">${icon}</div>
      <div class="tl-content">
        <div class="tl-title">${step.label}</div>
        ${tlEntry ? `<div class="tl-time">${formatTanggal(tlEntry.tanggal)}</div>` : '<div class="tl-time">Belum tercapai</div>'}
        ${tlEntry?.catatan ? `<div class="tl-note">${tlEntry.catatan}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ===== MODAL OPEN/CLOSE =====
function openModal() {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}
document.getElementById('modalOverlay')?.addEventListener('click', closeModal);
document.getElementById('modalClose')?.addEventListener('click',   closeModal);
document.getElementById('btnCloseModal')?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

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

// ===== NAVBAR SCROLL =====
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }, { passive: true });
}
initNavbarScroll();

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

// ===== UTILS =====
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
}
function formatRupiah(num) { return 'Rp ' + num.toLocaleString('id-ID'); }

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
    ['solar:diploma-bold-duotone',           'rgba(37,99,235,0.55)'],
    ['solar:book-2-bold-duotone',            'rgba(99,102,241,0.50)'],
    ['solar:pen-bold-duotone',               'rgba(139,92,246,0.48)'],
    ['solar:cup-star-bold-duotone',          'rgba(245,158,11,0.55)'],
    ['solar:star-bold-duotone',              'rgba(245,158,11,0.50)'],
    ['solar:document-text-bold-duotone',     'rgba(37,99,235,0.48)'],
    ['solar:target-bold-duotone',            'rgba(16,185,129,0.50)'],
    ['solar:lightbulb-bold-duotone',         'rgba(245,158,11,0.55)'],
    ['solar:microscope-bold-duotone',        'rgba(16,185,129,0.48)'],
    ['solar:graduation-cap-bold-duotone',    'rgba(37,99,235,0.52)'],
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

// ===== SCROLL REVEAL =====
function initScrollReveal() {
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
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.06}s`;
    observer.observe(el);
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  initNotifBadge();
  loadData();
  setTimeout(initScrollReveal, 80);
  console.log('📋 pendaftaranSaya.js loaded — user:', demoSession?.nama_lengkap);
});