/* =================================================================
   DAFTAR BEASISWA — JAVASCRIPT (Self-Contained)
   BeasiswaKampus — Mahasiswa Portal
   Ikon: Iconify (iconify-icon web component)
   CATATAN: Hanya field emoji di data & render diganti Iconify.
            Semua fungsi, logika, struktur identik asli.
   ================================================================= */


/* =================================================================
   1. CONFIGURATION & CONSTANTS
   ================================================================= */


/* =================================================================
   2. SESSION MANAGEMENT
   ================================================================= */
function getSession() {
  const raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return raw ? JSON.parse(raw) : null;
}

const session = getSession();

// Redirect kalau bukan mahasiswa (PRODUCTION)
// Comment baris di bawah saat development di browser tanpa sesi.
if (!session || session.role !== 'mahasiswa') {
  window.location.href = '../LOGIN/login.html';
}

const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));


/* =================================================================
   3. DATA — field emoji diganti: icon + iconColor + emoji_bg tetap
   ================================================================= */
let beasiswaList = [
  {
    id: 'b-001',
    nama_program: 'Beasiswa Mandiri Prestasi',
    sponsor_nama: 'Bank Mandiri',
    sponsor_industri: 'Perbankan',
    kuota_penerima: 25,
    kategori: 'prestasi',
    nominal_dana: 5000000,
    tanggal_buka:  '2026-03-01',
    tanggal_tutup: '2026-07-31',
    deskripsi:
      'Beasiswa untuk mahasiswa berprestasi dengan IPK minimum 3.50. ' +
      'Program ini memberikan dukungan finansial penuh selama 1 tahun akademik.',
    persyaratan: [
      'IPK minimal 3.50',
      'Mahasiswa aktif semester 3–7',
      'Sertifikat prestasi akademik/non-akademik',
      'Surat rekomendasi dosen',
      'Tidak sedang menerima beasiswa lain',
    ],
    icon: 'solar:cup-star-bold-duotone',
    iconColor: '#d97706',
    accent: '#fbbf24',
    emoji_bg: '#fef3c7',
  },
  {
    id: 'b-002',
    nama_program: 'Pertamina Sobat Bumi',
    sponsor_nama: 'Pertamina',
    sponsor_industri: 'Energi',
    kuota_penerima: 15,
    kategori: 'riset',
    nominal_dana: 7500000,
    tanggal_buka:  '2026-04-01',
    tanggal_tutup: '2026-07-15',
    deskripsi:
      'Beasiswa riset bidang energi terbarukan dan lingkungan hidup. ' +
      'Ditujukan untuk mahasiswa yang aktif dalam penelitian energi berkelanjutan.',
    persyaratan: [
      'IPK minimal 3.30',
      'Mahasiswa teknik/sains semester 5–8',
      'Proposal riset energi terbarukan',
      'Sertifikat TOEFL min. 450',
      'Surat keterangan aktif',
    ],
    icon: 'solar:globus-bold-duotone',
    iconColor: '#059669',
    accent: '#fb7185',
    emoji_bg: '#fee2e2',
  },
  {
    id: 'b-003',
    nama_program: 'Beasiswa Djarum Plus',
    sponsor_nama: 'Djarum Foundation',
    sponsor_industri: 'Pendidikan',
    kuota_penerima: 30,
    kategori: 'prestasi',
    nominal_dana: 6000000,
    tanggal_buka:  '2026-03-15',
    tanggal_tutup: '2026-08-15',
    deskripsi:
      'Pelatihan soft skills intensif + dana pendidikan selama 1 tahun penuh. ' +
      'Program unggulan dengan jejaring alumni nasional yang kuat.',
    persyaratan: [
      'IPK minimal 3.20',
      'Aktif organisasi kampus',
      'Lolos seleksi soft skills test',
      'Surat rekomendasi ketua jurusan',
      'Esai motivasi 500 kata',
    ],
    icon: 'solar:star-bold-duotone',
    iconColor: '#f59e0b',
    accent: '#f59e0b',
    emoji_bg: '#fef3c7',
  },
  {
    id: 'b-004',
    nama_program: 'Telkom Digital Talent',
    sponsor_nama: 'Telkom Indonesia',
    sponsor_industri: 'Telekomunikasi',
    kuota_penerima: 20,
    kategori: 'industri',
    nominal_dana: 4500000,
    tanggal_buka:  '2026-05-01',
    tanggal_tutup: '2026-08-01',
    deskripsi:
      'Untuk mahasiswa IT/Telekomunikasi dengan minat pengembangan digital. ' +
      'Peluang magang di Telkom Group setelah lulus seleksi.',
    persyaratan: [
      'IPK minimal 3.00',
      'Jurusan Informatika/Teknik Elektro/Sistem Informasi',
      'Sertifikat kursus digital (opsional)',
      'CV dan portofolio proyek',
      'Lulus tes kompetensi digital',
    ],
    icon: 'solar:laptop-bold-duotone',
    iconColor: '#2563eb',
    accent: '#ef4444',
    emoji_bg: '#fee2e2',
  },
  {
    id: 'b-005',
    nama_program: 'Beasiswa BCA Finance',
    sponsor_nama: 'BCA',
    sponsor_industri: 'Perbankan',
    kuota_penerima: 18,
    kategori: 'industri',
    nominal_dana: 5500000,
    tanggal_buka:  '2026-04-15',
    tanggal_tutup: '2026-07-20',
    deskripsi:
      'Khusus mahasiswa Ekonomi, Akuntansi, dan Manajemen Keuangan. ' +
      'Termasuk program mentoring dari profesional BCA.',
    persyaratan: [
      'IPK minimal 3.30',
      'Jurusan Ekonomi/Akuntansi/Manajemen',
      'Sertifikat keahlian keuangan (nilai plus)',
      'Tidak sedang berkarir part-time perbankan lain',
      'Surat rekomendasi fakultas',
    ],
    icon: 'solar:wallet-money-bold-duotone',
    iconColor: '#2563eb',
    accent: '#3b82f6',
    emoji_bg: '#dbeafe',
  },
  {
    id: 'b-006',
    nama_program: 'Beasiswa Afirmasi 3T',
    sponsor_nama: 'Djarum Foundation',
    sponsor_industri: 'Pendidikan',
    kuota_penerima: 40,
    kategori: 'afirmasi',
    nominal_dana: 4000000,
    tanggal_buka:  '2026-03-01',
    tanggal_tutup: '2026-09-01',
    deskripsi:
      'Untuk mahasiswa dari daerah Terdepan, Terluar, dan Tertinggal Indonesia. ' +
      'Tidak ada syarat IPK minimum — fokus pada potensi dan semangat.',
    persyaratan: [
      'Berasal dari daerah 3T (dibuktikan KTP)',
      'Surat keterangan keluarga tidak mampu',
      'Surat rekomendasi kepala desa/lurah',
      'Aktif kuliah semester berjalan',
      'Tidak sedang menerima beasiswa pemerintah lain',
    ],
    icon: 'solar:leaf-bold-duotone',
    iconColor: '#10b981',
    accent: '#10b981',
    emoji_bg: '#d1fae5',
  },
  {
    id: 'b-007',
    nama_program: 'Astra Future Leader',
    sponsor_nama: 'Astra International',
    sponsor_industri: 'Otomotif',
    kuota_penerima: 12,
    kategori: 'prestasi',
    nominal_dana: 10000000,
    tanggal_buka:  '2026-04-01',
    tanggal_tutup: '2026-06-30',
    deskripsi:
      'Program pengembangan kepemimpinan + ikatan dinas pasca lulus di Astra Group. ' +
      'Beasiswa bergengsi dengan nilai terbesar.',
    persyaratan: [
      'IPK minimal 3.50',
      'Pengalaman kepemimpinan organisasi',
      'Sertifikat TOEFL min. 500',
      'Lulus assessment center Astra',
      'Bersedia ikatan dinas 2 tahun',
    ],
    icon: 'solar:rocket-bold-duotone',
    iconColor: '#10b981',
    accent: '#34d399',
    emoji_bg: '#d1fae5',
  },
  {
    id: 'b-008',
    nama_program: 'Garuda Aviation Scholar',
    sponsor_nama: 'Garuda Indonesia',
    sponsor_industri: 'Penerbangan',
    kuota_penerima: 8,
    kategori: 'industri',
    nominal_dana: 8000000,
    tanggal_buka:  '2026-05-15',
    tanggal_tutup: '2026-08-30',
    deskripsi:
      'Beasiswa untuk teknik penerbangan dan manajemen aviasi. ' +
      'Kesempatan kunjungan industri ke fasilitas Garuda Indonesia.',
    persyaratan: [
      'IPK minimal 3.20',
      'Jurusan Teknik Penerbangan/Manajemen Transportasi',
      'Bebas buta warna',
      'Sertifikat bahasa Inggris aktif',
      'Lulus tes psikologi',
    ],
    icon: 'solar:plain-bold-duotone',
    iconColor: '#06b6d4',
    accent: '#06b6d4',
    emoji_bg: '#cffafe',
  },
  {
    id: 'b-009',
    nama_program: 'Unilever Bright Future',
    sponsor_nama: 'Unilever',
    sponsor_industri: 'FMCG',
    kuota_penerima: 22,
    kategori: 'riset',
    nominal_dana: 6500000,
    tanggal_buka:  '2026-04-01',
    tanggal_tutup: '2026-07-31',
    deskripsi:
      'Riset di bidang sustainability dan consumer goods inovatif. ' +
      'Kolaborasi penelitian dengan lab R&D Unilever Indonesia.',
    persyaratan: [
      'IPK minimal 3.20',
      'Jurusan Kimia/Teknik Kimia/Biologi/Farmasi',
      'Proposal riset terkait sustainability',
      'Sertifikat TOEFL min. 450',
      'Rekomendasi dosen pembimbing',
    ],
    icon: 'solar:microscope-bold-duotone',
    iconColor: '#8b5cf6',
    accent: '#8b5cf6',
    emoji_bg: '#ede9fe',
  },
];


