/* ============================================================
   PERKEMBANGANPENERIMA.JS — Beasiswa Kampus (Kabag)
   Post-award progress tracking for ratified scholarship recipients.
   Read-only (MIS reports on data — perkembangan_penerima rows are seeded
   directly in the database, not created through this app).
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

/* ── DUMMY DATA (shown when there's no real session or the API call fails) ── */
const dummyPenerima = [
  {
    id: 'r-001',
    pendaftaran: {
      profiles: { nama_lengkap: 'Fadhlan Rizki Maulana', nim_nip: '2021410043', program_studi: 'Manajemen', ipk: 3.65 },
      beasiswa: { nama_program: 'Beasiswa Mandiri Prestasi', sponsors: { nama_perusahaan: 'Bank Mandiri' } },
    },
    perkembangan_penerima: [
      { id: 'k-001', periode: 'Semester 1 2026', ipk_snapshot: 3.70, catatan: 'Mengikuti program magang riset, performa baik.' },
    ],
  },
  {
    id: 'r-002',
    pendaftaran: {
      profiles: { nama_lengkap: 'Hana Putri Azzahra', nim_nip: '2021310088', program_studi: 'Teknik Informatika', ipk: 3.95 },
      beasiswa: { nama_program: 'Beasiswa Mandiri Prestasi', sponsors: { nama_perusahaan: 'Bank Mandiri' } },
    },
    perkembangan_penerima: [
      { id: 'k-002', periode: 'Semester 2 2025', ipk_snapshot: 3.88, catatan: 'Program pertukaran ke universitas mitra.' },
      { id: 'k-003', periode: 'Semester 1 2026', ipk_snapshot: 3.95, catatan: 'Nilai stabil, aktif organisasi kampus.' },
    ],
  },
];

let penerimaData = dummyPenerima;
let ipkChart = null;

async function loadData() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/kabag/perkembangan');
      penerimaData = data;
    } catch (err) {
      console.warn('Gagal memuat data perkembangan, pakai data contoh:', err);
      penerimaData = dummyPenerima;
    }
  }
  renderList();
  renderChart();
}

/* ── RENDER CHART: rata-rata IPK per periode, lintas semua penerima ── */
function renderChart() {
  const canvas = document.getElementById('chartIpk');
  if (!canvas || typeof Chart === 'undefined') return;

  const byPeriode = {};
  penerimaData.forEach(p => {
    (p.perkembangan_penerima || []).forEach(en => {
      if (en.ipk_snapshot == null) return;
      if (!byPeriode[en.periode]) byPeriode[en.periode] = { sum: 0, count: 0 };
      byPeriode[en.periode].sum += en.ipk_snapshot;
      byPeriode[en.periode].count += 1;
    });
  });

  const periodes = Object.keys(byPeriode);
  const averages = periodes.map(p => +(byPeriode[p].sum / byPeriode[p].count).toFixed(2));

  if (ipkChart) ipkChart.destroy();

  if (!periodes.length) {
    canvas.style.display = 'none';
    const parent = canvas.parentElement;
    if (parent && !parent.querySelector('.list-empty')) {
      parent.insertAdjacentHTML('beforeend', '<div class="list-empty">Belum ada data perkembangan IPK untuk ditampilkan.</div>');
    }
    return;
  }
  canvas.style.display = 'block';

  ipkChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: periodes,
      datasets: [{
        label: 'Rata-rata IPK',
        data: averages,
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30,58,138,0.12)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 4 } },
    },
  });
}

/* ── EXPORT LAPORAN PERKEMBANGAN (Excel/PDF) ── */
const PERKEMBANGAN_EXPORT_COLUMNS = [
  { key: 'nama', label: 'Nama Mahasiswa' },
  { key: 'nim', label: 'NIM' },
  { key: 'beasiswa', label: 'Beasiswa' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'periode', label: 'Periode' },
  { key: 'ipkFmt', label: 'IPK' },
  { key: 'catatan', label: 'Catatan' },
];

