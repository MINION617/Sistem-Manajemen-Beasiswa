/* ============================================================
   PROFILPERUSAHAANBEASISWA.JS — Beasiswa Kampus
   Layout  : Top Navbar (identik kumpulanPerusahaanBeasiswa)
   Fitur   : Chart.js tren penerima, breakdown gender/IPK/wilayah
   ============================================================ */


/* ============================================================
   SESSION
   ============================================================ */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}

const session = getSession();

/* Uncomment saat production: */
// if (!session || session.role !== 'mahasiswa') window.location.href = '../LOGIN/login.html';

const demoSession = session || {
  nama_lengkap: 'Rizky Firmansyah',
  nim_nip:      '2021310045',
  role:         'mahasiswa',
  id:           'demo-uuid',
};


/* ============================================================
   DATA PERUSAHAAN
   ============================================================ */
const PERUSAHAAN_DATA = {
  'bank-mandiri': {
    id:              'sp-001',
    slug:            'bank-mandiri',
    nama_perusahaan: 'Bank Mandiri',
    industri:        'Perbankan',
    tagline:         'Berkomitmen mendukung pendidikan dan pengembangan sumber daya manusia Indonesia.',
    tentang:         'PT Bank Mandiri (Persero) Tbk adalah bank terbesar di Indonesia dari segi aset. Didirikan pada 2 Oktober 1998, Bank Mandiri berkomitmen pada pengembangan SDM Indonesia melalui program tanggung jawab sosial di bidang pendidikan. Program Beasiswa Mandiri telah menjangkau ribuan mahasiswa berprestasi di seluruh penjuru Indonesia sejak tahun 2003.',
    narahubung:      'Budi Santoso',
    kontak:          '+62 812 1000 2000',
    email:           'csr@bankmandiri.co.id',
    alamat:          'Jl. Jenderal Gatot Subroto Kav. 36-38, Jakarta Selatan',
    warna:           '#1e40af',
    inisial:         'BM',
    tags:            ['BUMN', 'Perbankan', 'CSR Aktif', 'Sejak 2003'],
    sosmed: [
      { label: '🌐 Website',  url: 'https://bankmandiri.co.id' },
      { label: '📘 Facebook', url: '#' },
    ],
    stats: {
      total_penerima:     342,
      total_dana_miliar:  1.7,
      tahun_mulai:        2003,
      rata_dana_tahunan:  5000000,
    },
  },
  'pertamina': {
    id:              'sp-002',
    slug:            'pertamina',
    nama_perusahaan: 'Pertamina',
    industri:        'Energi',
    tagline:         'Mendorong generasi muda untuk menjadi pemimpin di bidang energi dan lingkungan.',
    tentang:         'PT Pertamina (Persero) adalah BUMN yang bergerak di bidang energi. Pertamina Foundation mengelola program beasiswa "Pertamina Sobat Bumi" yang menyasar mahasiswa tertarik di bidang energi terbarukan dan keberlanjutan lingkungan. Komitmen terhadap sustainability adalah prioritas utama program beasiswa ini.',
    narahubung:      'Siti Rahayu',
    kontak:          '+62 813 2000 3000',
    email:           'foundation@pertamina.com',
    alamat:          'Jl. Medan Merdeka Timur No. 1A, Jakarta Pusat',
    warna:           '#dc2626',
    inisial:         'PT',
    tags:            ['BUMN', 'Energi', 'Sustainability', 'Riset'],
    sosmed: [
      { label: '🌐 Website', url: 'https://pertamina.com' },
    ],
    stats: {
      total_penerima:    187,
      total_dana_miliar: 1.4,
      tahun_mulai:       2015,
      rata_dana_tahunan: 7500000,
    },
  },
  'telkom-indonesia': {
    id:              'sp-003',
    slug:            'telkom-indonesia',
    nama_perusahaan: 'Telkom Indonesia',
    industri:        'Telekomunikasi',
    tagline:         'Mempersiapkan talenta digital Indonesia untuk transformasi teknologi global.',
    tentang:         'PT Telkom Indonesia (Persero) Tbk adalah perusahaan telekomunikasi terbesar di Indonesia. Program Digital Talent Scholarship merupakan wujud komitmen Telkom dalam mendukung pengembangan ekosistem digital. Program ini menyasar mahasiswa bidang teknologi informasi dengan fokus pada keahlian cloud computing, AI, dan cybersecurity.',
    narahubung:      'Andi Prasetyo',
    kontak:          '+62 811 3000 4000',
    email:           'scholarship@telkom.co.id',
    alamat:          'Jl. Japati No. 1, Bandung, Jawa Barat',
    warna:           '#ef4444',
    inisial:         'TI',
    tags:            ['BUMN', 'Teknologi', 'Digital', 'IT'],
    sosmed: [
      { label: '🌐 Website', url: 'https://telkom.co.id' },
    ],
    stats: {
      total_penerima:    210,
      total_dana_miliar: 0.9,
      tahun_mulai:       2018,
      rata_dana_tahunan: 4500000,
    },
  },
  'djarum-foundation': {
    id:              'sp-004',
    slug:            'djarum-foundation',
    nama_perusahaan: 'Djarum Foundation',
    industri:        'Pendidikan',
    tagline:         'Menciptakan pemimpin masa depan Indonesia yang cerdas dan berdaya saing global.',
    tentang:         'Djarum Foundation adalah yayasan filantropi dari Djarum Group, bergerak di bidang pendidikan sejak 1984. Program Beasiswa Djarum Plus dikenal sebagai salah satu program beasiswa paling bergengsi di Indonesia, menggabungkan bantuan finansial dengan pelatihan kepemimpinan dan soft skills intensif. Alumni program ini banyak menjadi pemimpin di berbagai sektor.',
    narahubung:      'Kartika Dewi',
    kontak:          '+62 812 4000 5000',
    email:           'beasiswa@djarumfoundation.org',
    alamat:          'Jl. KS Tubun No. 2, Jakarta Barat',
    warna:           '#f59e0b',
    inisial:         'DJ',
    tags:            ['Swasta', 'Pendidikan', 'Kepemimpinan', 'Sejak 1984'],
    sosmed: [
      { label: '🌐 Website',    url: 'https://djarumfoundation.org' },
      { label: '📸 Instagram',  url: '#' },
    ],
    stats: {
      total_penerima:    480,
      total_dana_miliar: 2.1,
      tahun_mulai:       1984,
      rata_dana_tahunan: 6000000,
    },
  },
  'bca': {
    id:              'sp-005',
    slug:            'bca',
    nama_perusahaan: 'BCA',
    industri:        'Perbankan',
    tagline:         'Memberdayakan generasi muda dalam bidang keuangan dan bisnis untuk Indonesia.',
    tentang:         'PT Bank Central Asia Tbk (BCA) adalah bank swasta terbesar di Indonesia. BCA Finance Scholarship menargetkan mahasiswa terbaik di bidang ekonomi, akuntansi, dan manajemen keuangan. Selain bantuan dana tuition, penerima beasiswa mendapat kesempatan magang di BCA Group dan jalur khusus rekrutmen.',
    narahubung:      'Reza Firmansyah',
    kontak:          '+62 813 5000 6000',
    email:           'scholarship@bca.co.id',
    alamat:          'Jl. M.H. Thamrin No. 1, Jakarta Pusat',
    warna:           '#3b82f6',
    inisial:         'BC',
    tags:            ['Swasta', 'Perbankan', 'Keuangan', 'Magang'],
    sosmed: [
      { label: '🌐 Website', url: 'https://bca.co.id' },
    ],
    stats: {
      total_penerima:    156,
      total_dana_miliar: 0.6,
      tahun_mulai:       2016,
      rata_dana_tahunan: 5000000,
    },
  },
  'astra-international': {
    id:              'sp-006',
    slug:            'astra-international',
    nama_perusahaan: 'Astra International',
    industri:        'Otomotif',
    tagline:         'Mencetak pemimpin masa depan yang siap berkontribusi membangun bangsa.',
    tentang:         'PT Astra International Tbk adalah konglomerasi bisnis terbesar di Indonesia. Program Astra Future Leader Scholar menggabungkan beasiswa akademik dengan program pengembangan kepemimpinan intensif, mempersiapkan mahasiswa terbaik untuk karir di Astra Group.',
    narahubung:      'Hendra Kurniawan',
    kontak:          '+62 811 6000 7000',
    email:           'csr@astra.co.id',
    alamat:          'Jl. Gaya Motor Raya No. 8, Sunter II, Jakarta Utara',
    warna:           '#10b981',
    inisial:         'AS',
    tags:            ['Swasta', 'Otomotif', 'Kepemimpinan', 'Ikatan Dinas'],
    sosmed: [
      { label: '🌐 Website', url: 'https://astra.co.id' },
    ],
    stats: {
      total_penerima:    124,
      total_dana_miliar: 1.2,
      tahun_mulai:       2012,
      rata_dana_tahunan: 5500000,
    },
  },
  'garuda-indonesia': {
    id:              'sp-007',
    slug:            'garuda-indonesia',
    nama_perusahaan: 'Garuda Indonesia',
    industri:        'Penerbangan',
    tagline:         'Membina talenta muda untuk industri penerbangan Indonesia yang maju.',
    tentang:         'PT Garuda Indonesia (Persero) Tbk adalah maskapai penerbangan nasional Indonesia. Program beasiswa Garuda Aviation Excellence membuka peluang bagi mahasiswa yang ingin berkontribusi di industri penerbangan, mencakup program teknik penerbangan, manajemen aviasi, dan hospitality.',
    narahubung:      'Doni Hermawan',
    kontak:          '+62 812 7000 8000',
    email:           'scholarship@garuda.co.id',
    alamat:          'Jl. Medan Merdeka Selatan No. 13, Jakarta Pusat',
    warna:           '#06b6d4',
    inisial:         'GI',
    tags:            ['BUMN', 'Penerbangan', 'Teknik', 'Aviasi'],
    sosmed: [
      { label: '🌐 Website', url: 'https://garuda-indonesia.com' },
    ],
    stats: {
      total_penerima:    98,
      total_dana_miliar: 0.5,
      tahun_mulai:       2014,
      rata_dana_tahunan: 5200000,
    },
  },
  'unilever': {
    id:              'sp-008',
    slug:            'unilever',
    nama_perusahaan: 'Unilever',
    industri:        'FMCG',
    tagline:         'Menginspirasi mahasiswa untuk menciptakan dampak positif melalui inovasi berkelanjutan.',
    tentang:         'PT Unilever Indonesia Tbk adalah perusahaan consumer goods terbesar di Indonesia. Program Unilever Future Leaders mendukung mahasiswa yang passion terhadap entrepreneurship, sustainability, dan product innovation. Program ini juga menyediakan mentoring dari para pemimpin bisnis dan kesempatan internship di Unilever.',
    narahubung:      'Maya Kusumawati',
    kontak:          '+62 813 8000 9000',
    email:           'scholarship@unilever.co.id',
    alamat:          'Jl. Jend. Gatot Subroto Kav. 15, Jakarta Selatan',
    warna:           '#8b5cf6',
    inisial:         'UL',
    tags:            ['Swasta', 'FMCG', 'Inovasi', 'Sustainability'],
    sosmed: [
      { label: '🌐 Website',  url: 'https://unilever.co.id' },
      { label: '📘 LinkedIn', url: '#' },
    ],
    stats: {
      total_penerima:    167,
      total_dana_miliar: 0.8,
      tahun_mulai:       2017,
      rata_dana_tahunan: 4800000,
    },
  },
};


