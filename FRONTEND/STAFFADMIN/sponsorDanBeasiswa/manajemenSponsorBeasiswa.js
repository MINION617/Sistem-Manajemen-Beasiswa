/* ============================================================
   MANAJEMENSPONSORBEASISWA.JS — Beasiswa Kampus (Staff Admin)
   Folder  : sponsorDanBeasiswa/
   Tabel   : sponsors, beasiswa
   Kolom sponsors : id, nama_perusahaan, industri, tagline, tentang,
                    narahubung, kontak, email, alamat, warna, is_aktif
   Kolom beasiswa : id, sponsor_id, nama_program, deskripsi,
                    nominal_dana, kuota_penerima, tanggal_buka,
                    tanggal_tutup, kategori, status
   Sinkron dengan: profilPerusahaanBeasiswa.html (mahasiswa)
                   daftarBeasiswa.html (mahasiswa)
   ============================================================ */

/* ============================================================
   SESSION (shared BK layer) — guard staff AKTIF
   ============================================================ */
const session = (window.BK && BK.session) ? BK.session.requireRole('staff') : null;
const demoSession = session || {};

/* ============================================================
   DUMMY DATA — sponsors
   Nama field identik dengan profilPerusahaanBeasiswa.js mahasiswa
   ============================================================ */
let dummySponsorsSeed = [
  {
    id               : 'sp-001',
    nama_perusahaan  : 'Bank Mandiri',
    industri         : 'Perbankan',
    tagline          : 'Berkomitmen mendukung pendidikan SDM Indonesia.',
    tentang          : 'PT Bank Mandiri (Persero) Tbk adalah bank terbesar di Indonesia dari segi aset.',
    narahubung       : 'Budi Santoso',
    kontak           : '+62 812 1000 2000',
    email            : 'csr@bankmandiri.co.id',
    alamat           : 'Jl. Jenderal Gatot Subroto Kav. 36-38, Jakarta Selatan',
    warna            : '#1e40af',
    inisial          : 'BM',
    is_aktif         : true,
    jumlah_beasiswa  : 1,
    total_kuota      : 25,
  },
  {
    id               : 'sp-002',
    nama_perusahaan  : 'Pertamina',
    industri         : 'Energi',
    tagline          : 'Mendorong generasi muda untuk bidang energi dan lingkungan.',
    tentang          : 'PT Pertamina (Persero) BUMN bidang energi. Program Sobat Bumi fokus sustainability.',
    narahubung       : 'Siti Rahayu',
    kontak           : '+62 813 2000 3000',
    email            : 'foundation@pertamina.com',
    alamat           : 'Jl. Medan Merdeka Timur No. 1A, Jakarta Pusat',
    warna            : '#dc2626',
    inisial          : 'PT',
    is_aktif         : true,
    jumlah_beasiswa  : 1,
    total_kuota      : 15,
  },
  {
    id               : 'sp-003',
    nama_perusahaan  : 'Telkom Indonesia',
    industri         : 'Telekomunikasi',
    tagline          : 'Mempersiapkan talenta digital Indonesia untuk transformasi global.',
    tentang          : 'PT Telkom Indonesia Tbk, perusahaan telekomunikasi terbesar di Indonesia.',
    narahubung       : 'Andi Prasetyo',
    kontak           : '+62 811 3000 4000',
    email            : 'scholarship@telkom.co.id',
    alamat           : 'Jl. Japati No. 1, Bandung',
    warna            : '#ef4444',
    inisial          : 'TI',
    is_aktif         : true,
    jumlah_beasiswa  : 1,
    total_kuota      : 20,
  },
  {
    id               : 'sp-004',
    nama_perusahaan  : 'Djarum Foundation',
    industri         : 'Pendidikan',
    tagline          : 'Menciptakan pemimpin masa depan Indonesia yang berdaya saing global.',
    tentang          : 'Yayasan filantropi dari Djarum Group. Program Beasiswa Djarum Plus sejak 1984.',
    narahubung       : 'Kartika Dewi',
    kontak           : '+62 812 4000 5000',
    email            : 'beasiswa@djarumfoundation.org',
    alamat           : 'Jl. KS Tubun No. 2, Jakarta Barat',
    warna            : '#f59e0b',
    inisial          : 'DJ',
    is_aktif         : true,
    jumlah_beasiswa  : 2,
    total_kuota      : 70,
  },
  {
    id               : 'sp-005',
    nama_perusahaan  : 'BCA',
    industri         : 'Perbankan',
    tagline          : 'Memberdayakan generasi muda dalam bidang keuangan dan bisnis.',
    tentang          : 'PT Bank Central Asia Tbk, bank swasta terbesar di Indonesia.',
    narahubung       : 'Reza Firmansyah',
    kontak           : '+62 813 5000 6000',
    email            : 'scholarship@bca.co.id',
    alamat           : 'Jl. M.H. Thamrin No. 1, Jakarta Pusat',
    warna            : '#3b82f6',
    inisial          : 'BC',
    is_aktif         : false,
    jumlah_beasiswa  : 1,
    total_kuota      : 18,
  },
];

