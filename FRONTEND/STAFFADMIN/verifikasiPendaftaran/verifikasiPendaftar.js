/* ============================================================
   VERIFIKASIPENDAFTAR.JS — Beasiswa Kampus (Staff Admin)
   Folder  : verifikasiPendaftaran/
   Tabel   : pendaftaran, profiles, beasiswa, dokumen_pendaftaran
   Kolom pendaftaran :
     id, mahasiswa_id, beasiswa_id, status, tanggal_daftar,
     catatan_staff (nullable)
   Enum status (sinkron dengan pendaftaranSaya.js mahasiswa) :
     menunggu_verifikasi | lolos_berkas | ditolak_berkas |
     wawancara           | lolos_final  | tidak_lolos_final
   Kolom dokumen_pendaftaran :
     id, pendaftaran_id, jenis_dokumen, file_url, status
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

/* ============================================================
   SESSION
   ============================================================ */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}

const session = getSession();
if (!session || session.role !== 'staff') {
  // window.location.href = '../LOGIN/login.html';
}

const demoSession = session || {
  nama_lengkap : 'Rangga Adi Nugroho',
  role         : 'staff',
  id           : 'demo-staff-uuid',
};

/* ============================================================
   DUMMY DATA — pendaftaran
   Field name identik dengan pendaftaranSaya.js mahasiswa:
     id, mahasiswa_id, beasiswa_id, status, tanggal_daftar
   JOIN profiles → mahasiswa.nama_lengkap, nim_nip, program_studi
   JOIN beasiswa  → nama_program, sponsors.nama_perusahaan
   JOIN dokumen_pendaftaran → jenis_dokumen, file_url, status
   ============================================================ */
