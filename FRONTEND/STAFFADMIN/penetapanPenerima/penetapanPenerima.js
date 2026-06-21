/* ============================================================
   PENETAPANPENERIMA.JS — Beasiswa Kampus (Staff Admin)
   Folder  : penetapanPenerima/
   ──────────────────────────────────────────────────────────
   TABEL YANG DIGUNAKAN:
     pendaftaran   — id, mahasiswa_id, beasiswa_id, status,
                     tanggal_daftar, catatan_staff, updated_at
     hasil_seleksi — nilai_tes, nilai_wawancara, catatan_staff
     profiles      — nama_lengkap, nim_nip, program_studi, ipk
     beasiswa      — nama_program, kuota_penerima, nominal_dana
   ──────────────────────────────────────────────────────────
   SINKRON DENGAN MAHASISWA:
     pendaftaranSaya.js menggunakan FIELD NAME YANG SAMA:
       pendaftaran.status  → lolos_final | tidak_lolos_final
       hasil_seleksi.nilai_tes, nilai_wawancara, catatan_staff
       timeline entry: { step:'lolos_final', catatan: ... }

   STATUS FLOW (sinkron antara staff & mahasiswa):
     wawancara → [TETAPKAN] → lolos_final
     wawancara → [TIDAK LOLOS] → tidak_lolos_final
     lolos_final → [BATALKAN] → wawancara (reversal)
   ──────────────────────────────────────────────────────────
   SETELAH lolos_final:
     Data masuk ke PencairanDana/pencairanDana.html
     Mahasiswa lihat status di penerimaBeasiswa.html
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

/* ── SESSION ── */
function getSession() {
  const s = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return s ? JSON.parse(s) : null;
}
const session    = getSession();
if (!session || session.role !== 'staff') {
  // window.location.href = '../LOGIN/login.html';
}
const demoSession = session || { nama_lengkap: 'Rangga Adi Nugroho', role: 'staff', id: 'demo-staff-uuid' };