/* ============================================================
   DUMMY DATA — beasiswa
   Nama field identik dengan daftarBeasiswa.js mahasiswa
   ============================================================ */
let dummyBeasiswaSeed = [
  {
    id             : 'b-001',
    sponsor_id     : 'sp-001',
    nama_program   : 'Beasiswa Mandiri Prestasi',
    deskripsi      : 'Untuk mahasiswa berprestasi IPK ≥ 3.50. Mencakup biaya pendidikan, tunjangan bulanan, dan pelatihan.',
    nominal_dana   : 5000000,
    kuota_penerima : 25,
    tanggal_buka   : '2026-03-01',
    tanggal_tutup  : '2026-07-31',
    kategori       : 'prestasi',
    status         : 'buka',
    icon           : 'solar:cup-star-bold-duotone',
    iconColor      : '#d97706',
    bg             : '#fef3c7',
  },
  {
    id             : 'b-002',
    sponsor_id     : 'sp-002',
    nama_program   : 'Pertamina Sobat Bumi',
    deskripsi      : 'Riset di bidang energi terbarukan dan keberlanjutan. Termasuk kesempatan riset bersama Pertamina.',
    nominal_dana   : 7500000,
    kuota_penerima : 15,
    tanggal_buka   : '2026-03-15',
    tanggal_tutup  : '2026-07-15',
    kategori       : 'riset',
    status         : 'buka',
    icon           : 'solar:globus-bold-duotone',
    iconColor      : '#059669',
    bg             : '#fee2e2',
  },
  {
    id             : 'b-003',
    sponsor_id     : 'sp-003',
    nama_program   : 'Telkom Digital Talent',
    deskripsi      : 'Untuk mahasiswa IT/Telekomunikasi. Akses pelatihan sertifikasi internasional cloud dan AI.',
    nominal_dana   : 4500000,
    kuota_penerima : 20,
    tanggal_buka   : '2026-04-01',
    tanggal_tutup  : '2026-08-01',
    kategori       : 'industri',
    status         : 'buka',
    icon           : 'solar:laptop-bold-duotone',
    iconColor      : '#2563eb',
    bg             : '#eff6ff',
  },
  {
    id             : 'b-004',
    sponsor_id     : 'sp-004',
    nama_program   : 'Beasiswa Djarum Plus',
    deskripsi      : 'Pelatihan soft skills intensif + dana pendidikan selama 1 tahun.',
    nominal_dana   : 6000000,
    kuota_penerima : 30,
    tanggal_buka   : '2026-02-01',
    tanggal_tutup  : '2026-06-30',
    kategori       : 'prestasi',
    status         : 'buka',
    icon           : 'solar:star-bold-duotone',
    iconColor      : '#f59e0b',
    bg             : '#fef3c7',
  },
  {
    id             : 'b-005',
    sponsor_id     : 'sp-004',
    nama_program   : 'Beasiswa Afirmasi 3T',
    deskripsi      : 'Khusus mahasiswa dari daerah Terdepan, Terluar, dan Tertinggal. Dukungan penuh selama masa studi.',
    nominal_dana   : 5000000,
    kuota_penerima : 40,
    tanggal_buka   : '2026-03-01',
    tanggal_tutup  : '2026-08-31',
    kategori       : 'afirmasi',
    status         : 'buka',
    icon           : 'solar:leaf-bold-duotone',
    iconColor      : '#10b981',
    bg             : '#d1fae5',
  },
  {
    id             : 'b-006',
    sponsor_id     : 'sp-005',
    nama_program   : 'BCA Finance Excellence',
    deskripsi      : 'Untuk mahasiswa Ekonomi, Akuntansi, dan Manajemen Keuangan. Termasuk program magang di BCA.',
    nominal_dana   : 5000000,
    kuota_penerima : 18,
    tanggal_buka   : '2026-03-01',
    tanggal_tutup  : '2026-07-31',
    kategori       : 'industri',
    status         : 'tutup',
    icon           : 'solar:wallet-money-bold-duotone',
    iconColor      : '#2563eb',
    bg             : '#dbeafe',
  },
];

/* ============================================================
   LIVE DATA (Supabase) + DB <-> UI MAPPERS
   ============================================================ */
let dummySponsors = [];
let dummyBeasiswa = [];

function inisialOf(nama) {
  return (nama || '').trim().slice(0, 2).toUpperCase() || '??';
}