let dummyPendaftaran = [
  {
    id             : 'p-101',
    mahasiswa_id   : 'u-001',
    beasiswa_id    : 'b-001',
    status         : 'menunggu_verifikasi',
    tanggal_daftar : '2026-06-18T07:30:00Z',
    catatan_staff  : null,
    /* JOIN profiles */
    mahasiswa: {
      nama_lengkap   : 'Adinda Putri Lestari',
      nim_nip        : '2022310011',
      program_studi  : 'Teknik Informatika',
      ipk            : 3.82,
    },
    /* JOIN beasiswa + sponsors */
    beasiswa: {
      nama_program   : 'Beasiswa Mandiri Prestasi',
      nominal_dana   : 5000000,
      sponsors       : { nama_perusahaan: 'Bank Mandiri' },
    },
    /* JOIN dokumen_pendaftaran */
    dokumen_pendaftaran: [
      { id:'dk-001', jenis_dokumen:'KTP',              file_url:'#', status:'ada' },
      { id:'dk-002', jenis_dokumen:'KTM',              file_url:'#', status:'ada' },
      { id:'dk-003', jenis_dokumen:'Transkrip Nilai',  file_url:'#', status:'ada' },
      { id:'dk-004', jenis_dokumen:'Surat Rekomendasi',file_url:'#', status:'ada' },
      { id:'dk-005', jenis_dokumen:'Foto 3x4',         file_url:null,status:'missing' },
    ],
  },
  {
    id             : 'p-102',
    mahasiswa_id   : 'u-002',
    beasiswa_id    : 'b-004',
    status         : 'menunggu_verifikasi',
    tanggal_daftar : '2026-06-18T06:10:00Z',
    catatan_staff  : null,
    mahasiswa: {
      nama_lengkap  : 'Cahaya Nur Aisyah',
      nim_nip       : '2021220032',
      program_studi : 'Akuntansi',
      ipk           : 3.75,
    },
    beasiswa: {
      nama_program  : 'Beasiswa Djarum Plus',
      nominal_dana  : 6000000,
      sponsors      : { nama_perusahaan: 'Djarum Foundation' },
    },
    dokumen_pendaftaran: [
      { id:'dk-011', jenis_dokumen:'KTP',               file_url:'#', status:'ada' },
      { id:'dk-012', jenis_dokumen:'KTM',               file_url:'#', status:'ada' },
      { id:'dk-013', jenis_dokumen:'Transkrip Nilai',   file_url:'#', status:'ada' },
      { id:'dk-014', jenis_dokumen:'Surat Rekomendasi', file_url:null,status:'missing' },
      { id:'dk-015', jenis_dokumen:'Foto 3x4',          file_url:'#', status:'ada' },
    ],
  },
  {
    id             : 'p-103',
    mahasiswa_id   : 'u-003',
    beasiswa_id    : 'b-002',
    status         : 'menunggu_verifikasi',
    tanggal_daftar : '2026-06-17T15:45:00Z',
    catatan_staff  : null,
    mahasiswa: {
      nama_lengkap  : 'Dimas Surya Atmaja',
      nim_nip       : '2020130021',
      program_studi : 'Teknik Elektro',
      ipk           : 3.91,
    },
    beasiswa: {
      nama_program  : 'Pertamina Sobat Bumi',
      nominal_dana  : 7500000,
      sponsors      : { nama_perusahaan: 'Pertamina' },
    },
    dokumen_pendaftaran: [
      { id:'dk-021', jenis_dokumen:'KTP',               file_url:'#', status:'ada' },
      { id:'dk-022', jenis_dokumen:'KTM',               file_url:'#', status:'ada' },
      { id:'dk-023', jenis_dokumen:'Transkrip Nilai',   file_url:'#', status:'ada' },
      { id:'dk-024', jenis_dokumen:'Surat Rekomendasi', file_url:'#', status:'ada' },
      { id:'dk-025', jenis_dokumen:'Foto 3x4',          file_url:'#', status:'ada' },
    ],
  },
  {
    id             : 'p-104',
    mahasiswa_id   : 'u-004',
    beasiswa_id    : 'b-006',
    status         : 'menunggu_verifikasi',
    tanggal_daftar : '2026-06-17T11:20:00Z',
    catatan_staff  : null,
    mahasiswa: {
      nama_lengkap  : 'Bagas Pratama Wijaya',
      nim_nip       : '2021410043',
      program_studi : 'Manajemen',
      ipk           : 3.65,
    },
    beasiswa: {
      nama_program  : 'BCA Finance Excellence',
      nominal_dana  : 5000000,
      sponsors      : { nama_perusahaan: 'BCA' },
    },
    dokumen_pendaftaran: [
      { id:'dk-031', jenis_dokumen:'KTP',               file_url:'#',  status:'ada' },
      { id:'dk-032', jenis_dokumen:'KTM',               file_url:null, status:'missing' },
      { id:'dk-033', jenis_dokumen:'Transkrip Nilai',   file_url:null, status:'missing' },
      { id:'dk-034', jenis_dokumen:'Surat Rekomendasi', file_url:'#',  status:'ada' },
      { id:'dk-035', jenis_dokumen:'Foto 3x4',          file_url:'#',  status:'ada' },
    ],
  },
  {
    id             : 'p-105',
    mahasiswa_id   : 'u-005',
    beasiswa_id    : 'b-003',
    status         : 'lolos_berkas',
    tanggal_daftar : '2026-06-15T09:00:00Z',
    catatan_staff  : 'Semua dokumen lengkap dan valid.',
    mahasiswa: {
      nama_lengkap  : 'Elisa Rahayu Putri',
      nim_nip       : '2022510017',
      program_studi : 'Sistem Informasi',
      ipk           : 3.88,
    },
    beasiswa: {
      nama_program  : 'Telkom Digital Talent',
      nominal_dana  : 4500000,
      sponsors      : { nama_perusahaan: 'Telkom Indonesia' },
    },
    dokumen_pendaftaran: [
      { id:'dk-041', jenis_dokumen:'KTP',               file_url:'#', status:'ada' },
      { id:'dk-042', jenis_dokumen:'KTM',               file_url:'#', status:'ada' },
      { id:'dk-043', jenis_dokumen:'Transkrip Nilai',   file_url:'#', status:'ada' },
      { id:'dk-044', jenis_dokumen:'Surat Rekomendasi', file_url:'#', status:'ada' },
      { id:'dk-045', jenis_dokumen:'Foto 3x4',          file_url:'#', status:'ada' },
    ],
  },
  {
    id             : 'p-106',
    mahasiswa_id   : 'u-006',
    beasiswa_id    : 'b-001',
    status         : 'ditolak_berkas',
    tanggal_daftar : '2026-06-14T14:00:00Z',
    catatan_staff  : 'Transkrip nilai tidak sesuai, IPK di bawah syarat minimum 3.50.',
    mahasiswa: {
      nama_lengkap  : 'Farhan Rizki Maulana',
      nim_nip       : '2023110029',
      program_studi : 'Teknik Industri',
      ipk           : 3.21,
    },
    beasiswa: {
      nama_program  : 'Beasiswa Mandiri Prestasi',
      nominal_dana  : 5000000,
      sponsors      : { nama_perusahaan: 'Bank Mandiri' },
    },
    dokumen_pendaftaran: [
      { id:'dk-051', jenis_dokumen:'KTP',               file_url:'#',  status:'ada' },
      { id:'dk-052', jenis_dokumen:'KTM',               file_url:'#',  status:'ada' },
      { id:'dk-053', jenis_dokumen:'Transkrip Nilai',   file_url:'#',  status:'ada' },
      { id:'dk-054', jenis_dokumen:'Surat Rekomendasi', file_url:null, status:'missing' },
      { id:'dk-055', jenis_dokumen:'Foto 3x4',          file_url:'#',  status:'ada' },
    ],
  },
];