function perkembanganExportRows() {
  const rows = [];
  penerimaData.forEach(p => {
    const profil = p.pendaftaran?.profiles;
    const beasiswa = p.pendaftaran?.beasiswa;
    const entries = p.perkembangan_penerima || [];
    const base = {
      nama: profil?.nama_lengkap || '—',
      nim: profil?.nim_nip || '—',
      beasiswa: beasiswa?.nama_program || '—',
      sponsor: beasiswa?.sponsors?.nama_perusahaan || '—',
    };
    if (!entries.length) {
      rows.push({ ...base, periode: '—', ipkFmt: '—', catatan: 'Belum ada catatan perkembangan.' });
      return;
    }
    entries.forEach(en => {
      rows.push({ ...base, periode: en.periode, ipkFmt: en.ipk_snapshot ?? '—', catatan: en.catatan || '—' });
    });
  });
  return rows;
}
function ipkChartAspectRatio() {
  if (!ipkChart) return 16 / 9;
  return ipkChart.canvas.width / ipkChart.canvas.height;
}

document.getElementById('btnExportPerkembanganExcel')?.addEventListener('click', async () => {
  if (typeof ExcelJS === 'undefined') { alert('Library Excel belum termuat. Coba refresh halaman.'); return; }
  const workbook = new ExcelJS.Workbook();
  addTableSheet(workbook, 'Perkembangan Penerima', PERKEMBANGAN_EXPORT_COLUMNS, perkembanganExportRows());
  if (ipkChart) addChartImageSheet(workbook, 'Grafik Tren IPK', ipkChart.toBase64Image(), ipkChartAspectRatio());
  await downloadWorkbook(workbook, 'laporan-perkembangan-penerima');
});

document.getElementById('btnExportPerkembanganPdf')?.addEventListener('click', () => {
  if (typeof window.jspdf === 'undefined') { alert('Library PDF belum termuat. Coba refresh halaman.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text('Laporan Perkembangan Penerima Beasiswa', 14, 16);
  doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`, 14, 22);

  addPdfTable(doc, 31, null, PERKEMBANGAN_EXPORT_COLUMNS, perkembanganExportRows(), [30, 58, 138]);

  if (ipkChart) {
    doc.addPage();
    addPdfChartImage(doc, 16, ipkChart.toBase64Image(), ipkChartAspectRatio(), 'Grafik Tren Rata-rata IPK per Periode');
  }

  doc.save('laporan-perkembangan-penerima.pdf');
});

/* ── UTILS ── */
function inisial(nama) { return (nama || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }

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

/* ── RENDER LIST ── */
function renderList() {
  const el = document.getElementById('listPenerima');
  if (!el) return;

  if (!penerimaData.length) {
    el.innerHTML = '<div class="list-empty">Belum ada penerima beasiswa yang disahkan.</div>';
    return;
  }

  el.innerHTML = penerimaData.map(p => {
    const profil = p.pendaftaran?.profiles;
    const beasiswa = p.pendaftaran?.beasiswa;
    const entries = p.perkembangan_penerima || [];

    return `
      <div class="penerima-card">
        <div class="penerima-card-head">
          <div>
            <div class="penerima-nama">${profil?.nama_lengkap || '—'}</div>
            <div class="penerima-sub">
              NIM: ${profil?.nim_nip || '—'} · ${profil?.program_studi || '—'} ·
              ${beasiswa?.nama_program || '—'} (${beasiswa?.sponsors?.nama_perusahaan || '—'})
            </div>
          </div>
        </div>
        ${entries.length
          ? entries.map(en => `
              <div class="perkembangan-entry">
                <div class="perkembangan-periode">${en.periode}</div>
                <div class="perkembangan-detail">
                  ${en.ipk_snapshot != null ? `IPK: <span class="perkembangan-ipk">${en.ipk_snapshot}</span> — ` : ''}
                  ${en.catatan || 'Tidak ada catatan.'}
                </div>
              </div>
            `).join('')
          : '<div class="perkembangan-empty">Belum ada catatan perkembangan.</div>'
        }
      </div>
    `;
  }).join('');
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
  loadData();
  console.log('📈 perkembanganPenerima.js loaded | User:', demoSession?.nama_lengkap);
});
