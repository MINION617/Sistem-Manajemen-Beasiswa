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
   SESSION
   ============================================================ */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}

const session = getSession();

if (!session || session.role !== 'staff') {
  // Uncomment saat production:
  // window.location.href = '../LOGIN/login.html';
}

const demoSession = session || {
  nama_lengkap : 'Rangga Adi Nugroho',
  role         : 'staff',
  id           : 'demo-staff-uuid',
};

const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

/* ============================================================
   BACKEND WIRING — GET/POST/PATCH /api/sponsors, /api/beasiswa
   Kolom asli DB berbeda nama dari field dummy di atas (mis. `kuota`
   bukan `kuota_penerima`, `jenis_industri` bukan `industri`), dan
   `status` beasiswa di DB memakai 'aktif'/'nonaktif' (dipakai juga
   oleh daftarBeasiswa.js mahasiswa yang filter status=aktif),
   sedangkan form di halaman ini memakai label 'buka'/'tutup'.
   ============================================================ */
const STATUS_BACKEND_TO_UI = { aktif: 'buka', nonaktif: 'tutup' };
const STATUS_UI_TO_BACKEND = { buka: 'aktif', tutup: 'nonaktif' };

const KATEGORI_STYLE = {
  prestasi : { icon: 'solar:cup-star-bold-duotone',  iconColor: '#d97706', bg: '#fef3c7' },
  riset    : { icon: 'solar:globus-bold-duotone',     iconColor: '#059669', bg: '#fee2e2' },
  industri : { icon: 'solar:laptop-bold-duotone',     iconColor: '#2563eb', bg: '#eff6ff' },
  afirmasi : { icon: 'solar:leaf-bold-duotone',        iconColor: '#10b981', bg: '#d1fae5' },
};
const KATEGORI_STYLE_DEFAULT = { icon: 'solar:diploma-bold-duotone', iconColor: '#2563eb', bg: '#eff6ff' };

function mapSponsorFromApi(s) {
  return {
    id              : s.id,
    nama_perusahaan : s.nama_perusahaan,
    industri        : s.jenis_industri || '—',
    tagline         : s.tagline || '',
    tentang         : s.tentang || '',
    narahubung      : s.narahubung || '—',
    kontak          : s.kontak_perusahaan || '—',
    email           : s.email || '',
    alamat          : s.alamat_perusahaan || '',
    warna           : s.warna || '#2563eb',
    inisial         : (s.nama_perusahaan || '??').slice(0, 2).toUpperCase(),
    is_aktif        : s.is_aktif,
    jumlah_beasiswa : 0,
    total_kuota     : 0,
  };
}

function mapBeasiswaFromApi(b) {
  const style = KATEGORI_STYLE[b.kategori] || KATEGORI_STYLE_DEFAULT;
  return {
    id             : b.id,
    sponsor_id     : b.sponsor_id,
    nama_program   : b.nama_program,
    deskripsi      : b.deskripsi || '',
    nominal_dana   : b.nominal_dana || 0,
    kuota_penerima : b.kuota || 0,
    tanggal_buka   : b.tanggal_buka,
    tanggal_tutup  : b.tanggal_tutup,
    tanggal_tes_wawancara : b.tanggal_tes_wawancara || null,
    tanggal_penetapan     : b.tanggal_penetapan || null,
    ipk_minimum           : b.ipk_minimum ?? null,
    target_ipk             : b.target_ipk ?? null,
    target_nilai_tes       : b.target_nilai_tes ?? null,
    target_nilai_wawancara : b.target_nilai_wawancara ?? null,
    target_kerja_keras     : b.target_kerja_keras ?? null,
    target_kepemimpinan    : b.target_kepemimpinan ?? null,
    target_komunikasi      : b.target_komunikasi ?? null,
    target_keberanian      : b.target_keberanian ?? null,
    kategori       : b.kategori || 'prestasi',
    status         : STATUS_BACKEND_TO_UI[b.status] || 'tutup',
    ...style,
  };
}