/* ============================================================
   STATUS CONFIG — sinkron dengan pendaftaranSaya.js mahasiswa
   ============================================================ */
const STATUS_CFG = {
  menunggu_verifikasi : {
    label  : 'Menunggu Verifikasi',
    cls    : 'status-menunggu',
    accent : '#d97706',
    icon   : 'solar:inbox-in-bold-duotone',
  },
  lolos_berkas : {
    label  : 'Lolos Berkas',
    cls    : 'status-lolos',
    accent : '#2563eb',
    icon   : 'solar:check-circle-bold-duotone',
  },
  ditolak_berkas : {
    label  : 'Ditolak Berkas',
    cls    : 'status-ditolak',
    accent : '#be123c',
    icon   : 'solar:close-circle-bold-duotone',
  },
  wawancara : {
    label  : 'Wawancara',
    cls    : 'status-wawancara',
    accent : '#7c3aed',
    icon   : 'solar:microphone-bold-duotone',
  },
  lolos_final : {
    label  : 'Lolos Final',
    cls    : 'status-final',
    accent : '#059669',
    icon   : 'solar:cup-star-bold-duotone',
  },
  tidak_lolos_final : {
    label  : 'Tidak Lolos',
    cls    : 'status-ditolak',
    accent : '#be123c',
    icon   : 'solar:close-circle-bold-duotone',
  },
};

/* ============================================================
   STATE
   ============================================================ */
let activeStatusFilter  = 'menunggu_verifikasi';
let activeBeasiswaFilter = 'all';
let searchQuery          = '';
let pendingAksi          = null; /* { pendaftaranId, aksi: 'setuju'|'tolak' } */
let openDetailId         = null;

/* ============================================================
   UTILS
   ============================================================ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatRupiah(num) {
  return 'Rp ' + (num / 1000000).toLocaleString('id-ID') + ' jt';
}

function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', {
    day   : 'numeric',
    month : 'short',
    year  : 'numeric',
  });
}

function timeAgo(str) {
  const diff = Date.now() - new Date(str).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1)  return 'baru saja';
  if (m < 60) return m + ' menit lalu';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' jam lalu';
  return Math.floor(h / 24) + ' hari lalu';
}

function inisial(nama) {
  return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur    = 0;
  const step = Math.max(1, Math.ceil(target / 22));
  const t    = setInterval(() => {
    cur += step;
    if (cur >= target) { el.textContent = target; clearInterval(t); }
    else el.textContent = cur;
  }, 35);
}

/* ============================================================
   USER INFO
   ============================================================ */
