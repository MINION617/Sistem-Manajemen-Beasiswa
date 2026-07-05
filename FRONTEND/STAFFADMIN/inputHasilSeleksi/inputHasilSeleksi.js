/* ============================================================
   INPUTHASILSELEKSI.JS — Beasiswa Kampus (Staff Admin)
   Folder  : inputHasilSeleksi/
   ──────────────────────────────────────────────────────────
   TABEL YANG DIGUNAKAN:
     pendaftaran      — id, mahasiswa_id, beasiswa_id, status
     hasil_seleksi    — pendaftaran_id, nilai_tes, nilai_wawancara,
                        catatan_staff, jadwal_wawancara
     profiles         — nama_lengkap, nim_nip, program_studi
     beasiswa         — nama_program, nominal_dana
   ──────────────────────────────────────────────────────────
   SINKRON DENGAN MAHASISWA:
     pendaftaranSaya.js → hasil_seleksi { nilai_tes, nilai_wawancara,
                          catatan_staff } tampil di modal detail
     pendaftaran.status enum SAMA:
       lolos_berkas | wawancara | lolos_final | tidak_lolos_final
   ──────────────────────────────────────────────────────────
   ALUR NILAI:
     Staff input nilai_tes  → otomatis update status → 'wawancara'
     Staff input nilai_wawancara → status tetap 'wawancara'
     Lanjut ke penetapanPenerima untuk ubah → 'lolos_final'
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

/* ── DUMMY DATA ──
   Struktur: pendaftaran JOIN profiles JOIN beasiswa JOIN hasil_seleksi
   Field name sinkron dengan pendaftaranSaya.js mahasiswa
──────────────────────────────────────────────────────── */
let dummyData = [
  {
    id             : 'p-101',
    mahasiswa_id   : 'u-001',
    beasiswa_id    : 'b-001',
    /* pendaftaran.status — sinkron enum mahasiswa */
    status         : 'lolos_berkas',
    tanggal_daftar : '2026-06-10T07:30:00Z',
    /* JOIN profiles */
    mahasiswa: { nama_lengkap: 'Adinda Putri Lestari', nim_nip: '2022310011', program_studi: 'Teknik Informatika', ipk: 3.82 },
    /* JOIN beasiswa */
    beasiswa : { nama_program: 'Beasiswa Mandiri Prestasi', nominal_dana: 5000000, sponsors: { nama_perusahaan: 'Bank Mandiri' } },
    /* JOIN hasil_seleksi — field name IDENTIK dengan pendaftaranSaya.js */
    hasil_seleksi  : { nilai_tes: null, nilai_wawancara: null, catatan_staff: null },
  },
  {
    id             : 'p-102',
    mahasiswa_id   : 'u-002',
    beasiswa_id    : 'b-004',
    status         : 'lolos_berkas',
    tanggal_daftar : '2026-06-10T06:10:00Z',
    mahasiswa: { nama_lengkap: 'Cahaya Nur Aisyah', nim_nip: '2021220032', program_studi: 'Akuntansi', ipk: 3.75 },
    beasiswa : { nama_program: 'Beasiswa Djarum Plus', nominal_dana: 6000000, sponsors: { nama_perusahaan: 'Djarum Foundation' } },
    hasil_seleksi  : { nilai_tes: null, nilai_wawancara: null, catatan_staff: null },
  },
  {
    id             : 'p-103',
    mahasiswa_id   : 'u-003',
    beasiswa_id    : 'b-002',
    status         : 'wawancara',
    tanggal_daftar : '2026-06-05T15:45:00Z',
    mahasiswa: { nama_lengkap: 'Dimas Surya Atmaja', nim_nip: '2020130021', program_studi: 'Teknik Elektro', ipk: 3.91 },
    beasiswa : { nama_program: 'Pertamina Sobat Bumi', nominal_dana: 7500000, sponsors: { nama_perusahaan: 'Pertamina' } },
    /* Nilai tes sudah ada, wawancara belum */
    hasil_seleksi  : { nilai_tes: 84.5, nilai_wawancara: null, catatan_staff: null },
  },
  {
    id             : 'p-104',
    mahasiswa_id   : 'u-004',
    beasiswa_id    : 'b-003',
    status         : 'wawancara',
    tanggal_daftar : '2026-06-07T11:20:00Z',
    mahasiswa: { nama_lengkap: 'Elisa Rahayu Putri', nim_nip: '2022510017', program_studi: 'Sistem Informasi', ipk: 3.88 },
    beasiswa : { nama_program: 'Telkom Digital Talent', nominal_dana: 4500000, sponsors: { nama_perusahaan: 'Telkom Indonesia' } },
    hasil_seleksi  : { nilai_tes: 91.0, nilai_wawancara: 88.5, catatan_staff: 'Presentasi sangat baik, komunikasi lancar.' },
  },
  {
    id             : 'p-105',
    mahasiswa_id   : 'u-005',
    beasiswa_id    : 'b-004',
    status         : 'wawancara',
    tanggal_daftar : '2026-06-08T09:00:00Z',
    mahasiswa: { nama_lengkap: 'Fadhlan Rizki Maulana', nim_nip: '2021410043', program_studi: 'Manajemen', ipk: 3.65 },
    beasiswa : { nama_program: 'Beasiswa Djarum Plus', nominal_dana: 6000000, sponsors: { nama_perusahaan: 'Djarum Foundation' } },
    hasil_seleksi  : { nilai_tes: 76.0, nilai_wawancara: null, catatan_staff: null },
  },
  {
    id             : 'p-106',
    mahasiswa_id   : 'u-006',
    beasiswa_id    : 'b-001',
    status         : 'wawancara',
    tanggal_daftar : '2026-06-09T14:00:00Z',
    mahasiswa: { nama_lengkap: 'Gita Safira Dewi', nim_nip: '2023110029', program_studi: 'Teknik Industri', ipk: 3.78 },
    beasiswa : { nama_program: 'Beasiswa Mandiri Prestasi', nominal_dana: 5000000, sponsors: { nama_perusahaan: 'Bank Mandiri' } },
    hasil_seleksi  : { nilai_tes: 88.0, nilai_wawancara: 85.0, catatan_staff: 'Motivasi tinggi, cocok untuk program ini.' },
  },
];