/* ============================================================
   DATA BEASISWA per sponsor
   ============================================================ */
const BEASISWA_DATA = {
  'sp-001': [
    {
      id:             'b-001',
      nama_program:   'Beasiswa Mandiri Prestasi',
      deskripsi:      'Beasiswa untuk mahasiswa berprestasi dengan IPK minimum 3.50. Mencakup biaya pendidikan, tunjangan bulanan, dan pelatihan pengembangan diri.',
      kuota_penerima: 25,
      nominal_dana:   5000000,
      tanggal_buka:   '2026-03-01',
      tanggal_tutup:  '2026-07-31',
      status:         'buka',
      kategori:       'prestasi',
      icon:           'solar:cup-star-bold-duotone',
      iconColor:      '#d97706',
      bg:             '#fef3c7',
    },
  ],
  'sp-002': [
    {
      id:             'b-002',
      nama_program:   'Pertamina Sobat Bumi',
      deskripsi:      'Beasiswa riset di bidang energi terbarukan, lingkungan, dan keberlanjutan. Termasuk kesempatan riset bersama tim Pertamina.',
      kuota_penerima: 15,
      nominal_dana:   7500000,
      tanggal_buka:   '2026-03-15',
      tanggal_tutup:  '2026-07-15',
      status:         'buka',
      kategori:       'riset',
      icon:           'solar:globus-bold-duotone',
      iconColor:      '#059669',
      bg:             '#fee2e2',
    },
  ],
  'sp-003': [
    {
      id:             'b-003',
      nama_program:   'Telkom Digital Talent',
      deskripsi:      'Untuk mahasiswa IT/Telekomunikasi dengan minat pada pengembangan digital, cloud, dan AI. Termasuk akses pelatihan sertifikasi internasional.',
      kuota_penerima: 20,
      nominal_dana:   4500000,
      tanggal_buka:   '2026-04-01',
      tanggal_tutup:  '2026-08-01',
      status:         'buka',
      kategori:       'industri',
      icon:           'solar:laptop-bold-duotone',
      iconColor:      '#2563eb',
      bg:             '#eff6ff',
    },
  ],
  'sp-004': [
    {
      id:             'b-004',
      nama_program:   'Beasiswa Djarum Plus',
      deskripsi:      'Pelatihan soft skills intensif + dana pendidikan selama 1 tahun. Peserta bergabung dalam jaringan alumni Beswan Djarum yang kuat.',
      kuota_penerima: 30,
      nominal_dana:   6000000,
      tanggal_buka:   '2026-02-01',
      tanggal_tutup:  '2026-06-30',
      status:         'buka',
      kategori:       'prestasi',
      icon:           'solar:star-bold-duotone',
      iconColor:      '#f59e0b',
      bg:             '#fef3c7',
    },
    {
      id:             'b-006',
      nama_program:   'Beasiswa Afirmasi 3T',
      deskripsi:      'Khusus mahasiswa dari daerah Terdepan, Terluar, dan Tertinggal. Dukungan penuh selama masa studi.',
      kuota_penerima: 40,
      nominal_dana:   5000000,
      tanggal_buka:   '2026-03-01',
      tanggal_tutup:  '2026-08-31',
      status:         'buka',
      kategori:       'afirmasi',
      icon:           'solar:leaf-bold-duotone',
      iconColor:      '#10b981',
      bg:             '#d1fae5',
    },
  ],
  'sp-005': [
    {
      id:             'b-007',
      nama_program:   'BCA Finance Excellence',
      deskripsi:      'Beasiswa untuk mahasiswa bidang Ekonomi, Akuntansi, dan Manajemen Keuangan. Termasuk program magang di BCA.',
      kuota_penerima: 18,
      nominal_dana:   5000000,
      tanggal_buka:   '2026-03-01',
      tanggal_tutup:  '2026-07-31',
      status:         'buka',
      kategori:       'industri',
      icon:           'solar:wallet-money-bold-duotone',
      iconColor:      '#2563eb',
      bg:             '#dbeafe',
    },
  ],
  'sp-006': [
    {
      id:             'b-008',
      nama_program:   'Astra Future Leader Scholar',
      deskripsi:      'Program pengembangan kepemimpinan + beasiswa penuh. Peserta mengikuti training intensif dan siap untuk ikatan dinas pasca lulus.',
      kuota_penerima: 12,
      nominal_dana:   5500000,
      tanggal_buka:   '2026-02-15',
      tanggal_tutup:  '2026-07-15',
      status:         'buka',
      kategori:       'prestasi',
      icon:           'solar:crown-bold-duotone',
      iconColor:      '#10b981',
      bg:             '#d1fae5',
    },
  ],
  'sp-007': [
    {
      id:             'b-009',
      nama_program:   'Garuda Aviation Excellence',
      deskripsi:      'Untuk mahasiswa bidang teknik penerbangan, manajemen aviasi, dan hospitality. Kesempatan praktek di Garuda Indonesia.',
      kuota_penerima: 8,
      nominal_dana:   5200000,
      tanggal_buka:   '2026-04-01',
      tanggal_tutup:  '2026-08-31',
      status:         'buka',
      kategori:       'industri',
      icon:           'solar:plain-bold-duotone',
      iconColor:      '#06b6d4',
      bg:             '#cffafe',
    },
  ],
  'sp-008': [
    {
      id:             'b-010',
      nama_program:   'Unilever Future Leaders',
      deskripsi:      'Untuk mahasiswa berprestasi dengan passion di entrepreneurship dan sustainability. Mentoring dari leader bisnis dan kesempatan internship.',
      kuota_penerima: 22,
      nominal_dana:   4800000,
      tanggal_buka:   '2026-03-01',
      tanggal_tutup:  '2026-07-31',
      status:         'buka',
      kategori:       'prestasi',
      icon:           'solar:rocket-bold-duotone',
      iconColor:      '#8b5cf6',
      bg:             '#ede9fe',
    },
  ],
};


