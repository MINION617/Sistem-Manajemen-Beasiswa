/* ============================================================
   PROFILWABAG.JS — Beasiswa Kampus (Wabag)
   Profil khusus Wabag: lihat & edit data diri.
   Perubahan disimpan di localStorage 'bk_profil_wabag'
   (key yang sama dengan halaman profil lama, tetap kompatibel).
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

/* ── DATA PROFIL ── */
const PROFIL_DEFAULT = {
  nama      : demoSession.nama_lengkap || 'Dra. Hartini, M.M.',
  nip       : demoSession.nim_nip || '197808252005012002',
  email     : demoSession.email || 'hartini@univ.ac.id',
  telp      : demoSession.nomor_whatsapp || '0823-4567-8901',
  alamat    : demoSession.alamat || '',
  jabatan   : demoSession.jabatan || 'Wakil Bagian Keuangan',
  unit      : demoSession.unit || 'Biro Kemahasiswaan & Alumni',
  periode   : '2024 – 2028',
  bergabung : 'Maret 2024',
};

const STORAGE_KEY = 'bk_profil_wabag';

function getProfil() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? Object.assign({}, PROFIL_DEFAULT, JSON.parse(saved)) : Object.assign({}, PROFIL_DEFAULT);
}

let profil = getProfil();

const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

async function loadProfile() {
  if (!isRealSession) return;
  try {
    const { data } = await api.get('/profil');
    profil = {
      ...profil,
      nama: data.nama_lengkap ?? profil.nama,
      nip: data.nim_nip ?? profil.nip,
      email: data.email ?? profil.email,
      telp: data.nomor_whatsapp ?? profil.telp,
      alamat: data.alamat ?? profil.alamat,
      jabatan: data.jabatan ?? profil.jabatan,
      unit: data.unit ?? profil.unit,
    };
    renderProfil();
  } catch (err) {
    console.warn('Gagal memuat profil, pakai data lokal:', err);
  }
}

/* ── RENDER ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }

function renderProfil() {
  const inisial = (profil.nama || 'W').charAt(0).toUpperCase();
  setEl('profilNama', profil.nama);
  setEl('profilJabatan', `${profil.jabatan} · ${profil.unit}`);
  setEl('sidebarName', profil.nama);
  ['profilAvatar', 'sidebarAvatar', 'topbarAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = inisial;
  });

  const setVal = (id, v) => { const e = document.getElementById(id); if (e) e.value = v || ''; };
  setVal('inpNama',   profil.nama);
  setVal('inpEmail',  profil.email);
  setVal('inpTelp',   profil.telp);
  setVal('inpAlamat', profil.alamat);

  const info = [
    { icon:'solar:card-bold-duotone',            label:'NIP',            value:profil.nip },
    { icon:'solar:case-round-bold-duotone',      label:'Jabatan',        value:profil.jabatan },
    { icon:'solar:buildings-2-bold-duotone',     label:'Unit Kerja',     value:profil.unit },
    { icon:'solar:calendar-bold-duotone',        label:'Periode Jabatan',value:profil.periode },
    { icon:'solar:user-plus-bold-duotone',       label:'Bergabung',      value:profil.bergabung },
  ];
  const el = document.getElementById('infoList');
  if (el) {
    el.innerHTML = info.map(i => `
      <div class="info-item">
        <div class="info-icon"><iconify-icon icon="${i.icon}" width="16"></iconify-icon></div>
        <div class="info-text">
          <div class="info-label">${i.label}</div>
          <div class="info-value">${i.value || '—'}</div>
        </div>
      </div>
    `).join('');
  }
}

/* ── SIMPAN ── */
document.getElementById('formProfil')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nama   = document.getElementById('inpNama')?.value.trim() || profil.nama;
  const email  = document.getElementById('inpEmail')?.value.trim() || '';
  const telp   = document.getElementById('inpTelp')?.value.trim() || '';
  const alamat = document.getElementById('inpAlamat')?.value.trim() || '';

  const note = document.getElementById('saveNote');

  if (isRealSession) {
    try {
      const { data } = await api.patch('/profil', {
        nama_lengkap: nama,
        email,
        nomor_whatsapp: telp,
        alamat,
      });
      profil.nama   = data.nama_lengkap;
      profil.email  = data.email;
      profil.telp   = data.nomor_whatsapp;
      profil.alamat = data.alamat;
    } catch (err) {
      if (note) note.textContent = '⚠ Gagal menyimpan: ' + (err?.message || 'error');
      return;
    }
  } else {
    profil.nama   = nama;
    profil.email  = email;
    profil.telp   = telp;
    profil.alamat = alamat;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profil));
  }

  renderProfil();
  if (note) {
    note.textContent = 'Tersimpan ✓';
    setTimeout(() => { note.textContent = ''; }, 2500);
  }
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
    ['solar:user-circle-bold-duotone','rgba(37,99,235,.16)'],
    ['solar:wallet-money-bold-duotone','rgba(5,150,105,.18)'],
    ['solar:case-round-bold-duotone','rgba(124,58,237,.16)'],
  ];
  for(let i=0;i<12;i++){
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
  renderProfil();
  loadProfile();
  console.log('👤 profilWabag.js loaded | User:', profil.nama);
});