/* ── DUMMY DATA ──
   Struktur JOIN: pendaftaran + profiles + beasiswa + hasil_seleksi
   Hanya tampilkan status 'wawancara' (siap ditetapkan) dan final
   Field name IDENTIK dengan pendaftaranSaya.js mahasiswa
──────────────────────────────────────────────────────── */
let dummyData = [
  {
    id              : 'p-103',
    mahasiswa_id    : 'u-003',
    beasiswa_id     : 'b-002',
    /* pendaftaran.status — sinkron enum mahasiswa */
    status          : 'wawancara',
    tanggal_daftar  : '2026-06-05T15:45:00Z',
    updated_at      : '2026-06-20T10:00:00Z',
    catatan_staff   : null,
    mahasiswa : { nama_lengkap: 'Dimas Surya Atmaja',  nim_nip: '2020130021', program_studi: 'Teknik Elektro',   ipk: 3.91 },
    beasiswa  : { nama_program: 'Pertamina Sobat Bumi',  kuota_penerima: 15, nominal_dana: 7500000, sponsors: { nama_perusahaan: 'Pertamina' } },
    /* hasil_seleksi — field IDENTIK dengan pendaftaranSaya.js */
    hasil_seleksi   : { nilai_tes: 84.5, nilai_wawancara: 88.0, catatan_staff: 'Pemahaman riset sangat mendalam.' },
  },
  {
    id              : 'p-104',
    mahasiswa_id    : 'u-004',
    beasiswa_id     : 'b-003',
    status          : 'wawancara',
    tanggal_daftar  : '2026-06-07T11:20:00Z',
    updated_at      : '2026-06-21T09:00:00Z',
    catatan_staff   : null,
    mahasiswa : { nama_lengkap: 'Elisa Rahayu Putri',   nim_nip: '2022510017', program_studi: 'Sistem Informasi', ipk: 3.88 },
    beasiswa  : { nama_program: 'Telkom Digital Talent', kuota_penerima: 20, nominal_dana: 4500000, sponsors: { nama_perusahaan: 'Telkom Indonesia' } },
    hasil_seleksi   : { nilai_tes: 91.0, nilai_wawancara: 88.5, catatan_staff: 'Presentasi sangat baik, komunikasi lancar.' },
  },
  {
    id              : 'p-106',
    mahasiswa_id    : 'u-006',
    beasiswa_id     : 'b-001',
    status          : 'wawancara',
    tanggal_daftar  : '2026-06-09T14:00:00Z',
    updated_at      : '2026-06-22T14:00:00Z',
    catatan_staff   : null,
    mahasiswa : { nama_lengkap: 'Gita Safira Dewi',     nim_nip: '2023110029', program_studi: 'Teknik Industri',  ipk: 3.78 },
    beasiswa  : { nama_program: 'Beasiswa Mandiri Prestasi', kuota_penerima: 25, nominal_dana: 5000000, sponsors: { nama_perusahaan: 'Bank Mandiri' } },
    hasil_seleksi   : { nilai_tes: 88.0, nilai_wawancara: 85.0, catatan_staff: 'Motivasi tinggi, cocok untuk program ini.' },
  },
  {
    id              : 'p-201',
    mahasiswa_id    : 'u-007',
    beasiswa_id     : 'b-001',
    status          : 'lolos_final',
    tanggal_daftar  : '2026-05-15T08:00:00Z',
    updated_at      : '2026-06-10T10:00:00Z',
    catatan_staff   : 'Selamat! Kamu dinyatakan sebagai penerima beasiswa Mandiri Prestasi.',
    mahasiswa : { nama_lengkap: 'Hana Putri Azzahra',   nim_nip: '2021310088', program_studi: 'Teknik Informatika', ipk: 3.95 },
    beasiswa  : { nama_program: 'Beasiswa Mandiri Prestasi', kuota_penerima: 25, nominal_dana: 5000000, sponsors: { nama_perusahaan: 'Bank Mandiri' } },
    hasil_seleksi   : { nilai_tes: 93.5, nilai_wawancara: 91.0, catatan_staff: 'Terbaik dari semua kandidat yang diwawancarai.' },
  },
  {
    id              : 'p-202',
    mahasiswa_id    : 'u-008',
    beasiswa_id     : 'b-002',
    status          : 'lolos_final',
    tanggal_daftar  : '2026-05-12T09:00:00Z',
    updated_at      : '2026-06-11T10:00:00Z',
    catatan_staff   : 'Selamat! Kamu dinyatakan sebagai penerima beasiswa Pertamina Sobat Bumi.',
    mahasiswa : { nama_lengkap: 'Ivan Rizki Ramadhan',  nim_nip: '2020230045', program_studi: 'Teknik Kimia',      ipk: 3.86 },
    beasiswa  : { nama_program: 'Pertamina Sobat Bumi',  kuota_penerima: 15, nominal_dana: 7500000, sponsors: { nama_perusahaan: 'Pertamina' } },
    hasil_seleksi   : { nilai_tes: 87.0, nilai_wawancara: 90.0, catatan_staff: 'Portofolio riset energi terbarukan sangat kuat.' },
  },
  {
    id              : 'p-203',
    mahasiswa_id    : 'u-009',
    beasiswa_id     : 'b-003',
    status          : 'tidak_lolos_final',
    tanggal_daftar  : '2026-05-18T10:00:00Z',
    updated_at      : '2026-06-12T10:00:00Z',
    catatan_staff   : 'Maaf, nilai wawancara belum memenuhi ambang batas minimum program.',
    mahasiswa : { nama_lengkap: 'Joko Widiatmoko',      nim_nip: '2022410061', program_studi: 'Teknik Sipil',      ipk: 3.55 },
    beasiswa  : { nama_program: 'Telkom Digital Talent', kuota_penerima: 20, nominal_dana: 4500000, sponsors: { nama_perusahaan: 'Telkom Indonesia' } },
    hasil_seleksi   : { nilai_tes: 72.0, nilai_wawancara: 68.5, catatan_staff: 'Perlu meningkatkan kemampuan komunikasi teknis.' },
  },
];