/* ── LOAD DATA ── */
async function loadAntrean() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/seleksi/antrean');
      dummyData = data.map(mapSeleksiRow);
    } catch (err) {
      console.warn('Gagal memuat antrean seleksi, pakai data contoh:', err);
    }
  }
  loadStats();
  populateFilterBeasiswa();
  renderList();
}

/* ── STATUS CONFIG (sinkron enum mahasiswa) ── */
const STATUS_CFG = {
  lolos_berkas : { label: 'Lolos Berkas', cls: 'status-lolos-berkas', accent: '#2563eb', icon: 'solar:check-circle-bold-duotone' },
  wawancara    : { label: 'Wawancara',    cls: 'status-wawancara',    accent: '#7c3aed', icon: 'solar:microphone-bold-duotone' },
  lolos_final  : { label: 'Lolos Final',  cls: 'status-lolos-final',  accent: '#059669', icon: 'solar:cup-star-bold-duotone' },
};

/* ── STATE ── */
let activeTab    = 'lolos_berkas';
let filterBs     = 'all';
let searchQ      = '';
let editingId    = null;

/* ── UTILS ── */
function setEl(id, val)  { const e = document.getElementById(id); if (e) e.textContent = val; }
function inisial(nama)   { return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function formatTgl(str)  { return new Date(str).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }
function formatRp(n)     { return 'Rp ' + (n/1000000).toLocaleString('id-ID') + ' jt'; }
function delay(ms)       { return new Promise(r => setTimeout(r, ms)); }

function nilaiClass(n) {
  if (n === null || n === undefined) return '';
  if (n >= 80) return 'hijau';
  if (n >= 60) return 'kuning';
  return 'merah';
}

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 22));
  const t = setInterval(() => {
    cur += step;
    if (cur >= target) { el.textContent = target; clearInterval(t); }
    else el.textContent = cur;
  }, 35);
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
  const active      = dummyData.filter(d => ['lolos_berkas','wawancara'].includes(d.status));
  const belumTes    = active.filter(d => !d.hasil_seleksi?.nilai_tes).length;
  const belumWaw    = dummyData.filter(d => d.status === 'wawancara' && !d.hasil_seleksi?.nilai_wawancara).length;
  const lengkap     = dummyData.filter(d => d.status === 'wawancara' && d.hasil_seleksi?.nilai_tes && d.hasil_seleksi?.nilai_wawancara).length;
  const total       = active.length;

  animateNum('statBelumTes',       belumTes);
  animateNum('statBelumWawancara', belumWaw);
  animateNum('statLengkap',        lengkap);
  animateNum('statTotal',          total);
  setEl('bannerCount', belumTes + belumWaw);

  /* Tab counts */
  const tTes  = dummyData.filter(d => d.status === 'lolos_berkas').length;
  const tWaw  = dummyData.filter(d => d.status === 'wawancara').length;
  const tAll  = dummyData.filter(d => ['lolos_berkas','wawancara'].includes(d.status)).length;
  setEl('tcTes',       tTes);
  setEl('tcWawancara', tWaw);
  setEl('tcSemua',     tAll);
}

