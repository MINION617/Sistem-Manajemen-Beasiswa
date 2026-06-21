/* ============================================
   BERANDA.JS — Beasiswa Kampus
   Interaktivitas + Dummy Data
   Perubahan: Tombol "Daftar →" dan "Daftar Sekarang"
   sekarang redirect ke daftarBeasiswa.html
   Section form pendaftaran dihapus dari beranda.
   ============================================ */

// ===== DATA (sesuai kolom SQL) =====
// sponsors.nama_perusahaan, sponsors.industri
const sponsors = [
  { id: 1, nama_perusahaan: 'Bank Mandiri',        industri: 'Perbankan',       color: '#1e40af', slug: 'bank-mandiri'        },
  { id: 2, nama_perusahaan: 'Pertamina',            industri: 'Energi',          color: '#dc2626', slug: 'pertamina'           },
  { id: 3, nama_perusahaan: 'Telkom Indonesia',     industri: 'Telekomunikasi',  color: '#ef4444', slug: 'telkom-indonesia'    },
  { id: 4, nama_perusahaan: 'Djarum Foundation',    industri: 'Pendidikan',      color: '#f59e0b', slug: 'djarum-foundation'   },
  { id: 5, nama_perusahaan: 'BCA',                  industri: 'Perbankan',       color: '#3b82f6', slug: 'bca'                 },
  { id: 6, nama_perusahaan: 'Astra International',  industri: 'Otomotif',        color: '#10b981', slug: 'astra-international' },
  { id: 7, nama_perusahaan: 'Garuda Indonesia',     industri: 'Penerbangan',     color: '#06b6d4', slug: null                 },
  { id: 8, nama_perusahaan: 'Unilever',             industri: 'FMCG',            color: '#8b5cf6', slug: null                 },
];

// beasiswa.nama_program, beasiswa.kuota_penerima, beasiswa.kategori, beasiswa.deskripsi
const beasiswaList = [
  {
    id: 1, nama_program: 'Beasiswa Mandiri Prestasi', sponsor: 'Bank Mandiri',
    tahun: '2026/2027', kuota_penerima: 25, kategori: 'prestasi',
    deskripsi: 'Beasiswa untuk mahasiswa berprestasi dengan IPK minimum 3.50.',
    emoji: '🏆', color: '#dbeafe', accent: '#fbbf24',
  },
  {
    id: 2, nama_program: 'Pertamina Sobat Bumi', sponsor: 'Pertamina',
    tahun: '2026/2027', kuota_penerima: 15, kategori: 'riset',
    deskripsi: 'Beasiswa riset bidang energi terbarukan dan lingkungan.',
    emoji: '🌍', color: '#fee2e2', accent: '#fb7185',
  },
  {
    id: 3, nama_program: 'Beasiswa Djarum Plus', sponsor: 'Djarum Foundation',
    tahun: '2026/2027', kuota_penerima: 30, kategori: 'prestasi',
    deskripsi: 'Pelatihan soft skills + dana pendidikan selama 1 tahun penuh.',
    emoji: '✨', color: '#fef3c7', accent: '#f59e0b',
  },
  {
    id: 4, nama_program: 'Telkom Digital Talent', sponsor: 'Telkom Indonesia',
    tahun: '2026/2027', kuota_penerima: 20, kategori: 'industri',
    deskripsi: 'Untuk mahasiswa IT/Telekomunikasi dengan minat pengembangan digital.',
    emoji: '💻', color: '#fee2e2', accent: '#ef4444',
  },
  {
    id: 5, nama_program: 'Beasiswa BCA Finance', sponsor: 'BCA',
    tahun: '2026/2027', kuota_penerima: 18, kategori: 'industri',
    deskripsi: 'Khusus mahasiswa Ekonomi, Akuntansi, dan Manajemen Keuangan.',
    emoji: '💰', color: '#dbeafe', accent: '#3b82f6',
  },
  {
    id: 6, nama_program: 'Beasiswa Afirmasi 3T', sponsor: 'Djarum Foundation',
    tahun: '2026/2027', kuota_penerima: 40, kategori: 'afirmasi',
    deskripsi: 'Untuk mahasiswa daerah Terdepan, Terluar, dan Tertinggal Indonesia.',
    emoji: '🌱', color: '#d1fae5', accent: '#10b981',
  },
  {
    id: 7, nama_program: 'Astra Future Leader', sponsor: 'Astra International',
    tahun: '2026/2027', kuota_penerima: 12, kategori: 'prestasi',
    deskripsi: 'Program pengembangan kepemimpinan + ikatan dinas pasca lulus.',
    emoji: '🚀', color: '#d1fae5', accent: '#34d399',
  },
  {
    id: 8, nama_program: 'Garuda Aviation Scholar', sponsor: 'Garuda Indonesia',
    tahun: '2026/2027', kuota_penerima: 8, kategori: 'industri',
    deskripsi: 'Beasiswa untuk teknik penerbangan dan manajemen aviasi.',
    emoji: '✈️', color: '#cffafe', accent: '#06b6d4',
  },
  {
    id: 9, nama_program: 'Unilever Bright Future', sponsor: 'Unilever',
    tahun: '2026/2027', kuota_penerima: 22, kategori: 'riset',
    deskripsi: 'Riset di bidang sustainability dan consumer goods inovatif.',
    emoji: '🔬', color: '#ede9fe', accent: '#8b5cf6',
  },
];

