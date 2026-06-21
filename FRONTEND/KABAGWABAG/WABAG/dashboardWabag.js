/* ============================================================
   DASHBOARDWABAG.JS — Beasiswa Kampus (Wabag)
   Role: Wakil Bagian Keuangan — monitoring keuangan beasiswa
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

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

const dummyLaporan = [
  { status:'masuk' }, { status:'masuk' },
  { status:'diproses' }, { status:'diproses' },
  { status:'selesai' }, { status:'selesai' },
];

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
  const totalDana      = dummyPenerima.reduce((sum, d) => sum + d.nominal, 0);
  const totalPenerima  = dummyPenerima.length;
  const totalSponsor   = dummySponsor.length;
  const menungguCair   = dummyPenerima.filter(d => d.status === 'belum_cair').length;
  const laporanMasuk   = dummyLaporan.filter(d => d.status === 'masuk').length;

  /* Format total dana ringkas */
  const el = document.getElementById('statTotalDana');
  if (el) {
    const juta = totalDana / 1000000;
    el.textContent = `Rp ${juta.toLocaleString('id-ID')} Jt`;
  }
  animateNum('statPenerima',    totalPenerima);
  animateNum('statSponsor',     totalSponsor);
  animateNum('statMenungguCair',menungguCair);

  const badge = document.getElementById('badgeLaporan');
  if (badge) {
    badge.textContent = laporanMasuk;
    badge.classList.toggle('show', laporanMasuk > 0);
  }
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = laporanMasuk > 0 ? 'block' : 'none';
}

/* ── RINGKASAN PER BEASISWA ── */
function renderRingkasanBeasiswa() {
  const el = document.getElementById('listRingkasanBeasiswa');
  if (!el) return;

  /* Group by beasiswa */
  const map = {};
  dummyPenerima.forEach(d => {
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

  el.innerHTML = dummySponsor.map(s => `
    <div class="sponsor-item">
      <div class="sponsor-logo">${inisial(s.nama)}</div>
      <div class="sponsor-info">
        <div class="sponsor-nama">${s.nama}</div>
        <div class="sponsor-jenis">${s.jenis} · ${s.beasiswa} program beasiswa</div>
      </div>
      <div class="sponsor-kontribusi">${formatRupiah(s.kontribusi)}</div>
    </div>
  `).join('');
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

  el.innerHTML = dummyPenerima.map(d => {
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
  loadStats();
  renderRingkasanBeasiswa();
  renderSponsor();
  renderTabelPenerima();
  console.log('💰 dashboardWabag.js loaded | User:', demoSession?.nama_lengkap);
});