/* sponsors: DB row -> shape yang dipakai render */
function sponsorToRender(row) {
  return {
    id              : row.id,
    nama_perusahaan : row.nama_perusahaan || '',
    industri        : row.jenis_industri || '',
    tagline         : row.tagline || '',
    tentang         : row.tentang || '',
    narahubung      : row.narahubung || '',
    kontak          : row.kontak_perusahaan || '',
    email           : row.email || '',
    alamat          : row.alamat_perusahaan || '',
    warna           : row.warna || '#2563eb',
    inisial         : inisialOf(row.nama_perusahaan),
    is_aktif        : row.is_aktif !== false,
    jumlah_beasiswa : 0,   /* diturunkan di loadData */
    total_kuota     : 0,
  };
}

/* sponsors: payload form (UI) -> kolom DB */
function sponsorToDb(p) {
  return {
    nama_perusahaan   : p.nama_perusahaan,
    jenis_industri    : p.industri,
    kontak_perusahaan : p.kontak,
    alamat_perusahaan : p.alamat,
    tagline           : p.tagline,
    tentang           : p.tentang,
    narahubung        : p.narahubung,
    email             : p.email,
    warna             : p.warna,
    is_aktif          : p.is_aktif,
  };
}

const KATEGORI_VISUAL = {
  prestasi: { icon: 'solar:cup-star-bold-duotone',    iconColor: '#d97706', bg: '#fef3c7' },
  riset:    { icon: 'solar:globus-bold-duotone',      iconColor: '#059669', bg: '#fee2e2' },
  industri: { icon: 'solar:buildings-2-bold-duotone', iconColor: '#2563eb', bg: '#eff6ff' },
  afirmasi: { icon: 'solar:leaf-bold-duotone',        iconColor: '#10b981', bg: '#d1fae5' },
  _default: { icon: 'solar:diploma-bold-duotone',     iconColor: '#2563eb', bg: '#eff6ff' },
};

/* beasiswa: DB row -> shape render. status DB aktif/nonaktif -> UI buka/tutup */
function beasiswaToRender(row) {
  const vis = KATEGORI_VISUAL[row.kategori] || KATEGORI_VISUAL._default;
  return {
    id             : row.id,
    sponsor_id     : row.sponsor_id,
    nama_program   : row.nama_program || '',
    deskripsi      : row.deskripsi || '',
    nominal_dana   : row.nominal_dana || 0,
    kuota_penerima : row.kuota || 0,
    tanggal_buka   : row.tanggal_buka || '',
    tanggal_tutup  : row.tanggal_tutup || '',
    kategori       : row.kategori || '',
    status         : (row.status === 'aktif') ? 'buka' : 'tutup',
    icon           : vis.icon, iconColor: vis.iconColor, bg: vis.bg,
  };
}

/* beasiswa: payload form (UI) -> kolom DB. UI buka/tutup -> DB aktif/nonaktif */
function beasiswaToDb(p) {
  return {
    nama_program : p.nama_program,
    sponsor_id   : p.sponsor_id,
    deskripsi    : p.deskripsi,
    nominal_dana : p.nominal_dana,
    kuota        : p.kuota_penerima,
    tanggal_buka : p.tanggal_buka || null,
    tanggal_tutup: p.tanggal_tutup || null,
    kategori     : p.kategori,
    status       : (p.status === 'buka') ? 'aktif' : 'nonaktif',
  };
}

async function loadData() {
  if (window.BK && BK.api && BK.sb) {
    const [sp, bs] = await Promise.all([BK.api.listSponsors(), BK.api.listBeasiswa()]);
    dummySponsors = (!sp.error && Array.isArray(sp.data)) ? sp.data.map(sponsorToRender) : dummySponsorsSeed.slice();
    dummyBeasiswa = (!bs.error && Array.isArray(bs.data)) ? bs.data.map(beasiswaToRender) : dummyBeasiswaSeed.slice();
  } else {
    dummySponsors = dummySponsorsSeed.slice();
    dummyBeasiswa = dummyBeasiswaSeed.slice();
  }
  /* turunkan jumlah_beasiswa & total_kuota per sponsor */
  dummySponsors.forEach(s => {
    const rel = dummyBeasiswa.filter(b => b.sponsor_id === s.id);
    s.jumlah_beasiswa = rel.length;
    s.total_kuota     = rel.reduce((a, b) => a + (b.kuota_penerima || 0), 0);
  });
}

/* ============================================================
   STATE
   ============================================================ */
let activeTab         = 'sponsor';
let activeSponsorFilter = 'all';
let searchQuery       = '';
let editingSponsorId  = null;
let editingBeasiswaId = null;
let hapusType         = null;
let hapusId           = null;