/* ============================================================
   DATA TREN PENERIMA PER TAHUN
   ============================================================ */
const PENERIMA_PER_TAHUN = {
  'sp-001': [
    { tahun: 2022, jumlah: 18, aktif: 15 },
    { tahun: 2023, jumlah: 24, aktif: 22 },
    { tahun: 2024, jumlah: 28, aktif: 26 },
    { tahun: 2025, jumlah: 32, aktif: 30 },
    { tahun: 2026, jumlah: 35, aktif: 30 },
  ],
  'sp-002': [
    { tahun: 2022, jumlah: 12, aktif: 10 },
    { tahun: 2023, jumlah: 15, aktif: 14 },
    { tahun: 2024, jumlah: 18, aktif: 17 },
    { tahun: 2025, jumlah: 22, aktif: 20 },
    { tahun: 2026, jumlah: 25, aktif: 22 },
  ],
  'sp-003': [
    { tahun: 2022, jumlah: 14, aktif: 12 },
    { tahun: 2023, jumlah: 18, aktif: 17 },
    { tahun: 2024, jumlah: 22, aktif: 21 },
    { tahun: 2025, jumlah: 26, aktif: 24 },
    { tahun: 2026, jumlah: 30, aktif: 28 },
  ],
  'sp-004': [
    { tahun: 2022, jumlah: 32, aktif: 28 },
    { tahun: 2023, jumlah: 40, aktif: 38 },
    { tahun: 2024, jumlah: 48, aktif: 46 },
    { tahun: 2025, jumlah: 56, aktif: 52 },
    { tahun: 2026, jumlah: 64, aktif: 60 },
  ],
  'sp-005': [
    { tahun: 2022, jumlah: 10, aktif: 9  },
    { tahun: 2023, jumlah: 14, aktif: 13 },
    { tahun: 2024, jumlah: 18, aktif: 17 },
    { tahun: 2025, jumlah: 22, aktif: 20 },
    { tahun: 2026, jumlah: 26, aktif: 24 },
  ],
  'sp-006': [
    { tahun: 2022, jumlah: 8,  aktif: 7  },
    { tahun: 2023, jumlah: 10, aktif: 9  },
    { tahun: 2024, jumlah: 12, aktif: 11 },
    { tahun: 2025, jumlah: 15, aktif: 14 },
    { tahun: 2026, jumlah: 18, aktif: 16 },
  ],
  'sp-007': [
    { tahun: 2022, jumlah: 6,  aktif: 5  },
    { tahun: 2023, jumlah: 8,  aktif: 7  },
    { tahun: 2024, jumlah: 11, aktif: 10 },
    { tahun: 2025, jumlah: 14, aktif: 13 },
    { tahun: 2026, jumlah: 17, aktif: 15 },
  ],
  'sp-008': [
    { tahun: 2022, jumlah: 12, aktif: 11 },
    { tahun: 2023, jumlah: 16, aktif: 15 },
    { tahun: 2024, jumlah: 20, aktif: 19 },
    { tahun: 2025, jumlah: 24, aktif: 22 },
    { tahun: 2026, jumlah: 28, aktif: 26 },
  ],
};