// Dummy cek status — status sesuai enum status_seleksi SQL
const STATUS_LABEL = {
  menunggu_verifikasi: 'Menunggu Verifikasi',
  lolos_berkas:        'Lolos Berkas',
  wawancara:           'Wawancara',
  lolos_final:         'Lolos Final',
  ditolak_berkas:      'Ditolak Berkas',
  tidak_lolos_final:   'Tidak Lolos',
};
const STATUS_CLASS = {
  menunggu_verifikasi: 'status-pending',
  lolos_berkas:        'status-verified',
  wawancara:           'status-verified',
  lolos_final:         'status-approved-tag',
  ditolak_berkas:      'status-rejected',
  tidak_lolos_final:   'status-rejected',
};

// pendaftaran.mahasiswa_id → profiles.nim_nip
const pendaftaranData = [
  { nim_nip: '2150001', nama_lengkap: 'Adinda Putri Lestari', beasiswa: 'Beasiswa Mandiri Prestasi', tanggal_daftar: '2026-04-12', status: 'lolos_final'         },
  { nim_nip: '2150042', nama_lengkap: 'Bagas Pratama Wijaya', beasiswa: 'Pertamina Sobat Bumi',      tanggal_daftar: '2026-04-15', status: 'lolos_berkas'        },
  { nim_nip: '2150078', nama_lengkap: 'Cahaya Nur Aisyah',    beasiswa: 'Beasiswa Djarum Plus',      tanggal_daftar: '2026-04-20', status: 'menunggu_verifikasi' },
  { nim_nip: '2150123', nama_lengkap: 'Dimas Surya Atmaja',   beasiswa: 'Telkom Digital Talent',     tanggal_daftar: '2026-04-08', status: 'ditolak_berkas'      },
];

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== MOBILE MENU =====
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// ===== ACTIVE NAV ON SCROLL =====
const sections   = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinkEls.forEach(link => {
    const href = link.getAttribute('href');
    // Hanya tandai active untuk anchor href (#...), bukan href ke halaman lain
    if (href && href.startsWith('#')) {
      link.classList.toggle('active', href === '#' + current);
    }
  });
});

// ===== HERO STATS COUNTER =====
const animateCounter = (el) => {
  const target   = +el.dataset.count;
  const duration = 2000;
  const start    = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(target * eased).toLocaleString('id-ID');
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
  });
});
document.querySelectorAll('.stat-number').forEach(c => counterObserver.observe(c));