/* ============================================================
   UTILS
   ============================================================ */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatRupiah(num) {
  if (num >= 1000000) {
    return 'Rp ' + (num / 1000000).toLocaleString('id-ID') + ' jt';
  }
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function formatTanggal(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('id-ID', {
    day   : 'numeric',
    month : 'short',
    year  : 'numeric',
  });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur        = 0;
  const step     = Math.max(1, Math.ceil(target / 22));
  const t        = setInterval(() => {
    cur += step;
    if (cur >= target) { el.textContent = target; clearInterval(t); }
    else el.textContent = cur;
  }, 35);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ============================================================
   USER INFO
   ============================================================ */
function initUserInfo() {
  const nama  = demoSession?.nama_lengkap || 'Staff Admin';
  const init  = nama.charAt(0).toUpperCase();
  setEl('sidebarName',   nama);
  setEl('sidebarAvatar', init);
  setEl('topbarAvatar',  init);
}

/* ============================================================
   STATS
   ============================================================ */
function loadStats() {
  const sponsorAktif = dummySponsors.filter(s => s.is_aktif).length;
  const beasiswaAktif = dummyBeasiswa.filter(b => b.status === 'buka').length;
  const totalKuota   = dummyBeasiswa.filter(b => b.status === 'buka')
                                    .reduce((s, b) => s + b.kuota_penerima, 0);
  const totalDana    = dummyBeasiswa.filter(b => b.status === 'buka')
                                    .reduce((s, b) => s + b.nominal_dana, 0);

  animateNum('statSponsor',  sponsorAktif);
  animateNum('statBeasiswa', beasiswaAktif);
  animateNum('statKuota',    totalKuota);
  setEl('statDana', formatRupiah(totalDana));

  setEl('bannerSubtitle',
    `${sponsorAktif} sponsor aktif dengan ${beasiswaAktif} program beasiswa dan ${totalKuota} kuota tersedia.`
  );

  /* Shimmer pada load */
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('shimmer');
      setTimeout(() => card.classList.remove('shimmer'), 1100);
    }, i * 100);
  });
}

/* ============================================================
   RENDER SPONSOR GRID
   ============================================================ */
