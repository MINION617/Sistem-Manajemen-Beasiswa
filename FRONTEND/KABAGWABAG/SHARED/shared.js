/* ============================================================
   SHARED.JS — Beasiswa Kampus (Kabag & Wabag)
   Utility bersama: deteksi role, sidebar, canvas, particles
   ============================================================ */

/* ── SESSION & ROLE ── */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session = getSession();
const ROLE    = session?.role || 'kabag'; /* kabag | wabag */

/* Demo session jika belum login */
const demoSession = session || (ROLE === 'wabag'
  ? { nama_lengkap:'Dra. Hartini, M.M.',   role:'wabag', id:'demo-wabag-uuid' }
  : { nama_lengkap:'Dr. Suharto, M.Pd.',   role:'kabag', id:'demo-kabag-uuid' }
);

const ROLE_CFG = {
  kabag : { label:'Kabag', dashboardUrl:'../KABAG/dashboardKabag.html', icon:'solar:star-bold-duotone' },
  wabag : { label:'Wabag', dashboardUrl:'../WABAG/dashboardWabag.html', icon:'solar:wallet-bold-duotone' },
};
const roleCfg = ROLE_CFG[ROLE] || ROLE_CFG.kabag;

/* ── INIT USER INFO ── */
function initUserInfo() {
  const nama        = demoSession?.nama_lengkap || 'Pengguna';
  const inisialUser = nama.charAt(0).toUpperCase();

  const elName    = document.getElementById('sidebarName');
  const elAvatar  = document.getElementById('sidebarAvatar');
  const elTopAvt  = document.getElementById('topbarAvatar');
  const elRole    = document.getElementById('sidebarRoleLabel');
  const elNavDash = document.getElementById('navDashboard');
  const elPage    = document.getElementById('pageTitle');
  const elBanner  = document.getElementById('bannerTitle');

  if (elName)    elName.textContent    = nama;
  if (elAvatar)  elAvatar.textContent  = inisialUser;
  if (elTopAvt)  elTopAvt.textContent  = inisialUser;
  if (elRole)    elRole.textContent    = roleCfg.label;
  if (elNavDash) elNavDash.href        = roleCfg.dashboardUrl;

  /* Update judul halaman dengan label role */
  if (elPage) {
    const pageBase = elPage.textContent;
    elPage.textContent = `${roleCfg.label} — ${pageBase}`;
  }
  if (elBanner) {
    const bannerBase = elBanner.textContent;
    elBanner.textContent = `${roleCfg.label} — ${bannerBase}`;
  }
}

/* ── UTILS ── */
function setEl(id, val)  { const e = document.getElementById(id); if (e) e.textContent = val; }
function inisial(nama)   { return nama.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function formatRupiah(n) { return 'Rp ' + n.toLocaleString('id-ID'); }
function formatTgl(str)  {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
}
function timeAgo(str) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return m + ' menit lalu';
  const h = Math.floor(m/60);
  if (h < 24) return h + ' jam lalu';
  return Math.floor(h/24) + ' hari lalu';
}
function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur = 0;
  const step = Math.max(1, Math.ceil(target/22));
  const t = setInterval(()=>{ cur+=step; if(cur>=target){el.textContent=target;clearInterval(t);}else el.textContent=cur; },35);
}

/* ── SIDEBAR ── */
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
function openSidebar()  { sidebar?.classList.add('open');    sidebarOverlay?.classList.add('active');    document.body.style.overflow='hidden'; }
function closeSidebar() { sidebar?.classList.remove('open'); sidebarOverlay?.classList.remove('active'); document.body.style.overflow=''; }
document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

/* ── LOGOUT ── */
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

/* ── BG CANVAS ── */
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

/* ── PARTICLES ── */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const icons = [
    ['solar:cup-star-bold-duotone','rgba(37,99,235,.16)'],
    ['solar:diploma-bold-duotone','rgba(37,99,235,.14)'],
    ['solar:users-group-two-rounded-bold-duotone','rgba(5,150,105,.14)'],
    ['solar:chart-bold-duotone','rgba(124,58,237,.14)'],
    ['solar:star-bold-duotone','rgba(251,191,36,.16)'],
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