/* ============================================================
   DATA BREAKDOWN PENERIMA
   ============================================================ */
const PENERIMA_BREAKDOWN = {
  'sp-001': {
    byGender:  { pria: 45, wanita: 55 },
    byRegion:  { jawa: 65, sumatra: 15, sulawesi: 12, lainnya: 8 },
    byIPK:     { excellent: 35, veryGood: 40, good: 25 },
    topUniversitas: [
      { nama: 'Universitas Indonesia',          jumlah: 35 },
      { nama: 'Bandung Institute of Technology', jumlah: 28 },
      { nama: 'Universitas Gadjah Mada',         jumlah: 22 },
    ],
  },
  'sp-002': {
    byGender:  { pria: 52, wanita: 48 },
    byRegion:  { jawa: 55, sumatra: 20, kalimantan: 15, lainnya: 10 },
    byIPK:     { excellent: 40, veryGood: 35, good: 25 },
    topUniversitas: [
      { nama: 'Universitas Gadjah Mada',  jumlah: 20 },
      { nama: 'Universitas Indonesia',    jumlah: 18 },
      { nama: 'Universitas Diponegoro',   jumlah: 15 },
    ],
  },
  'sp-003': {
    byGender:  { pria: 60, wanita: 40 },
    byRegion:  { jawa: 70, sumatra: 12, lainnya: 18 },
    byIPK:     { excellent: 38, veryGood: 42, good: 20 },
    topUniversitas: [
      { nama: 'Bandung Institute of Technology', jumlah: 32 },
      { nama: 'Universitas Indonesia',           jumlah: 25 },
      { nama: 'Universitas Telkom',              jumlah: 20 },
    ],
  },
  'sp-004': {
    byGender:  { pria: 48, wanita: 52 },
    byRegion:  { jawa: 60, sumatra: 18, sulawesi: 12, lainnya: 10 },
    byIPK:     { excellent: 45, veryGood: 35, good: 20 },
    topUniversitas: [
      { nama: 'Universitas Indonesia',  jumlah: 42 },
      { nama: 'Universitas Gadjah Mada', jumlah: 35 },
      { nama: 'Universitas Airlangga',  jumlah: 28 },
    ],
  },
  'sp-005': {
    byGender:  { pria: 55, wanita: 45 },
    byRegion:  { jawa: 75, sumatra: 15, lainnya: 10 },
    byIPK:     { excellent: 42, veryGood: 38, good: 20 },
    topUniversitas: [
      { nama: 'Universitas Indonesia',      jumlah: 22 },
      { nama: 'Universitas Trisakti',       jumlah: 18 },
      { nama: 'Universitas Pelita Harapan', jumlah: 15 },
    ],
  },
  'sp-006': {
    byGender:  { pria: 58, wanita: 42 },
    byRegion:  { jawa: 80, sumatra: 12, lainnya: 8 },
    byIPK:     { excellent: 40, veryGood: 40, good: 20 },
    topUniversitas: [
      { nama: 'Universitas Indonesia',           jumlah: 18 },
      { nama: 'Bandung Institute of Technology', jumlah: 15 },
      { nama: 'Universitas Presiden',            jumlah: 12 },
    ],
  },
  'sp-007': {
    byGender:  { pria: 65, wanita: 35 },
    byRegion:  { jawa: 72, sumatra: 18, lainnya: 10 },
    byIPK:     { excellent: 38, veryGood: 42, good: 20 },
    topUniversitas: [
      { nama: 'Universitas Indonesia',              jumlah: 14 },
      { nama: 'Universitas Gunadarma',              jumlah: 12 },
      { nama: 'Politeknik Penerbangan Indonesia',   jumlah: 10 },
    ],
  },
  'sp-008': {
    byGender:  { pria: 50, wanita: 50 },
    byRegion:  { jawa: 68, sumatra: 16, sulawesi: 10, lainnya: 6 },
    byIPK:     { excellent: 42, veryGood: 38, good: 20 },
    topUniversitas: [
      { nama: 'Universitas Indonesia',  jumlah: 24 },
      { nama: 'Universitas Padjajaran', jumlah: 20 },
      { nama: 'Universitas Airlangga',  jumlah: 18 },
    ],
  },
};


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
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatTanggal(str) {
  return new Date(str).toLocaleDateString('id-ID', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function formatRegion(region) {
  const map = {
    jawa:        'Jawa',
    sumatra:     'Sumatra',
    sulawesi:    'Sulawesi',
    kalimantan:  'Kalimantan',
    lainnya:     'Lainnya',
  };
  return map[region] || region;
}

function animateCount(elId, target) {
  const el = document.getElementById(elId);
  if (!el || target === 0) {
    if (el) el.textContent = '0';
    return;
  }
  let cur  = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(t);
  }, 30);
}