/* ── STATE ── */
let activeTab   = 'siap';
let filterBs    = 'all';
let sortBy      = 'nilai_desc';
let searchQ     = '';
let pendingAksi = null; /* { id, aksi: 'tetapkan'|'tolak'|'batal' } */
let detailId    = null;

/* ── UTILS ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function inisial(nama)  { return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function formatTgl(str) { return new Date(str).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }
function formatRp(n)    { return 'Rp ' + (n/1000000).toLocaleString('id-ID') + ' jt'; }
function delay(ms)      { return new Promise(r => setTimeout(r, ms)); }

function nilaiRata(hs) {
  if (!hs) return null;
  const { nilai_tes: t, nilai_wawancara: w } = hs;
  if (t !== null && w !== null) return ((t + w) / 2).toFixed(1);
  if (t !== null) return t.toFixed(1);
  return null;
}

function rataClass(r) {
  if (r === null) return '';
  const n = parseFloat(r);
  if (n >= 85) return 'excellent';
  if (n >= 70) return 'good';
  return 'avg';
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
  setEl('sidebarName',   nama);
  setEl('sidebarAvatar', nama.charAt(0).toUpperCase());
  setEl('topbarAvatar',  nama.charAt(0).toUpperCase());
}

/* ── STATS ── */
function loadStats() {
  const siap       = dummyData.filter(d => d.status === 'wawancara').length;
  const lolos      = dummyData.filter(d => d.status === 'lolos_final').length;
  const tidakLolos = dummyData.filter(d => d.status === 'tidak_lolos_final').length;
  const totalDana  = dummyData.filter(d => d.status === 'lolos_final')
                               .reduce((s, d) => s + (d.beasiswa?.nominal_dana || 0), 0);

  animateNum('statSiap',       siap);
  animateNum('statLolos',      lolos);
  animateNum('statTidakLolos', tidakLolos);
  setEl('statTotalDana', formatRp(totalDana));

  setEl('bannerSiap',       siap);
  setEl('bannerDitetapkan', lolos);

  /* Tab counts */
  const all = dummyData.length;
  setEl('tcSiap',        siap);
  setEl('tcLolos',       lolos);
  setEl('tcTidakLolos',  tidakLolos);
  setEl('tcAll',         all);
}

/* ── POPULATE FILTER ── */
function populateFilter() {
  const sel = document.getElementById('filterBeasiswa');
  if (!sel) return;
  const uniq = [...new Map(dummyData.map(d => [d.beasiswa_id, d.beasiswa?.nama_program])).entries()];
  sel.innerHTML = '<option value="all">Semua Beasiswa</option>';
  uniq.forEach(([id, nama]) => { sel.innerHTML += `<option value="${id}">${nama}</option>`; });
  sel.addEventListener('change', () => { filterBs = sel.value; renderList(); });

  const sortSel = document.getElementById('sortSelect');
  sortSel?.addEventListener('change', () => { sortBy = sortSel.value; renderList(); });
}