/* Jumlah pendaftaran yang sedang diproses — dipakai untuk badge
   "Pendaftaran Saya" di navbar, sama seperti di dashboard.js.
   TODO: ganti dengan hitungan asli dari data pendaftaran saat sudah
   terhubung ke backend. */
const dummyPendaftaranProses = 2;

/* Jumlah notifikasi belum dibaca — dipakai untuk titik merah di lonceng
   notifikasi & badge di dropdown profil, sama seperti di dashboard.js.
   TODO: ganti dengan hitungan asli dari data notifikasi saat sudah
   terhubung ke backend. */
const dummyNotifUnread = 2;


/* =================================================================
   3B. BACKEND WIRING — GET /api/beasiswa + GET /api/pendaftaran/saya
   Kategori asli di database bebas teks (bisa null), jadi icon/warna
   kartu dipetakan dari kategori dengan fallback generik.
   ================================================================= */
const KATEGORI_ICON = {
  prestasi: { icon: 'solar:cup-star-bold-duotone',   iconColor: '#d97706', accent: '#fbbf24', emoji_bg: '#fef3c7' },
  riset:    { icon: 'solar:microscope-bold-duotone',  iconColor: '#8b5cf6', accent: '#8b5cf6', emoji_bg: '#ede9fe' },
  industri: { icon: 'solar:case-bold-duotone',        iconColor: '#2563eb', accent: '#3b82f6', emoji_bg: '#dbeafe' },
  afirmasi: { icon: 'solar:leaf-bold-duotone',         iconColor: '#10b981', accent: '#10b981', emoji_bg: '#d1fae5' },
};
const KATEGORI_DEFAULT = { icon: 'solar:medal-ribbons-star-bold-duotone', iconColor: '#2563eb', accent: '#3b82f6', emoji_bg: '#dbeafe' };