function renderSponsorGrid() {
  const el = document.getElementById('sponsorGrid');
  if (!el) return;

  let data = [...dummySponsors];

  /* Filter pencarian */
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(s =>
      s.nama_perusahaan.toLowerCase().includes(q) ||
      s.industri.toLowerCase().includes(q)
    );
  }

  setEl('countSponsor', data.length + ' sponsor');

  if (!data.length) {
    el.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-3)">
        <iconify-icon icon="solar:buildings-2-bold-duotone" width="48" style="color:var(--text-4);margin-bottom:12px;display:block"></iconify-icon>
        <p style="font-weight:600">Tidak ada sponsor ditemukan</p>
      </div>`;
    return;
  }

  el.innerHTML = data.map((s, i) => `
    <div
      class="sponsor-card"
      style="--sponsor-color:${s.warna}; animation-delay:${i * 0.06}s"
    >
      <div class="sponsor-card-head">
        <div class="sponsor-logo" style="background:${s.warna}">
          ${s.inisial}
        </div>
        <div class="sponsor-info">
          <div class="sponsor-nama">${s.nama_perusahaan}</div>
          <div class="sponsor-industri">${s.industri}</div>
        </div>
        <div class="sponsor-status-wrap">
          <span class="status-pill ${s.is_aktif ? 'status-aktif' : 'status-nonaktif'}">
            ${s.is_aktif ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      </div>

      <div class="sponsor-card-meta">
        <div class="sponsor-meta-item">
          <iconify-icon
            icon="solar:diploma-bold-duotone"
            width="13"
            style="color:var(--blue-500)"
          ></iconify-icon>
          ${s.jumlah_beasiswa} program
        </div>
        <div class="sponsor-meta-item">
          <iconify-icon
            icon="solar:users-group-two-rounded-bold-duotone"
            width="13"
            style="color:var(--blue-500)"
          ></iconify-icon>
          ${s.total_kuota} kuota
        </div>
        <div class="sponsor-meta-item">
          <iconify-icon
            icon="solar:phone-bold-duotone"
            width="13"
            style="color:var(--blue-500)"
          ></iconify-icon>
          ${s.narahubung}
        </div>
      </div>

      <div class="sponsor-card-actions">
        <button
          class="btn-action btn-action-edit"
          onclick="openEditSponsor('${s.id}')"
        >
          <iconify-icon icon="solar:pen-bold-duotone" width="13"></iconify-icon>
          Edit
        </button>
        <button
          class="btn-action btn-action-beasiswa"
          onclick="switchToBeasiswaTab('${s.id}')"
        >
          <iconify-icon icon="solar:diploma-bold-duotone" width="13"></iconify-icon>
          Beasiswa
        </button>
        <button
          class="btn-action btn-action-hapus"
          onclick="confirmHapus('sponsor','${s.id}','${s.nama_perusahaan}')"
        >
          <iconify-icon icon="solar:trash-bin-2-bold-duotone" width="13"></iconify-icon>
          Hapus
        </button>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   RENDER BEASISWA LIST
   ============================================================ */
function renderBeasiswaList() {
  const el = document.getElementById('beasiswaList');
  if (!el) return;

  let data = [...dummyBeasiswa];

  /* Filter sponsor chip */
  if (activeSponsorFilter !== 'all') {
    data = data.filter(b => b.sponsor_id === activeSponsorFilter);
  }

  /* Filter pencarian */
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(b =>
      b.nama_program.toLowerCase().includes(q) ||
      getSponsorNama(b.sponsor_id).toLowerCase().includes(q)
    );
  }

  setEl('countBeasiswa', data.length + ' program');

  if (!data.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--text-3)">
        <iconify-icon icon="solar:diploma-bold-duotone" width="48" style="color:var(--text-4);margin-bottom:12px;display:block"></iconify-icon>
        <p style="font-weight:600">Tidak ada program beasiswa ditemukan</p>
      </div>`;
    return;
  }

  el.innerHTML = data.map((b, i) => {
    const sponsor  = dummySponsors.find(s => s.id === b.sponsor_id);
    const sisa     = Math.ceil((new Date(b.tanggal_tutup) - Date.now()) / 86400000);
    const isOpen   = b.status === 'buka' && sisa > 0;

    return `
      <div
        class="beasiswa-card"
        style="--bs-color:${sponsor?.warna || 'var(--blue-600)'}; animation-delay:${i * 0.07}s"
      >
        <div class="bs-icon" style="background:${b.bg}">
          <iconify-icon
            icon="${b.icon}"
            style="color:${b.iconColor}"
            width="24"
          ></iconify-icon>
        </div>

        <div class="bs-main">
          <div class="bs-nama">${b.nama_program}</div>
          <div class="bs-sponsor">
            <iconify-icon
              icon="solar:buildings-2-bold-duotone"
              width="11"
              style="vertical-align:middle;margin-right:3px;color:var(--text-4)"
            ></iconify-icon>
            ${sponsor?.nama_perusahaan || '—'}
          </div>
          <div class="bs-tags">
            <span class="bs-tag">
              <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
              ${formatTanggal(b.tanggal_buka)} – ${formatTanggal(b.tanggal_tutup)}
            </span>
            <span class="bs-tag">
              <iconify-icon icon="solar:tag-bold-duotone" width="10"></iconify-icon>
              ${capitalize(b.kategori)}
            </span>
            ${isOpen
              ? `<span class="bs-tag" style="color:#047857;background:var(--mint-soft);border-color:#a7f3d0">
                   <iconify-icon icon="solar:clock-circle-bold-duotone" width="10"></iconify-icon>
                   Sisa ${sisa} hari
                 </span>`
              : `<span class="bs-tag" style="color:#be123c;background:var(--coral-soft);border-color:#fecaca">
                   <iconify-icon icon="solar:close-circle-bold-duotone" width="10"></iconify-icon>
                   Tutup
                 </span>`
            }
          </div>
        </div>

        <div class="bs-right">
          <div class="bs-nominal">${formatRupiah(b.nominal_dana)}<span style="font-size:10px;font-weight:500;color:var(--text-3)">/bln</span></div>
          <div class="bs-kuota">
            <iconify-icon
              icon="solar:users-group-two-rounded-bold-duotone"
              width="11"
              style="vertical-align:middle;margin-right:3px"
            ></iconify-icon>
            ${b.kuota_penerima} kuota
          </div>
          <span class="status-pill ${b.status === 'buka' ? 'status-buka' : 'status-tutup'}">
            ${b.status === 'buka' ? 'Buka' : 'Tutup'}
          </span>
          <div class="bs-actions" style="margin-top:8px">
            <button
              class="btn-action btn-action-edit"
              onclick="openEditBeasiswa('${b.id}')"
            >
              <iconify-icon icon="solar:pen-bold-duotone" width="12"></iconify-icon>
              Edit
            </button>
            <button
              class="btn-action btn-action-hapus"
              onclick="confirmHapus('beasiswa','${b.id}','${b.nama_program}')"
            >
              <iconify-icon icon="solar:trash-bin-2-bold-duotone" width="12"></iconify-icon>
              Hapus
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getSponsorNama(sponsorId) {
  return dummySponsors.find(s => s.id === sponsorId)?.nama_perusahaan || '';
}

/* ============================================================
   RENDER FILTER CHIPS SPONSOR
   ============================================================ */
function renderFilterChips() {
  const el = document.getElementById('filterSponsorBeasiswa');
  if (!el) return;

  el.innerHTML = `<button class="filter-chip ${activeSponsorFilter === 'all' ? 'active' : ''}" data-sponsor="all">Semua</button>`;

  dummySponsors.forEach(s => {
    el.innerHTML += `
      <button
        class="filter-chip ${activeSponsorFilter === s.id ? 'active' : ''}"
        data-sponsor="${s.id}"
      >
        ${s.nama_perusahaan}
      </button>
    `;
  });

  el.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSponsorFilter = btn.dataset.sponsor;
      el.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBeasiswaList();
    });
  });
}

