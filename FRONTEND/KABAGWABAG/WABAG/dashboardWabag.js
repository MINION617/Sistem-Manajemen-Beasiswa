/* ============================================================
   DASHBOARDWABAG.JS — Beasiswa Kampus (Wabag)
   Role: Wakil Bagian Keuangan — monitoring keuangan beasiswa
   ============================================================ */


/* ── SESSION ── */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session = getSession();
if (!session || session.role !== 'wabag') {
  // window.location.href = '../../LOGIN/login.html';
}
const demoSession = session || {
  nama_lengkap : 'Dra. Hartini, M.M.',
  role         : 'wabag',
  id           : 'demo-wabag-uuid'
};
const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

/* ── DUMMY DATA PENERIMA ── */
const dummyPenerima = [
  { id:'r-001', nama:'Fadhlan Rizki Maulana', nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', sponsor:'Bank Mandiri',   nominal:5000000,  status:'sudah_cair',      tgl:'2026-06-11' },
  { id:'r-002', nama:'Cahaya Nur Aisyah',     nim:'2021220032', beasiswa:'Pertamina Sobat Bumi',      sponsor:'Pertamina',      nominal:7500000,  status:'sudah_cair',      tgl:'2026-06-10' },
  { id:'r-003', nama:'Elisa Rahayu Putri',    nim:'2022510017', beasiswa:'Telkom Digital Talent',     sponsor:'Telkom',         nominal:6000000,  status:'proses_transfer', tgl:'2026-06-15' },
  { id:'r-004', nama:'Bagas Pratama Wijaya',  nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', sponsor:'Bank Mandiri',   nominal:5000000,  status:'proses_transfer', tgl:'2026-06-16' },
  { id:'r-005', nama:'Dimas Surya Atmaja',    nim:'2020130021', beasiswa:'Beasiswa Mandiri Prestasi', sponsor:'Bank Mandiri',   nominal:5000000,  status:'belum_cair',      tgl:null },
  { id:'r-006', nama:'Gita Safira Dewi',      nim:'2023110029', beasiswa:'Pertamina Sobat Bumi',      sponsor:'Pertamina',      nominal:7500000,  status:'belum_cair',      tgl:null },
];

const dummySponsor = [
  { id:'s-001', nama:'Bank Mandiri',   jenis:'BUMN Perbankan',    kontribusi:15000000, beasiswa:3 },
  { id:'s-002', nama:'Pertamina',      jenis:'BUMN Energi',       kontribusi:15000000, beasiswa:2 },
  { id:'s-003', nama:'Telkom',         jenis:'BUMN Telekomunikasi',kontribusi:6000000, beasiswa:1 },
];

const dummyRealisasi = {
  programs: [
    { namaProgram:'Beasiswa Mandiri Prestasi', sponsor:'Bank Mandiri', penerimaDisahkan:3, komitmen:15000000, tersalur:10000000, persentase:67 },
    { namaProgram:'Pertamina Sobat Bumi',      sponsor:'Pertamina',    penerimaDisahkan:2, komitmen:15000000, tersalur:7500000,  persentase:50 },
    { namaProgram:'Telkom Digital Talent',     sponsor:'Telkom',       penerimaDisahkan:1, komitmen:6000000,  tersalur:0,        persentase:0  },
  ],
  overall: { totalKomitmen:36000000, totalTersalur:17500000, persentase:49 },
};

const dummyAntrian = {
  totalCount: 3,
  totalNominal: 18500000,
  buckets: {
    '0-7'  : { count:1, nominal:6000000 },
    '8-14' : { count:1, nominal:5000000 },
    '15-30': { count:0, nominal:0 },
    '>30'  : { count:1, nominal:7500000 },
  },
  tertua: [
    { nama:'Gita Safira Dewi',   beasiswa:'Pertamina Sobat Bumi',      nominal:7500000, status:'pending',         umurHari:34 },
    { nama:'Dimas Surya Atmaja', beasiswa:'Beasiswa Mandiri Prestasi', nominal:5000000, status:'pending',         umurHari:12 },
    { nama:'Elisa Rahayu Putri', beasiswa:'Telkom Digital Talent',     nominal:6000000, status:'sedang_diproses', umurHari:3  },
  ],
};

const dummyTrenPenyaluran = {
  years: ['2024', '2025', '2026'],
  byYear: {
    '2024': { totalNominal:18000000, totalCair:18000000, count:4, perStatus:{ sudah_cair:4 } },
    '2025': { totalNominal:27500000, totalCair:25000000, count:6, perStatus:{ sudah_cair:5, pending:1 } },
    '2026': { totalNominal:36000000, totalCair:17500000, count:6, perStatus:{ sudah_cair:3, sedang_diproses:1, pending:2 } },
  },
};

/* ── DATA (real backend, falls back to dummy above) ── */
const PENYALURAN_STATUS_TO_WABAG = {
  pending: 'belum_cair',
  sedang_diproses: 'proses_transfer',
  sudah_cair: 'sudah_cair',
};

let penerimaData = dummyPenerima;
let sponsorData = dummySponsor;
let financeDashboard = null; // { totalDisbursed, perStatus } from /finance/dashboard, or null → derive from penerimaData
let realisasiData = dummyRealisasi; // { programs, overall } from /finance/realisasi-anggaran
let antrianData = dummyAntrian;     // { totalCount, totalNominal, buckets, tertua } from /finance/antrian-pencairan
let trenPenyaluran = dummyTrenPenyaluran; // { years, byYear } from /finance/tren-penyaluran

async function loadWabagData() {
  if (isRealSession) {
    try {
      const [{ data: penyaluran }, { data: dashboard }, { data: alokasi }, { data: realisasi }, { data: antrian }, { data: tren }] = await Promise.all([
        api.get('/penyaluran'),
        api.get('/finance/dashboard'),
        api.get('/finance/alokasi-sponsor'),
        api.get('/finance/realisasi-anggaran'),
        api.get('/finance/antrian-pencairan'),
        api.get('/finance/tren-penyaluran'),
      ]);
      penerimaData = penyaluran.map(mapPenyaluranRow).map(row => ({
        id: row.id,
        nama: row.mahasiswa?.nama_lengkap || '—',
        nim: row.mahasiswa?.nim_nip || '—',
        beasiswa: row.beasiswa?.nama_program || '—',
        sponsor: row.beasiswa?.sponsors?.nama_perusahaan || '—',
        nominal: row.nominal || 0,
        status: PENYALURAN_STATUS_TO_WABAG[row.status] || 'belum_cair',
        tgl: row.tanggal_pencairan,
      }));
      sponsorData = alokasi.map(s => ({
        id: s.sponsorId,
        nama: s.namaPerusahaan,
        jenis: null,
        kontribusi: s.total,
        beasiswa: s.count,
      }));
      financeDashboard = dashboard;
      realisasiData = realisasi;
      antrianData = antrian;
      trenPenyaluran = tren;
    } catch (err) {
      console.warn('Gagal memuat data keuangan, pakai data contoh:', err);
      penerimaData = dummyPenerima;
      sponsorData = dummySponsor;
      financeDashboard = null;
      realisasiData = dummyRealisasi;
      antrianData = dummyAntrian;
      trenPenyaluran = dummyTrenPenyaluran;
    }
  }
  loadStats();
  renderRingkasanBeasiswa();
  renderSponsor();
  renderRealisasi();
  renderAntrian();
  renderTrenPenyaluran();
  renderTabelPenerima();
}

/* ── UTILS ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}
function inisial(nama) { return nama.charAt(0).toUpperCase(); }
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
  const nama = demoSession?.nama_lengkap || 'Wakil Bagian Keuangan';
  setEl('sidebarName', nama);
  const inisialUser = nama.charAt(0).toUpperCase();
  const sidebarAv = document.getElementById('sidebarAvatar');
  const topbarAv  = document.getElementById('topbarAvatar');
  if (sidebarAv) sidebarAv.textContent = inisialUser;
  if (topbarAv)  topbarAv.textContent  = inisialUser;
  setEl('welcomeTitle', `Halo, ${nama.split(' ')[0]}! 👋`);
}

/* ── STATS KEUANGAN ── */
function loadStats() {
  const totalDana      = financeDashboard ? financeDashboard.totalDisbursed : penerimaData.reduce((sum, d) => sum + d.nominal, 0);
  const totalPenerima  = penerimaData.length;
  const totalSponsor   = sponsorData.length;
  const menungguCair   = financeDashboard ? (financeDashboard.perStatus.pending || 0) : penerimaData.filter(d => d.status === 'belum_cair').length;

  /* Format total dana ringkas */
  const el = document.getElementById('statTotalDana');
  if (el) {
    const juta = totalDana / 1000000;
    el.textContent = `Rp ${juta.toLocaleString('id-ID')} Jt`;
  }
  animateNum('statPenerima',    totalPenerima);
  animateNum('statSponsor',     totalSponsor);
  animateNum('statMenungguCair',menungguCair);

  /* Badge sidebar "Penyaluran Dana" = jumlah antrian outstanding;
     dot lonceng menyala kalau ada antrian menunggu >30 hari. */
  const outstanding = antrianData?.totalCount || 0;
  const badge = document.getElementById('badgeAntrian');
  if (badge) {
    badge.textContent = outstanding;
    badge.classList.toggle('show', outstanding > 0);
  }
  const lamaMenunggu = antrianData?.buckets?.['>30']?.count || 0;
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = lamaMenunggu > 0 ? 'block' : 'none';
}

/* ── RINGKASAN PER BEASISWA ── */
function renderRingkasanBeasiswa() {
  const el = document.getElementById('listRingkasanBeasiswa');
  if (!el) return;

  /* Group by beasiswa */
  const map = {};
  penerimaData.forEach(d => {
    if (!map[d.beasiswa]) map[d.beasiswa] = { nama:d.beasiswa, sponsor:d.sponsor, total:0, count:0 };
    map[d.beasiswa].total += d.nominal;
    map[d.beasiswa].count++;
  });
  const list = Object.values(map);

  el.innerHTML = list.map(b => `
    <div class="beasiswa-sum-item">
      <div class="beasiswa-sum-icon">
        <iconify-icon icon="solar:diploma-bold-duotone" style="color:var(--blue-600);font-size:18px"></iconify-icon>
      </div>
      <div class="beasiswa-sum-info">
        <div class="beasiswa-sum-nama">${b.nama}</div>
        <div class="beasiswa-sum-meta">Sponsor: ${b.sponsor} · ${b.count} penerima</div>
      </div>
      <div class="beasiswa-sum-right">
        <div class="beasiswa-sum-dana">${formatRupiah(b.total)}</div>
        <div class="beasiswa-sum-count">Total dana</div>
      </div>
    </div>
  `).join('');
}

/* ── DAFTAR SPONSOR ── */
function renderSponsor() {
  const el = document.getElementById('listSponsor');
  if (!el) return;

  el.innerHTML = sponsorData.map(s => `
    <div class="sponsor-item">
      <div class="sponsor-logo">${inisial(s.nama)}</div>
      <div class="sponsor-info">
        <div class="sponsor-nama">${s.nama}</div>
        <div class="sponsor-jenis">${s.jenis || '—'} · ${s.beasiswa} penyaluran</div>
      </div>
      <div class="sponsor-kontribusi">${formatRupiah(s.kontribusi)}</div>
    </div>
  `).join('');
}

/* ── REALISASI ANGGARAN ── */
function renderRealisasi() {
  const el = document.getElementById('listRealisasi');
  if (!el) return;

  const { programs, overall } = realisasiData;
  const head = document.getElementById('realisasiOverall');
  if (head) head.textContent = overall.persentase === null ? '' : `Total terealisasi: ${overall.persentase}%`;

  if (!programs.length) {
    el.innerHTML = '<div class="wabag-empty">Belum ada penerima disahkan — belum ada anggaran yang berjalan.</div>';
    return;
  }

  el.innerHTML = programs.map(p => {
    const pct = p.persentase === null ? 0 : Math.min(100, p.persentase);
    return `
      <div class="realisasi-item" title="Tersalur ${formatRupiah(p.tersalur)} dari komitmen ${formatRupiah(p.komitmen)}">
        <div class="realisasi-top">
          <div class="realisasi-info">
            <div class="realisasi-nama">${p.namaProgram}</div>
            <div class="realisasi-meta">${p.sponsor || '—'} · ${p.penerimaDisahkan} penerima disahkan</div>
          </div>
          <div class="realisasi-angka">
            <span class="realisasi-pct">${p.persentase === null ? '—' : p.persentase + '%'}</span>
            <span class="realisasi-nominal">${formatRupiah(p.tersalur)} / ${formatRupiah(p.komitmen)}</span>
          </div>
        </div>
        <div class="realisasi-track"><div class="realisasi-fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

/* ── ANTRIAN PENCAIRAN (AGING) ── */
const AGING_LABELS = { '0-7':'0–7 hari', '8-14':'8–14 hari', '15-30':'15–30 hari', '>30':'>30 hari' };
const AGING_COLORS = { '0-7':'#f59e0b', '8-14':'#d97706', '15-30':'#b45309', '>30':'#92400e' };
const ANTRIAN_STATUS_LABEL = { pending:'Belum Cair', sedang_diproses:'Proses Transfer' };

function renderAntrian() {
  const el = document.getElementById('antrianBody');
  if (!el) return;

  const { totalCount, totalNominal, buckets, tertua } = antrianData;
  const head = document.getElementById('antrianTotal');
  if (head) head.textContent = totalCount ? `${totalCount} antrian · ${formatRupiah(totalNominal)} tertahan` : '';

  if (!totalCount) {
    el.innerHTML = `
      <div class="wabag-empty wabag-empty-ok">
        <iconify-icon icon="solar:check-circle-bold-duotone" width="18"></iconify-icon>
        Tidak ada antrian — semua pencairan sudah selesai.
      </div>`;
    return;
  }

  const maxCount = Math.max(...Object.values(buckets).map(b => b.count), 1);
  const barsHtml = Object.keys(AGING_LABELS).map(key => {
    const b = buckets[key] || { count:0, nominal:0 };
    const width = b.count === 0 ? 0 : Math.max(8, (b.count / maxCount) * 100);
    return `
      <div class="aging-row" title="${AGING_LABELS[key]}: ${b.count} antrian, ${formatRupiah(b.nominal)}">
        <span class="aging-label">${AGING_LABELS[key]}</span>
        <div class="aging-track">
          <div class="aging-fill" style="width:${width}%;background:${AGING_COLORS[key]}"></div>
        </div>
        <span class="aging-val">${b.count}${b.count ? ' · ' + formatRupiah(b.nominal) : ''}</span>
      </div>
    `;
  }).join('');

  const tertuaHtml = tertua.slice(0, 3).map(t => `
    <div class="antrian-old-item">
      <div class="antrian-old-info">
        <div class="antrian-old-nama">${t.nama || '—'}</div>
        <div class="antrian-old-meta">${t.beasiswa || '—'} · ${ANTRIAN_STATUS_LABEL[t.status] || t.status}</div>
      </div>
      <div class="antrian-old-right">
        <span class="antrian-old-umur">${t.umurHari} hari</span>
        <span class="antrian-old-nominal">${formatRupiah(t.nominal)}</span>
      </div>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="aging-bars">${barsHtml}</div>
    <div class="antrian-old-head">Terlama di antrian</div>
    ${tertuaHtml}
  `;
}

/* ── TREN DANA TERSALUR ── */
let trenPenyaluranChart = null;
function renderTrenPenyaluran() {
  const canvas = document.getElementById('chartTrenPenyaluran');
  if (!canvas || typeof Chart === 'undefined') return;

  if (trenPenyaluranChart) { trenPenyaluranChart.destroy(); trenPenyaluranChart = null; }

  if (!trenPenyaluran || !trenPenyaluran.years.length) {
    canvas.style.display = 'none';
    const parent = canvas.parentElement;
    if (parent && !parent.querySelector('.tren-empty')) {
      parent.insertAdjacentHTML('beforeend', '<div class="tren-empty">Belum ada data penyaluran untuk dibandingkan.</div>');
    }
    return;
  }
  canvas.style.display = 'block';

  const { years, byYear } = trenPenyaluran;

  trenPenyaluranChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Total Tercatat',
          data: years.map(y => byYear[y].totalNominal),
          borderColor: '#2b4fad',
          backgroundColor: 'rgba(43,79,173,0.10)',
          tension: 0.3,
          fill: true,
          pointRadius: 4,
        },
        {
          label: 'Sudah Cair',
          data: years.map(y => byYear[y].totalCair),
          borderColor: '#059669',
          backgroundColor: 'rgba(5,150,105,0.10)',
          tension: 0.3,
          fill: true,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatRupiah(ctx.parsed.y)}`,
            afterBody: (items) => {
              const y = items[0]?.label;
              return y && byYear[y] ? `Jumlah transaksi: ${byYear[y].count}` : '';
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: (v) => 'Rp ' + (v / 1000000).toLocaleString('id-ID') + ' Jt' },
        },
      },
    },
  });
}

