/* ============================================================
   REKOMENDASIKANDIDAT.JS — Beasiswa Kampus (Kabag)
   Ranks wawancara-stage candidates against the automatically-derived
   profile of past successful recipients (see backend
   kabag.service.js getRekomendasi for the scoring formula).
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
const demoSession = session || { nama_lengkap: 'Dr. Suharto, M.Pd.', role: 'kabag', id: 'demo-kabag-uuid' };
const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

const DIMENSION_LABELS = {
  ipk: 'IPK',
  nilai_tes: 'Nilai Tes',
  nilai_wawancara: 'Nilai Wawancara',
  nilai_kerja_keras: 'Kerja Keras',
  nilai_kepemimpinan: 'Kepemimpinan',
  nilai_komunikasi: 'Komunikasi',
  nilai_keberanian: 'Keberanian',
};
const DIMENSION_SCALE = {
  ipk: 4, nilai_tes: 100, nilai_wawancara: 100,
  nilai_kerja_keras: 10, nilai_kepemimpinan: 10, nilai_komunikasi: 10, nilai_keberanian: 10,
};

/* ── DUMMY DATA (shown when there's no real session or the API call fails) ── */
const dummyBeasiswaList = [
  { beasiswa_id: 'b-001', beasiswa: 'Beasiswa Mandiri Prestasi' },
  { beasiswa_id: 'b-002', beasiswa: 'Pertamina Sobat Bumi' },
];
const dummyRekomendasi = {
  profileAvailable: true,
  candidates: [
    {
      // Skor dihitung ulang persis mengikuti rumus scoreCandidate() di
      // BACKEND/src/modules/kabag/kabag.service.js — lihat perhitungan
      // manualnya di RUMUS_REKOMENDASI.md (contoh kandidat p-001).
      id: 'p-001', mahasiswa: { nama_lengkap: 'Bagas Pratama Wijaya', nim_nip: '2021410043', ipk: 3.82 },
      score: 98,
      breakdown: {
        ipk: { candidate: 3.82, profileMean: 3.7 },
        nilai_tes: { candidate: 88, profileMean: 85 },
        nilai_wawancara: { candidate: 85, profileMean: 84 },
      },
    },
    {
      id: 'p-002', mahasiswa: { nama_lengkap: 'Dimas Surya Atmaja', nim_nip: '2020130021', ipk: 3.65 },
      score: 97,
      breakdown: {
        ipk: { candidate: 3.65, profileMean: 3.7 },
        nilai_tes: { candidate: 79, profileMean: 85 },
        nilai_wawancara: { candidate: 82, profileMean: 84 },
      },
    },
  ],
};

let beasiswaList = dummyBeasiswaList;

async function loadBeasiswaList() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/kabag/pendaftar');
      const mapped = data.map(mapKabagApplicantRow);
      const uniq = new Map();
      mapped.forEach(row => { if (row.beasiswa_id && !uniq.has(row.beasiswa_id)) uniq.set(row.beasiswa_id, row.beasiswa); });
      beasiswaList = Array.from(uniq.entries()).map(([beasiswa_id, beasiswa]) => ({ beasiswa_id, beasiswa }));
    } catch (err) {
      console.warn('Gagal memuat daftar beasiswa, pakai data contoh:', err);
      beasiswaList = dummyBeasiswaList;
    }
  }
  populateSelect();
}

function populateSelect() {
  const sel = document.getElementById('selectBeasiswa');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Pilih program —</option>' +
    beasiswaList.map(b => `<option value="${b.beasiswa_id}">${b.beasiswa}</option>`).join('');
  sel.addEventListener('change', () => {
    if (sel.value) loadRekomendasi(sel.value);
    else document.getElementById('hasilWrap').style.display = 'none';
  });
}

async function loadRekomendasi(beasiswaId) {
  const wrap = document.getElementById('hasilWrap');
  wrap.style.display = 'block';
  wrap.classList.add('is-visible');

  let result = dummyRekomendasi;
  if (isRealSession) {
    try {
      const { data } = await api.get('/kabag/rekomendasi/' + beasiswaId);
      result = data;
    } catch (err) {
      console.warn('Gagal memuat rekomendasi, pakai data contoh:', err);
      result = dummyRekomendasi;
    }
  }
  renderRekomendasi(result);
}