/* ── RENDER LIST ── */
function renderList() {
  const listEl  = document.getElementById('penerimaList');
  const emptyEl = document.getElementById('emptyState');

  let data = [...dummyData];

  /* Tab filter */
  if (activeTab === 'siap')              data = data.filter(d => d.status === 'wawancara');
  else if (activeTab === 'lolos_final')  data = data.filter(d => d.status === 'lolos_final');
  else if (activeTab === 'tidak_lolos_final') data = data.filter(d => d.status === 'tidak_lolos_final');

  if (filterBs !== 'all') data = data.filter(d => d.beasiswa_id === filterBs);

  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(d =>
      d.mahasiswa?.nama_lengkap?.toLowerCase().includes(q) ||
      d.beasiswa?.nama_program?.toLowerCase().includes(q) ||
      d.mahasiswa?.nim_nip?.includes(q)
    );
  }

  /* Sort */
  data.sort((a, b) => {
    const rA = parseFloat(nilaiRata(a.hasil_seleksi)) || 0;
    const rB = parseFloat(nilaiRata(b.hasil_seleksi)) || 0;
    if (sortBy === 'nilai_desc') return rB - rA;
    if (sortBy === 'nilai_asc')  return rA - rB;
    return (a.mahasiswa?.nama_lengkap || '').localeCompare(b.mahasiswa?.nama_lengkap || '');
  });

  setEl('panelCount', data.length + ' peserta');

  if (!data.length) { listEl.innerHTML = ''; emptyEl.style.display = 'flex'; return; }
  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const hs   = d.hasil_seleksi;
    const rata = nilaiRata(hs);
    const rc   = rataClass(rata);

    /* Rank badge hanya untuk tab siap */
    const rankNum  = i + 1;
    const rankCls  = rankNum === 1 ? 'rank-1' : rankNum === 2 ? 'rank-2' : rankNum === 3 ? 'rank-3' : 'rank-n';
    const showRank = activeTab === 'siap' && sortBy === 'nilai_desc';

    /* Warna accent border */
    const accentMap = { wawancara:'#7c3aed', lolos_final:'#059669', tidak_lolos_final:'#be123c' };
    const accent    = accentMap[d.status] || '#2563eb';

    /* Status pill */
    const statusMap = {
      wawancara         : { label: 'Siap Ditetapkan', cls: 'status-siap' },
      lolos_final       : { label: 'Lolos Final',     cls: 'status-lolos-final' },
      tidak_lolos_final : { label: 'Tidak Lolos',     cls: 'status-tidak-lolos' },
    };
    const sc = statusMap[d.status] || statusMap.wawancara;

    /* Action buttons */
    let actionsHTML = '';
    if (d.status === 'wawancara') {
      actionsHTML = `
        <button class="btn-detail-sm" onclick="openDetail('${d.id}')">
          <iconify-icon icon="solar:eye-bold-duotone" width="12"></iconify-icon> Detail
        </button>
        <button class="btn-tetapkan" onclick="triggerAksi('${d.id}','tetapkan')">
          <iconify-icon icon="solar:cup-star-bold-duotone" width="12"></iconify-icon> Tetapkan
        </button>
        <button class="btn-tolak" onclick="triggerAksi('${d.id}','tolak')">
          <iconify-icon icon="solar:close-circle-bold-duotone" width="12"></iconify-icon> Tidak Lolos
        </button>
      `;
    } else if (d.status === 'lolos_final') {
      actionsHTML = `
        <button class="btn-detail-sm" onclick="openDetail('${d.id}')">
          <iconify-icon icon="solar:eye-bold-duotone" width="12"></iconify-icon> Detail
        </button>
        <button class="btn-batal-sm" onclick="triggerAksi('${d.id}','batal')">
          <iconify-icon icon="solar:restart-bold-duotone" width="12"></iconify-icon> Batalkan
        </button>
      `;
    } else {
      actionsHTML = `
        <button class="btn-detail-sm" onclick="openDetail('${d.id}')">
          <iconify-icon icon="solar:eye-bold-duotone" width="12"></iconify-icon> Detail
        </button>
      `;
    }

    return `
      <div class="penerima-card" style="--card-accent:${accent};animation-delay:${i * 0.06}s">

        ${showRank
          ? `<div class="rank-badge ${rankCls}">${rankNum <= 3 ? ['🥇','🥈','🥉'][rankNum-1] : rankNum}</div>`
          : ''
        }

        <div class="card-avatar">${inisial(d.mahasiswa?.nama_lengkap || '?')}</div>

        <div class="card-main">
          <div class="card-nama">${d.mahasiswa?.nama_lengkap || '—'}</div>
          <div class="card-sub">
            NIM: ${d.mahasiswa?.nim_nip || '—'}
            &nbsp;·&nbsp; IPK ${d.mahasiswa?.ipk?.toFixed(2) || '—'}
            &nbsp;·&nbsp; ${d.mahasiswa?.program_studi || '—'}
          </div>
          <div class="card-tags">
            <span class="status-pill ${sc.cls}">${sc.label}</span>
            <span class="card-tag">
              <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
              Daftar ${formatTgl(d.tanggal_daftar)}
            </span>
            <span class="card-tag">
              <iconify-icon icon="solar:users-group-two-rounded-bold-duotone" width="10"></iconify-icon>
              Kuota: ${d.beasiswa?.kuota_penerima}
            </span>
          </div>
        </div>

        <div class="card-right">
          <div class="card-beasiswa">${d.beasiswa?.nama_program || '—'}</div>
          <div class="nilai-rata-wrap">
            <span class="nilai-rata-label">Rata-rata Nilai</span>
            <span class="nilai-rata-num ${rc}">
              ${rata !== null ? rata : '—'}
            </span>
          </div>
          <div class="nilai-detail-row">
            <span class="nilai-mini">
              Tes: <span>${hs?.nilai_tes ?? '—'}</span>
            </span>
            <span class="nilai-mini">
              Wawancara: <span>${hs?.nilai_wawancara ?? '—'}</span>
            </span>
          </div>
          <div class="card-actions">${actionsHTML}</div>
        </div>

      </div>
    `;
  }).join('');
}