function mapBeasiswaFromApi(b) {
  const style = KATEGORI_ICON[b.kategori] || KATEGORI_DEFAULT;
  return {
    id: b.id,
    nama_program: b.nama_program,
    sponsor_nama: b.sponsors?.nama_perusahaan || 'Sponsor belum ditentukan',
    sponsor_industri: b.sponsors?.jenis_industri || '—',
    kuota_penerima: b.kuota ?? 0,
    kategori: b.kategori || 'lainnya',
    nominal_dana: b.nominal_dana ?? 0,
    tanggal_buka: b.tanggal_buka,
    tanggal_tutup: b.tanggal_tutup,
    deskripsi: b.deskripsi || 'Belum ada deskripsi untuk program ini.',
    persyaratan: b.persyaratan?.length ? b.persyaratan : ['Persyaratan menyusul, hubungi bagian beasiswa.'],
    ...style,
  };
}

/* Jumlah pendaftaran berstatus "sedang diproses" — diisi ulang oleh
   loadBeasiswaData() dari data /pendaftaran/saya yang sama, supaya badge
   "Pendaftaran Saya" konsisten dengan dashboard.js/pendaftaranSaya.js/
   historyBeasiswa.js (bukan lagi hardcode). */
let pendaftaranProsesReal = null;

/* Lonceng notifikasi — hitungan asli (sinkron dengan dashboard.js/
   notifikasi.js), bukan dummyNotifUnread yang selalu nyala. */
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