/* ============================================================
   POPULATE SPONSOR SELECT (form beasiswa)
   ============================================================ */
function populateSponsorSelect() {
  const sel = document.getElementById('fSponsorId');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Pilih Sponsor --</option>';
  dummySponsors.forEach(s => {
    sel.innerHTML += `<option value="${s.id}">${s.nama_perusahaan}</option>`;
  });
}

/* ============================================================
   TAB SWITCH
   ============================================================ */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  activeTab = tab;

  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  document.getElementById('panelSponsor')?.classList.toggle('hidden', tab !== 'sponsor');
  document.getElementById('panelBeasiswa')?.classList.toggle('hidden', tab !== 'beasiswa');

  if (tab === 'beasiswa') {
    renderFilterChips();
    renderBeasiswaList();
  } else {
    renderSponsorGrid();
  }
}

function switchToBeasiswaTab(sponsorId) {
  activeSponsorFilter = sponsorId;
  switchTab('beasiswa');
}

/* ============================================================
   SEARCH
   ============================================================ */
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    if (activeTab === 'sponsor') {
      renderSponsorGrid();
    } else {
      renderBeasiswaList();
    }
  });
}

/* ============================================================
   MODAL SPONSOR — TAMBAH / EDIT
   ============================================================ */
const modalSponsor = document.getElementById('modalSponsor');

function openAddSponsor() {
  editingSponsorId = null;
  setEl('modalSponsorTitle', 'Tambah Sponsor Baru');
  document.getElementById('formSponsor')?.reset();
  document.getElementById('fWarna').value    = '#2563eb';
  document.getElementById('fWarnaHex').value = '#2563eb';
  clearFormMsg('formSponsorMsg');
  modalSponsor?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openEditSponsor(id) {
  const s = dummySponsors.find(x => x.id === id);
  if (!s) return;
  editingSponsorId = id;
  setEl('modalSponsorTitle', 'Edit Sponsor — ' + s.nama_perusahaan);

  const f = (fieldId, val) => {
    const el = document.getElementById(fieldId);
    if (el) el.value = val ?? '';
  };

  f('fNamaPerusahaan', s.nama_perusahaan);
  f('fIndustri',       s.industri);
  f('fTagline',        s.tagline);
  f('fTentang',        s.tentang);
  f('fNarahubung',     s.narahubung);
  f('fKontak',         s.kontak);
  f('fEmailSponsor',   s.email);
  f('fAlamatSponsor',  s.alamat);
  f('fStatusSponsor',  s.is_aktif ? 'true' : 'false');

  const warna = s.warna || '#2563eb';
  document.getElementById('fWarna').value    = warna;
  document.getElementById('fWarnaHex').value = warna;

  clearFormMsg('formSponsorMsg');
  modalSponsor?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalSponsor() {
  modalSponsor?.classList.remove('active');
  document.body.style.overflow = '';
  editingSponsorId = null;
}

/* Sync color picker ↔ hex input */
document.getElementById('fWarna')?.addEventListener('input', (e) => {
  document.getElementById('fWarnaHex').value = e.target.value;
});
document.getElementById('fWarnaHex')?.addEventListener('input', (e) => {
  const v = e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
    document.getElementById('fWarna').value = v;
  }
});

/* Form submit sponsor */
document.getElementById('formSponsor')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nama = document.getElementById('fNamaPerusahaan').value.trim();
  if (!nama) {
    showFormMsg('formSponsorMsg', 'error', '⚠ Nama perusahaan wajib diisi');
    return;
  }

  if (!window.BK || !BK.sb || !BK.api) {
    showFormMsg('formSponsorMsg', 'error', '⚠ Supabase belum siap.');
    return;
  }

  setLoading('btnSimpanSponsor', 'loaderSponsor', true);

  const dbPayload = sponsorToDb({
    nama_perusahaan : nama,
    industri        : document.getElementById('fIndustri').value.trim(),
    tagline         : document.getElementById('fTagline').value.trim(),
    tentang         : document.getElementById('fTentang').value.trim(),
    narahubung      : document.getElementById('fNarahubung').value.trim(),
    kontak          : document.getElementById('fKontak').value.trim(),
    email           : document.getElementById('fEmailSponsor').value.trim(),
    alamat          : document.getElementById('fAlamatSponsor').value.trim(),
    warna           : document.getElementById('fWarnaHex').value || '#2563eb',
    is_aktif        : document.getElementById('fStatusSponsor').value === 'true',
  });

  const res = editingSponsorId
    ? await BK.api.updateSponsor(editingSponsorId, dbPayload)
    : await BK.api.createSponsor(dbPayload);

  setLoading('btnSimpanSponsor', 'loaderSponsor', false);

  if (res.error) {
    showFormMsg('formSponsorMsg', 'error', '✗ Gagal menyimpan: ' + (res.error.message || 'coba lagi'));
    return;
  }
  showFormMsg('formSponsorMsg', 'success',
    editingSponsorId ? '✓ Data sponsor berhasil diperbarui!' : '✓ Sponsor baru berhasil ditambahkan!');

  await loadData();
  loadStats();
  renderSponsorGrid();
  populateSponsorSelect();

  setTimeout(() => closeModalSponsor(), 1200);
});