/* ── MODAL KONFIRMASI ── */
const modalKonfirmasi = document.getElementById('modalKonfirmasi');

function triggerAksi(id, aksi) {
  pendingAksi = { id, aksi };
  const d     = dummyData.find(x => x.id === id);
  const nama  = d?.mahasiswa?.nama_lengkap || '—';

  const iconEl  = document.getElementById('konfirmasiIcon');
  const titleEl = document.getElementById('konfirmasiTitle');
  const descEl  = document.getElementById('konfirmasiDesc');
  const btnEl   = document.getElementById('confirmPenetapan');
  const textEl  = document.getElementById('catatanPenetapan');

  if (textEl) textEl.value = '';

  if (aksi === 'tetapkan') {
    iconEl.innerHTML  = `<iconify-icon icon="solar:cup-star-bold-duotone" width="52" style="color:#059669"></iconify-icon>`;
    titleEl.textContent = 'Tetapkan Sebagai Penerima?';
    descEl.textContent  = `${nama} akan ditetapkan sebagai penerima resmi dan dapat melanjutkan ke tahap pencairan dana.`;
    btnEl.style.setProperty('--konfirmasi-bg', '#059669');
    btnEl.textContent   = 'Ya, Tetapkan';
  } else if (aksi === 'tolak') {
    iconEl.innerHTML  = `<iconify-icon icon="solar:close-circle-bold-duotone" width="52" style="color:#be123c"></iconify-icon>`;
    titleEl.textContent = 'Nyatakan Tidak Lolos?';
    descEl.textContent  = `${nama} akan mendapat notifikasi bahwa tidak lolos seleksi final beasiswa ini.`;
    btnEl.style.setProperty('--konfirmasi-bg', '#be123c');
    btnEl.textContent   = 'Ya, Tidak Lolos';
  } else {
    iconEl.innerHTML  = `<iconify-icon icon="solar:restart-bold-duotone" width="52" style="color:#d97706"></iconify-icon>`;
    titleEl.textContent = 'Batalkan Penetapan?';
    descEl.textContent  = `${nama} akan dikembalikan ke status Wawancara. Pastikan ada alasan yang valid.`;
    btnEl.style.setProperty('--konfirmasi-bg', '#d97706');
    btnEl.textContent   = 'Ya, Batalkan';
  }

  modalKonfirmasi?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeKonfirmasi() {
  modalKonfirmasi?.classList.remove('active');
  document.body.style.overflow = '';
  pendingAksi = null;
}

document.getElementById('cancelKonfirmasi')?.addEventListener('click',         closeKonfirmasi);
document.getElementById('modalKonfirmasiOverlay')?.addEventListener('click',  closeKonfirmasi);

document.getElementById('confirmPenetapan')?.addEventListener('click', async () => {
  if (!pendingAksi) return;
  const { id, aksi } = pendingAksi;
  const catatan = document.getElementById('catatanPenetapan')?.value.trim() || null;

  const idx = dummyData.findIndex(d => d.id === id);
  if (idx === -1) { closeKonfirmasi(); return; }

  /* UPDATE status & catatan — field sinkron dengan pendaftaranSaya.js mahasiswa */
  if (aksi === 'tetapkan') {
    dummyData[idx].status        = 'lolos_final';
    dummyData[idx].catatan_staff = catatan || 'Selamat! Kamu dinyatakan sebagai penerima beasiswa.';
    dummyData[idx].updated_at    = new Date().toISOString();
  } else if (aksi === 'tolak') {
    dummyData[idx].status        = 'tidak_lolos_final';
    dummyData[idx].catatan_staff = catatan || 'Maaf, kamu belum berhasil lolos seleksi final kali ini.';
    dummyData[idx].updated_at    = new Date().toISOString();
  } else {
    dummyData[idx].status        = 'wawancara';
    dummyData[idx].catatan_staff = catatan;
    dummyData[idx].updated_at    = new Date().toISOString();
  }

  closeKonfirmasi();
  loadStats();
  renderList();
});

/* ── MODAL DETAIL ── */
const modalDetail = document.getElementById('modalDetail');

function openDetail(id) {
  detailId    = id;
  const d     = dummyData.find(x => x.id === id);
  if (!d) return;
  const hs    = d.hasil_seleksi;
  const rata  = nilaiRata(hs);
  const rc    = rataClass(rata);

  const statusMap = {
    wawancara         : { label: 'Siap Ditetapkan', cls: 'status-siap' },
    lolos_final       : { label: 'Lolos Final',     cls: 'status-lolos-final' },
    tidak_lolos_final : { label: 'Tidak Lolos',     cls: 'status-tidak-lolos' },
  };
  const sc = statusMap[d.status] || statusMap.wawancara;

  const detailActionsHTML = d.status === 'wawancara' ? `
    <button class="btn-tetapkan" style="flex:1" onclick="closeDetail(); triggerAksi('${d.id}','tetapkan')">
      <iconify-icon icon="solar:cup-star-bold-duotone" width="14"></iconify-icon> Tetapkan
    </button>
    <button class="btn-tolak" style="flex:1" onclick="closeDetail(); triggerAksi('${d.id}','tolak')">
      <iconify-icon icon="solar:close-circle-bold-duotone" width="14"></iconify-icon> Tidak Lolos
    </button>
  ` : d.status === 'lolos_final' ? `
    <button class="btn-batal-sm" style="flex:1" onclick="closeDetail(); triggerAksi('${d.id}','batal')">
      <iconify-icon icon="solar:restart-bold-duotone" width="14"></iconify-icon> Batalkan Penetapan
    </button>
  ` : '';

  document.getElementById('modalDetailContent').innerHTML = `
    <div class="detail-head">
      <div class="detail-avatar">${inisial(d.mahasiswa?.nama_lengkap || '?')}</div>
      <div>
        <div class="detail-nama">${d.mahasiswa?.nama_lengkap || '—'}</div>
        <div class="detail-meta-row">
          <span>NIM: ${d.mahasiswa?.nim_nip || '—'}</span>
          <span>IPK: ${d.mahasiswa?.ipk?.toFixed(2) || '—'}</span>
          <span>${d.mahasiswa?.program_studi || '—'}</span>
          <span class="status-pill ${sc.cls}">${sc.label}</span>
        </div>
      </div>
    </div>

    <!-- Nilai rata-rata besar -->
    <div class="rata-rata-box">
      <div class="rata-rata-label">Nilai Rata-rata</div>
      <div class="rata-rata-val">${rata !== null ? rata : '—'}</div>
      <div class="rata-rata-kuota">
        Kuota: ${d.beasiswa?.kuota_penerima} penerima
        &nbsp;·&nbsp;
        ${formatRp(d.beasiswa?.nominal_dana || 0)}/bulan
      </div>
    </div>

    <!-- Nilai detail -->
    <div class="nilai-box">
      <div class="nilai-item">
        <div class="nilai-item-label">Nilai Tes</div>
        <div class="nilai-item-val ${rataClass(hs?.nilai_tes)}">${hs?.nilai_tes ?? '—'}</div>
      </div>
      <div class="nilai-item">
        <div class="nilai-item-label">Nilai Wawancara</div>
        <div class="nilai-item-val ${rataClass(hs?.nilai_wawancara)}">${hs?.nilai_wawancara ?? '—'}</div>
      </div>
    </div>

    <!-- Info pendaftaran -->
    <div class="detail-section-title">Informasi Pendaftaran</div>
    <div class="info-row"><span class="info-label">Program Beasiswa</span><span class="info-val">${d.beasiswa?.nama_program || '—'}</span></div>
    <div class="info-row"><span class="info-label">Sponsor</span><span class="info-val">${d.beasiswa?.sponsors?.nama_perusahaan || '—'}</span></div>
    <div class="info-row"><span class="info-label">Tanggal Daftar</span><span class="info-val">${formatTgl(d.tanggal_daftar)}</span></div>
    <div class="info-row"><span class="info-label">Terakhir Update</span><span class="info-val">${formatTgl(d.updated_at)}</span></div>

    <!-- Catatan staff -->
    ${hs?.catatan_staff ? `
      <div class="detail-section-title">Catatan Evaluasi</div>
      <div style="background:var(--bg);border-radius:var(--radius-sm);padding:12px;font-size:13px;color:var(--text-2);line-height:1.6;border-left:3px solid var(--blue-400)">
        ${hs.catatan_staff}
      </div>
    ` : ''}

    ${d.catatan_staff ? `
      <div class="detail-section-title">Catatan Penetapan</div>
      <div style="background:var(--mint-soft);border-radius:var(--radius-sm);padding:12px;font-size:13px;color:#047857;line-height:1.6">
        ${d.catatan_staff}
      </div>
    ` : ''}

    <!-- Actions -->
    <div class="detail-actions">${detailActionsHTML}</div>
  `;

  modalDetail?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  modalDetail?.classList.remove('active');
  document.body.style.overflow = '';
  detailId = null;
}

document.getElementById('modalDetailClose')?.addEventListener('click',   closeDetail);
document.getElementById('modalDetailOverlay')?.addEventListener('click', closeDetail);

/* ── TAB INIT ── */
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderList();
    });
  });
}