/* ============================================================
   USER INFO — navbar
   ============================================================ */
function initUserInfo() {
  const s     = demoSession;
  const nama  = s?.nama_lengkap || 'Mahasiswa';
  const nim   = s?.nim_nip       || '—';
  const init  = nama.charAt(0).toUpperCase();
  const first = nama.split(' ')[0];

  setEl('navUsername',  first);
  setEl('topbarAvatar', init);
  setEl('mobileName',   nama);
  setEl('mobileNim',    'NIM: ' + nim);
  setEl('mobileAvatar', init);
}


/* ============================================================
   MAIN INIT — baca URL param dan render
   ============================================================ */
function init() {
  console.log('🚀 Initializing profil perusahaan...');

  const urlParams    = new URLSearchParams(window.location.search);
  const sponsorSlug  = urlParams.get('sponsor') || 'bank-mandiri';
  const data         = PERUSAHAAN_DATA[sponsorSlug];

  if (!data) {
    console.error('❌ Sponsor tidak ditemukan:', sponsorSlug);
    document.body.innerHTML = `
      <div style="
        padding: 60px 20px;
        text-align: center;
        font-family: system-ui;
        color: #0f172a;
      ">
        <div style="font-size: 56px; margin-bottom: 16px;"><iconify-icon icon="solar:magnifer-bold-duotone" width="56" style="color:#94a3b8"></iconify-icon></div>
        <h1 style="font-size: 22px; margin-bottom: 8px;">Perusahaan tidak ditemukan</h1>
        <a
          href="../kumpulanPerusahaanBeasiswa/kumpulanPerusahaanBeasiswa.html"
          style="color: #2563eb; font-weight: 700;"
        >
          ← Kembali ke daftar perusahaan
        </a>
      </div>
    `;
    return;
  }

  console.log('✅ Data loaded untuk:', data.nama_perusahaan);
  renderPage(data, sponsorSlug);
}


/* ============================================================
   RENDER PAGE
   ============================================================ */
function renderPage(data, slug) {
  console.log('📝 Rendering page...');

  /* Set company color CSS var */
  document.documentElement.style.setProperty('--company-color', data.warna);

  /* Logo + warna */
  const logoEl = document.getElementById('companyLogoEl');
  if (logoEl) {
    logoEl.textContent       = data.inisial;
    logoEl.style.background  = data.warna;
  }

  /* Hero content */
  setEl('companyIndustryTag', data.industri);
  setEl('companyName',        data.nama_perusahaan);
  setEl('companyTagline',     data.tagline);
  setEl('breadcrumbNama',     data.nama_perusahaan);
  setEl('aboutNama',          data.nama_perusahaan);
  setEl('ctaNama',            data.nama_perusahaan);

  /* Meta row */
  setEl('metaKontakVal', data.kontak);
  setEl('metaAlamatVal', data.alamat);

  /* About */
  setEl('aboutDesc', data.tentang);

  /* Tags */
  const tagsEl = document.getElementById('aboutTags');
  if (tagsEl) {
    tagsEl.innerHTML = data.tags.map(t =>
      `<span class="tag" style="
        background: ${data.warna}18;
        color: ${data.warna};
        border: 1.5px solid ${data.warna}40;
      ">${t}</span>`
    ).join('');
  }

  /* Contact */
  const contactEl = document.getElementById('contactList');
  if (contactEl) {
    contactEl.innerHTML = `
      <div class="contact-item">
        <div class="contact-item-icon"><iconify-icon icon="solar:user-bold-duotone" width="18" style="color:#2563eb"></iconify-icon></div>
        <div>
          <div class="contact-item-label">Narahubung</div>
          <div class="contact-item-val">${data.narahubung}</div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon"><iconify-icon icon="solar:phone-bold-duotone" width="18" style="color:#2563eb"></iconify-icon></div>
        <div>
          <div class="contact-item-label">Telepon / WhatsApp</div>
          <div class="contact-item-val">${data.kontak}</div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon"><iconify-icon icon="solar:letter-bold-duotone" width="18" style="color:#2563eb"></iconify-icon></div>
        <div>
          <div class="contact-item-label">Email</div>
          <div class="contact-item-val">
            <a href="mailto:${data.email}" style="color: inherit;">${data.email}</a>
          </div>
        </div>
      </div>
      <div class="contact-item">
        <div class="contact-item-icon"><iconify-icon icon="solar:map-point-bold-duotone" width="18" style="color:#2563eb"></iconify-icon></div>
        <div>
          <div class="contact-item-label">Alamat Kantor</div>
          <div class="contact-item-val">${data.alamat}</div>
        </div>
      </div>
    `;
  }

  /* Sosmed */
  if (data.sosmed && data.sosmed.length) {
    const sosmedCard = document.getElementById('sosmedCard');
    const sosmedList = document.getElementById('sosmedList');
    if (sosmedCard) sosmedCard.style.display = 'block';
    if (sosmedList) {
      sosmedList.innerHTML = data.sosmed.map(s =>
        `<a href="${s.url}" class="sosmed-item" target="_blank" rel="noopener">${s.label}</a>`
      ).join('');
    }
  }

  /* Stats — ambil dari beasiswa dan penerima data */
  const beasiswaArr      = BEASISWA_DATA[data.id] || [];
  const penerimaData     = PENERIMA_PER_TAHUN[data.id] || [];
  const tahunTerakhir    = penerimaData[penerimaData.length - 1] || {};
  const totalKuota       = beasiswaArr.reduce((s, b) => s + b.kuota_penerima, 0);
  const danaString       = 'Rp ' + (data.stats.total_dana_miliar * 1000).toFixed(0) + ' Jt';

  /* Hero floating cards */
  setEl('heroTotalPenerima', data.stats.total_penerima + ' mahasiswa');
  setEl('heroTotalKuota',    totalKuota + ' kuota');
  setEl('stripDana',         danaString);

  /* Stat tiles + hero badge */
  animateCount('stripBeasiswa', beasiswaArr.length);
  animateCount('stripKuota',    totalKuota);
  animateCount('stripPenerima', tahunTerakhir.aktif || 0);

  /* Stat tile "Dana Disalurkan" (separate ID dari stripDana) */
  setEl('statProgram',   beasiswaArr.length);
  setEl('statDanaTotal', danaString);

  /* Init scroll animations */
  initScrollAnimations();

  /* Render beasiswa list */
  renderBeasiswa(data);

  /* Render charts setelah sedikit delay */
  setTimeout(() => {
    console.log('📊 Rendering charts...');
    renderChartsAndStats(data, slug);
  }, 120);

  console.log('✅ Page rendering complete!');
}