document.getElementById('modalSponsorClose')?.addEventListener('click', closeModalSponsor);
document.getElementById('cancelSponsor')?.addEventListener('click',    closeModalSponsor);
document.getElementById('modalSponsorOverlay')?.addEventListener('click', closeModalSponsor);
document.getElementById('btnTambahSponsor')?.addEventListener('click',  openAddSponsor);
document.getElementById('btnTambahSponsor2')?.addEventListener('click', openAddSponsor);

/* ============================================================
   MODAL BEASISWA — TAMBAH / EDIT
   ============================================================ */
const modalBeasiswa = document.getElementById('modalBeasiswa');

function openAddBeasiswa() {
  editingBeasiswaId = null;
  setEl('modalBeasiswaTitle', 'Tambah Program Beasiswa');
  document.getElementById('formBeasiswa')?.reset();
  clearFormMsg('formBeasiswaMsg');
  populateSponsorSelect();
  modalBeasiswa?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openEditBeasiswa(id) {
  const b = dummyBeasiswa.find(x => x.id === id);
  if (!b) return;
  editingBeasiswaId = id;
  setEl('modalBeasiswaTitle', 'Edit Beasiswa — ' + b.nama_program);
  populateSponsorSelect();

  const f = (fieldId, val) => {
    const el = document.getElementById(fieldId);
    if (el) el.value = val ?? '';
  };

  f('fNamaProgram',    b.nama_program);
  f('fSponsorId',      b.sponsor_id);
  f('fDeskripsi',      b.deskripsi);
  f('fNominalDana',    b.nominal_dana);
  f('fKuota',          b.kuota_penerima);
  f('fTanggalBuka',    b.tanggal_buka);
  f('fTanggalTutup',   b.tanggal_tutup);
  f('fKategori',       b.kategori);
  f('fStatusBeasiswa', b.status);

  clearFormMsg('formBeasiswaMsg');
  modalBeasiswa?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalBeasiswa() {
  modalBeasiswa?.classList.remove('active');
  document.body.style.overflow = '';
  editingBeasiswaId = null;
}

/* Form submit beasiswa */
document.getElementById('formBeasiswa')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nama      = document.getElementById('fNamaProgram').value.trim();
  const sponsorId = document.getElementById('fSponsorId').value;

  if (!nama) {
    showFormMsg('formBeasiswaMsg', 'error', '⚠ Nama program wajib diisi');
    return;
  }
  if (!sponsorId) {
    showFormMsg('formBeasiswaMsg', 'error', '⚠ Pilih sponsor terlebih dahulu');
    return;
  }

  if (!window.BK || !BK.sb || !BK.api) {
    showFormMsg('formBeasiswaMsg', 'error', '⚠ Supabase belum siap.');
    return;
  }

  setLoading('btnSimpanBeasiswa', 'loaderBeasiswa', true);

  const dbPayload = beasiswaToDb({
    nama_program   : nama,
    sponsor_id     : sponsorId,
    deskripsi      : document.getElementById('fDeskripsi').value.trim(),
    nominal_dana   : parseInt(document.getElementById('fNominalDana').value) || 0,
    kuota_penerima : parseInt(document.getElementById('fKuota').value) || 0,
    tanggal_buka   : document.getElementById('fTanggalBuka').value,
    tanggal_tutup  : document.getElementById('fTanggalTutup').value,
    kategori       : document.getElementById('fKategori').value,
    status         : document.getElementById('fStatusBeasiswa').value,
  });

  const res = editingBeasiswaId
    ? await BK.api.updateBeasiswa(editingBeasiswaId, dbPayload)
    : await BK.api.createBeasiswa(dbPayload);

  setLoading('btnSimpanBeasiswa', 'loaderBeasiswa', false);

  if (res.error) {
    showFormMsg('formBeasiswaMsg', 'error', '✗ Gagal menyimpan: ' + (res.error.message || 'coba lagi'));
    return;
  }
  showFormMsg('formBeasiswaMsg', 'success',
    editingBeasiswaId ? '✓ Program beasiswa berhasil diperbarui!' : '✓ Program beasiswa berhasil ditambahkan!');

  await loadData();
  loadStats();
  renderBeasiswaList();
  renderFilterChips();

  setTimeout(() => closeModalBeasiswa(), 1200);
});