/** Ganti data contoh dengan data asli backend kalau sesi login-nya nyata. */
async function loadBeasiswaData() {
  if (!isRealSession) return;
  try {
    const [beasiswaRes, pendaftaranRes] = await Promise.all([
      api.get('/beasiswa?status=aktif'),
      api.get('/pendaftaran/saya'),
    ]);

    beasiswaList = beasiswaRes.data.map(mapBeasiswaFromApi);
    pendaftaranRes.data.forEach(p => sudahDaftar.add(p.beasiswa_id));
    pendaftaranProsesReal = pendaftaranRes.data.filter(p =>
      ['menunggu_verifikasi', 'lolos_berkas', 'wawancara'].includes(p.status)
    ).length;
  } catch (err) {
    console.warn('Gagal memuat data beasiswa dari backend, pakai data contoh:', err);
  }
}

/* =================================================================
   4. STATE
   ================================================================= */
let sudahDaftar      = new Set();
let activeFilter     = 'all';
let searchQuery      = '';
let selectedBeasiswa = null;


/* =================================================================
   5. UTILITY FUNCTIONS
   ================================================================= */
function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function deadlineLabel(tanggalTutup) {
  const diff = Math.ceil(
    (new Date(tanggalTutup) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0)   return { text: 'Sudah tutup',              urgent: true };
  if (diff === 0) return { text: 'Tutup hari ini!',          urgent: true };
  if (diff <= 7)  return { text: `Tutup ${diff} hari lagi`,  urgent: true };
  return { text: `Tutup ${formatTanggal(tanggalTutup)}`,     urgent: false };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Animasi angka berjalan naik/turun menuju nilai target */
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

/** Efek shimmer sekali jalan di stats-strip saat data selesai dimuat */
function triggerStatsShimmer() {
  const strip = document.querySelector('.stats-strip');
  if (!strip) return;
  strip.classList.add('shimmer');
  setTimeout(() => strip.classList.remove('shimmer'), 1100);
}


/* =================================================================
   6. USER INFO INITIALIZATION
   ================================================================= */
function initUserInfo() {
  const nama = session?.nama_lengkap || 'Mahasiswa';
  const nim  = session?.nim_nip      || '—';
  const init = nama.charAt(0).toUpperCase();

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('sidebarName',   nama);
  set('topbarAvatar',  init);
  set('sidebarAvatar', init);
  set('sidebarNim',    'NIM: ' + nim);
  set('mobileName',    nama);
}


/* =================================================================
   7. DAFTAR STATUS
   ================================================================= */
async function loadSudahDaftar() {
  // Diisi oleh loadBeasiswaData() (lihat bagian 3B) saat sesi asli;
  // di sini tinggal update tampilan strip.
  updateStripSudahDaftar();
}

function updateStripSudahDaftar() {
  animateNum('stripSudahDaftar', sudahDaftar.size);
}


/* =================================================================
   8. FILTER & SEARCH
   ================================================================= */
function getFilteredList() {
  return beasiswaList.filter(b => {
    const matchFilter = activeFilter === 'all' || b.kategori === activeFilter;
    const q           = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      b.nama_program.toLowerCase().includes(q) ||
      b.sponsor_nama.toLowerCase().includes(q) ||
      b.kategori.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
}

function initFilterSearch() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderGrid();
    });
  });

  document.getElementById('searchInput')?.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderGrid();
  });

  document.getElementById('btnReset')?.addEventListener('click', () => {
    searchQuery  = '';
    activeFilter = 'all';
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-tab[data-filter="all"]')?.classList.add('active');
    document.getElementById('searchInput').value = '';
    renderGrid();
  });
}


