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

/* ── DUMMY DATA — proposal menunggu ratifikasi (penerima_beasiswa: diusulkan) ── */
const dummyRatifikasi = [
  {
    id: 'pb-101',
    pendaftaran: {
      profiles: { nama_lengkap: 'Ivan Rizki Ramadhan', nim_nip: '2020230045', program_studi: 'Teknik Kimia', ipk: 3.86 },
      beasiswa: { nama_program: 'Pertamina Sobat Bumi', nominal_dana: 7500000, sponsors: { nama_perusahaan: 'Pertamina' } },
    },
  },
];

let penerimaData = dummyPenerima;
let ratifikasiData = dummyRatifikasi;
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
  loadRatifikasi();
}

/* ── MENUNGGU RATIFIKASI (penerima_beasiswa: diusulkan) ──
   Staff menetapkan pendaftaran lolos_final -> otomatis membuat baris
   penerima_beasiswa berstatus 'diusulkan' (lihat BACKEND penetapan.service.js).
   Sebelumnya TIDAK ADA UI di manapun buat Kabag mengesahkan/membatalkan
   proposal ini — endpoint backend-nya (PATCH /penerima/:id/sahkan|batalkan)
   sudah ada tapi tidak pernah dipanggil, jadi proposal nyangkut selamanya
   dan Wabag tidak pernah melihat penerima baru. */
async function loadRatifikasi() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/penerima?status=diusulkan');
      ratifikasiData = data;
    } catch (err) {
      console.warn('Gagal memuat daftar ratifikasi, pakai data contoh:', err);
      ratifikasiData = dummyRatifikasi;
    }
  }
  renderRatifikasi();
}