/** Ganti data contoh dengan data asli backend kalau sesi login-nya nyata. */
async function loadRealData() {
  if (!isRealSession) return;
  try {
    const [sponsorsRes, beasiswaRes] = await Promise.all([
      api.get('/sponsors'),
      api.get('/beasiswa'),
    ]);
    dummySponsors = sponsorsRes.data.map(mapSponsorFromApi);
    dummyBeasiswa = beasiswaRes.data.map(mapBeasiswaFromApi);
    dummySponsors.forEach(s => updateSponsorKuota(s.id));
  } catch (err) {
    console.warn('Gagal memuat data sponsor/beasiswa dari backend, pakai data contoh:', err);
  }
}

/* ============================================================
   DUMMY DATA — sponsors
   Nama field identik dengan profilPerusahaanBeasiswa.js mahasiswa
   ============================================================ */
let dummySponsors = [
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
let dummyBeasiswa = [
  {
    id             : 'b-001',
    sponsor_id     : 'sp-001',
    nama_program   : 'Beasiswa Mandiri Prestasi',
    deskripsi      : 'Untuk mahasiswa berprestasi IPK ≥ 3.50. Mencakup biaya pendidikan, tunjangan bulanan, dan pelatihan.',
    nominal_dana   : 5000000,
    kuota_penerima : 25,
    tanggal_buka   : '2026-03-01',
    tanggal_tutup  : '2026-07-31',
    tanggal_tes_wawancara : '2026-08-07',
    tanggal_penetapan     : '2026-08-14',
    ipk_minimum         : 3.00,
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
    tanggal_tes_wawancara : '2026-07-22',
    tanggal_penetapan     : '2026-07-29',
    ipk_minimum         : 3.20,
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
    tanggal_tes_wawancara : '2026-08-08',
    tanggal_penetapan     : '2026-08-15',
    ipk_minimum         : 3.00,
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
    tanggal_tes_wawancara : '2026-07-07',
    tanggal_penetapan     : '2026-07-14',
    ipk_minimum         : 3.25,
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
    tanggal_tes_wawancara : '2026-09-07',
    tanggal_penetapan     : '2026-09-14',
    ipk_minimum         : 2.75,
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
    tanggal_tes_wawancara : '2026-08-07',
    tanggal_penetapan     : '2026-08-14',
    ipk_minimum         : 3.00,
    kategori       : 'industri',
    status         : 'tutup',
    icon           : 'solar:wallet-money-bold-duotone',
    iconColor      : '#2563eb',
    bg             : '#dbeafe',
  },
];

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

  setLoading('btnSimpanSponsor', 'loaderSponsor', true);

  const payload = {
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
    inisial         : nama.slice(0, 2).toUpperCase(),
  };

  try {
    if (isRealSession) {
      const apiPayload = {
        namaPerusahaan   : payload.nama_perusahaan,
        jenisIndustri    : payload.industri,
        tagline          : payload.tagline || undefined,
        tentang          : payload.tentang || undefined,
        narahubung       : payload.narahubung || undefined,
        kontakPerusahaan : payload.kontak || undefined,
        email            : payload.email || undefined,
        alamatPerusahaan : payload.alamat || undefined,
        warna            : payload.warna,
        isAktif          : payload.is_aktif,
      };

      if (editingSponsorId) {
        const res = await api.patch(`/sponsors/${editingSponsorId}`, apiPayload);
        const idx = dummySponsors.findIndex(s => s.id === editingSponsorId);
        if (idx !== -1) dummySponsors[idx] = mapSponsorFromApi(res.data);
        showFormMsg('formSponsorMsg', 'success', '✓ Data sponsor berhasil diperbarui!');
      } else {
        const res = await api.post('/sponsors', apiPayload);
        dummySponsors.push(mapSponsorFromApi(res.data));
        showFormMsg('formSponsorMsg', 'success', '✓ Sponsor baru berhasil ditambahkan!');
      }
      dummySponsors.forEach(s => updateSponsorKuota(s.id));
    } else {
      await delay(900);

      if (editingSponsorId) {
        const idx = dummySponsors.findIndex(s => s.id === editingSponsorId);
        if (idx !== -1) dummySponsors[idx] = { ...dummySponsors[idx], ...payload };
        showFormMsg('formSponsorMsg', 'success', '✓ Data sponsor berhasil diperbarui!');
      } else {
        dummySponsors.push({ id: 'sp-' + Date.now(), jumlah_beasiswa: 0, total_kuota: 0, ...payload });
        showFormMsg('formSponsorMsg', 'success', '✓ Sponsor baru berhasil ditambahkan!');
      }
    }

    setLoading('btnSimpanSponsor', 'loaderSponsor', false);
    loadStats();
    renderSponsorGrid();
    populateSponsorSelect();

    setTimeout(() => closeModalSponsor(), 1500);
  } catch (err) {
    setLoading('btnSimpanSponsor', 'loaderSponsor', false);
    showFormMsg('formSponsorMsg', 'error', '⚠ ' + (err?.message || 'Gagal menyimpan sponsor.'));
  }
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
  f('fTanggalTesWawancara', b.tanggal_tes_wawancara);
  f('fTanggalPenetapan',    b.tanggal_penetapan);
  f('fIpkMinimum',          b.ipk_minimum);
  f('fTargetIpk',             b.target_ipk);
  f('fTargetNilaiTes',        b.target_nilai_tes);
  f('fTargetNilaiWawancara',  b.target_nilai_wawancara);
  f('fTargetKerjaKeras',      b.target_kerja_keras);
  f('fTargetKepemimpinan',    b.target_kepemimpinan);
  f('fTargetKomunikasi',      b.target_komunikasi);
  f('fTargetKeberanian',      b.target_keberanian);
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

  setLoading('btnSimpanBeasiswa', 'loaderBeasiswa', true);

  const payload = {
    nama_program   : nama,
    sponsor_id     : sponsorId,
    deskripsi      : document.getElementById('fDeskripsi').value.trim(),
    nominal_dana   : parseInt(document.getElementById('fNominalDana').value) || 0,
    kuota_penerima : parseInt(document.getElementById('fKuota').value) || 0,
    tanggal_buka   : document.getElementById('fTanggalBuka').value,
    tanggal_tutup  : document.getElementById('fTanggalTutup').value,
    tanggal_tes_wawancara : document.getElementById('fTanggalTesWawancara').value || null,
    tanggal_penetapan     : document.getElementById('fTanggalPenetapan').value || null,
    ipk_minimum           : document.getElementById('fIpkMinimum').value ? parseFloat(document.getElementById('fIpkMinimum').value) : null,
    target_ipk             : document.getElementById('fTargetIpk').value ? parseFloat(document.getElementById('fTargetIpk').value) : null,
    target_nilai_tes       : document.getElementById('fTargetNilaiTes').value ? parseFloat(document.getElementById('fTargetNilaiTes').value) : null,
    target_nilai_wawancara : document.getElementById('fTargetNilaiWawancara').value ? parseFloat(document.getElementById('fTargetNilaiWawancara').value) : null,
    target_kerja_keras     : document.getElementById('fTargetKerjaKeras').value ? parseFloat(document.getElementById('fTargetKerjaKeras').value) : null,
    target_kepemimpinan    : document.getElementById('fTargetKepemimpinan').value ? parseFloat(document.getElementById('fTargetKepemimpinan').value) : null,
    target_komunikasi      : document.getElementById('fTargetKomunikasi').value ? parseFloat(document.getElementById('fTargetKomunikasi').value) : null,
    target_keberanian      : document.getElementById('fTargetKeberanian').value ? parseFloat(document.getElementById('fTargetKeberanian').value) : null,
    kategori       : document.getElementById('fKategori').value,
    status         : document.getElementById('fStatusBeasiswa').value,
  };

  try {
    if (isRealSession) {
      const apiPayload = {
        sponsorId   : payload.sponsor_id,
        namaProgram : payload.nama_program,
        deskripsi   : payload.deskripsi || undefined,
        nominalDana : payload.nominal_dana,
        kuota       : payload.kuota_penerima,
        tanggalBuka : payload.tanggal_buka || undefined,
        tanggalTutup: payload.tanggal_tutup || undefined,
        tanggalTesWawancara: payload.tanggal_tes_wawancara,
        tanggalPenetapan   : payload.tanggal_penetapan,
        ipkMinimum         : payload.ipk_minimum,
        targetIpk             : payload.target_ipk,
        targetNilaiTes        : payload.target_nilai_tes,
        targetNilaiWawancara  : payload.target_nilai_wawancara,
        targetKerjaKeras      : payload.target_kerja_keras,
        targetKepemimpinan    : payload.target_kepemimpinan,
        targetKomunikasi      : payload.target_komunikasi,
        targetKeberanian      : payload.target_keberanian,
        kategori    : payload.kategori || undefined,
        status      : STATUS_UI_TO_BACKEND[payload.status] || 'aktif',
      };

      if (editingBeasiswaId) {
        const res = await api.patch(`/beasiswa/${editingBeasiswaId}`, apiPayload);
        const idx = dummyBeasiswa.findIndex(b => b.id === editingBeasiswaId);
        if (idx !== -1) dummyBeasiswa[idx] = mapBeasiswaFromApi(res.data);
        showFormMsg('formBeasiswaMsg', 'success', '✓ Program beasiswa berhasil diperbarui!');
      } else {
        const res = await api.post('/beasiswa', apiPayload);
        dummyBeasiswa.push(mapBeasiswaFromApi(res.data));
        showFormMsg('formBeasiswaMsg', 'success', '✓ Program beasiswa berhasil ditambahkan!');
      }
    } else {
      await delay(900);

      if (editingBeasiswaId) {
        const idx = dummyBeasiswa.findIndex(b => b.id === editingBeasiswaId);
        if (idx !== -1) dummyBeasiswa[idx] = { ...dummyBeasiswa[idx], ...payload };
        showFormMsg('formBeasiswaMsg', 'success', '✓ Program beasiswa berhasil diperbarui!');
      } else {
        dummyBeasiswa.push({
          id: 'b-' + Date.now(), icon: 'solar:diploma-bold-duotone',
          iconColor: '#2563eb', bg: '#eff6ff', ...payload,
        });
        showFormMsg('formBeasiswaMsg', 'success', '✓ Program beasiswa berhasil ditambahkan!');
      }
    }

    setLoading('btnSimpanBeasiswa', 'loaderBeasiswa', false);

    /* Update kuota sponsor */
    updateSponsorKuota(sponsorId);
    loadStats();
    renderBeasiswaList();

    setTimeout(() => closeModalBeasiswa(), 1500);
  } catch (err) {
    setLoading('btnSimpanBeasiswa', 'loaderBeasiswa', false);
    showFormMsg('formBeasiswaMsg', 'error', '⚠ ' + (err?.message || 'Gagal menyimpan program beasiswa.'));
  }
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
  setEl('hapusTitle', `${isRealSession ? 'Nonaktifkan' : 'Hapus'} ${type === 'sponsor' ? 'Sponsor' : 'Beasiswa'}?`);
  setEl('hapusDesc', isRealSession
    ? `"${nama}" akan dinonaktifkan dan tidak lagi tampil untuk mahasiswa. Data tetap tersimpan dan bisa diaktifkan kembali lewat Edit.`
    : `"${nama}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`);
  setEl('confirmHapus', isRealSession ? 'Ya, Nonaktifkan' : 'Ya, Hapus');
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
  try {
    if (isRealSession) {
      // Backend tidak punya hard-delete (konsisten dengan modul lain) —
      // "Hapus" di sini menonaktifkan lewat PATCH, bukan menghapus baris.
      if (hapusType === 'sponsor') {
        const res = await api.patch(`/sponsors/${hapusId}`, { isAktif: false });
        const idx = dummySponsors.findIndex(s => s.id === hapusId);
        if (idx !== -1) dummySponsors[idx] = mapSponsorFromApi(res.data);
      } else {
        const res = await api.patch(`/beasiswa/${hapusId}`, { status: 'nonaktif' });
        const idx = dummyBeasiswa.findIndex(b => b.id === hapusId);
        if (idx !== -1) dummyBeasiswa[idx] = mapBeasiswaFromApi(res.data);
      }
    } else if (hapusType === 'sponsor') {
      dummySponsors  = dummySponsors.filter(s => s.id !== hapusId);
      dummyBeasiswa  = dummyBeasiswa.filter(b => b.sponsor_id !== hapusId);
    } else {
      const b = dummyBeasiswa.find(x => x.id === hapusId);
      dummyBeasiswa = dummyBeasiswa.filter(x => x.id !== hapusId);
      if (b) updateSponsorKuota(b.sponsor_id);
    }

    renderSponsorGrid();
    renderFilterChips();
    renderBeasiswaList();
    loadStats();
    closeModalHapus();
  } catch (err) {
    console.error('Gagal menonaktifkan:', err);
    alert(err?.message || 'Gagal menonaktifkan data. Coba lagi.');
  }
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
  await loadRealData();
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