/* ── SEARCH ── */
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => { searchQ = input.value.trim(); renderList(); });
}

/* ── SIDEBAR MOBILE ── */
const sidebar = document.getElementById('sidebar');
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

/* ── KEYBOARD ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeKonfirmasi(); closeDetail();
    logoutModal?.classList.remove('active');
    closeSidebar();
    document.body.style.overflow = '';
  }
});

/* ── BG CANVAS ── */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const orbs = Array.from({length:5},()=>({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:100+Math.random()*160,dx:(Math.random()-.5)*.3,dy:(Math.random()-.5)*.3,hue:210+Math.random()*30,alpha:.04+Math.random()*.04}));
  function draw() {
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
    ['solar:cup-star-bold-duotone',        'rgba(251,191,36,.22)'],
    ['solar:star-bold-duotone',            'rgba(251,191,36,.20)'],
    ['solar:diploma-bold-duotone',         'rgba(5,150,105,.18)'],
    ['solar:check-circle-bold-duotone',    'rgba(5,150,105,.18)'],
    ['solar:trophy-bold-duotone',          'rgba(251,191,36,.18)'],
    ['solar:document-add-bold-duotone',    'rgba(37,99,235,.16)'],
    ['solar:users-group-rounded-bold-duotone','rgba(37,99,235,.16)'],
  ];
  for (let i=0;i<18;i++) {
    const [icon,color] = icons[i % icons.length];
    const p = document.createElement('iconify-icon');
    p.setAttribute('icon', icon);
    p.className = 'particle';
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
  populateFilter();
  initTabs();
  initSearch();
  renderList();
  console.log('🏆 penetapanPenerima.js loaded | Staff:', demoSession?.nama_lengkap);
});