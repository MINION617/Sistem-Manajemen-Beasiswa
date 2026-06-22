/* ============================================================
   PENETAPANPENERIMA.JS — Kabag (KD-3)
   Staff mengusulkan (diusulkan) → Kabag mengesahkan (disahkan) / batalkan.
   Prototype dummy data. Pakai util dari shared.js.
   ============================================================ */

let kandidat = [
  { id: 'k-1', nama: 'Adinda Putri Lestari',  nim: '2150001', beasiswa: 'Beasiswa Mandiri Prestasi', sponsor: 'Bank Mandiri',   tes: 88, wawancara: 91, ipk: 3.85, status: 'diusulkan' },
  { id: 'k-2', nama: 'Bagas Pratama Wijaya',   nim: '2150042', beasiswa: 'Pertamina Sobat Bumi',      sponsor: 'Pertamina',     tes: 84, wawancara: 86, ipk: 3.62, status: 'diusulkan' },
  { id: 'k-3', nama: 'Citra Maharani',         nim: '2150088', beasiswa: 'Telkom Digital Talent',     sponsor: 'Telkom',        tes: 90, wawancara: 88, ipk: 3.74, status: 'diusulkan' },
  { id: 'k-4', nama: 'Dimas Anggoro',          nim: '2150120', beasiswa: 'Beasiswa BCA Finance',      sponsor: 'BCA',           tes: 79, wawancara: 82, ipk: 3.55, status: 'disahkan' },
  { id: 'k-5', nama: 'Erika Wulandari',        nim: '2150156', beasiswa: 'Astra Future Leader',       sponsor: 'Astra',         tes: 92, wawancara: 90, ipk: 3.90, status: 'diusulkan' },
];

const ST = {
  diusulkan:  { label: 'Diusulkan',  cls: 'status-menunggu', accent: '#d97706' },
  disahkan:   { label: 'Disahkan',   cls: 'status-final',    accent: '#059669' },
  dibatalkan: { label: 'Dibatalkan', cls: 'status-ditolak',  accent: '#e11d48' },
};

function inisialNama(n) { return n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }

function renderStats() {
  const c = { diusulkan: 0, disahkan: 0, dibatalkan: 0 };
  kandidat.forEach(k => c[k.status]++);
  setEl('statDiusulkan', c.diusulkan);
  setEl('statDisahkan', c.disahkan);
  setEl('statDibatalkan', c.dibatalkan);
}

function renderList() {
  const wrap = document.getElementById('listKandidat');
  if (!wrap) return;
  wrap.innerHTML = kandidat.map(k => {
    const st = ST[k.status] || ST.diusulkan;
    const rata = ((Number(k.tes) + Number(k.wawancara)) / 2).toFixed(1);
    const actions = k.status === 'diusulkan'
      ? `<div style="display:flex;gap:10px;margin-top:14px">
           <button class="btn-primary" data-acc="${k.id}" style="padding:9px 18px">
             <iconify-icon icon="solar:verified-check-bold-duotone" width="16"></iconify-icon> Sahkan (ACC)
           </button>
           <button data-batal="${k.id}" style="padding:9px 18px;border:1.5px solid #fecaca;background:#fff;color:#be123c;border-radius:100px;font-weight:700;font-size:13px;cursor:pointer">
             Batalkan
           </button>
         </div>`
      : `<div style="display:flex;gap:10px;margin-top:14px;align-items:center">
           <span class="badge-readonly">
             <iconify-icon icon="solar:check-read-line-duotone" width="13"></iconify-icon>
             ${k.status === 'disahkan' ? 'Sudah disahkan oleh Kabag' : 'Usulan dibatalkan'}
           </span>
           <button data-reset="${k.id}" style="padding:7px 14px;border:1.5px solid var(--border);background:#fff;color:var(--text-3);border-radius:100px;font-weight:600;font-size:12px;cursor:pointer">Tinjau ulang</button>
         </div>`;
    return `
    <div class="pendaftar-card" style="--card-accent:${st.accent}">
      <div class="card-head">
        <div class="card-avatar">${inisialNama(k.nama)}</div>
        <div class="card-main">
          <div class="card-nama">${k.nama}</div>
          <div class="card-meta">
            <span class="card-meta-item"><iconify-icon icon="solar:hashtag-bold-duotone" width="13"></iconify-icon>${k.nim}</span>
            <span class="card-meta-item"><iconify-icon icon="solar:diploma-bold-duotone" width="13"></iconify-icon>${k.beasiswa}</span>
            <span class="card-meta-item"><iconify-icon icon="solar:buildings-2-bold-duotone" width="13"></iconify-icon>${k.sponsor}</span>
          </div>
        </div>
        <div class="card-right"><span class="status-pill ${st.cls}">${st.label}</span></div>
      </div>
      <div class="card-nilai-wrap">
        <div class="nilai-chip"><span class="nilai-chip-num">${k.tes}</span><span class="nilai-chip-label">Tes</span></div>
        <div class="nilai-chip"><span class="nilai-chip-num">${k.wawancara}</span><span class="nilai-chip-label">Wawancara</span></div>
        <div class="nilai-chip"><span class="nilai-chip-num">${rata}</span><span class="nilai-chip-label">Rata-rata</span></div>
        <div class="nilai-chip ipk"><span class="nilai-chip-num">${k.ipk}</span><span class="nilai-chip-label">IPK</span></div>
      </div>
      ${actions}
    </div>`;
  }).join('');

  wrap.querySelectorAll('[data-acc]').forEach(b => b.addEventListener('click', () => setStatus(b.dataset.acc, 'disahkan')));
  wrap.querySelectorAll('[data-batal]').forEach(b => b.addEventListener('click', () => setStatus(b.dataset.batal, 'dibatalkan')));
  wrap.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', () => setStatus(b.dataset.reset, 'diusulkan')));
}

function setStatus(id, status) {
  const k = kandidat.find(x => x.id === id);
  if (!k) return;
  k.status = status;
  renderStats();
  renderList();
}

document.addEventListener('DOMContentLoaded', () => {
  initUserInfo();
  initBgCanvas();
  initParticles();
  renderStats();
  renderList();
  const search = document.getElementById('searchInput');
  search && search.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#listKandidat .pendaftar-card').forEach((card, i) => {
      const k = kandidat[i];
      const match = !q || k.nama.toLowerCase().includes(q) || k.nim.includes(q) || k.beasiswa.toLowerCase().includes(q);
      card.style.display = match ? '' : 'none';
    });
  });
  console.log('🎓 penetapanPenerima.js (Kabag) loaded');
});