// ===== RENDER BEASISWA CARDS =====
// Klik "Daftar →" → redirect ke daftarBeasiswa.html?id={beasiswa_id}
// User akan langsung melihat modal detail beasiswa yang dipilih
const beasiswaGrid = document.getElementById('beasiswaGrid');
function renderBeasiswa(filter = 'all') {
  const items = filter === 'all' ? beasiswaList : beasiswaList.filter(b => b.kategori === filter);
  beasiswaGrid.innerHTML = items.map(b => `
    <div class="beasiswa-card fade-in" style="--accent: ${b.accent};">
      <div class="beasiswa-card-top">
        <div class="beasiswa-emoji" style="--bg-color: ${b.color};">${b.emoji}</div>
        <span class="kuota-badge">${b.kuota_penerima} kuota</span>
      </div>
      <h3 class="beasiswa-name">${b.nama_program}</h3>
      <p class="beasiswa-sponsor">Sponsor: <strong>${b.sponsor}</strong></p>
      <p class="beasiswa-desc">${b.deskripsi}</p>
      <div class="beasiswa-meta">
        <span class="beasiswa-tahun">📅 ${b.tahun}</span>
        <a href="daftarBeasiswa/daftarBeasiswa.html?id=${b.id}" class="beasiswa-btn">Daftar →</a>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.beasiswa-card.fade-in').forEach(el => fadeObserver.observe(el));
}

// ===== FILTER =====
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderBeasiswa(chip.dataset.filter);
  });
});

// ===== RENDER SPONSOR =====
// Sponsor yang punya slug → link ke profilPerusahaanBeasiswa.html?sponsor={slug}
// Sponsor tanpa slug (Garuda, Unilever) → tidak bisa diklik
const sponsorGrid = document.getElementById('sponsorGrid');
function renderSponsors() {
  sponsorGrid.innerHTML = sponsors.map(s => {
    const inisial = s.nama_perusahaan.split(' ').map(w => w[0]).slice(0, 2).join('');
    const inner = `
      <div class="sponsor-logo" style="background: ${s.color};">${inisial}</div>
      <div class="sponsor-name">${s.nama_perusahaan}</div>
      <div class="sponsor-industri">${s.industri}</div>`;

    if (s.slug) {
      return `<a href="profilPerusahaanBeasiswa/profilPerusahaanBeasiswa.html?sponsor=${s.slug}"
                 class="sponsor-card fade-in" style="--accent: ${s.color}; text-decoration:none; cursor:pointer;"
                 title="Lihat profil ${s.nama_perusahaan}">${inner}</a>`;
    }
    return `<div class="sponsor-card fade-in" style="--accent: ${s.color};">${inner}</div>`;
  }).join('');
  document.querySelectorAll('.sponsor-card.fade-in').forEach(el => fadeObserver.observe(el));
}

// ===== CEK STATUS =====
// Cari berdasarkan nim_nip, tampilkan status sesuai enum status_seleksi
function cekStatus() {
  const nim    = document.getElementById('nimCek').value.trim();
  const result = document.getElementById('statusResult');

  if (!nim) {
    result.innerHTML = `<div class="status-empty"><div class="status-icon">⚠️</div><p>Masukkan NIM terlebih dahulu</p></div>`;
    return;
  }

  const data = pendaftaranData.find(p => p.nim_nip === nim);
  if (!data) {
    result.innerHTML = `<div class="status-empty"><div class="status-icon">😔</div><p>NIM <strong>${nim}</strong> belum terdaftar.<br/>Silakan daftar terlebih dahulu.</p></div>`;
    return;
  }

  const label   = STATUS_LABEL[data.status] || data.status;
  const cls     = STATUS_CLASS[data.status] || 'status-pending';
  const tanggal = new Date(data.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  result.innerHTML = `
    <div class="status-result">
      <div class="status-result-name">${data.nama_lengkap}</div>
      <div class="status-result-nim">NIM: ${data.nim_nip}</div>
      <div class="status-row"><span>Beasiswa</span><span>${data.beasiswa}</span></div>
      <div class="status-row"><span>Tanggal Daftar</span><span>${tanggal}</span></div>
      <div class="status-row"><span>Status</span><span class="status-tag ${cls}">${label}</span></div>
    </div>`;
}

document.getElementById('btnCekStatus').addEventListener('click', cekStatus);
document.getElementById('nimCek').addEventListener('keypress', (e) => { if (e.key === 'Enter') cekStatus(); });

// ===== FADE IN ON SCROLL =====
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.section-header, .status-card').forEach(el => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderBeasiswa('all');
  renderSponsors();
  console.log('🎓 Beasiswa Kampus — Beranda loaded!');
});