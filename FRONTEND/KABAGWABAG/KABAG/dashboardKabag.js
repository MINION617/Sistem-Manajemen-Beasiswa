/* ============================================================
   DASHBOARDKABAG.JS — Beasiswa Kampus (Kabag)
   Role: Kepala Bagian — monitoring seleksi & laporan staff
   ============================================================ */


/* ── SESSION ── */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session = getSession();
if (!session || session.role !== 'kabag') {
  // window.location.href = '../../LOGIN/login.html';
}
const demoSession = session || {
  nama_lengkap : 'Dr. Suharto, M.Pd.',
  role         : 'kabag',
  id           : 'demo-kabag-uuid'
};
const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

/* ── DUMMY DATA PENDAFTAR ── */
const dummyPendaftar = [
  { id:'p-001', nama:'Bagas Pratama Wijaya',  nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', nilai_tes:88, nilai_wawancara:85, ipk:3.82, status:'wawancara',   tgl:'2026-06-18T08:00:00Z' },
  { id:'p-002', nama:'Cahaya Nur Aisyah',     nim:'2021220032', beasiswa:'Pertamina Sobat Bumi',      nilai_tes:91, nilai_wawancara:89, ipk:3.91, status:'wawancara',   tgl:'2026-07-02T08:00:00Z' },
  { id:'p-003', nama:'Dimas Surya Atmaja',    nim:'2020130021', beasiswa:'Beasiswa Mandiri Prestasi', nilai_tes:79, nilai_wawancara:82, ipk:3.65, status:'lolos_berkas', tgl:'2026-07-05T08:00:00Z' },
  { id:'p-004', nama:'Elisa Rahayu Putri',    nim:'2022510017', beasiswa:'Telkom Digital Talent',     nilai_tes:85, nilai_wawancara:87, ipk:3.77, status:'wawancara',   tgl:'2026-06-15T08:00:00Z' },
  { id:'p-005', nama:'Fadhlan Rizki Maulana', nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', nilai_tes:93, nilai_wawancara:91, ipk:3.95, status:'lolos_final', tgl:'2026-06-01T08:00:00Z' },
  { id:'p-006', nama:'Gita Safira Dewi',      nim:'2023110029', beasiswa:'Pertamina Sobat Bumi',      nilai_tes:72, nilai_wawancara:null, ipk:3.50, status:'lolos_berkas', tgl:'2026-07-06T08:00:00Z' },
];

const dummyLaporan = [
  { id:'l-001', judul:'Bukti transfer belum muncul',        mahasiswa:'Bagas Pratama',  status:'masuk',    tgl:'2026-06-20T08:00:00Z' },
  { id:'l-002', judul:'Status seleksi tidak berubah',       mahasiswa:'Cahaya Aisyah',  status:'masuk',    tgl:'2026-06-19T14:00:00Z' },
  { id:'l-003', judul:'Gagal upload berkas KTM',            mahasiswa:'Dimas Surya',    status:'diproses', tgl:'2026-06-18T09:15:00Z' },
  { id:'l-004', judul:'Nilai tes tidak sesuai penguji',     mahasiswa:'Elisa Rahayu',   status:'diproses', tgl:'2026-06-17T13:30:00Z' },
  { id:'l-005', judul:'Upload sertifikat prestasi gagal',   mahasiswa:'Fadhlan Rizki',  status:'selesai',  tgl:'2026-06-10T09:00:00Z' },
  { id:'l-006', judul:'Tidak bisa login ke portal beasiswa',mahasiswa:'Gita Safira',    status:'selesai',  tgl:'2026-06-08T11:00:00Z' },
];

const PIPELINE_STAGES = [
  { key:'menunggu_verifikasi', label:'Verifikasi Berkas', icon:'solar:inbox-in-bold-duotone',               color:'#d97706' },
  { key:'lolos_berkas',        label:'Lolos Berkas',      icon:'solar:check-circle-bold-duotone',            color:'#2563eb' },
  { key:'wawancara',           label:'Wawancara',         icon:'solar:microphone-bold-duotone',              color:'#7c3aed' },
  { key:'lolos_final',         label:'Penerima Final',    icon:'solar:cup-star-bold-duotone',               color:'#059669' },
  { key:'pencairan',           label:'Dana Dicairkan',    icon:'solar:transfer-horizontal-bold-duotone',    color:'#0284c7' },
];

/* ── DATA (real backend, falls back to dummy above) ── */
let pendaftarData = dummyPendaftar;
let laporanCounts = null; // {total, perStatus} from /kabag/laporan-statistik; null → derive from dummyLaporan
let trenPendaftaran = null; // {years, byYear} from /kabag/tren-pendaftaran; null → hide the section
let danaDicairkanCount = 0; // count of penyaluran_dana rows with status sudah_cair, from /penyaluran

async function loadDashboardData() {
  if (isRealSession) {
    try {
      const [{ data: pendaftar }, { data: laporanStat }, { data: tren }, { data: penyaluran }] = await Promise.all([
        api.get('/kabag/pendaftar'),
        api.get('/kabag/laporan-statistik'),
        api.get('/kabag/tren-pendaftaran'),
        api.get('/penyaluran?status=sudah_cair'),
      ]);
      pendaftarData = pendaftar.map(mapKabagApplicantRow);
      laporanCounts = laporanStat;
      trenPendaftaran = tren;
      danaDicairkanCount = penyaluran.length;
    } catch (err) {
      console.warn('Gagal memuat data kabag, pakai data contoh:', err);
      pendaftarData = dummyPendaftar;
      laporanCounts = null;
      trenPendaftaran = null;
      danaDicairkanCount = 0;
    }
  }
  loadStats();
  renderInsight();
  renderTopNilai();
  renderRingkasanLaporan();
  renderPipeline();
  renderTrenPendaftaran();
}

/* ── INSIGHT CEPAT ──
   Kalimat naratif dihitung otomatis dari pendaftarData/laporanCounts
   yang sudah ada (bukan hardcoded) — memperkuat kriteria kesesuaian
   output dengan kebutuhan pengambilan keputusan manajemen. */
function renderInsight() {
  const el = document.getElementById('listInsightKabag');
  if (!el) return;

  const insights = [];

  /* 1. Pendaftar lama di tahap wawancara tanpa progres */
  const now = Date.now();
  const lamaWawancara = pendaftarData.filter(d => {
    if (d.status !== 'wawancara' || !d.tgl) return false;
    return (now - new Date(d.tgl).getTime()) / 86400000 > 7;
  });
  if (lamaWawancara.length > 0) {
    insights.push({
      icon  : 'solar:clock-circle-bold-duotone',
      color : 'var(--orange)',
      text  : `<strong>${lamaWawancara.length} pendaftar</strong> sudah menunggu lebih dari 7 hari di tahap wawancara tanpa progres nilai — pertimbangkan tindak lanjut ke Staff.`,
    });
  }

  /* 2. Program dengan rasio lolos-final tertinggi (min. 2 pendaftar sebagai pembanding) */
  const byBeasiswa = {};
  pendaftarData.forEach(d => {
    byBeasiswa[d.beasiswa] ??= { total: 0, lolos: 0 };
    byBeasiswa[d.beasiswa].total++;
    if (d.status === 'lolos_final') byBeasiswa[d.beasiswa].lolos++;
  });
  const programPembanding = Object.entries(byBeasiswa)
    .map(([nama, v]) => ({ nama, rasio: v.lolos / v.total, total: v.total }))
    .filter(p => p.total >= 2);
  if (programPembanding.length >= 2) {
    const top = [...programPembanding].sort((a, b) => b.rasio - a.rasio)[0];
    if (top.rasio > 0) {
      insights.push({
        icon  : 'solar:cup-star-bold-duotone',
        color : 'var(--emerald)',
        text  : `Program <strong>${top.nama}</strong> punya rasio lolos final tertinggi (${Math.round(top.rasio * 100)}%) dibanding program lain musim ini.`,
      });
    }
  }

  /* 3. Rata-rata nilai tes musim berjalan */
  const sudahTes = pendaftarData.filter(d => d.nilai_tes != null);
  if (sudahTes.length > 0) {
    const rata = sudahTes.reduce((s, d) => s + d.nilai_tes, 0) / sudahTes.length;
    insights.push({
      icon  : 'solar:chart-2-bold-duotone',
      color : 'var(--purple)',
      text  : `Rata-rata nilai tes pendaftar musim ini <strong>${rata.toFixed(1)}</strong>, dari ${sudahTes.length} dari ${pendaftarData.length} pendaftar yang sudah dites.`,
    });
  }

  /* 4. Laporan kendala yang belum ditindaklanjuti */
  const masuk = laporanCounts ? (laporanCounts.perStatus.masuk || 0) : dummyLaporan.filter(d => d.status === 'masuk').length;
  if (masuk > 0) {
    insights.push({
      icon  : 'solar:chat-round-unread-bold-duotone',
      color : '#e11d48',
      text  : `<strong>${masuk} laporan kendala</strong> masih berstatus baru dan belum ditindaklanjuti Staff.`,
    });
  }

  if (!insights.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-4);font-size:13px">Belum ada insight untuk ditampilkan</div>';
    return;
  }

  el.innerHTML = insights.map(i => `
    <div class="insight-item">
      <div class="insight-icon" style="color:${i.color}">
        <iconify-icon icon="${i.icon}"></iconify-icon>
      </div>
      <div class="insight-text">${i.text}</div>
    </div>
  `).join('');
}

/* ── TREN PENDAFTARAN (Chart.js) ── */
let trenChart = null;

function renderTrenPendaftaran() {
  const canvas = document.getElementById('chartTren');
  if (!canvas || typeof Chart === 'undefined') return;

  if (trenChart) { trenChart.destroy(); trenChart = null; }

  if (!trenPendaftaran || !trenPendaftaran.years.length) {
    canvas.style.display = 'none';
    const parent = canvas.parentElement;
    if (parent && !parent.querySelector('.tren-empty')) {
      parent.insertAdjacentHTML('beforeend', '<div class="tren-empty">Belum ada data pendaftaran untuk dibandingkan (perlu login sebagai akun kabag asli).</div>');
    }
    return;
  }
  canvas.style.display = 'block';

  const { years, byYear } = trenPendaftaran;

  trenChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Jumlah Pendaftaran',
        data: years.map(y => byYear[y].total),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.15)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

/* ── EXPORT LAPORAN PENDAFTAR + TREN (Excel/PDF) ── */
const PENDAFTAR_EXPORT_COLUMNS = [
  { key: 'nama', label: 'Nama Mahasiswa' },
  { key: 'nim', label: 'NIM' },
  { key: 'beasiswa', label: 'Beasiswa' },
  { key: 'ipkFmt', label: 'IPK' },
  { key: 'nilaiTesFmt', label: 'Nilai Tes' },
  { key: 'nilaiWawancaraFmt', label: 'Nilai Wawancara' },
  { key: 'statusLabel', label: 'Status' },
];
const TREN_PENDAFTARAN_EXPORT_COLUMNS = [
  { key: 'tahun', label: 'Tahun' },
  { key: 'total', label: 'Jumlah Pendaftaran' },
];

function pendaftarExportRows() {
  return pendaftarData.map(d => ({
    ...d,
    ipkFmt: d.ipk != null ? d.ipk.toFixed(2) : '—',
    nilaiTesFmt: d.nilai_tes ?? '—',
    nilaiWawancaraFmt: d.nilai_wawancara ?? '—',
    statusLabel: d.status,
  }));
}
function trenPendaftaranExportRows() {
  const { years, byYear } = trenPendaftaran || { years: [], byYear: {} };
  return years.map(y => ({ tahun: y, total: byYear[y].total }));
}
function trenPendaftaranChartAspectRatio() {
  if (!trenChart) return 16 / 9;
  return trenChart.canvas.width / trenChart.canvas.height;
}

document.getElementById('btnExportKabagExcel')?.addEventListener('click', async () => {
  if (typeof ExcelJS === 'undefined') { alert('Library Excel belum termuat. Coba refresh halaman.'); return; }
  const workbook = new ExcelJS.Workbook();
  addTableSheet(workbook, 'Daftar Pendaftar', PENDAFTAR_EXPORT_COLUMNS, pendaftarExportRows());
  addTableSheet(workbook, 'Tren Pendaftaran', TREN_PENDAFTARAN_EXPORT_COLUMNS, trenPendaftaranExportRows());
  if (trenChart) addChartImageSheet(workbook, 'Grafik Tren', trenChart.toBase64Image(), trenPendaftaranChartAspectRatio());
  await downloadWorkbook(workbook, 'laporan-pendaftar-kabag');
});

document.getElementById('btnExportKabagPdf')?.addEventListener('click', () => {
  if (typeof window.jspdf === 'undefined') { alert('Library PDF belum termuat. Coba refresh halaman.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text('Laporan Pendaftar — Ringkasan Kabag', 14, 16);
  doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 14, 22);

  addPdfTable(doc, 31, 'Daftar Pendaftar', PENDAFTAR_EXPORT_COLUMNS, pendaftarExportRows(), [30, 58, 138]);

  if (trenChart) {
    doc.addPage();
    addPdfTable(doc, 16, 'Tren Pendaftaran Tahun ke Tahun', TREN_PENDAFTARAN_EXPORT_COLUMNS, trenPendaftaranExportRows(), [245, 158, 11]);
    const afterY = doc.lastAutoTable.finalY + 10;
    addPdfChartImage(doc, afterY, trenChart.toBase64Image(), trenPendaftaranChartAspectRatio(), 'Grafik Tren Pendaftaran');
  }

  doc.save('laporan-pendaftar-kabag.pdf');
});

/* ── UTILS ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function inisial(nama)  { return nama.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function timeAgo(str)   {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return m + ' menit lalu';
  const h = Math.floor(m/60);
  if (h < 24) return h + ' jam lalu';
  return Math.floor(h/24) + ' hari lalu';
}
function avgNilai(d) {
  if (d.nilai_tes && d.nilai_wawancara) return ((d.nilai_tes + d.nilai_wawancara) / 2).toFixed(1);
  if (d.nilai_tes) return d.nilai_tes.toFixed(1);
  return '—';
}
function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur = 0;
  const step = Math.max(1, Math.ceil(target/22));
  const t = setInterval(()=>{ cur+=step; if(cur>=target){el.textContent=target;clearInterval(t);}else el.textContent=cur; },35);
}

/* ── USER INFO ── */
function initUserInfo() {
  const nama = demoSession?.nama_lengkap || 'Kepala Bagian';
  setEl('sidebarName', nama);
  const inisialUser = nama.charAt(0).toUpperCase();
  const sidebarAv = document.getElementById('sidebarAvatar');
  const topbarAv  = document.getElementById('topbarAvatar');
  if (sidebarAv) sidebarAv.textContent = inisialUser;
  if (topbarAv)  topbarAv.textContent  = inisialUser;
  setEl('welcomeTitle', `Halo, ${nama.split(' ')[0]}! 👋`);
}

/* ── STATS ── */
function loadStats() {
  const totalPendaftar = pendaftarData.length;
  const sudahTes       = pendaftarData.filter(d => d.nilai_tes !== null).length;
  const sudahWawancara = pendaftarData.filter(d => d.nilai_wawancara !== null).length;
  const laporanMasuk   = laporanCounts ? (laporanCounts.perStatus.masuk || 0) : dummyLaporan.filter(d => d.status === 'masuk').length;

  animateNum('statPendaftar', totalPendaftar);
  animateNum('statNilaiTes',  sudahTes);
  animateNum('statWawancara', sudahWawancara);
  animateNum('statLaporan',   laporanMasuk);

  /* badge sidebar & notif — dihitung dari laporan yang BELUM PERNAH dilihat
     (bukan status mentah), supaya reset begitu Kabag membuka halaman
     Laporan Kendala, bukan menunggu Staff memproses. Lihat catatan yang
     sama di laporanKendala.js: 'bk_laporan_seen_<role>'. */
  const laporanSeen   = Number(localStorage.getItem('bk_laporan_seen_kabag') || 0);
  const laporanBelumDilihat = Math.max(0, laporanMasuk - laporanSeen);
  const badge = document.getElementById('badgeLaporan');
  if (badge) {
    badge.textContent = laporanBelumDilihat;
    badge.classList.toggle('show', laporanBelumDilihat > 0);
  }
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = laporanBelumDilihat > 0 ? 'block' : 'none';
}

/* ── TOP NILAI ── */
function renderTopNilai() {
  const el = document.getElementById('listTopNilai');
  if (!el) return;

  const sorted = [...pendaftarData]
    .filter(d => d.nilai_tes)
    .sort((a, b) => parseFloat(avgNilai(b)) - parseFloat(avgNilai(a)))
    .slice(0, 5);

  if (!sorted.length) {
    el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-4);font-size:13px">Belum ada data nilai</div>';
    return;
  }

  el.innerHTML = sorted.map((d, i) => {
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
    return `
      <div class="nilai-item">
        <div class="nilai-rank ${rankClass}">${i + 1}</div>
        <div class="nilai-avatar">${inisial(d.nama)}</div>
        <div class="nilai-info">
          <div class="nilai-nama">${d.nama}</div>
          <div class="nilai-meta">NIM: ${d.nim} · IPK: ${d.ipk}</div>
        </div>
        <div class="nilai-score">
          <div class="nilai-score-num">${avgNilai(d)}</div>
          <div class="nilai-score-label">Rata-rata</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── RINGKASAN LAPORAN ── */
function renderRingkasanLaporan() {
  const el = document.getElementById('listRingkasanLaporan');
  if (!el) return;

  const masuk    = laporanCounts ? (laporanCounts.perStatus.masuk    || 0) : dummyLaporan.filter(d => d.status === 'masuk').length;
  const diproses = laporanCounts ? (laporanCounts.perStatus.diproses || 0) : dummyLaporan.filter(d => d.status === 'diproses').length;
  const selesai  = laporanCounts ? (laporanCounts.perStatus.selesai  || 0) : dummyLaporan.filter(d => d.status === 'selesai').length;

  const STATUS_CFG = {
    masuk    : { cls:'pill-masuk',    dot:'masuk',    label:'Baru' },
    diproses : { cls:'pill-diproses', dot:'diproses', label:'Diproses' },
    selesai  : { cls:'pill-selesai',  dot:'selesai',  label:'Selesai' },
  };

  // Kabag only has access to laporan counts (/kabag/laporan-statistik), not the
  // individual complaint list (GET /laporan is staff-only) — recent items below
  // stay sample data until that's opened up to kabag.
  const recent = dummyLaporan.slice(0, 4);

  el.innerHTML = `
    <div class="laporan-summary">
      <div class="laporan-sum-card">
        <div class="laporan-sum-num" style="color:#e11d48">${masuk}</div>
        <div class="laporan-sum-label">Baru Masuk</div>
      </div>
      <div class="laporan-sum-card">
        <div class="laporan-sum-num" style="color:#d97706">${diproses}</div>
        <div class="laporan-sum-label">Diproses</div>
      </div>
      <div class="laporan-sum-card">
        <div class="laporan-sum-num" style="color:#059669">${selesai}</div>
        <div class="laporan-sum-label">Selesai</div>
      </div>
    </div>
    ${recent.map(d => {
      const cfg = STATUS_CFG[d.status] || STATUS_CFG.masuk;
      return `
        <div class="laporan-item">
          <div class="laporan-dot ${cfg.dot}"></div>
          <div class="laporan-info">
            <div class="laporan-judul">${d.judul}</div>
            <div class="laporan-by">${d.mahasiswa} · ${timeAgo(d.tgl)}</div>
          </div>
          <span class="laporan-status-pill ${cfg.cls}">${cfg.label}</span>
        </div>
      `;
    }).join('')}
  `;
}

/* ── PIPELINE ── */
function renderPipeline() {
  const el = document.getElementById('pipeline');
  if (!el) return;

  /* "pencairan" TIDAK PERNAH menjadi nilai pendaftaran.status (enum-nya cuma
     6 nilai: menunggu_verifikasi/lolos_berkas/ditolak_berkas/wawancara/
     lolos_final/tidak_lolos_final) — pencairan dana dicatat di tabel
     terpisah, penyaluran_dana. Filter status==='pencairan' di bawah selalu
     mengembalikan 0 apa pun keadaan aslinya; diganti dengan hitungan asli
     dari /penyaluran (danaDicairkanCount, lihat loadDashboardData()). */
  const counts = {
    menunggu_verifikasi : pendaftarData.filter(d => d.status === 'menunggu_verifikasi').length,
    lolos_berkas        : pendaftarData.filter(d => d.status === 'lolos_berkas').length,
    wawancara           : pendaftarData.filter(d => d.status === 'wawancara').length,
    lolos_final         : pendaftarData.filter(d => d.status === 'lolos_final').length,
    pencairan           : danaDicairkanCount,
  };

  el.innerHTML = PIPELINE_STAGES.map(s => `
    <div class="pipeline-stage">
      <div class="pipeline-bubble" style="--ring-color:${s.color}40">
        <iconify-icon icon="${s.icon}" style="color:${s.color}"></iconify-icon>
      </div>
      <div class="pipeline-count">${counts[s.key] || 0}</div>
      <div class="pipeline-name">${s.label}</div>
    </div>
  `).join('');

  /* ── Buat SVG connector overlay (garis mengalir + partikel, sama seperti staff) ── */
  requestAnimationFrame(() => {
    setTimeout(() => {
      const stages = el.querySelectorAll('.pipeline-stage');
      if (stages.length < 2) return;

      el.querySelector('.pipeline-connectors')?.remove();

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('pipeline-connectors');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const stageColors = PIPELINE_STAGES.map(s => s.color);

      for (let i = 0; i < stages.length - 1; i++) {
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.id = `pipeGradKabag${i}`;
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', stageColors[i]);

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', stageColors[i + 1]);

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
      }
      svg.appendChild(defs);

      const containerRect = el.getBoundingClientRect();

      for (let i = 0; i < stages.length - 1; i++) {
        const bubbleA = stages[i].querySelector('.pipeline-bubble');
        const bubbleB = stages[i + 1].querySelector('.pipeline-bubble');
        const rA = bubbleA.getBoundingClientRect();
        const rB = bubbleB.getBoundingClientRect();

        const x1 = rA.right - containerRect.left + 2;
        const x2 = rB.left - containerRect.left - 2;
        const y = rA.top + rA.height / 2 - containerRect.top;

        const grad = defs.querySelector(`#pipeGradKabag${i}`);
        grad.setAttribute('x1', x1);
        grad.setAttribute('y1', y);
        grad.setAttribute('x2', x2);
        grad.setAttribute('y2', y);

        const track = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        track.classList.add('connector-track');
        track.setAttribute('x1', x1);
        track.setAttribute('y1', y);
        track.setAttribute('x2', x2);
        track.setAttribute('y2', y);
        svg.appendChild(track);

        const flow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        flow.classList.add('connector-flow');
        flow.setAttribute('x1', x1);
        flow.setAttribute('y1', y);
        flow.setAttribute('x2', x2);
        flow.setAttribute('y2', y);
        flow.setAttribute('stroke', `url(#pipeGradKabag${i})`);
        flow.style.animationDelay = `${i * -0.35}s`;
        svg.appendChild(flow);

        for (let p = 0; p < 2; p++) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.classList.add('connector-particle');
          circle.setAttribute('r', '3.5');
          circle.setAttribute('fill', stageColors[i + 1]);

          const animCx = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animCx.setAttribute('attributeName', 'cx');
          animCx.setAttribute('from', x1);
          animCx.setAttribute('to', x2);
          animCx.setAttribute('dur', '2.2s');
          animCx.setAttribute('begin', `${p * 1.1}s`);
          animCx.setAttribute('repeatCount', 'indefinite');

          const animCy = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animCy.setAttribute('attributeName', 'cy');
          animCy.setAttribute('from', y);
          animCy.setAttribute('to', y);
          animCy.setAttribute('dur', '2.2s');
          animCy.setAttribute('begin', `${p * 1.1}s`);
          animCy.setAttribute('repeatCount', 'indefinite');

          const animOp = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animOp.setAttribute('attributeName', 'opacity');
          animOp.setAttribute('values', '0;0.85;0.85;0');
          animOp.setAttribute('keyTimes', '0;0.08;0.88;1');
          animOp.setAttribute('dur', '2.2s');
          animOp.setAttribute('begin', `${p * 1.1}s`);
          animOp.setAttribute('repeatCount', 'indefinite');

          circle.appendChild(animCx);
          circle.appendChild(animCy);
          circle.appendChild(animOp);
          svg.appendChild(circle);
        }
      }

      el.appendChild(svg);
    }, 60);
  });
}