function initUserInfo() {
  const nama = demoSession?.nama_lengkap || 'Staff Admin';
  const init = nama.charAt(0).toUpperCase();
  setEl('sidebarName',   nama);
  setEl('sidebarAvatar', init);
  setEl('topbarAvatar',  init);
}

/* ============================================================
   STATS & COUNTS
   ============================================================ */
function loadStats() {
  const menunggu = dummyPendaftaran.filter(p => p.status === 'menunggu_verifikasi').length;
  const lolos    = dummyPendaftaran.filter(p => p.status === 'lolos_berkas').length;
  const ditolak  = dummyPendaftaran.filter(p => p.status === 'ditolak_berkas').length;
  const total    = dummyPendaftaran.length;

  animateNum('statMenunggu',  menunggu);
  animateNum('statLolosBerkas', lolos);
  animateNum('statDitolak',   ditolak);
  animateNum('statTotal',     total);

  setEl('bannerCount', menunggu);

  /* Tab counts */
  setEl('tcMenunggu', menunggu);
  setEl('tcLolos',    lolos);
  setEl('tcDitolak',  ditolak);
  setEl('tcSemua',    total);

  /* Badge sidebar */
  const badge = document.getElementById('badgeVerifikasi');
  if (badge && menunggu > 0) {
    badge.textContent = menunggu;
    badge.classList.add('show');
  }

  /* Shimmer */
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('shimmer');
      setTimeout(() => card.classList.remove('shimmer'), 1100);
    }, i * 100);
  });
}

/* ============================================================
   POPULATE FILTER BEASISWA SELECT
   ============================================================ */
function populateBeasiswaFilter() {
  const sel = document.getElementById('filterBeasiswa');
  if (!sel) return;

  const uniqueBeasiswa = [...new Map(
    dummyPendaftaran.map(p => [p.beasiswa_id, p.beasiswa?.nama_program])
  ).entries()];

  sel.innerHTML = '<option value="all">Semua Beasiswa</option>';
  uniqueBeasiswa.forEach(([id, nama]) => {
    sel.innerHTML += `<option value="${id}">${nama}</option>`;
  });

  sel.addEventListener('change', () => {
    activeBeasiswaFilter = sel.value;
    renderList();
  });
}

/* ============================================================
   RENDER LIST
   ============================================================ */