/* ── POPULATE FILTER BEASISWA ── */
function populateFilterBeasiswa() {
  const sel = document.getElementById('filterBeasiswa');
  if (!sel) return;
  const uniq = [...new Map(dummyData.map(d => [d.beasiswa_id, d.beasiswa?.nama_program])).entries()];
  sel.innerHTML = '<option value="all">Semua Beasiswa</option>';
  uniq.forEach(([id, nama]) => {
    sel.innerHTML += `<option value="${id}">${nama}</option>`;
  });
  sel.addEventListener('change', () => { filterBs = sel.value; renderList(); });
}

/* ── RENDER LIST ── */
function renderList() {
  const listEl  = document.getElementById('pesertaList');
  const emptyEl = document.getElementById('emptyState');

  let data = [...dummyData];

  /* Filter tab */
  if (activeTab === 'lolos_berkas') {
    data = data.filter(d => d.status === 'lolos_berkas');
  } else if (activeTab === 'wawancara') {
    data = data.filter(d => d.status === 'wawancara');
  } else {
    data = data.filter(d => ['lolos_berkas','wawancara'].includes(d.status));
  }

  /* Filter beasiswa */
  if (filterBs !== 'all') data = data.filter(d => d.beasiswa_id === filterBs);

  /* Pencarian */
  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(d =>
      d.mahasiswa?.nama_lengkap?.toLowerCase().includes(q) ||
      d.beasiswa?.nama_program?.toLowerCase().includes(q) ||
      d.mahasiswa?.nim_nip?.includes(q)
    );
  }

  setEl('panelCount', data.length + ' peserta');

  if (!data.length) {
    listEl.innerHTML      = '';
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const cfg = STATUS_CFG[d.status] || STATUS_CFG.lolos_berkas;
    const hs  = d.hasil_seleksi;

    const nilaiTes  = hs?.nilai_tes  ?? null;
    const nilaiWaw  = hs?.nilai_wawancara ?? null;

    /* Label tombol sesuai tahap */
    let btnLabel = 'Input Nilai Tes';
    if (d.status === 'wawancara' && nilaiWaw === null) btnLabel = 'Input Nilai Wawancara';
    if (d.status === 'wawancara' && nilaiWaw !== null) btnLabel = 'Edit Nilai';

    return `
      <div class="peserta-card" style="--card-accent:${cfg.accent};animation-delay:${i * 0.06}s">
        <div class="card-avatar">${inisial(d.mahasiswa?.nama_lengkap || '?')}</div>

        <div class="card-main">
          <div class="card-nama">${d.mahasiswa?.nama_lengkap || '—'}</div>
          <div class="card-sub">
            NIM: ${d.mahasiswa?.nim_nip || '—'}
            &nbsp;·&nbsp; IPK: ${d.mahasiswa?.ipk?.toFixed(2) || '—'}
            &nbsp;·&nbsp; ${d.mahasiswa?.program_studi || '—'}
          </div>
          <div class="card-tags">
            <span class="card-tag">
              <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
              ${cfg.label}
            </span>
            <span class="card-tag">
              <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
              Daftar ${formatTgl(d.tanggal_daftar)}
            </span>
          </div>
        </div>

        <div class="card-right">
          <div class="card-beasiswa">${d.beasiswa?.nama_program || '—'}</div>
          <div class="card-nilai-grid">
            <div class="nilai-chip ${nilaiTes !== null ? 'ada' : ''}">
              <span class="nilai-chip-label">Nilai Tes</span>
              <span class="nilai-chip-val ${nilaiTes === null ? 'kosong' : ''}">
                ${nilaiTes !== null ? nilaiTes : 'Belum'}
              </span>
            </div>
            <div class="nilai-chip ${nilaiWaw !== null ? 'ada' : ''}">
              <span class="nilai-chip-label">Wawancara</span>
              <span class="nilai-chip-val ${nilaiWaw === null ? 'kosong' : ''}">
                ${nilaiWaw !== null ? nilaiWaw : 'Belum'}
              </span>
            </div>
          </div>
          <button class="btn-input" onclick="openInputNilai('${d.id}')">
            <iconify-icon icon="solar:pen-bold-duotone" width="13"></iconify-icon>
            ${btnLabel}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/* ── MODAL INPUT NILAI ── */
const modalInput = document.getElementById('modalInput');

function openInputNilai(id) {
  editingId = id;
  const d  = dummyData.find(x => x.id === id);
  if (!d) return;
  const hs = d.hasil_seleksi;

  setEl('modalInputTitle', `Input Nilai — ${d.mahasiswa?.nama_lengkap}`);

  /* Peserta info block */
  document.getElementById('modalInputContent').innerHTML = `
    <div class="modal-peserta-info">
      <div class="mpi-avatar">${inisial(d.mahasiswa?.nama_lengkap || '?')}</div>
      <div>
        <div class="mpi-nama">${d.mahasiswa?.nama_lengkap}</div>
        <div class="mpi-sub">
          NIM: ${d.mahasiswa?.nim_nip}
          &nbsp;·&nbsp;
          ${d.beasiswa?.nama_program}
          &nbsp;·&nbsp;
          <span class="status-pill ${STATUS_CFG[d.status]?.cls || ''}">${STATUS_CFG[d.status]?.label || d.status}</span>
        </div>
      </div>
    </div>
  `;

  /* Pre-fill form */
  document.getElementById('fNilaiTes').value        = hs?.nilai_tes       ?? '';
  document.getElementById('fNilaiWawancara').value  = hs?.nilai_wawancara ?? '';
  document.getElementById('fCatatanStaff').value    = hs?.catatan_staff   ?? '';
  document.getElementById('fKerjaKeras').value      = hs?.nilai_kerja_keras      ?? '';
  document.getElementById('fKepemimpinan').value    = hs?.nilai_kepemimpinan     ?? '';
  document.getElementById('fKomunikasi').value      = hs?.nilai_komunikasi       ?? '';
  document.getElementById('fKeberanian').value      = hs?.nilai_keberanian       ?? '';
  document.getElementById('fSkorPrestasi').value    = hs?.skor_prestasi_akademik ?? '';

  updateNilaiBadge('fNilaiTes',       'badgeNilaiTes');
  updateNilaiBadge('fNilaiWawancara', 'badgeNilaiWawancara');

  clearFormMsg('formNilaiMsg');
  modalInput?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeInputNilai() {
  modalInput?.classList.remove('active');
  document.body.style.overflow = '';
  editingId = null;
}

/* Live badge update saat mengetik nilai */
function updateNilaiBadge(inputId, badgeId) {
  const input = document.getElementById(inputId);
  const badge = document.getElementById(badgeId);
  if (!input || !badge) return;
  const val = parseFloat(input.value);
  if (isNaN(val) || input.value === '') {
    badge.textContent  = '—';
    badge.className    = 'nilai-badge';
    return;
  }
  badge.textContent = val.toFixed(1);
  badge.className   = 'nilai-badge ' + nilaiClass(val);
}

document.getElementById('fNilaiTes')?.addEventListener('input',        () => updateNilaiBadge('fNilaiTes',       'badgeNilaiTes'));
document.getElementById('fNilaiWawancara')?.addEventListener('input',  () => updateNilaiBadge('fNilaiWawancara', 'badgeNilaiWawancara'));

/* Form submit */
document.getElementById('formNilai')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nilaiTes       = document.getElementById('fNilaiTes').value;
  const nilaiWaw       = document.getElementById('fNilaiWawancara').value;
  const catatan        = document.getElementById('fCatatanStaff').value.trim();
  const kerjaKeras     = document.getElementById('fKerjaKeras').value;
  const kepemimpinan   = document.getElementById('fKepemimpinan').value;
  const komunikasi     = document.getElementById('fKomunikasi').value;
  const keberanian     = document.getElementById('fKeberanian').value;
  const skorPrestasi   = document.getElementById('fSkorPrestasi').value;

  /* Validasi minimal satu nilai diisi */
  if (!nilaiTes && !nilaiWaw) {
    showFormMsg('formNilaiMsg', 'error', '⚠ Isi minimal salah satu nilai (Tes atau Wawancara).');
    return;
  }

  if (nilaiTes && (parseFloat(nilaiTes) < 0 || parseFloat(nilaiTes) > 100)) {
    showFormMsg('formNilaiMsg', 'error', '⚠ Nilai Tes harus antara 0 – 100.');
    return;
  }

  if (nilaiWaw && (parseFloat(nilaiWaw) < 0 || parseFloat(nilaiWaw) > 100)) {
    showFormMsg('formNilaiMsg', 'error', '⚠ Nilai Wawancara harus antara 0 – 100.');
    return;
  }

  setLoading('btnSimpanNilai', 'loaderNilai', true);

  const payload = {
    ...(nilaiTes      && { nilai_tes: parseFloat(nilaiTes) }),
    ...(nilaiWaw      && { nilai_wawancara: parseFloat(nilaiWaw) }),
    ...(catatan       && { catatan_staff: catatan }),
    ...(kerjaKeras    && { nilai_kerja_keras: parseFloat(kerjaKeras) }),
    ...(kepemimpinan  && { nilai_kepemimpinan: parseFloat(kepemimpinan) }),
    ...(komunikasi    && { nilai_komunikasi: parseFloat(komunikasi) }),
    ...(keberanian    && { nilai_keberanian: parseFloat(keberanian) }),
    ...(skorPrestasi  && { skor_prestasi_akademik: parseFloat(skorPrestasi) }),
  };

  if (isRealSession) {
    try {
      await api.post('/seleksi/' + editingId, payload);
      showFormMsg('formNilaiMsg', 'success', '✓ Nilai berhasil disimpan! Mahasiswa dapat melihatnya di Pendaftaran Saya.');
      setLoading('btnSimpanNilai', 'loaderNilai', false);
      await loadAntrean();
      setTimeout(() => closeInputNilai(), 1600);
      return;
    } catch (err) {
      console.warn('Gagal menyimpan nilai:', err);
      showFormMsg('formNilaiMsg', 'error', '⚠ Gagal menyimpan ke server. Coba lagi.');
      setLoading('btnSimpanNilai', 'loaderNilai', false);
      return;
    }
  }

  await delay(900);

  /* Fallback dummy: UPDATE local data — field name sinkron hasil_seleksi mahasiswa */
  const idx = dummyData.findIndex(d => d.id === editingId);
  if (idx !== -1) {
    dummyData[idx].hasil_seleksi = { ...dummyData[idx].hasil_seleksi, ...payload };

    /* Update status: jika nilai_tes diisi dan status masih lolos_berkas → wawancara */
    if (nilaiTes && dummyData[idx].status === 'lolos_berkas') {
      dummyData[idx].status = 'wawancara';
    }
  }

  showFormMsg('formNilaiMsg', 'success', '✓ Nilai berhasil disimpan! Mahasiswa dapat melihatnya di Pendaftaran Saya.');
  setLoading('btnSimpanNilai', 'loaderNilai', false);

  loadStats();
  renderList();

  setTimeout(() => closeInputNilai(), 1600);
});

document.getElementById('modalInputClose')?.addEventListener('click',   closeInputNilai);
document.getElementById('cancelNilai')?.addEventListener('click',        closeInputNilai);
document.getElementById('modalInputOverlay')?.addEventListener('click', closeInputNilai);

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

/* ── HELPERS ── */
function showFormMsg(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className   = 'form-message ' + type;
  el.textContent = msg;
}
function clearFormMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className   = 'form-message';
  el.textContent = '';
}
function setLoading(btnId, loaderId, on) {
  const btn    = document.getElementById(btnId);
  const text   = btn?.querySelector('.btn-text');
  const loader = document.getElementById(loaderId);
  if (btn)    btn.disabled         = on;
  if (text)   text.style.display   = on ? 'none' : '';
  if (loader) loader.style.display = on ? 'flex' : 'none';
}

/* ── SIDEBAR MOBILE ── */
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
function openSidebar()  { sidebar?.classList.add('open');    sidebarOverlay?.classList.add('active');    document.body.style.overflow = 'hidden'; }
function closeSidebar() { sidebar?.classList.remove('open'); sidebarOverlay?.classList.remove('active'); document.body.style.overflow = ''; }
document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

/* ── LOGOUT ── */
const logoutModal = document.getElementById('logoutModal');
document.getElementById('btnLogout')?.addEventListener('click',    () => { logoutModal?.classList.add('active');    document.body.style.overflow = 'hidden'; });
document.getElementById('cancelLogout')?.addEventListener('click', () => { logoutModal?.classList.remove('active'); document.body.style.overflow = ''; });
document.getElementById('logoutOverlay')?.addEventListener('click',() => { logoutModal?.classList.remove('active'); document.body.style.overflow = ''; });
document.getElementById('confirmLogout')?.addEventListener('click', () => {
  sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});

/* ── KEYBOARD ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeInputNilai(); logoutModal?.classList.remove('active'); closeSidebar(); document.body.style.overflow = ''; }
});

/* ── BG CANVAS ── */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const orbs = Array.from({ length: 5 }, () => ({ x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight, r: 100+Math.random()*160, dx:(Math.random()-.5)*.3, dy:(Math.random()-.5)*.3, hue:210+Math.random()*30, alpha:.04+Math.random()*.04 }));
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    orbs.forEach(o => {
      o.x+=o.dx; o.y+=o.dy;
      if(o.x<-o.r) o.x=canvas.width+o.r; if(o.x>canvas.width+o.r) o.x=-o.r;
      if(o.y<-o.r) o.y=canvas.height+o.r; if(o.y>canvas.height+o.r) o.y=-o.r;
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

  const symbols = ['🎓', '📋', '✅', '📊', '🏆', '📝', '💼', '🔍', '📑', '⭐'];
  const COUNT   = 18;

  for (let i = 0; i < COUNT; i++) {
    const p       = document.createElement('div');
    p.className   = 'particle';
    p.textContent = symbols[i % symbols.length];

    const dur   = 7 + Math.random() * 8;
    const delay = Math.random() * 10;
    const left  = Math.random() * 100;
    const size  = 12 + Math.random() * 10;

    p.style.cssText = `
      left:            ${left}%;
      bottom:          -40px;
      font-size:       ${size}px;
      --dur:           ${dur}s;
      --delay:         ${delay}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(p);
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initBgCanvas();
  initParticles();
  initUserInfo();
  initTabs();
  initSearch();
  loadAntrean();
  console.log('📝 inputHasilSeleksi.js loaded | Staff:', demoSession?.nama_lengkap);
});