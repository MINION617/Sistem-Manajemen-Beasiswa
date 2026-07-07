/* ============================================================
   TRACKINGPENERIMA.JS — Beasiswa Kampus (Staff Admin)
   Folder  : TrackingPenerima/
   ──────────────────────────────────────────────────────────
   Staff mencatat perkembangan (IPK semester + catatan) penerima
   beasiswa yang sudah disahkan Kabag. Sebelumnya TIDAK ADA jalur
   input untuk ini di aplikasi sama sekali — perkembangan_penerima
   cuma bisa terisi lewat insert manual ke database, jadi halaman
   Kabag "Perkembangan Penerima" selalu kosong untuk penerima baru.
   Hasil catatan di sini langsung muncul di GET /kabag/perkembangan.
   ============================================================ */

/* ── SESSION ── */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session = getSession();
if (!session || session.role !== 'staff') {
  // window.location.href = '../LOGIN/login.html';
}
const demoSession = session || { nama_lengkap: 'Rangga Adi Nugroho', role: 'staff', id: 'demo-staff-uuid' };
const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

/* ── DUMMY DATA (contoh, dipakai kalau bukan sesi real) ── */
const dummyPenerima = [
  {
    id: 'pb-101', nama: 'Fadhlan Rizki Maulana', nim: '2021410043', programStudi: 'Manajemen',
    ipkProfil: 3.65, beasiswa: 'Beasiswa Mandiri Prestasi', sponsor: 'Bank Mandiri',
    ipkMinimum: 3.50, jumlahCatatan: 1, latestPeriode: 'Semester 1 2026', latestIpk: 3.70,
  },
  {
    id: 'pb-102', nama: 'Hana Putri Azzahra', nim: '2021310088', programStudi: 'Teknik Informatika',
    ipkProfil: 3.95, beasiswa: 'Beasiswa Mandiri Prestasi', sponsor: 'Bank Mandiri',
    ipkMinimum: 3.50, jumlahCatatan: 0, latestPeriode: null, latestIpk: null,
  },
  {
    id: 'pb-103', nama: 'Ivan Rizki Ramadhan', nim: '2020230045', programStudi: 'Teknik Kimia',
    ipkProfil: 3.20, beasiswa: 'Pertamina Sobat Bumi', sponsor: 'Pertamina',
    ipkMinimum: 3.50, jumlahCatatan: 1, latestPeriode: 'Semester 2 2025', latestIpk: 3.15,
  },
];

/* Baris GET /api/penerima?status=disahkan -> bentuk yang dipakai halaman ini. */
function mapPenerimaRow(row) {
  const entries = row.perkembangan_penerima || [];
  const sorted = [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latest = sorted[0] || null;
  const profil = row.pendaftaran?.profiles;
  const beasiswa = row.pendaftaran?.beasiswa;
  return {
    id: row.id,
    nama: profil?.nama_lengkap || '—',
    nim: profil?.nim_nip || '—',
    programStudi: profil?.program_studi || '—',
    ipkProfil: profil?.ipk ?? null,
    beasiswa: beasiswa?.nama_program || '—',
    sponsor: beasiswa?.sponsors?.nama_perusahaan || '—',
    ipkMinimum: beasiswa?.ipk_minimum ?? null,
    jumlahCatatan: entries.length,
    latestPeriode: latest?.periode || null,
    latestIpk: latest?.ipk_snapshot ?? null,
  };
}

let penerimaData = dummyPenerima;

async function loadData() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/penerima?status=disahkan');
      penerimaData = data.map(mapPenerimaRow);
    } catch (err) {
      console.warn('Gagal memuat daftar penerima, pakai data contoh:', err);
      penerimaData = dummyPenerima;
    }
  }
  loadStats();
  populateFilterBeasiswa();
  renderList();
}

/* ── STATE ── */
let filterBeasiswa = 'all';
let searchQ        = '';
let editingId       = null;

/* ── UTILS ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function inisial(nama)  { return (nama || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function delay(ms)      { return new Promise(r => setTimeout(r, ms)); }
function butuhPerhatian(d) {
  const ipkTerkini = d.latestIpk ?? d.ipkProfil;
  return d.ipkMinimum != null && ipkTerkini != null && ipkTerkini < d.ipkMinimum;
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 22));
  const t = setInterval(() => { cur += step; if (cur >= target) { el.textContent = target; clearInterval(t); } else el.textContent = cur; }, 35);
}

/* ── USER INFO ── */
function initUserInfo() {
  const nama = demoSession?.nama_lengkap || 'Staff Admin';
  setEl('sidebarName', nama);
  setEl('sidebarAvatar', nama.charAt(0).toUpperCase());
  setEl('topbarAvatar', nama.charAt(0).toUpperCase());
}

/* ── STATS ── */
function loadStats() {
  const total      = penerimaData.length;
  const sudahTrack = penerimaData.filter(d => d.jumlahCatatan > 0).length;
  const belumTrack = total - sudahTrack;
  const perhatian  = penerimaData.filter(butuhPerhatian).length;

  animateNum('statTotal',      total);
  animateNum('statSudahTrack', sudahTrack);
  animateNum('statBelumTrack', belumTrack);
  animateNum('statPerhatian',  perhatian);

  setEl('bannerTotal',     total);
  setEl('bannerPerhatian', perhatian);
}