function renderList() {
  const listEl  = document.getElementById('pendaftarList');
  const emptyEl = document.getElementById('emptyState');
  if (!listEl) return;

  let data = [...dummyPendaftaran];

  /* Filter status tab */
  if (activeStatusFilter !== 'all') {
    data = data.filter(p => p.status === activeStatusFilter);
  }

  /* Filter beasiswa */
  if (activeBeasiswaFilter !== 'all') {
    data = data.filter(p => p.beasiswa_id === activeBeasiswaFilter);
  }

  /* Filter search */
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(p =>
      p.mahasiswa?.nama_lengkap?.toLowerCase().includes(q) ||
      p.beasiswa?.nama_program?.toLowerCase().includes(q) ||
      p.mahasiswa?.nim_nip?.includes(q)
    );
  }

  setEl('panelCount', data.length + ' pendaftar');

  if (!data.length) {
    listEl.innerHTML           = '';
    emptyEl.style.display      = 'flex';
    return;
  }

  emptyEl.style.display = 'none';

  const statusCfg = STATUS_CFG;

  listEl.innerHTML = data.map((p, i) => {
    const cfg       = statusCfg[p.status] || statusCfg.menunggu_verifikasi;
    const docsTotal = p.dokumen_pendaftaran?.length || 0;
    const docsAda   = p.dokumen_pendaftaran?.filter(d => d.status === 'ada').length || 0;

    /* Tampilkan tombol aksi hanya jika masih menunggu */
    const isMenunggu = p.status === 'menunggu_verifikasi';

    return `
      <div
        class="pendaftar-card"
        style="--card-accent:${cfg.accent}; animation-delay:${i * 0.06}s"
        onclick="openDetail('${p.id}')"
      >
        <div class="card-avatar">${inisial(p.mahasiswa?.nama_lengkap || '?')}</div>

        <div class="card-main">
          <div class="card-nama">${p.mahasiswa?.nama_lengkap || '—'}</div>
          <div class="card-nim">
            NIM: ${p.mahasiswa?.nim_nip || '—'}
            &nbsp;·&nbsp;
            IPK: ${p.mahasiswa?.ipk?.toFixed(2) || '—'}
          </div>
          <div class="card-tags">
            <span class="card-tag">
              <iconify-icon icon="solar:diploma-bold-duotone" width="10"></iconify-icon>
              ${p.mahasiswa?.program_studi || '—'}
            </span>
            <span class="card-tag">
              <iconify-icon icon="solar:document-text-bold-duotone" width="10"></iconify-icon>
              ${docsAda}/${docsTotal} dokumen
            </span>
            <span class="card-tag">
              <iconify-icon icon="solar:clock-circle-bold-duotone" width="10"></iconify-icon>
              ${timeAgo(p.tanggal_daftar)}
            </span>
          </div>
        </div>

        <div class="card-right" onclick="event.stopPropagation()">
          <div class="card-beasiswa">${p.beasiswa?.nama_program || '—'}</div>
          <div class="card-tanggal">
            ${p.beasiswa?.sponsors?.nama_perusahaan || '—'}
            &nbsp;·&nbsp;
            ${formatTanggal(p.tanggal_daftar)}
          </div>
          <span class="status-pill ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
            ${cfg.label}
          </span>
          ${isMenunggu ? `
            <div class="card-actions" style="margin-top:8px">
              <button
                class="btn-setuju"
                onclick="event.stopPropagation(); triggerAksi('${p.id}','setuju')"
              >
                <iconify-icon icon="solar:check-circle-bold-duotone" width="13"></iconify-icon>
                Setuju
              </button>
              <button
                class="btn-tolak"
                onclick="event.stopPropagation(); triggerAksi('${p.id}','tolak')"
              >
                <iconify-icon icon="solar:close-circle-bold-duotone" width="13"></iconify-icon>
                Tolak
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/* ============================================================
   TAB SWITCH
   ============================================================ */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeStatusFilter = btn.dataset.status;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderList();
    });
  });
}

/* ============================================================
   SEARCH
   ============================================================ */
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    renderList();
  });
}

/* ============================================================
   MODAL DETAIL PENDAFTAR
   ============================================================ */
const modalDetail = document.getElementById('modalDetail');

