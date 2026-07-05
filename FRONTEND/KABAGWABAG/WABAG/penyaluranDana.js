/* ============================================================
   PENYALURANDANA.JS — Beasiswa Kampus (Wabag)
   Halaman khusus Wabag: daftar penyaluran dana (GET /penyaluran)
   + verifikasi bukti transfer (FIN-03, PATCH /penyaluran/:id/verifikasi)
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

/* ── DUMMY DATA (fallback tanpa login) ── */
function daysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}
const dummyRows = [
  { id:'p-001', nama:'Fadhlan Rizki Maulana', nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', sponsor:'Bank Mandiri', nominal:5000000, status:'sudah_cair',      created_at:daysAgoIso(25), tanggal_pencairan:daysAgoIso(20), bukti_transfer_url:'https://example.com/bukti/p-001.pdf', diverifikasi_oleh:'demo-wabag-uuid' },
  { id:'p-002', nama:'Cahaya Nur Aisyah',     nim:'2021220032', beasiswa:'Pertamina Sobat Bumi',      sponsor:'Pertamina',    nominal:7500000, status:'sudah_cair',      created_at:daysAgoIso(22), tanggal_pencairan:daysAgoIso(18), bukti_transfer_url:'https://example.com/bukti/p-002.pdf', diverifikasi_oleh:null },
  { id:'p-003', nama:'Elisa Rahayu Putri',    nim:'2022510017', beasiswa:'Telkom Digital Talent',     sponsor:'Telkom',       nominal:6000000, status:'sedang_diproses', created_at:daysAgoIso(3),  tanggal_pencairan:null, bukti_transfer_url:'https://example.com/bukti/p-003.pdf', diverifikasi_oleh:null },
  { id:'p-004', nama:'Bagas Pratama Wijaya',  nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', sponsor:'Bank Mandiri', nominal:5000000, status:'sudah_cair',      created_at:daysAgoIso(15), tanggal_pencairan:daysAgoIso(10), bukti_transfer_url:null, diverifikasi_oleh:null },
  { id:'p-005', nama:'Dimas Surya Atmaja',    nim:'2020130021', beasiswa:'Beasiswa Mandiri Prestasi', sponsor:'Bank Mandiri', nominal:5000000, status:'pending',         created_at:daysAgoIso(12), tanggal_pencairan:null, bukti_transfer_url:null, diverifikasi_oleh:null },
  { id:'p-006', nama:'Gita Safira Dewi',      nim:'2023110029', beasiswa:'Pertamina Sobat Bumi',      sponsor:'Pertamina',    nominal:7500000, status:'pending',         created_at:daysAgoIso(34), tanggal_pencairan:null, bukti_transfer_url:null, diverifikasi_oleh:null },
];

/* ── STATE ── */
let rows = dummyRows;
let activeTab = 'all';
let searchQuery = '';

async function loadData() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/penyaluran');
      rows = data.map(raw => {
        const m = mapPenyaluranRow(raw);
        return {
          id: m.id,
          nama: m.mahasiswa?.nama_lengkap || '—',
          nim: m.mahasiswa?.nim_nip || '—',
          beasiswa: m.beasiswa?.nama_program || '—',
          sponsor: m.beasiswa?.sponsors?.nama_perusahaan || '—',
          nominal: Number(m.nominal || 0),
          status: m.status,
          created_at: m.created_at,
          tanggal_pencairan: m.tanggal_pencairan,
          bukti_transfer_url: m.bukti_transfer_url,
          diverifikasi_oleh: raw.diverifikasi_oleh || null, // mapper tidak membawa kolom ini
        };
      });
    } catch (err) {
      console.warn('Gagal memuat penyaluran, pakai data contoh:', err);
      rows = dummyRows;
    }
  }
  renderAll();
}

/* ── UTILS ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function formatRupiah(num) { return 'Rp ' + Number(num || 0).toLocaleString('id-ID'); }
function formatTanggal(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
}
function umurHari(iso) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}
/* Perlu verifikasi = sudah cair, ada bukti transfer, belum diverifikasi wabag */
function perluVerifikasi(r) {
  return r.status === 'sudah_cair' && !!r.bukti_transfer_url && !r.diverifikasi_oleh;
}