document.getElementById('modalBeasiswaClose')?.addEventListener('click',    closeModalBeasiswa);
document.getElementById('cancelBeasiswa')?.addEventListener('click',        closeModalBeasiswa);
document.getElementById('modalBeasiswaOverlay')?.addEventListener('click',  closeModalBeasiswa);
document.getElementById('btnTambahBeasiswa')?.addEventListener('click',     openAddBeasiswa);

function updateSponsorKuota(sponsorId) {
  const idx = dummySponsors.findIndex(s => s.id === sponsorId);
  if (idx === -1) return;
  const relatedBs = dummyBeasiswa.filter(b => b.sponsor_id === sponsorId);
  dummySponsors[idx].jumlah_beasiswa = relatedBs.length;
  dummySponsors[idx].total_kuota     = relatedBs.reduce((s, b) => s + b.kuota_penerima, 0);
}

/* ============================================================
   MODAL HAPUS
   ============================================================ */
const modalHapus = document.getElementById('modalHapus');

function confirmHapus(type, id, nama) {
  hapusType = type;
  hapusId   = id;
  setEl('hapusTitle', `Hapus ${type === 'sponsor' ? 'Sponsor' : 'Beasiswa'}?`);
  setEl('hapusDesc',  `"${nama}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`);
  modalHapus?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalHapus() {
  modalHapus?.classList.remove('active');
  document.body.style.overflow = '';
  hapusType = null;
  hapusId   = null;
}

document.getElementById('cancelHapus')?.addEventListener('click', closeModalHapus);
document.getElementById('modalHapusOverlay')?.addEventListener('click', closeModalHapus);

document.getElementById('confirmHapus')?.addEventListener('click', async () => {
  if (!hapusId) return;
  if (!window.BK || !BK.sb || !BK.api) { alert('Supabase belum siap.'); return; }

  const res = (hapusType === 'sponsor')
    ? await BK.api.deleteSponsor(hapusId)   /* FK ON DELETE SET NULL melepas beasiswa terkait */
    : await BK.api.deleteBeasiswa(hapusId);

  if (res.error) { alert('Gagal menghapus: ' + (res.error.message || 'coba lagi')); return; }

  await loadData();
  loadStats();
  renderSponsorGrid();
  renderFilterChips();
  renderBeasiswaList();
  closeModalHapus();
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
  if (window.BK && BK.session) BK.session.clearSession();
  else { sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user'); }
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
   BG CANVAS — identik dashboardStaffAdmin.js
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
   FLOATING PARTICLES — Iconify, identik pola dashboard
   ============================================================ */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const iconSet = [
    ['solar:buildings-2-bold-duotone',  'rgba(37,99,235,0.22)'],
    ['solar:diploma-bold-duotone',      'rgba(37,99,235,0.18)'],
    ['solar:cup-star-bold-duotone',     'rgba(251,191,36,0.22)'],
    ['solar:star-bold-duotone',         'rgba(251,191,36,0.20)'],
    ['solar:users-group-two-rounded-bold-duotone', 'rgba(37,99,235,0.18)'],
    ['solar:banknote-bold-duotone',     'rgba(124,58,237,0.18)'],
    ['solar:pen-bold-duotone',          'rgba(37,99,235,0.16)'],
    ['solar:check-circle-bold-duotone', 'rgba(5,150,105,0.18)'],
  ];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const [iconName, color] = iconSet[i % iconSet.length];
    const p                 = document.createElement('iconify-icon');
    p.setAttribute('icon', iconName);
    p.className             = 'particle';

    const dur   = 7  + Math.random() * 8;
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

/* ============================================================
   HELPERS: form message & loading
   ============================================================ */
function showFormMsg(msgId, type, msg) {
  const el = document.getElementById(msgId);
  if (!el) return;
  el.className   = 'form-message ' + type;
  el.textContent = msg;
}

function clearFormMsg(msgId) {
  const el = document.getElementById(msgId);
  if (!el) return;
  el.className   = 'form-message';
  el.textContent = '';
}

function setLoading(btnId, loaderId, on) {
  const btn    = document.getElementById(btnId);
  const text   = btn?.querySelector('.btn-text');
  const loader = document.getElementById(loaderId);
  if (btn)    btn.disabled         = on;
  if (text)   text.style.display   = on ? 'none' : '';
  if (loader) loader.style.display = on ? 'flex' : 'none';
}

/* ============================================================
   KEYBOARD
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hideLogout();
    closeSidebar();
    closeModalSponsor();
    closeModalBeasiswa();
    closeModalHapus();
  }
});

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  initBgCanvas();
  initParticles();
  initUserInfo();

  await loadData();

  loadStats();
  initTabs();
  initSearch();
  populateSponsorSelect();
  renderSponsorGrid(); /* default tab = sponsor */

  console.log(
    '🏢 manajemenSponsorBeasiswa.js loaded | Staff:',
    demoSession?.nama_lengkap
  );
});