/* ── SIDEBAR & LOGOUT ── */
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
function openSidebar()  { sidebar?.classList.add('open');    sidebarOverlay?.classList.add('active');    document.body.style.overflow='hidden'; }
function closeSidebar() { sidebar?.classList.remove('open'); sidebarOverlay?.classList.remove('active'); document.body.style.overflow=''; }
document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

const logoutModal = document.getElementById('logoutModal');
document.getElementById('btnLogout')?.addEventListener('click',    () => { logoutModal?.classList.add('active');    document.body.style.overflow='hidden'; });
document.getElementById('cancelLogout')?.addEventListener('click', () => { logoutModal?.classList.remove('active'); document.body.style.overflow=''; });
document.getElementById('logoutOverlay')?.addEventListener('click',() => { logoutModal?.classList.remove('active'); document.body.style.overflow=''; });
document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { logoutModal?.classList.remove('active'); closeSidebar(); document.body.style.overflow=''; }
});

/* ── BG CANVAS & PARTICLES ── */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const orbs = Array.from({length:5},()=>({
    x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
    r:100+Math.random()*160, dx:(Math.random()-.5)*.3, dy:(Math.random()-.5)*.3,
    hue:210+Math.random()*30, alpha:.04+Math.random()*.04
  }));
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    orbs.forEach(o=>{
      o.x+=o.dx; o.y+=o.dy;
      if(o.x<-o.r)o.x=canvas.width+o.r; if(o.x>canvas.width+o.r)o.x=-o.r;
      if(o.y<-o.r)o.y=canvas.height+o.r; if(o.y>canvas.height+o.r)o.y=-o.r;
      const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      g.addColorStop(0,`hsla(${o.hue},80%,60%,${o.alpha})`);
      g.addColorStop(1,`hsla(${o.hue},80%,60%,0)`);
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const icons = [
    ['solar:cup-star-bold-duotone','rgba(37,99,235,.18)'],
    ['solar:diploma-bold-duotone','rgba(37,99,235,.16)'],
    ['solar:chart-bold-duotone','rgba(124,58,237,.16)'],
    ['solar:users-group-two-rounded-bold-duotone','rgba(5,150,105,.16)'],
    ['solar:star-bold-duotone','rgba(251,191,36,.18)'],
  ];
  for(let i=0;i<16;i++){
    const [icon,color]=icons[i%icons.length];
    const p=document.createElement('iconify-icon');
    p.setAttribute('icon',icon); p.className='particle';
    const dur=7+Math.random()*8, dl=Math.random()*10;
    p.style.cssText=`left:${Math.random()*100}%;bottom:-40px;font-size:${12+Math.random()*10}px;color:${color};--dur:${dur}s;--delay:${dl}s;animation-delay:${dl}s`;
    container.appendChild(p);
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadDashboardData();
  console.log('📊 dashboardKabag.js loaded | User:', demoSession?.nama_lengkap);
});