/* ── USER INFO ── */
function initUserInfo() {
  const nama = demoSession?.nama_lengkap || 'Wakil Bagian Keuangan';
  setEl('sidebarName', nama);
  const inisial = nama.charAt(0).toUpperCase();
  const sidebarAv = document.getElementById('sidebarAvatar');
  const topbarAv  = document.getElementById('topbarAvatar');
  if (sidebarAv) sidebarAv.textContent = inisial;
  if (topbarAv)  topbarAv.textContent  = inisial;
}

/* ── STATS & BADGES ── */
function renderStats() {
  const total   = rows.length;
  const cair    = rows.filter(r => r.status === 'sudah_cair').length;
  const proses  = rows.filter(r => r.status === 'sedang_diproses').length;
  const pending = rows.filter(r => r.status === 'pending').length;
  const verif   = rows.filter(perluVerifikasi).length;
  const outstanding = proses + pending;
  const totalDana = rows.reduce((s, r) => s + r.nominal, 0);

  setEl('statTotal',   total);
  setEl('statCair',    cair);
  setEl('statProses',  proses);
  setEl('statPending', pending);
  setEl('bannerTotalDana', formatRupiah(totalDana));
  setEl('bannerAntrian',   outstanding);
  setEl('tcAll',     total);
  setEl('tcPending', pending);
  setEl('tcProses',  proses);
  setEl('tcCair',    cair);
  setEl('tcVerif',   verif);

  const badge = document.getElementById('badgeAntrian');
  if (badge) {
    badge.textContent = outstanding;
    badge.classList.toggle('show', outstanding > 0);
  }
}

/* ── TABEL ── */
const STATUS_CFG = {
  sudah_cair      : { cls:'status-cair',   label:'Sudah Cair',      icon:'solar:check-circle-bold-duotone' },
  sedang_diproses : { cls:'status-proses', label:'Sedang Diproses', icon:'solar:transfer-horizontal-bold-duotone' },
  pending         : { cls:'status-belum',  label:'Belum Cair',      icon:'solar:clock-circle-bold-duotone' },
};

function filteredRows() {
  let list = rows;
  if (activeTab === 'perlu_verifikasi') list = list.filter(perluVerifikasi);
  else if (activeTab !== 'all') list = list.filter(r => r.status === activeTab);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(r =>
      (r.nama || '').toLowerCase().includes(q) ||
      (r.nim || '').toLowerCase().includes(q) ||
      (r.beasiswa || '').toLowerCase().includes(q) ||
      (r.sponsor || '').toLowerCase().includes(q)
    );
  }
  return list;
}

function renderTable() {
  const el = document.getElementById('tablePenyaluran');
  const empty = document.getElementById('emptyState');
  if (!el) return;

  const list = filteredRows();
  setEl('panelCount', `${list.length} penyaluran`);
  if (empty) empty.style.display = list.length ? 'none' : 'block';

  el.innerHTML = list.map((r, i) => {
    const cfg = STATUS_CFG[r.status] || STATUS_CFG.pending;

    const waktu = r.status === 'sudah_cair'
      ? `<span class="td-tanggal">${formatTanggal(r.tanggal_pencairan)}</span>`
      : `<span class="td-umur ${umurHari(r.created_at) > 30 ? 'td-umur-late' : ''}">${umurHari(r.created_at)} hari antre</span>`;

    const bukti = r.bukti_transfer_url
      ? `<a class="bukti-link" href="${r.bukti_transfer_url}" target="_blank" rel="noopener">
           <iconify-icon icon="solar:document-text-bold-duotone" width="13"></iconify-icon> Lihat
         </a>`
      : '<span class="bukti-none">—</span>';

    let verif;
    if (r.diverifikasi_oleh) {
      verif = `<span class="verif-done"><iconify-icon icon="solar:shield-check-bold-duotone" width="13"></iconify-icon> Terverifikasi</span>`;
    } else if (perluVerifikasi(r)) {
      verif = `<button class="btn-verif" data-id="${r.id}">
                 <iconify-icon icon="solar:shield-check-bold-duotone" width="13"></iconify-icon> Verifikasi
               </button>`;
    } else {
      verif = '<span class="verif-na">—</span>';
    }

    return `
      <tr>
        <td class="td-no">${i + 1}</td>
        <td class="td-nama">${r.nama}<div class="td-sub">${r.nim}</div></td>
        <td>${r.beasiswa}<div class="td-sub">${r.sponsor}</div></td>
        <td class="td-dana">${formatRupiah(r.nominal)}</td>
        <td>
          <span class="status-pill-sm ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
            ${cfg.label}
          </span>
        </td>
        <td>${waktu}</td>
        <td>${bukti}</td>
        <td>${verif}</td>
      </tr>
    `;
  }).join('');

  el.querySelectorAll('.btn-verif').forEach(btn => {
    btn.addEventListener('click', () => verifikasi(btn.dataset.id, btn));
  });
}