let rekomCharts = [];
let lastRekomendasiResult = null;

function renderRekomendasi(result) {
  const el = document.getElementById('listRekomendasi');
  if (!el) return;

  lastRekomendasiResult = result;
  rekomCharts.forEach(c => c.destroy());
  rekomCharts = [];

  const coldStart = !result.profileAvailable
    ? '<div class="cold-start-msg">Belum ada data penerima berhasil untuk dijadikan acuan pembanding — kandidat di bawah diurutkan berdasarkan IPK saja.</div>'
    : '';

  if (!result.candidates.length) {
    el.innerHTML = coldStart + '<div class="list-empty">Belum ada kandidat di tahap wawancara untuk program ini.</div>';
    return;
  }

  el.innerHTML = coldStart + result.candidates.map((c, i) => `
    <div class="rekom-card ${i === 0 ? 'rank-1' : ''}">
      <div class="rekom-card-head">
        <div>
          <div class="rekom-nama">#${i + 1} ${c.mahasiswa?.nama_lengkap || '—'}</div>
          <div class="rekom-sub">NIM: ${c.mahasiswa?.nim_nip || '—'} · IPK: ${c.mahasiswa?.ipk ?? '—'}</div>
        </div>
        <div>
          <div class="rekom-score">${c.score ?? '—'}</div>
          <div class="rekom-score-label">skor kecocokan</div>
        </div>
      </div>
      <div class="rekom-chart-box">
        <canvas id="chartRekom-${i}"></canvas>
      </div>
    </div>
  `).join('');

  result.candidates.forEach((c, i) => {
    const canvas = document.getElementById(`chartRekom-${i}`);
    if (!canvas || typeof Chart === 'undefined' || !c.breakdown || !Object.keys(c.breakdown).length) return;

    const keys = Object.keys(c.breakdown);
    const labels = keys.map(k => DIMENSION_LABELS[k] || k);
    const candidateVals = keys.map(k => (c.breakdown[k].candidate / (DIMENSION_SCALE[k] || 1)) * 100);
    const profileVals = keys.map(k => (c.breakdown[k].profileMean / (DIMENSION_SCALE[k] || 1)) * 100);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Kandidat', data: candidateVals, borderColor: '#1e3a8a', backgroundColor: 'rgba(30,58,138,0.15)', tension: 0.3, pointRadius: 4 },
          { label: 'Acuan Penerima Berhasil', data: profileVals, borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.12)', tension: 0.3, pointRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100 } },
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
      },
    });
    rekomCharts.push(chart);
  });
}

/* ── EXPORT LAPORAN REKOMENDASI (Excel/PDF) ── */
const REKOM_EXPORT_COLUMNS = [
  { key: 'peringkat', label: 'Peringkat' },
  { key: 'nama', label: 'Nama Mahasiswa' },
  { key: 'nim', label: 'NIM' },
  { key: 'ipk', label: 'IPK' },
  { key: 'scoreFmt', label: 'Skor Kecocokan' },
];

function rekomendasiExportRows() {
  if (!lastRekomendasiResult) return [];
  return lastRekomendasiResult.candidates.map((c, i) => ({
    peringkat: i + 1,
    nama: c.mahasiswa?.nama_lengkap || '—',
    nim: c.mahasiswa?.nim_nip || '—',
    ipk: c.mahasiswa?.ipk ?? '—',
    scoreFmt: c.score ?? '—',
  }));
}
function selectedBeasiswaLabel() {
  const sel = document.getElementById('selectBeasiswa');
  return sel?.selectedOptions?.[0]?.textContent || '—';
}