function openDetail(id) {
  const p = dummyPendaftaran.find(x => x.id === id);
  if (!p) return;
  openDetailId = id;

  const cfg       = STATUS_CFG[p.status] || STATUS_CFG.menunggu_verifikasi;
  const isMenunggu = p.status === 'menunggu_verifikasi';

  const docsHTML = (p.dokumen_pendaftaran || []).map(d => `
    <div class="dokumen-item ${d.status === 'ada' ? 'ada' : 'missing'}">
      <div class="dokumen-check">
        <iconify-icon
          icon="${d.status === 'ada' ? 'solar:check-circle-bold-duotone' : 'solar:close-circle-bold-duotone'}"
          width="16"
          style="color:${d.status === 'ada' ? '#047857' : '#be123c'}"
        ></iconify-icon>
      </div>
      <span class="dokumen-name">${d.jenis_dokumen}</span>
      <span class="dokumen-status">${d.status === 'ada' ? 'Ada' : 'Tidak Ada'}</span>
      ${d.file_url && d.status === 'ada'
        ? `<a href="${d.file_url}" class="dokumen-link" target="_blank" onclick="event.stopPropagation()">
             <iconify-icon icon="solar:eye-bold-duotone" width="12" style="vertical-align:middle"></iconify-icon>
             Lihat
           </a>`
        : ''
      }
    </div>
  `).join('');

  document.getElementById('modalDetailContent').innerHTML = `
    <div class="detail-head">
      <div class="detail-avatar">${inisial(p.mahasiswa?.nama_lengkap || '?')}</div>
      <div>
        <div class="detail-nama">${p.mahasiswa?.nama_lengkap || '—'}</div>
        <div class="detail-meta">
          <span class="detail-meta-item">
            <iconify-icon icon="solar:document-text-bold-duotone" width="12" style="color:var(--text-4)"></iconify-icon>
            NIM: ${p.mahasiswa?.nim_nip || '—'}
          </span>
          <span class="detail-meta-item">
            <iconify-icon icon="solar:diploma-bold-duotone" width="12" style="color:var(--text-4)"></iconify-icon>
            ${p.mahasiswa?.program_studi || '—'}
          </span>
          <span class="detail-meta-item">
            <iconify-icon icon="solar:star-bold-duotone" width="12" style="color:var(--text-4)"></iconify-icon>
            IPK: ${p.mahasiswa?.ipk?.toFixed(2) || '—'}
          </span>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Informasi Pendaftaran</div>
      <div class="info-row">
        <span class="info-row-label">Program Beasiswa</span>
        <span class="info-row-val">${p.beasiswa?.nama_program || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Sponsor</span>
        <span class="info-row-val">${p.beasiswa?.sponsors?.nama_perusahaan || '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Dana</span>
        <span class="info-row-val">${formatRupiah(p.beasiswa?.nominal_dana || 0)}/bln</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Tanggal Daftar</span>
        <span class="info-row-val">${formatTanggal(p.tanggal_daftar)}</span>
      </div>
      <div class="info-row">
        <span class="info-row-label">Status</span>
        <span class="info-row-val">
          <span class="status-pill ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
            ${cfg.label}
          </span>
        </span>
      </div>
      ${p.catatan_staff ? `
        <div class="info-row">
          <span class="info-row-label">Catatan Staff</span>
          <span class="info-row-val" style="max-width:280px;text-align:right;line-height:1.4">
            ${p.catatan_staff}
          </span>
        </div>
      ` : ''}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Kelengkapan Dokumen</div>
      <div class="dokumen-list">${docsHTML}</div>
    </div>

    ${isMenunggu ? `
      <div class="detail-actions">
        <button
          class="btn-aksi-setuju"
          onclick="triggerAksi('${p.id}','setuju')"
        >
          <iconify-icon icon="solar:check-circle-bold-duotone" width="16"></iconify-icon>
          Loloskan Berkas
        </button>
        <button
          class="btn-aksi-tolak"
          onclick="triggerAksi('${p.id}','tolak')"
        >
          <iconify-icon icon="solar:close-circle-bold-duotone" width="16"></iconify-icon>
          Tolak Berkas
        </button>
      </div>
    ` : ''}
  `;

  modalDetail?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  modalDetail?.classList.remove('active');
  document.body.style.overflow = '';
  openDetailId = null;
}

document.getElementById('modalDetailClose')?.addEventListener('click',  closeDetail);
document.getElementById('modalDetailOverlay')?.addEventListener('click', closeDetail);

/* ============================================================
   MODAL KONFIRMASI AKSI — Setuju / Tolak
   ============================================================ */
const modalKonfirmasi = document.getElementById('modalKonfirmasi');

