/* ============================================================
   DASHBOARDKABAG.JS — Beasiswa Kampus (Kabag)
   Role: Kepala Bagian — monitoring seleksi & laporan staff
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

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

/* ── DUMMY DATA PENDAFTAR ── */
const dummyPendaftar = [
  { id:'p-001', nama:'Bagas Pratama Wijaya',  nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', nilai_tes:88, nilai_wawancara:85, ipk:3.82, status:'wawancara' },
  { id:'p-002', nama:'Cahaya Nur Aisyah',     nim:'2021220032', beasiswa:'Pertamina Sobat Bumi',      nilai_tes:91, nilai_wawancara:89, ipk:3.91, status:'wawancara' },
  { id:'p-003', nama:'Dimas Surya Atmaja',    nim:'2020130021', beasiswa:'Beasiswa Mandiri Prestasi', nilai_tes:79, nilai_wawancara:82, ipk:3.65, status:'lolos_berkas' },
  { id:'p-004', nama:'Elisa Rahayu Putri',    nim:'2022510017', beasiswa:'Telkom Digital Talent',     nilai_tes:85, nilai_wawancara:87, ipk:3.77, status:'wawancara' },
  { id:'p-005', nama:'Fadhlan Rizki Maulana', nim:'2021410043', beasiswa:'Beasiswa Mandiri Prestasi', nilai_tes:93, nilai_wawancara:91, ipk:3.95, status:'lolos_final' },
  { id:'p-006', nama:'Gita Safira Dewi',      nim:'2023110029', beasiswa:'Pertamina Sobat Bumi',      nilai_tes:72, nilai_wawancara:null, ipk:3.50, status:'lolos_berkas' },
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
  const totalPendaftar = dummyPendaftar.length;
  const sudahTes       = dummyPendaftar.filter(d => d.nilai_tes !== null).length;
  const sudahWawancara = dummyPendaftar.filter(d => d.nilai_wawancara !== null).length;
  const laporanMasuk   = dummyLaporan.filter(d => d.status === 'masuk').length;

  animateNum('statPendaftar', totalPendaftar);
  animateNum('statNilaiTes',  sudahTes);
  animateNum('statWawancara', sudahWawancara);
  animateNum('statLaporan',   laporanMasuk);

  /* badge sidebar & notif */
  const badge = document.getElementById('badgeLaporan');
  if (badge) {
    badge.textContent = laporanMasuk;
    badge.classList.toggle('show', laporanMasuk > 0);
  }
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = laporanMasuk > 0 ? 'block' : 'none';
}

/* ── TOP NILAI ── */
function renderTopNilai() {
  const el = document.getElementById('listTopNilai');
  if (!el) return;

  const sorted = [...dummyPendaftar]
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

  const masuk    = dummyLaporan.filter(d => d.status === 'masuk').length;
  const diproses = dummyLaporan.filter(d => d.status === 'diproses').length;
  const selesai  = dummyLaporan.filter(d => d.status === 'selesai').length;

  const STATUS_CFG = {
    masuk    : { cls:'pill-masuk',    dot:'masuk',    label:'Baru' },
    diproses : { cls:'pill-diproses', dot:'diproses', label:'Diproses' },
    selesai  : { cls:'pill-selesai',  dot:'selesai',  label:'Selesai' },
  };

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

  const counts = {
    menunggu_verifikasi : dummyPendaftar.filter(d => d.status === 'menunggu_verifikasi').length,
    lolos_berkas        : dummyPendaftar.filter(d => d.status === 'lolos_berkas').length,
    wawancara           : dummyPendaftar.filter(d => d.status === 'wawancara').length,
    lolos_final         : dummyPendaftar.filter(d => d.status === 'lolos_final').length,
    pencairan           : dummyPendaftar.filter(d => d.status === 'pencairan').length,
  };

  el.innerHTML = PIPELINE_STAGES.map(s => `
    <div class="pipeline-stage">
      <div class="pipeline-bubble">
        <iconify-icon icon="${s.icon}" style="color:${s.color}"></iconify-icon>
      </div>
      <div class="pipeline-count">${counts[s.key] || 0}</div>
      <div class="pipeline-name">${s.label}</div>
    </div>
  `).join('');
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
  loadStats();
  renderTopNilai();
  renderRingkasanLaporan();
  renderPipeline();
  console.log('📊 dashboardKabag.js loaded | User:', demoSession?.nama_lengkap);
});