/* ── VERIFIKASI (FIN-03) ── */
async function verifikasi(id, btn) {
  const row = rows.find(r => r.id === id);
  if (!row) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Memproses…'; }
  try {
    if (isRealSession) {
      await api.patch(`/penyaluran/${id}/verifikasi`);
      row.diverifikasi_oleh = demoSession.id;
    } else {
      row.diverifikasi_oleh = demoSession.id; // demo: tandai lokal saja
    }
    renderAll();
  } catch (err) {
    console.error('Gagal verifikasi:', err);
    alert('Gagal memverifikasi bukti transfer: ' + (err.message || 'error tidak diketahui'));
    renderAll();
  }
}

function renderAll() {
  renderStats();
  renderTable();
}

/* ── EXPORT (Excel/PDF) ── */
const EXPORT_COLUMNS = [
  { key: 'nama', label: 'Nama Mahasiswa' },
  { key: 'nim', label: 'NIM' },
  { key: 'beasiswa', label: 'Beasiswa' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'nominalFmt', label: 'Nominal' },
  { key: 'statusLabel', label: 'Status' },
  { key: 'waktuFmt', label: 'Tanggal Cair / Umur Antre' },
  { key: 'verifLabel', label: 'Verifikasi' },
];

function exportRows() {
  return filteredRows().map(r => {
    const cfg = STATUS_CFG[r.status] || STATUS_CFG.pending;
    return {
      ...r,
      nominalFmt: formatRupiah(r.nominal),
      statusLabel: cfg.label,
      waktuFmt: r.status === 'sudah_cair'
        ? formatTanggal(r.tanggal_pencairan)
        : `${umurHari(r.created_at)} hari antre`,
      verifLabel: r.diverifikasi_oleh ? 'Terverifikasi' : (perluVerifikasi(r) ? 'Perlu verifikasi' : '—'),
    };
  });
}

document.getElementById('btnExportExcel')?.addEventListener('click', () => {
  exportToExcel('laporan-penyaluran-dana', 'Penyaluran Dana', EXPORT_COLUMNS, exportRows());
});
document.getElementById('btnExportPdf')?.addEventListener('click', () => {
  const tabLabel = document.querySelector('.tab-btn.active')?.textContent?.trim() || 'Semua';
  exportToPdf(
    'laporan-penyaluran-dana',
    'Laporan Penyaluran Dana Beasiswa',
    EXPORT_COLUMNS,
    exportRows(),
    `Filter: ${tabLabel}${searchQuery ? ` · Pencarian: "${searchQuery}"` : ''}`
  );
});

/* ── TAB & SEARCH ── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTab = btn.dataset.tab;
    renderTable();
  });
});
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderTable();
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

/* ── BG CANVAS & PARTICLES (pola sama dengan dashboardWabag) ── */
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
    ['solar:transfer-horizontal-bold-duotone','rgba(5,150,105,.16)'],
    ['solar:shield-check-bold-duotone','rgba(124,58,237,.16)'],
  ];
  for(let i=0;i<14;i++){
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
  loadData();
  console.log('💸 penyaluranDana.js loaded | User:', demoSession?.nama_lengkap);
});