function renderRatifikasi() {
  const el = document.getElementById('listRatifikasi');
  if (!el) return;

  if (!ratifikasiData.length) {
    el.innerHTML = '<div class="list-empty">Tidak ada proposal yang menunggu ratifikasi saat ini.</div>';
    return;
  }

  el.innerHTML = ratifikasiData.map(p => {
    const profil = p.pendaftaran?.profiles;
    const beasiswa = p.pendaftaran?.beasiswa;
    return `
      <div class="penerima-card" id="ratifikasi-${p.id}">
        <div class="penerima-card-head">
          <div>
            <div class="penerima-nama">${profil?.nama_lengkap || '—'}</div>
            <div class="penerima-sub">
              NIM: ${profil?.nim_nip || '—'} · ${profil?.program_studi || '—'} ·
              ${beasiswa?.nama_program || '—'} (${beasiswa?.sponsors?.nama_perusahaan || '—'})
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0">
            <button class="btn-export" style="background:#dcfce7;color:#059669" onclick="ratifikasiAksi('${p.id}','sahkan')">
              <iconify-icon icon="solar:check-circle-bold-duotone" width="14"></iconify-icon> Sahkan
            </button>
            <button class="btn-export" style="background:#fee2e2;color:#be123c" onclick="ratifikasiAksi('${p.id}','batalkan')">
              <iconify-icon icon="solar:close-circle-bold-duotone" width="14"></iconify-icon> Batalkan
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function ratifikasiAksi(penerimaId, aksi) {
  if (!isRealSession) {
    ratifikasiData = ratifikasiData.filter(p => p.id !== penerimaId);
    renderRatifikasi();
    return;
  }
  try {
    await api.patch(`/penerima/${penerimaId}/${aksi}`);
    ratifikasiData = ratifikasiData.filter(p => p.id !== penerimaId);
    renderRatifikasi();
    if (aksi === 'sahkan') loadData(); // penerima baru harus muncul di "Daftar Penerima" + grafik IPK
  } catch (err) {
    alert(err?.message || 'Gagal menyimpan keputusan ratifikasi.');
  }
}

/* ── RENDER CHART: rata-rata IPK per periode, dipecah per PROGRAM BEASISWA ──
   Sebelumnya satu garis gabungan semua penerima — bisa menutupi masalah
   (satu program menurun, program lain naik, garis rata-rata kelihatan
   baik-baik saja). Per-mahasiswa juga tidak dipakai karena garisnya akan
   sebanyak jumlah penerima (sudah 42+) dan tidak kebaca; kasus "mahasiswa
   mana yang perlu diperhatikan" sudah ditangani lewat badge & filter
   "Perlu Perhatian" di daftar penerima, bukan lewat grafik. */
const CHART_PROGRAM_COLORS = ['#1e3a8a', '#059669', '#d97706', '#7c3aed', '#be123c', '#0891b2'];

/* periode adalah teks bebas ("Semester 1 2026") — urutkan kronologis
   berdasarkan tahun lalu nomor semester, bukan urutan kemunculan di data
   (yang ikut urutan created_at terbaru dulu dan jadi acak di grafik). */
function periodeSortKey(periode) {
  const m = /semester\s*(\d+)\D+(\d{4})/i.exec(periode || '');
  if (!m) return [9999, 9];
  return [parseInt(m[2], 10), parseInt(m[1], 10)];
}
function sortPeriodes(periodes) {
  return [...periodes].sort((a, b) => {
    const [ya, sa] = periodeSortKey(a);
    const [yb, sb] = periodeSortKey(b);
    return ya - yb || sa - sb;
  });
}

function renderChart() {
  const canvas = document.getElementById('chartIpk');
  if (!canvas || typeof Chart === 'undefined') return;

  const byProgram = {};
  const periodeSet = new Set();
  penerimaData.forEach(p => {
    const program = p.pendaftaran?.beasiswa?.nama_program || 'Tidak diketahui';
    (p.perkembangan_penerima || []).forEach(en => {
      if (en.ipk_snapshot == null) return;
      periodeSet.add(en.periode);
      if (!byProgram[program]) byProgram[program] = {};
      if (!byProgram[program][en.periode]) byProgram[program][en.periode] = { sum: 0, count: 0 };
      byProgram[program][en.periode].sum += en.ipk_snapshot;
      byProgram[program][en.periode].count += 1;
    });
  });

  const periodes = sortPeriodes(periodeSet);
  const programs = Object.keys(byProgram);

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

  const datasets = programs.map((program, i) => ({
    label: program,
    data: periodes.map(periode => {
      const cell = byProgram[program][periode];
      return cell ? +(cell.sum / cell.count).toFixed(2) : null;
    }),
    borderColor: CHART_PROGRAM_COLORS[i % CHART_PROGRAM_COLORS.length],
    backgroundColor: CHART_PROGRAM_COLORS[i % CHART_PROGRAM_COLORS.length] + '20',
    tension: 0.3,
    fill: false,
    pointRadius: 4,
    spanGaps: true,
  }));

  ipkChart = new Chart(canvas, {
    type: 'line',
    data: { labels: periodes, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } } },
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

/* ── PERLU PERHATIAN — IPK penerima turun di bawah syarat program.
   IPK "terkini" diambil dari catatan perkembangan TERBARU (kalau ada),
   kalau belum pernah dicatat sama sekali dipakai IPK profil saat ini.
   Program tanpa ipk_minimum (null) tidak pernah dianggap butuh perhatian. */
function ipkTerkini(p) {
  const entries = p.perkembangan_penerima || [];
  const sorted = [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latest = sorted[0];
  return latest?.ipk_snapshot ?? p.pendaftaran?.profiles?.ipk ?? null;
}
function butuhPerhatian(p) {
  const min = p.pendaftaran?.beasiswa?.ipk_minimum;
  const ipk = ipkTerkini(p);
  return min != null && ipk != null && ipk < min;
}

let activeFilterPenerima = 'all';
function setFilterPenerima(filter) {
  activeFilterPenerima = filter;
  document.getElementById('btnFilterSemua')?.style.setProperty('outline', filter === 'all' ? '2px solid #2563eb' : 'none');
  document.getElementById('btnFilterPerhatian')?.style.setProperty('outline', filter === 'perhatian' ? '2px solid #be123c' : 'none');
  renderList();
}

/* ── RENDER LIST ── */
function renderList() {
  const el = document.getElementById('listPenerima');
  if (!el) return;

  const perhatianCount = penerimaData.filter(butuhPerhatian).length;
  const countEl = document.getElementById('countPerhatian');
  if (countEl) countEl.textContent = `(${perhatianCount})`;

  const data = activeFilterPenerima === 'perhatian' ? penerimaData.filter(butuhPerhatian) : penerimaData;

  if (!data.length) {
    el.innerHTML = `<div class="list-empty">${
      activeFilterPenerima === 'perhatian'
        ? 'Tidak ada penerima yang IPK-nya di bawah syarat minimum saat ini.'
        : 'Belum ada penerima beasiswa yang disahkan.'
    }</div>`;
    return;
  }

  el.innerHTML = data.map(p => {
    const profil = p.pendaftaran?.profiles;
    const beasiswa = p.pendaftaran?.beasiswa;
    const entries = p.perkembangan_penerima || [];
    const perhatian = butuhPerhatian(p);
    const ipk = ipkTerkini(p);

    return `
      <div class="penerima-card" style="${perhatian ? 'border-left:3px solid #be123c' : ''}">
        <div class="penerima-card-head">
          <div>
            <div class="penerima-nama">
              ${profil?.nama_lengkap || '—'}
              ${perhatian ? `
                <span style="display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:700;color:#be123c;background:#fee2e2;border:1px solid #fecaca;border-radius:100px;padding:2px 8px;margin-left:6px">
                  <iconify-icon icon="solar:danger-triangle-bold-duotone" width="10"></iconify-icon>
                  IPK ${ipk?.toFixed(2)} di bawah minimum ${beasiswa?.ipk_minimum?.toFixed(2)}
                </span>
              ` : ''}
            </div>
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