/* ── POPULATE FILTER ── */
function populateFilterBeasiswa() {
  const sel = document.getElementById('filterBeasiswa');
  if (!sel) return;
  const uniq = [...new Set(penerimaData.map(d => d.beasiswa).filter(Boolean))];
  sel.innerHTML = '<option value="all">Semua Beasiswa</option>' +
    uniq.map(nama => `<option value="${nama}">${nama}</option>`).join('');
  filterBeasiswa = 'all';
  sel.addEventListener('change', () => { filterBeasiswa = sel.value; renderList(); });
}

document.getElementById('searchInput')?.addEventListener('input', e => {
  searchQ = e.target.value.trim().toLowerCase();
  renderList();
});

/* ── RENDER LIST ── */
function renderList() {
  const listEl  = document.getElementById('trackingList');
  const emptyEl = document.getElementById('emptyState');

  let data = [...penerimaData];
  if (filterBeasiswa !== 'all') data = data.filter(d => d.beasiswa === filterBeasiswa);
  if (searchQ) {
    data = data.filter(d =>
      d.nama.toLowerCase().includes(searchQ) ||
      d.nim.includes(searchQ) ||
      d.beasiswa.toLowerCase().includes(searchQ)
    );
  }

  setEl('panelCount', data.length + ' penerima');

  if (!data.length) { listEl.innerHTML = ''; emptyEl.style.display = 'flex'; return; }
  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const perhatian = butuhPerhatian(d);
    const ipkTerkini = d.latestIpk ?? d.ipkProfil;
    return `
      <div class="pencairan-card" style="--card-accent:${perhatian ? '#be123c' : '#059669'};animation-delay:${i * .06}s">
        <div class="card-avatar">${inisial(d.nama)}</div>

        <div class="card-main">
          <div class="card-nama">
            ${d.nama}
            ${perhatian ? `
              <span class="card-tag" style="color:#be123c;background:var(--coral-soft);border-color:#fecaca;margin-left:6px">
                <iconify-icon icon="solar:danger-triangle-bold-duotone" width="10"></iconify-icon>
                IPK di bawah minimum
              </span>
            ` : ''}
          </div>
          <div class="card-sub">NIM: ${d.nim} &nbsp;·&nbsp; ${d.programStudi}</div>
          <div class="card-tags">
            <span class="card-tag">
              <iconify-icon icon="solar:diploma-bold-duotone" width="10"></iconify-icon>
              ${d.beasiswa}
            </span>
            <span class="card-tag">
              <iconify-icon icon="solar:star-bold-duotone" width="10"></iconify-icon>
              IPK terkini: ${ipkTerkini != null ? ipkTerkini.toFixed(2) : '—'}${d.ipkMinimum != null ? ' / min ' + d.ipkMinimum.toFixed(2) : ''}
            </span>
            ${d.latestPeriode ? `
              <span class="card-tag">
                <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
                Terakhir dicatat: ${d.latestPeriode}
              </span>
            ` : `
              <span class="card-tag" style="color:#d97706;background:var(--yellow-soft, #fef3c7);border-color:#fde68a">
                <iconify-icon icon="solar:clock-circle-bold-duotone" width="10"></iconify-icon>
                Belum ada catatan
              </span>
            `}
          </div>
        </div>

        <div class="card-right">
          <div class="card-beasiswa">${d.sponsor}</div>
          <div class="card-actions">
            <button class="btn-upload" onclick="openTracking('${d.id}')">
              <iconify-icon icon="solar:pen-new-square-bold-duotone" width="13"></iconify-icon>
              Catat Perkembangan
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── MODAL CATAT PERKEMBANGAN ── */
const modalTracking = document.getElementById('modalTracking');

function openTracking(id) {
  editingId = id;
  const d = penerimaData.find(x => x.id === id);
  if (!d) return;

  setEl('modalTrackingTitle', `Catat Perkembangan — ${d.nama}`);

  document.getElementById('trackingPenerimaInfo').innerHTML = `
    <div class="penerima-info-block">
      <div class="pib-avatar">${inisial(d.nama)}</div>
      <div>
        <div class="pib-nama">${d.nama}</div>
        <div class="pib-sub">
          NIM: ${d.nim} &nbsp;·&nbsp; ${d.beasiswa}
          &nbsp;·&nbsp; <strong>IPK terkini: ${(d.latestIpk ?? d.ipkProfil)?.toFixed(2) ?? '—'}</strong>
        </div>
      </div>
    </div>
  `;

  document.getElementById('fPeriode').value = '';
  document.getElementById('fIpkSnapshot').value = d.ipkProfil ?? '';
  document.getElementById('fCatatanTracking').value = '';

  clearFormMsg('formTrackingMsg');
  modalTracking?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTracking() {
  modalTracking?.classList.remove('active');
  document.body.style.overflow = '';
  editingId = null;
}

document.getElementById('modalTrackingClose')?.addEventListener('click',   closeTracking);
document.getElementById('cancelTracking')?.addEventListener('click',       closeTracking);
document.getElementById('modalTrackingOverlay')?.addEventListener('click', closeTracking);

function clearFormMsg(id) { const el = document.getElementById(id); if (el) { el.textContent = ''; el.className = 'form-message'; } }
function showFormMsg(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'form-message ' + (type === 'error' ? 'form-error' : 'form-success');
}
function setLoading(btnId, loaderId, loading) {
  const btn = document.getElementById(btnId);
  const text = btn?.querySelector('.btn-text');
  const loader = document.getElementById(loaderId);
  if (btn) btn.disabled = loading;
  if (text) text.style.display = loading ? 'none' : 'inline-flex';
  if (loader) loader.style.display = loading ? 'inline-flex' : 'none';
}

document.getElementById('formTracking')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const periode = document.getElementById('fPeriode').value.trim();
  const ipkVal  = document.getElementById('fIpkSnapshot').value;
  const catatan = document.getElementById('fCatatanTracking').value.trim();

  if (!periode) { showFormMsg('formTrackingMsg', 'error', '⚠ Periode wajib diisi.'); return; }
  if (ipkVal && (parseFloat(ipkVal) < 0 || parseFloat(ipkVal) > 4)) {
    showFormMsg('formTrackingMsg', 'error', '⚠ IPK harus antara 0.00 – 4.00.');
    return;
  }

  setLoading('btnSimpanTracking', 'loaderTracking', true);

  try {
    if (isRealSession) {
      await api.post('/perkembangan', {
        penerimaId: editingId,
        periode,
        ipkSnapshot: ipkVal ? parseFloat(ipkVal) : null,
        catatan: catatan || null,
      });
      await loadData();
    } else {
      await delay(800);
      const idx = penerimaData.findIndex(d => d.id === editingId);
      if (idx !== -1) {
        penerimaData[idx].jumlahCatatan += 1;
        penerimaData[idx].latestPeriode = periode;
        penerimaData[idx].latestIpk = ipkVal ? parseFloat(ipkVal) : null;
      }
      loadStats();
      renderList();
    }

    showFormMsg('formTrackingMsg', 'success', '✓ Catatan perkembangan tersimpan! Kabag dapat melihatnya di Perkembangan Penerima.');
    setTimeout(closeTracking, 1400);
  } catch (err) {
    showFormMsg('formTrackingMsg', 'error', '⚠ ' + (err?.message || 'Gagal menyimpan catatan.'));
  } finally {
    setLoading('btnSimpanTracking', 'loaderTracking', false);
  }
});

/* ── BADGE LAPORAN — sinkron dengan halaman staff lain ── */
async function updateLaporanBadge() {
  if (!isRealSession) return;
  try {
    const { data } = await api.get('/laporan');
    const belum = data.filter(l => l.status !== 'selesai').length;
    const badge = document.getElementById('badgeLaporan');
    if (badge) {
      badge.textContent = belum;
      badge.classList.toggle('show', belum > 0);
    }
  } catch (err) {
    console.warn('Gagal memuat badge laporan:', err);
  }
}

/* ── SIDEBAR & LOGOUT ── */
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
function openSidebar()  { sidebar?.classList.add('open');    sidebarOverlay?.classList.add('active');    document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar?.classList.remove('open'); sidebarOverlay?.classList.remove('active'); document.body.style.overflow = ''; }
document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

const logoutModal = document.getElementById('logoutModal');
document.getElementById('btnLogout')?.addEventListener('click',    () => { logoutModal?.classList.add('active');    document.body.style.overflow = 'hidden'; });
document.getElementById('cancelLogout')?.addEventListener('click', () => { logoutModal?.classList.remove('active'); document.body.style.overflow = ''; });
document.getElementById('logoutOverlay')?.addEventListener('click',() => { logoutModal?.classList.remove('active'); document.body.style.overflow = ''; });
document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { logoutModal?.classList.remove('active'); closeSidebar(); closeTracking(); }
});

/* ── BG CANVAS & PARTICLES ── */
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
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const icons = [
    ['solar:graph-new-up-bold-duotone', 'rgba(37,99,235,.16)'],
    ['solar:diploma-bold-duotone', 'rgba(5,150,105,.16)'],
    ['solar:star-bold-duotone', 'rgba(251,191,36,.18)'],
  ];
  for (let i = 0; i < 14; i++) {
    const [icon, color] = icons[i % icons.length];
    const p = document.createElement('iconify-icon');
    p.setAttribute('icon', icon); p.className = 'particle';
    const dur = 7 + Math.random() * 8, dl = Math.random() * 10;
    p.style.cssText = `left:${Math.random() * 100}%;bottom:-40px;font-size:${12 + Math.random() * 10}px;color:${color};--dur:${dur}s;--delay:${dl}s;animation-delay:${dl}s`;
    container.appendChild(p);
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  loadData();
  updateLaporanBadge();
  console.log('📊 trackingPenerima.js loaded | Staff:', demoSession?.nama_lengkap);
});