document.getElementById('btnExportRekomendasiExcel')?.addEventListener('click', async () => {
  if (!lastRekomendasiResult || !lastRekomendasiResult.candidates.length) {
    alert('Belum ada data rekomendasi untuk diexport. Pilih program beasiswa dulu.');
    return;
  }
  if (typeof ExcelJS === 'undefined') { alert('Library Excel belum termuat. Coba refresh halaman.'); return; }
  const workbook = new ExcelJS.Workbook();
  addTableSheet(workbook, 'Peringkat Kandidat', REKOM_EXPORT_COLUMNS, rekomendasiExportRows());
  rekomCharts.forEach((chart, i) => {
    const nama = lastRekomendasiResult.candidates[i]?.mahasiswa?.nama_lengkap || `Kandidat ${i + 1}`;
    const sheetName = `Grafik ${nama}`.slice(0, 31); // Excel sheet name limit
    const ratio = chart.canvas.width / chart.canvas.height;
    addChartImageSheet(workbook, sheetName, chart.toBase64Image(), ratio);
  });
  await downloadWorkbook(workbook, 'laporan-rekomendasi-kandidat');
});

document.getElementById('btnExportRekomendasiPdf')?.addEventListener('click', () => {
  if (!lastRekomendasiResult || !lastRekomendasiResult.candidates.length) {
    alert('Belum ada data rekomendasi untuk diexport. Pilih program beasiswa dulu.');
    return;
  }
  if (typeof window.jspdf === 'undefined') { alert('Library PDF belum termuat. Coba refresh halaman.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait' });

  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text('Laporan Rekomendasi Kandidat', 14, 16);
  doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 14, 22);
  doc.text(`Program: ${selectedBeasiswaLabel()}`, 14, 27);

  addPdfTable(doc, 33, null, REKOM_EXPORT_COLUMNS, rekomendasiExportRows(), [30, 58, 138]);

  rekomCharts.forEach((chart, i) => {
    const nama = lastRekomendasiResult.candidates[i]?.mahasiswa?.nama_lengkap || `Kandidat ${i + 1}`;
    doc.addPage();
    const ratio = chart.canvas.width / chart.canvas.height;
    addPdfChartImage(doc, 16, chart.toBase64Image(), ratio, `Grafik Perbandingan — ${nama}`);
  });

  doc.save('laporan-rekomendasi-kandidat.pdf');
});

/* ── USER INFO ── */
function initUserInfo() {
  const nama = demoSession?.nama_lengkap || 'Kepala Bagian';
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('sidebarName', nama);
  const initial = nama.charAt(0).toUpperCase();
  const sidebarAv = document.getElementById('sidebarAvatar');
  const topbarAv = document.getElementById('topbarAvatar');
  if (sidebarAv) sidebarAv.textContent = initial;
  if (topbarAv) topbarAv.textContent = initial;
}

/* ── SIDEBAR MOBILE ── */
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
function openSidebar() { sidebar?.classList.add('open'); sidebarOverlay?.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar?.classList.remove('open'); sidebarOverlay?.classList.remove('active'); document.body.style.overflow = ''; }
document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

/* ── LOGOUT ── */
const logoutModal = document.getElementById('logoutModal');
document.getElementById('btnLogout')?.addEventListener('click', () => { logoutModal?.classList.add('active'); document.body.style.overflow = 'hidden'; });
document.getElementById('cancelLogout')?.addEventListener('click', () => { logoutModal?.classList.remove('active'); document.body.style.overflow = ''; });
document.getElementById('logoutOverlay')?.addEventListener('click', () => { logoutModal?.classList.remove('active'); document.body.style.overflow = ''; });
document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { logoutModal?.classList.remove('active'); closeSidebar(); document.body.style.overflow = ''; }
});

/* ── BG CANVAS & PARTICLES (visual consistency with other Kabag pages) ── */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const orbs = Array.from({ length: 5 }, () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    r: 100 + Math.random() * 160, dx: (Math.random() - .5) * .3, dy: (Math.random() - .5) * .3,
    hue: 210 + Math.random() * 30, alpha: .04 + Math.random() * .04
  }));
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    orbs.forEach(o => {
      o.x += o.dx; o.y += o.dy;
      if (o.x < -o.r) o.x = canvas.width + o.r; if (o.x > canvas.width + o.r) o.x = -o.r;
      if (o.y < -o.r) o.y = canvas.height + o.r; if (o.y > canvas.height + o.r) o.y = -o.r;
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.hue},80%,60%,${o.alpha})`);
      g.addColorStop(1, `hsla(${o.hue},80%,60%,0)`);
      ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initUserInfo();
  loadBeasiswaList();
  console.log('🎯 rekomendasiKandidat.js loaded | User:', demoSession?.nama_lengkap);
});