/* =================================================================
   9. GRID RENDERING
   Ganti ${b.emoji} → <iconify-icon> menggunakan b.icon & b.iconColor
   Ganti 📅 deadline & ✓ sudah daftar → Iconify
   Semua HTML struktur lain identik asli
   ================================================================= */
function renderGrid() {
  const grid  = document.getElementById('beasiswaGrid');
  const empty = document.getElementById('emptyState');
  const list  = getFilteredList();

  animateNum('stripTotal', list.length);

  if (!list.length) {
    grid.style.display  = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.style.display  = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = list.map(b => {
    const sudah    = sudahDaftar.has(b.id);
    const deadline = deadlineLabel(b.tanggal_tutup);
    return `
    <div
      class="beasiswa-card reveal"
      style="--accent:${b.accent};"
      data-id="${b.id}"
    >
      <div class="card-top">
        <div class="card-emoji" style="--emoji-bg:${b.emoji_bg};">
          <iconify-icon icon="${b.icon}" width="28" style="color:${b.iconColor}"></iconify-icon>
        </div>
        <div class="card-badges">
          <span class="badge-kuota">${b.kuota_penerima} kuota</span>
          <span class="badge-kategori kategori-${b.kategori}">${b.kategori}</span>
        </div>
      </div>
      <div class="card-nama">${b.nama_program}</div>
      <div class="card-sponsor">Sponsor: <strong>${b.sponsor_nama}</strong></div>
      <div class="card-desc">${b.deskripsi}</div>
      <div class="card-footer">
        <span class="card-deadline ${deadline.urgent ? 'urgent' : ''}">
          <iconify-icon icon="solar:calendar-bold-duotone" width="13" style="vertical-align:middle;margin-right:3px"></iconify-icon>${deadline.text}
        </span>
        <button class="btn-lihat ${sudah ? 'sudah-daftar' : ''}" data-id="${b.id}">
          ${sudah
            ? '<iconify-icon icon="solar:check-circle-bold-duotone" width="14" style="vertical-align:middle;margin-right:3px"></iconify-icon>Sudah Daftar'
            : 'Lihat Detail'}
        </button>
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('.btn-lihat').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openDetail(btn.dataset.id);
    });
  });

  document.querySelectorAll('.beasiswa-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
  });

  setTimeout(applyScrollReveal, 50);
}


/* =================================================================
  10. MODAL — OPEN / CLOSE / STEP NAVIGATION
   ================================================================= */
const modal      = () => document.getElementById('modalDaftar');
const stepDetail = () => document.getElementById('stepDetail');
const stepForm   = () => document.getElementById('stepForm');
const stepSukses = () => document.getElementById('stepSukses');

function openModal() {
  modal()?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
  modal()?.classList.remove('active');
  document.body.style.overflow = '';
  selectedBeasiswa = null;
}

function showStep(step) {
  stepDetail().style.display = step === 'detail' ? 'block' : 'none';
  stepForm().style.display   = step === 'form'   ? 'block' : 'none';
  stepSukses().style.display = step === 'sukses' ? 'block' : 'none';
  const box = document.getElementById('modalBox');
  if (box) box.scrollTop = 0;
}

function initModalControls() {
  document.getElementById('modalOverlay')?.addEventListener('click', closeModalHandler);
  document.getElementById('modalClose')?.addEventListener('click',   closeModalHandler);
  document.getElementById('btnBackStep')?.addEventListener('click',  () => showStep('detail'));
  document.getElementById('btnBatalForm')?.addEventListener('click', closeModalHandler);
  document.getElementById('btnTutupDetail')?.addEventListener('click', closeModalHandler);
  document.getElementById('btnTutupSukses')?.addEventListener('click', closeModalHandler);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModalHandler();
  });
}


/* =================================================================
  11. MODAL — DETAIL BEASISWA
   Ganti ${b.emoji} di modal header → <iconify-icon>
   ================================================================= */
function openDetail(id) {
  const b = beasiswaList.find(x => x.id === id);
  if (!b) return;

  selectedBeasiswa = b;

  document.getElementById('modalHeader').innerHTML = `
    <div class="modal-beasiswa-emoji">
      <iconify-icon icon="${b.icon}" width="40" style="color:${b.iconColor}"></iconify-icon>
    </div>
    <div class="modal-beasiswa-nama">${b.nama_program}</div>
    <div class="modal-beasiswa-sponsor">${b.sponsor_nama} · ${b.sponsor_industri}</div>
  `;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('detailSponsor',   b.sponsor_nama);
  set('detailKuota',     b.kuota_penerima + ' orang');
  set('detailNominal',   formatRupiah(b.nominal_dana) + ' / tahun');
  set('detailKategori',  b.kategori.charAt(0).toUpperCase() + b.kategori.slice(1));
  set('detailBuka',      formatTanggal(b.tanggal_buka));
  set('detailTutup',     formatTanggal(b.tanggal_tutup));
  set('detailDeskripsi', b.deskripsi);

  document.getElementById('detailPersyaratan').innerHTML =
    b.persyaratan.map(p => `<li>${p}</li>`).join('');

  const sudah = sudahDaftar.has(b.id);
  const btn   = document.getElementById('btnLanjutDaftar');
  btn.textContent = sudah ? '✓ Sudah Terdaftar' : 'Daftar Sekarang →';
  btn.disabled    = sudah;

  showStep('detail');
  openModal();
}

function initDetailLanjut() {
  document.getElementById('btnLanjutDaftar')?.addEventListener('click', () => {
    if (!selectedBeasiswa) return;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('formBeasiswaName', selectedBeasiswa.nama_program);
    set('formNama',  session?.nama_lengkap  || '—');
    set('formNim',   session?.nim_nip       || '—');
    set('formIpk',   session?.ipk           || '—');
    set('formProdi', session?.program_studi || '—');

    document.getElementById('formDaftar').reset();
    document.querySelectorAll('.file-upload').forEach(el => {
      el.classList.remove('has-file');
    });
    document.querySelectorAll('.upload-main').forEach((el, i) => {
      const defaults = [
        'Klik untuk upload atau drag & drop',
        'TOEFL / IELTS / lainnya',
        'KTP, KK, Surat Rekomendasi, dll.',
      ];
      el.textContent = defaults[i] || 'Klik untuk upload';
    });
    clearFormErrors();

    showStep('form');
  });
}


/* =================================================================
  12. FORM — SUBMIT + VALIDATION
   ================================================================= */
function showFormError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = '⚠ ' + msg;
}

function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
  });
}

function validateForm() {
  clearFormErrors();
  let valid = true;

  const sertif = document.getElementById('sertifikat_prestasi');
  const berkas = document.getElementById('berkas_pendukung');
  const agree  = document.getElementById('agreeCheck');

  if (!sertif.files.length) {
    showFormError('errSertifikat', 'Sertifikat prestasi wajib diupload');
    valid = false;
  }
  if (!berkas.files.length) {
    showFormError('errBerkas', 'Berkas pendukung wajib diupload');
    valid = false;
  }
  if (!agree.checked) {
    showFormError('errAgree', 'Centang pernyataan di atas untuk melanjutkan');
    valid = false;
  }

  return valid;
}

function setSubmitLoading(on) {
  const btn    = document.getElementById('btnSubmitDaftar');
  const text   = btn?.querySelector('.btn-text');
  const loader = document.getElementById('submitLoader');
  if (btn)    btn.disabled         = on;
  if (text)   text.style.display   = on ? 'none' : '';
  if (loader) loader.style.display = on ? 'flex'  : 'none';
}

/** Upload file yang dipilih user ke POST /api/dokumen/upload, satu per satu,
 * lalu kembalikan array metadata siap dikirim sebagai field `dokumen`
 * ke POST /api/pendaftaran. Input yang kosong (mis. sertifikat_bahasa
 * yang opsional) dilewati. */
async function uploadPendaftaranFiles() {
  const fields = [
    { id: 'sertifikat_prestasi', jenisDokumen: 'sertifikat_prestasi' },
    { id: 'sertifikat_bahasa',   jenisDokumen: 'sertifikat_bahasa' },
    { id: 'berkas_pendukung',    jenisDokumen: 'berkas_pendukung' },
  ];

  const dokumen = [];
  for (const { id, jenisDokumen } of fields) {
    const file = document.getElementById(id)?.files?.[0];
    if (!file) continue;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jenisDokumen', jenisDokumen);

    const res = await api.upload('/dokumen/upload', formData);
    dokumen.push(res.data);
  }
  return dokumen;
}

function initFormSubmit() {
  document.getElementById('formDaftar')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);

    try {
      if (isRealSession) {
        const dokumen = await uploadPendaftaranFiles();
        await api.post('/pendaftaran', { beasiswaId: selectedBeasiswa.id, dokumen });
      } else {
        await delay(1500);
      }

      sudahDaftar.add(selectedBeasiswa.id);
      updateStripSudahDaftar();
      renderGrid();

      document.getElementById('suksesBeasiswaName').textContent =
        selectedBeasiswa.nama_program;
      showStep('sukses');

    } catch (err) {
      console.error(err);
      alert(err?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitLoading(false);
    }
  });
}


/* =================================================================
  13. FILE UPLOAD FEEDBACK
   ================================================================= */
function initFileUploads() {
  document.querySelectorAll('.file-upload input[type="file"]').forEach(input => {
    input.addEventListener('change', e => {
      const label    = e.target.closest('.file-upload');
      const mainText = label.querySelector('.upload-main');
      const subText  = label.querySelector('.upload-sub');

      if (e.target.files.length > 0) {
        label.classList.add('has-file');
        mainText.textContent = '✓ ' + e.target.files[0].name;
        if (subText) {
          subText.textContent = (e.target.files[0].size / 1024).toFixed(0) + ' KB';
        }
      } else {
        label.classList.remove('has-file');
      }
    });
  });
}


/* =================================================================
  14. BACKGROUND ANIMATION — CANVAS
   ================================================================= */
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
    x:     Math.random() * window.innerWidth,
    y:     Math.random() * window.innerHeight,
    r:     100 + Math.random() * 160,
    dx:    (Math.random() - 0.5) * 0.3,
    dy:    (Math.random() - 0.5) * 0.3,
    hue:   210 + Math.random() * 30,
    alpha: 0.04 + Math.random() * 0.04,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    orbs.forEach(o => {
      o.x += o.dx;
      o.y += o.dy;

      if (o.x < -o.r)                o.x = canvas.width + o.r;
      if (o.x > canvas.width + o.r)  o.x = -o.r;
      if (o.y < -o.r)                o.y = canvas.height + o.r;
      if (o.y > canvas.height + o.r) o.y = -o.r;

      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grad.addColorStop(0, `hsla(${o.hue}, 80%, 60%, ${o.alpha})`);
      grad.addColorStop(1, `hsla(${o.hue}, 80%, 60%, 0)`);

      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}


/* =================================================================
  15. BACKGROUND ANIMATION — FLOATING PARTICLES
   Ganti emoji string → iconify-icon element
   Teknik & logika identik asli
   ================================================================= */
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


/* =================================================================
  16. NAVBAR SCROLL EFFECT
   ================================================================= */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 10) navbar.classList.add('scrolled');
    else                     navbar.classList.remove('scrolled');
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* =================================================================
  17. MOBILE NAVIGATION DRAWER
   ================================================================= */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');
  if (!hamburger || !mobileNav) return;

  function open() {
    mobileNav.classList.add('open');
    overlay?.classList.add('active');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    mobileNav.classList.remove('open');
    overlay?.classList.remove('active');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? close() : open();
  });

  overlay?.addEventListener('click', close);

  document.getElementById('mobileBtnLogout')?.addEventListener('click', () => {
    close();
    setTimeout(showLogoutModal, 220);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}


/* =================================================================
  18. LOGOUT MODAL
   ================================================================= */
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
}


/* =================================================================
  19. SCROLL REVEAL
   ================================================================= */
function applyScrollReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          /* Hapus transitionDelay setelah animasi masuk selesai,
             supaya hover sesudahnya tidak ikut kena delay */
          const delay = parseFloat(entry.target.style.transitionDelay || 0) * 1000;
          setTimeout(() => { entry.target.style.transitionDelay = '0s'; }, delay + 650);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 6) * 0.05}s`;
    observer.observe(el);
  });
}


/* =================================================================
  20. INITIALIZATION (DOMContentLoaded)
   ================================================================= */
document.addEventListener('DOMContentLoaded', async () => {

  initBgCanvas();
  initParticles();

  initUserInfo();
  await loadBeasiswaData();
  await loadSudahDaftar();

  renderGrid();

  const total = beasiswaList.reduce((a, b) => a + b.kuota_penerima, 0);
  animateNum('stripKuota', total);
  animateNum('heroBadgeNum', beasiswaList.length);

  const bp = document.getElementById('badgePendaftaran');
  const proses = pendaftaranProsesReal !== null ? pendaftaranProsesReal : dummyPendaftaranProses;
  if (bp && proses > 0) {
    bp.textContent = proses;
    bp.classList.add('show');
  }

  const notifDot = document.getElementById('notifDot');
  if (!isRealSession && notifDot && dummyNotifUnread > 0) notifDot.classList.add('show');

  const badgeNotif = document.getElementById('badgeNotif');
  if (!isRealSession && badgeNotif && dummyNotifUnread > 0) {
    badgeNotif.textContent = dummyNotifUnread;
    badgeNotif.classList.add('show');
  }
  updateNotifBadge();

  setTimeout(triggerStatsShimmer, 500);

  initFilterSearch();
  initModalControls();
  initDetailLanjut();
  initFormSubmit();
  initFileUploads();

  initNavbarScroll();
  initMobileNav();
  initLogout();

  setTimeout(applyScrollReveal, 80);

  console.log(
    '🎓 daftarBeasiswa.js loaded — user:',
    session?.nama_lengkap,
    '| beasiswa aktif:',
    beasiswaList.length
  );
});