/* ============================================================
   RENDER BEASISWA LIST
   ============================================================ */
function renderBeasiswa(data) {
  const listEl  = document.getElementById('beasiswaList');
  const emptyEl = document.getElementById('noBeasiswa');
  const beasiswa = BEASISWA_DATA[data.id] || [];

  if (!beasiswa.length) {
    if (listEl)  listEl.innerHTML   = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  if (listEl) {
    listEl.innerHTML = beasiswa.map(b => {
      const tglTutup = new Date(b.tanggal_tutup);
      const sisa     = Math.ceil((tglTutup - Date.now()) / 86400000);
      const sisaBadge = sisa > 0
        ? `<span class="bs-tag"><iconify-icon icon="solar:clock-circle-bold-duotone" width="12" style="vertical-align:middle;margin-right:3px"></iconify-icon>Sisa ${sisa} hari</span>`
        : `<span class="bs-tag" style="color: #be123c;"><iconify-icon icon="solar:close-circle-bold-duotone" width="12" style="vertical-align:middle;margin-right:3px"></iconify-icon>Pendaftaran Tutup</span>`;

      return `
        <div class="bs-card fade-in" style="--bs-color: ${data.warna}; border-left-color: ${data.warna};">
          <div class="bs-card-emoji" style="background: ${b.bg};"><iconify-icon icon="${b.icon}" width="28" style="color:${b.iconColor}"></iconify-icon></div>
          <div class="bs-card-main">
            <div class="bs-card-nama">${b.nama_program}</div>
            <div class="bs-card-desc">${b.deskripsi}</div>
            <div class="bs-card-tags">
              <span class="bs-tag"><iconify-icon icon="solar:calendar-bold-duotone" width="12" style="vertical-align:middle;margin-right:3px"></iconify-icon>${formatTanggal(b.tanggal_buka)} – ${formatTanggal(b.tanggal_tutup)}</span>
              ${sisaBadge}
              <span class="bs-tag"><iconify-icon icon="solar:tag-bold-duotone" width="12" style="vertical-align:middle;margin-right:3px"></iconify-icon>${capitalize(b.kategori)}</span>
            </div>
          </div>
          <div class="bs-card-right">
            <div class="bs-nominal">
              ${formatRupiah(b.nominal_dana)}
              <span style="font-size: 11px; font-weight: 500; color: var(--text-3);">/bln</span>
            </div>
            <div class="bs-kuota"><iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="13" style="vertical-align:middle;margin-right:3px"></iconify-icon>${b.kuota_penerima} kuota</div>
            ${b.status === 'buka' && sisa > 0 ? `
              <div class="bs-status-open">
                <div class="bs-status-dot"></div>
                Pendaftaran Buka
              </div>
              <a href="../daftarBeasiswa/daftarBeasiswa.html" class="btn-daftar-bs">
                Daftar Sekarang
                <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            ` : `
              <div style="font-size: 11px; font-weight: 700; color: var(--text-4); margin-top: 4px;">
                Pendaftaran Tutup
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    /* Observe newly inserted fade-in elements */
    document.querySelectorAll('.bs-card.fade-in').forEach(el => {
      if (fadeObserver) fadeObserver.observe(el);
    });
  }
}


/* ============================================================
   RENDER CHARTS & STATS — diinsert setelah #beasiswa
   ============================================================ */
function renderChartsAndStats(data, slug) {
  const penerimaData = PENERIMA_PER_TAHUN[data.id] || [];
  const breakdown    = PENERIMA_BREAKDOWN[data.id]  || {};

  const beasiswaSection = document.getElementById('beasiswa');
  if (!beasiswaSection) {
    console.warn('⚠ Beasiswa section not found');
    return;
  }

  const chartHTML = `
    <section class="chart-section fade-in" id="chartSection">

      <div style="max-width: 1280px; margin: 0 auto;">

        <div style="margin-bottom: 24px;">
          <span style="
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: var(--blue-600);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
          ">
            <iconify-icon icon="solar:chart-2-bold-duotone" width="13" style="vertical-align:middle;margin-right:4px"></iconify-icon>Data & Statistik
          </span>
          <h2 style="
            font-family: var(--font-display);
            font-size: 26px;
            font-weight: 800;
            color: var(--text);
            margin-bottom: 6px;
          ">
            Tren & Breakdown <em style="color: ${data.warna}; font-style: normal;">Penerima Beasiswa</em>
          </h2>
          <p style="font-size: 14px; color: var(--text-3);">
            Analisis detail tentang penerima beasiswa tahun-tahun sebelumnya.
          </p>
        </div>

        <div class="charts-grid">

          <!-- Chart Tren -->
          <div class="chart-card fade-in">
            <h3 class="chart-card-title"><iconify-icon icon="solar:chart-bold-duotone" width="16" style="vertical-align:middle;margin-right:5px;color:#2563eb"></iconify-icon>Tren Penerima Per Tahun</h3>
            <canvas id="trenChart" height="80"></canvas>
            <p class="chart-note">Data menunjukkan pertumbuhan konsisten penerima beasiswa aktif.</p>
          </div>

          <!-- Chart Gender -->
          <div class="chart-card fade-in">
            <h3 class="chart-card-title"><iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="16" style="vertical-align:middle;margin-right:5px;color:#2563eb"></iconify-icon>Breakdown Gender</h3>
            <div class="stats-mini">
              <div class="stat-mini" style="--color: #3b82f6;">
                <div class="stat-mini-num">${breakdown.byGender?.pria || 50}%</div>
                <div class="stat-mini-label">Pria</div>
              </div>
              <div class="stat-mini" style="--color: #ec4899;">
                <div class="stat-mini-num">${breakdown.byGender?.wanita || 50}%</div>
                <div class="stat-mini-label">Wanita</div>
              </div>
            </div>
            <canvas id="genderChart" height="40" style="margin-top: 12px;"></canvas>
          </div>

          <!-- Distribusi IPK -->
          <div class="chart-card fade-in">
            <h3 class="chart-card-title"><iconify-icon icon="solar:diploma-bold-duotone" width="16" style="vertical-align:middle;margin-right:5px;color:#2563eb"></iconify-icon>Distribusi IPK</h3>
            <div class="stats-mini" style="flex-direction: column; gap: 8px;">
              <div class="stat-mini" style="--color: #f59e0b; display: flex; align-items: center; gap: 10px; text-align: left; padding: 10px 14px;">
                <iconify-icon icon="solar:star-bold-duotone" width="20" style="color:#f59e0b"></iconify-icon>
                <div>
                  <div class="stat-mini-num" style="font-size: 18px;">${breakdown.byIPK?.excellent || 40}%</div>
                  <div class="stat-mini-label">Excellent (IPK 3.8+)</div>
                </div>
              </div>
              <div class="stat-mini" style="--color: #34d399; display: flex; align-items: center; gap: 10px; text-align: left; padding: 10px 14px;">
                <iconify-icon icon="solar:check-circle-bold-duotone" width="20" style="color:#34d399"></iconify-icon>
                <div>
                  <div class="stat-mini-num" style="font-size: 18px;">${breakdown.byIPK?.veryGood || 35}%</div>
                  <div class="stat-mini-label">Very Good (3.5–3.8)</div>
                </div>
              </div>
              <div class="stat-mini" style="--color: #60a5fa; display: flex; align-items: center; gap: 10px; text-align: left; padding: 10px 14px;">
                <iconify-icon icon="solar:like-bold-duotone" width="20" style="color:#60a5fa"></iconify-icon>
                <div>
                  <div class="stat-mini-num" style="font-size: 18px;">${breakdown.byIPK?.good || 25}%</div>
                  <div class="stat-mini-label">Good (3.0–3.5)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Distribusi Wilayah -->
          <div class="chart-card fade-in">
            <h3 class="chart-card-title"><iconify-icon icon="solar:map-bold-duotone" width="16" style="vertical-align:middle;margin-right:5px;color:#2563eb"></iconify-icon>Distribusi Wilayah</h3>
            <div class="region-list">
              ${breakdown.byRegion
                ? Object.entries(breakdown.byRegion).map(([region, pct]) => `
                    <div class="region-item">
                      <div class="region-name">${formatRegion(region)}</div>
                      <div class="region-bar">
                        <div class="region-fill" style="width: ${pct}%; background: ${data.warna};"></div>
                      </div>
                      <div class="region-pct">${pct}%</div>
                    </div>
                  `).join('')
                : '<p style="font-size:13px; color: var(--text-3);">Data tidak tersedia.</p>'
              }
            </div>
          </div>

        </div>

        <!-- Top Universitas -->
        <div class="chart-card fade-in" style="margin-top: 16px;">
          <h3 class="chart-card-title"><iconify-icon icon="solar:buildings-bold-duotone" width="16" style="vertical-align:middle;margin-right:5px;color:#2563eb"></iconify-icon>Top Universitas Penerima</h3>
          <div class="top-unis">
            ${breakdown.topUniversitas
              ? breakdown.topUniversitas.map((uni, idx) => `
                  <div class="uni-item">
                    <div class="uni-rank" style="background: ${data.warna};">${idx + 1}</div>
                    <div class="uni-info">
                      <div class="uni-name">${uni.nama}</div>
                      <div class="uni-count">${uni.jumlah} mahasiswa</div>
                    </div>
                  </div>
                `).join('')
              : '<p style="font-size:13px; color: var(--text-3);">Data tidak tersedia.</p>'
            }
          </div>
        </div>

      </div>
    </section>
  `;

  beasiswaSection.insertAdjacentHTML('afterend', chartHTML);
  document.getElementById('chartSection')?.classList.add('visible');

  /* Observe new chart cards */
  setTimeout(() => {
    document.querySelectorAll('.chart-card.fade-in').forEach(el => {
      if (!el.classList.contains('visible') && fadeObserver) {
        fadeObserver.observe(el);
      }
    });
  }, 50);

  /* Chart.js */
  if (penerimaData.length > 0 && typeof Chart !== 'undefined') {

    /* Tren Chart */
    try {
      const ctx = document.getElementById('trenChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: penerimaData.map(d => d.tahun),
            datasets: [
              {
                label:                 'Total Penerima',
                data:                  penerimaData.map(d => d.jumlah),
                borderColor:           data.warna,
                backgroundColor:       data.warna + '20',
                borderWidth:           2.5,
                fill:                  true,
                tension:               0.4,
                pointRadius:           5,
                pointBackgroundColor:  data.warna,
                pointBorderColor:      '#fff',
                pointBorderWidth:      2,
              },
              {
                label:                 'Penerima Aktif',
                data:                  penerimaData.map(d => d.aktif),
                borderColor:           data.warna + 'cc',
                borderDash:            [5, 5],
                borderWidth:           2,
                fill:                  false,
                tension:               0.4,
                pointRadius:           4,
                pointBackgroundColor:  data.warna + 'cc',
                pointBorderColor:      '#fff',
                pointBorderWidth:      2,
              },
            ],
          },
          options: {
            responsive:          true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: true,
                labels:  { font: { size: 12, family: 'Plus Jakarta Sans' }, padding: 15 },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks:       { font: { size: 11 } },
                grid:        { color: '#e1e9f820' },
              },
              x: {
                ticks: { font: { size: 11 } },
                grid:  { display: false },
              },
            },
          },
        });
        console.log('✅ Tren chart rendered');
      }
    } catch (e) {
      console.error('❌ Tren chart error:', e);
    }

    /* Gender Doughnut Chart */
    try {
      const gCtx = document.getElementById('genderChart');
      if (gCtx && breakdown.byGender) {
        new Chart(gCtx, {
          type: 'doughnut',
          data: {
            labels: ['Pria', 'Wanita'],
            datasets: [{
              data:            [breakdown.byGender.pria, breakdown.byGender.wanita],
              backgroundColor: ['#3b82f6', '#ec4899'],
              borderColor:     '#fff',
              borderWidth:     3,
            }],
          },
          options: {
            responsive:          true,
            maintainAspectRatio: true,
            plugins:             { legend: { display: false } },
          },
        });
        console.log('✅ Gender chart rendered');
      }
    } catch (e) {
      console.error('❌ Gender chart error:', e);
    }

  } else if (typeof Chart === 'undefined') {
    console.warn('⚠ Chart.js tidak ditemukan');
  }
}