/* ── TABEL PENERIMA ── */
function renderTabelPenerima() {
  const el = document.getElementById('tablePenerima');
  if (!el) return;

  const STATUS_CFG = {
    sudah_cair      : { cls:'status-cair',   label:'Sudah Cair',      icon:'solar:check-circle-bold-duotone' },
    proses_transfer : { cls:'status-proses',  label:'Proses Transfer', icon:'solar:transfer-horizontal-bold-duotone' },
    belum_cair      : { cls:'status-belum',   label:'Belum Cair',     icon:'solar:clock-circle-bold-duotone' },
  };

  el.innerHTML = penerimaData.map(d => {
    const cfg = STATUS_CFG[d.status] || STATUS_CFG.belum_cair;
    return `
      <tr>
        <td class="td-nama">${d.nama}</td>
        <td class="td-nim">${d.nim}</td>
        <td>${d.beasiswa}</td>
        <td class="td-dana">${formatRupiah(d.nominal)}</td>
        <td>
          <span class="status-pill-sm ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
            ${cfg.label}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

/* ── EXPORT LAPORAN KEUANGAN (Realisasi Anggaran + Tren Penyaluran) ── */
const REALISASI_EXPORT_COLUMNS = [
  { key: 'namaProgram', label: 'Program Beasiswa' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'penerimaDisahkan', label: 'Penerima Disahkan' },
  { key: 'komitmenFmt', label: 'Komitmen' },
  { key: 'tersalurFmt', label: 'Tersalur' },
  { key: 'persentaseFmt', label: 'Realisasi' },
];
const TREN_EXPORT_COLUMNS = [
  { key: 'tahun', label: 'Tahun' },
  { key: 'totalNominalFmt', label: 'Total Tercatat' },
  { key: 'totalCairFmt', label: 'Sudah Cair' },
  { key: 'count', label: 'Jumlah Transaksi' },
];

function realisasiExportRows() {
  return (realisasiData.programs || []).map(p => ({
    ...p,
    komitmenFmt: formatRupiah(p.komitmen),
    tersalurFmt: formatRupiah(p.tersalur),
    persentaseFmt: p.persentase === null ? '—' : `${p.persentase}%`,
  }));
}
function trenExportRows() {
  const { years, byYear } = trenPenyaluran || { years: [], byYear: {} };
  return years.map(y => ({
    tahun: y,
    totalNominalFmt: formatRupiah(byYear[y].totalNominal),
    totalCairFmt: formatRupiah(byYear[y].totalCair),
    count: byYear[y].count,
  }));
}

function trenChartAspectRatio() {
  if (!trenPenyaluranChart) return 16 / 9;
  const canvas = trenPenyaluranChart.canvas;
  return canvas.width / canvas.height;
}

/**
 * Renders a standalone single-line chart off-screen (for export only — not
 * shown on the dashboard) and returns its PNG image + aspect ratio. Used to
 * give "Total Tercatat" and "Sudah Cair" their own individual charts in the
 * export, alongside the combined one already on screen.
 */
function renderStandaloneLineChartImage(label, color, years, values) {
  const width = 900, height = 420;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = 'fixed';
  canvas.style.left = '-9999px';
  document.body.appendChild(canvas);

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label,
        data: values,
        borderColor: color,
        backgroundColor: color + '26',
        tension: 0.3,
        fill: true,
        pointRadius: 5,
      }],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: { legend: { display: true, position: 'bottom' } },
      scales: { y: { beginAtZero: true } },
    },
  });

  const image = chart.toBase64Image();
  chart.destroy();
  canvas.remove();
  return { image, aspectRatio: width / height };
}

function trenIndividualChartImages() {
  const { years, byYear } = trenPenyaluran || { years: [], byYear: {} };
  if (!years.length) return [];
  return [
    {
      label: 'Grafik Total Tercatat per Tahun',
      sheetName: 'Grafik Total Tercatat',
      ...renderStandaloneLineChartImage('Total Tercatat', '#1e3a8a', years, years.map(y => byYear[y].totalNominal)),
    },
    {
      label: 'Grafik Sudah Cair per Tahun',
      sheetName: 'Grafik Sudah Cair',
      ...renderStandaloneLineChartImage('Sudah Cair', '#059669', years, years.map(y => byYear[y].totalCair)),
    },
  ];
}

document.getElementById('btnExportKeuanganExcel')?.addEventListener('click', async () => {
  if (typeof ExcelJS === 'undefined') { alert('Library Excel belum termuat. Coba refresh halaman.'); return; }
  const workbook = new ExcelJS.Workbook();
  addTableSheet(workbook, 'Realisasi Anggaran', REALISASI_EXPORT_COLUMNS, realisasiExportRows());
  addTableSheet(workbook, 'Tren Penyaluran', TREN_EXPORT_COLUMNS, trenExportRows());
  if (trenPenyaluranChart) addChartImageSheet(workbook, 'Grafik Tren', trenPenyaluranChart.toBase64Image(), trenChartAspectRatio());
  trenIndividualChartImages().forEach(c => addChartImageSheet(workbook, c.sheetName, c.image, c.aspectRatio));
  await downloadWorkbook(workbook, 'laporan-keuangan-wabag');
});

document.getElementById('btnExportKeuanganPdf')?.addEventListener('click', () => {
  if (typeof window.jspdf === 'undefined') { alert('Library PDF belum termuat. Coba refresh halaman.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait' });

  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text('Laporan Keuangan — Ringkasan Wabag', 14, 16);
  doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 14, 22);

  const afterRealisasiY = addPdfTable(doc, 31, 'Realisasi Anggaran', REALISASI_EXPORT_COLUMNS, realisasiExportRows(), [30, 58, 138]);
  const afterTrenY = addPdfTable(doc, afterRealisasiY, 'Tren Dana Tersalur Tahun ke Tahun', TREN_EXPORT_COLUMNS, trenExportRows(), [245, 158, 11]);

  if (trenPenyaluranChart) {
    doc.addPage();
    addPdfChartImage(doc, 16, trenPenyaluranChart.toBase64Image(), trenChartAspectRatio(), 'Grafik Tren Dana Tersalur (Gabungan)');
  }
  trenIndividualChartImages().forEach(c => {
    doc.addPage();
    addPdfChartImage(doc, 16, c.image, c.aspectRatio, c.label);
  });

  doc.save('laporan-keuangan-wabag.pdf');
});

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
    ['solar:wallet-money-bold-duotone','rgba(5,150,105,.18)'],
    ['solar:banknote-bold-duotone','rgba(37,99,235,.16)'],
    ['solar:buildings-2-bold-duotone','rgba(124,58,237,.16)'],
    ['solar:transfer-horizontal-bold-duotone','rgba(5,150,105,.16)'],
    ['solar:cup-star-bold-duotone','rgba(251,191,36,.18)'],
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
  loadWabagData();
  console.log('💰 dashboardWabag.js loaded | User:', demoSession?.nama_lengkap);
});