function triggerAksi(pendaftaranId, aksi) {
  /* Tutup detail dulu jika terbuka */
  if (openDetailId) closeDetail();

  pendingAksi = { pendaftaranId, aksi };

  const p    = dummyPendaftaran.find(x => x.id === pendaftaranId);
  const nama = p?.mahasiswa?.nama_lengkap || '—';

  const konfirmasiIconEl = document.getElementById('konfirmasiIcon');
  const konfirmasiTitleEl = document.getElementById('konfirmasiTitle');
  const konfirmasiDescEl  = document.getElementById('konfirmasiDesc');
  const btnKonfirmasi     = document.getElementById('confirmAksi');

  if (aksi === 'setuju') {
    konfirmasiIconEl.innerHTML = `<iconify-icon icon="solar:check-circle-bold-duotone" width="48" style="color:#047857"></iconify-icon>`;
    konfirmasiTitleEl.textContent = 'Loloskan Berkas?';
    konfirmasiDescEl.textContent  = `${nama} akan dilanjutkan ke tahap seleksi berikutnya (wawancara/tes).`;
    btnKonfirmasi.style.background = '#059669';
    btnKonfirmasi.textContent       = 'Ya, Loloskan';
  } else {
    konfirmasiIconEl.innerHTML = `<iconify-icon icon="solar:close-circle-bold-duotone" width="48" style="color:#be123c"></iconify-icon>`;
    konfirmasiTitleEl.textContent = 'Tolak Berkas?';
    konfirmasiDescEl.textContent  = `${nama} akan mendapat notifikasi penolakan dan tidak dapat lanjut seleksi.`;
    btnKonfirmasi.style.background = '#be123c';
    btnKonfirmasi.textContent       = 'Ya, Tolak';
  }

  /* Reset catatan */
  const catatanEl = document.getElementById('catatanVerifikasi');
  if (catatanEl) catatanEl.value = '';

  modalKonfirmasi?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeKonfirmasi() {
  modalKonfirmasi?.classList.remove('active');
  document.body.style.overflow = '';
  pendingAksi = null;
}

document.getElementById('cancelKonfirmasi')?.addEventListener('click',         closeKonfirmasi);
document.getElementById('modalKonfirmasiOverlay')?.addEventListener('click',  closeKonfirmasi);

document.getElementById('confirmAksi')?.addEventListener('click', () => {
  if (!pendingAksi) return;

  const { pendaftaranId, aksi } = pendingAksi;
  const catatan = document.getElementById('catatanVerifikasi')?.value.trim() || null;

  const idx = dummyPendaftaran.findIndex(p => p.id === pendaftaranId);
  if (idx === -1) { closeKonfirmasi(); return; }

  /* UPDATE status — field name sinkron dengan pendaftaranSaya.js mahasiswa */
  if (aksi === 'setuju') {
    dummyPendaftaran[idx].status        = 'lolos_berkas';
    dummyPendaftaran[idx].catatan_staff = catatan || 'Berkas dinyatakan lengkap dan valid.';
  } else {
    dummyPendaftaran[idx].status        = 'ditolak_berkas';
    dummyPendaftaran[idx].catatan_staff = catatan || 'Berkas tidak memenuhi syarat.';
  }

  closeKonfirmasi();
  loadStats();
  renderList();
});

/* ============================================================
   LOGOUT
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

document.getElementById('btnLogout')?.addEventListener('click',    showLogout);
document.getElementById('cancelLogout')?.addEventListener('click', hideLogout);
document.getElementById('logoutOverlay')?.addEventListener('click', hideLogout);
document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user');
  localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});

/* ============================================================
   SIDEBAR MOBILE
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
   BG CANVAS — identik pola dashboard
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
      o.x += o.dx; o.y += o.dy;
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
   FLOATING PARTICLES — Iconify, tema verifikasi/dokumen
   ============================================================ */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const symbols = ['🎓', '📋', '✅', '📊', '🏆', '📝', '💼', '🔍', '📑', '⭐'];
  const COUNT   = 18;

  for (let i = 0; i < COUNT; i++) {
    const p       = document.createElement('div');
    p.className   = 'particle';
    p.textContent = symbols[i % symbols.length];

    const dur   = 7 + Math.random() * 8;
    const delay = Math.random() * 10;
    const left  = Math.random() * 100;
    const size  = 12 + Math.random() * 10;

    p.style.cssText = `
      left:            ${left}%;
      bottom:          -40px;
      font-size:       ${size}px;
      --dur:           ${dur}s;
      --delay:         ${delay}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(p);
  }
}

/* ============================================================
   KEYBOARD
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hideLogout();
    closeSidebar();
    closeDetail();
    closeKonfirmasi();
  }
});

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadStats();
  populateBeasiswaFilter();
  initTabs();
  initSearch();
  renderList();

  console.log(
    '✅ verifikasiPendaftar.js loaded | Staff:',
    demoSession?.nama_lengkap
  );
});