/* ============================================================
   SCROLL ANIMATIONS — IntersectionObserver untuk .fade-in
   ============================================================ */
let fadeObserver;

function initScrollAnimations() {
  fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        fadeObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in, .reveal').forEach(el => {
    fadeObserver.observe(el);
  });
}


/* ============================================================
   NAVBAR SCROLL
   ============================================================ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}


/* ============================================================
   MOBILE NAV
   ============================================================ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay   = document.getElementById('mobileNavOverlay');

  function openNav() {
    mobileNav?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburger?.classList.add('open');
  }

  function closeNav() {
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
    hamburger?.classList.remove('open');
  }

  hamburger?.addEventListener('click', () => {
    if (mobileNav?.classList.contains('open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  overlay?.addEventListener('click', closeNav);

  document.getElementById('mobileBtnLogout')?.addEventListener('click', () => {
    closeNav();
    setTimeout(() => showLogoutModal(), 200);
  });
}


/* ============================================================
   LOGOUT
   ============================================================ */
function showLogoutModal() {
  document.getElementById('logoutModal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function hideLogoutModal() {
  document.getElementById('logoutModal')?.classList.remove('active');
  document.body.style.overflow = '';
}

function initLogout() {
  document.getElementById('btnLogout')?.addEventListener('click',     showLogoutModal);
  document.getElementById('cancelLogout')?.addEventListener('click',  hideLogoutModal);
  document.getElementById('logoutOverlay')?.addEventListener('click', hideLogoutModal);

  document.getElementById('confirmLogout')?.addEventListener('click', () => {
    sessionStorage.removeItem('bk_user');
    localStorage.removeItem('bk_user');
    window.location.href = '../LOGIN/login.html';
  });
}


/* ============================================================
   BACKGROUND CANVAS — orbs biru mengambang
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
    x:     Math.random() * window.innerWidth,
    y:     Math.random() * window.innerHeight,
    r:     100 + Math.random() * 180,
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


/* ============================================================
   FLOATING PARTICLES — emoji bisnis / perusahaan
   ============================================================ */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const iconSet = [
    ['solar:buildings-2-bold-duotone',  'rgba(37,99,235,0.22)'],
    ['solar:bag-bold-duotone',          'rgba(99,102,241,0.20)'],
    ['solar:diploma-bold-duotone',      'rgba(37,99,235,0.18)'],
    ['solar:star-bold-duotone',         'rgba(251,191,36,0.22)'],
    ['solar:rocket-bold-duotone',       'rgba(37,99,235,0.18)'],
    ['solar:lightbulb-bold-duotone',    'rgba(251,191,36,0.22)'],
    ['solar:wrench-bold-duotone',       'rgba(16,185,129,0.18)'],
    ['solar:chart-2-bold-duotone',      'rgba(37,99,235,0.20)'],
    ['solar:target-bold-duotone',       'rgba(239,68,68,0.18)'],
    ['solar:cup-star-bold-duotone',     'rgba(251,191,36,0.20)'],
  ];
  const count = 16;

  for (let i = 0; i < count; i++) {
    const [iconName, color] = iconSet[i % iconSet.length];
    const p                 = document.createElement('iconify-icon');

    p.setAttribute('icon', iconName);
    p.className = 'particle';

    const dur   = 7 + Math.random() * 9;
    const delay = Math.random() * 12;
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
   KEYBOARD SHORTCUT
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideLogoutModal();
});


/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  initNavbarScroll();
  initMobileNav();
  initLogout();
  init(); /* Render page content berdasarkan URL param */

  console.log('🏢 profilPerusahaanBeasiswa.js loaded');
});