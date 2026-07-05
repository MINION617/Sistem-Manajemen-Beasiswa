/* ============================================================
   KELOLAPENCAIRANDANA.JS — Beasiswa Kampus (Staff Admin)
   Folder  : PencairanDana/
   ──────────────────────────────────────────────────────────
   TABEL YANG DIGUNAKAN:
     penyaluran_dana  — id, pendaftaran_id, mahasiswa_id,
                        nominal_transfer, tanggal_transfer,
                        periode_bulan, no_rekening_tujuan,
                        bank_tujuan, no_referensi,
                        bukti_transfer_url, catatan,
                        status, created_at
     pendaftaran      — JOIN untuk mahasiswa_id, beasiswa_id
     profiles         — nama_lengkap, nim_nip, no_rekening
     beasiswa         — nama_program, nominal_dana
   ──────────────────────────────────────────────────────────
   SINKRON DENGAN MAHASISWA (penerimaBeasiswa.js):
     penyaluran_dana.status enum IDENTIK:
       pending | sedang_diproses | sudah_cair
     Field yang dilihat mahasiswa:
       nominal_transfer, tanggal_transfer, periode_bulan,
       bukti_transfer_url, status, catatan, bank_tujuan,
       no_referensi
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
   Struktur: penyaluran_dana JOIN pendaftaran JOIN profiles JOIN beasiswa
   Field name sinkron dengan penerimaBeasiswa.js mahasiswa
──────────────────────────────────────────────────────── */
let dummyData = [
  {
    /* penyaluran_dana fields */
    id                  : 'pd-001',
    pendaftaran_id      : 'p-201',
    mahasiswa_id        : 'u-007',
    nominal_transfer    : 5000000,
    tanggal_transfer    : null,
    periode_bulan       : '2026-07',
    no_rekening_tujuan  : '1230004567890',
    bank_tujuan         : 'BCA',
    no_referensi        : null,
    bukti_transfer_url  : null,
    catatan             : null,
    /* penyaluran_dana.status — IDENTIK dengan penerimaBeasiswa.js mahasiswa */
    status              : 'pending',
    created_at          : '2026-06-20T10:00:00Z',
    /* JOIN profiles */
    mahasiswa: { nama_lengkap: 'Hana Putri Azzahra',  nim_nip: '2021310088', program_studi: 'Teknik Informatika', no_rekening: '1230004567890' },
    /* JOIN beasiswa */
    beasiswa : { nama_program: 'Beasiswa Mandiri Prestasi', nominal_dana: 5000000, sponsors: { nama_perusahaan: 'Bank Mandiri' } },
  },
  {
    id                  : 'pd-002',
    pendaftaran_id      : 'p-202',
    mahasiswa_id        : 'u-008',
    nominal_transfer    : 7500000,
    tanggal_transfer    : null,
    periode_bulan       : '2026-07',
    no_rekening_tujuan  : '0088123456789',
    bank_tujuan         : 'BRI',
    no_referensi        : null,
    bukti_transfer_url  : null,
    catatan             : null,
    status              : 'pending',
    created_at          : '2026-06-20T11:00:00Z',
    mahasiswa: { nama_lengkap: 'Ivan Rizki Ramadhan', nim_nip: '2020230045', program_studi: 'Teknik Kimia', no_rekening: '0088123456789' },
    beasiswa : { nama_program: 'Pertamina Sobat Bumi', nominal_dana: 7500000, sponsors: { nama_perusahaan: 'Pertamina' } },
  },
  {
    id                  : 'pd-003',
    pendaftaran_id      : 'p-203',
    mahasiswa_id        : 'u-009',
    nominal_transfer    : 4500000,
    tanggal_transfer    : '2026-06-15',
    periode_bulan       : '2026-06',
    no_rekening_tujuan  : '5678901234567',
    bank_tujuan         : 'Mandiri',
    no_referensi        : 'TRF-20260615-003',
    bukti_transfer_url  : 'bukti_transfer_demo.png',
    catatan             : 'Dana beasiswa bulan Juni 2026 telah ditransfer.',
    status              : 'sudah_cair',
    created_at          : '2026-06-15T09:00:00Z',
    mahasiswa: { nama_lengkap: 'Kezia Aurel Santoso', nim_nip: '2022310099', program_studi: 'Sistem Informasi', no_rekening: '5678901234567' },
    beasiswa : { nama_program: 'Telkom Digital Talent', nominal_dana: 4500000, sponsors: { nama_perusahaan: 'Telkom Indonesia' } },
  },
  {
    id                  : 'pd-004',
    pendaftaran_id      : 'p-204',
    mahasiswa_id        : 'u-010',
    nominal_transfer    : 6000000,
    tanggal_transfer    : '2026-06-18',
    periode_bulan       : '2026-06',
    no_rekening_tujuan  : '9900112233445',
    bank_tujuan         : 'BNI',
    no_referensi        : 'TRF-20260618-004',
    bukti_transfer_url  : 'bukti_transfer_demo.png',
    catatan             : 'Pembayaran beasiswa periode Juni 2026.',
    status              : 'sudah_cair',
    created_at          : '2026-06-18T08:00:00Z',
    mahasiswa: { nama_lengkap: 'Luthfi Ananda Putra', nim_nip: '2021220078', program_studi: 'Akuntansi', no_rekening: '9900112233445' },
    beasiswa : { nama_program: 'Beasiswa Djarum Plus', nominal_dana: 6000000, sponsors: { nama_perusahaan: 'Djarum Foundation' } },
  },
  {
    id                  : 'pd-005',
    pendaftaran_id      : 'p-205',
    mahasiswa_id        : 'u-011',
    nominal_transfer    : 5000000,
    tanggal_transfer    : null,
    periode_bulan       : '2026-07',
    no_rekening_tujuan  : '3344556677889',
    bank_tujuan         : 'BSI',
    no_referensi        : null,
    bukti_transfer_url  : null,
    catatan             : null,
    status              : 'sedang_diproses',
    created_at          : '2026-06-19T10:00:00Z',
    mahasiswa: { nama_lengkap: 'Mira Salsabila',      nim_nip: '2022510055', program_studi: 'Manajemen', no_rekening: '3344556677889' },
    beasiswa : { nama_program: 'Beasiswa Mandiri Prestasi', nominal_dana: 5000000, sponsors: { nama_perusahaan: 'Bank Mandiri' } },
  },
];

/* ── STATUS CONFIG — IDENTIK dengan penerimaBeasiswa.js mahasiswa ── */
const STATUS_CFG = {
  pending          : { label: 'Menunggu',        cls: 'status-pending', accent: '#d97706', icon: 'solar:hourglass-bold-duotone' },
  sedang_diproses  : { label: 'Sedang Diproses', cls: 'status-proses',  accent: '#2563eb', icon: 'solar:transfer-horizontal-bold-duotone' },
  sudah_cair       : { label: 'Sudah Cair',      cls: 'status-cair',    accent: '#059669', icon: 'solar:check-circle-bold-duotone' },
};

/* ── LOAD DATA ── */
async function loadPencairanData() {
  if (isRealSession) {
    try {
      const { data } = await api.get('/penyaluran');
      dummyData = data.map(mapPenyaluranRow);
    } catch (err) {
      console.warn('Gagal memuat data penyaluran, pakai data contoh:', err);
    }
  }
  loadStats();
  populateFilter();
  renderList();
}

/* ── STATE ── */
let activeTab  = 'pending';
let filterBs   = 'all';
let filterBulan = 'all';
let searchQ    = '';
let editingId  = null;
let selectedFile = null;

/* ── UTILS ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function inisial(nama)  { return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function formatTgl(str) { if (!str) return '—'; return new Date(str).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }
function formatRp(n)    { if (!n) return 'Rp 0'; return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function formatRpShort(n) { if (!n) return 'Rp 0'; return 'Rp ' + (n/1000000).toLocaleString('id-ID') + ' jt'; }
function delay(ms)      { return new Promise(r => setTimeout(r, ms)); }

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
  const pending = dummyData.filter(d => d.status === 'pending').length;
  const proses  = dummyData.filter(d => d.status === 'sedang_diproses').length;
  const cair    = dummyData.filter(d => d.status === 'sudah_cair').length;
  const totalDana = dummyData.filter(d => d.status === 'sudah_cair')
                              .reduce((s, d) => s + (d.nominal_transfer || 0), 0);

  animateNum('statPending', pending);
  animateNum('statProses',  proses);
  animateNum('statCair',    cair);
  setEl('statTotalDana', formatRpShort(totalDana));

  setEl('bannerPending', pending);
  setEl('bannerTotal',   formatRpShort(totalDana));

  setEl('tcPending', pending);
  setEl('tcProses',  proses);
  setEl('tcCair',    cair);
  setEl('tcAll',     dummyData.length);
}

/* ── POPULATE FILTER ── */
function populateFilter() {
  const sel = document.getElementById('filterBeasiswa');
  if (!sel) return;
  const uniq = [...new Map(dummyData.map(d => [d.beasiswa?.nama_program, d.beasiswa?.nama_program])).entries()];
  sel.innerHTML = '<option value="all">Semua Beasiswa</option>';
  uniq.forEach(([id, nama]) => { if (nama) sel.innerHTML += `<option value="${nama}">${nama}</option>`; });
  sel.addEventListener('change', () => { filterBs = sel.value; renderList(); });

  const selBulan = document.getElementById('filterBulan');
  selBulan?.addEventListener('change', () => { filterBulan = selBulan.value; renderList(); });
}

/* ── RENDER LIST ── */
function renderList() {
  const listEl  = document.getElementById('pencairanList');
  const emptyEl = document.getElementById('emptyState');

  let data = [...dummyData];
  if (activeTab !== 'all') data = data.filter(d => d.status === activeTab);
  if (filterBs !== 'all') data = data.filter(d => d.beasiswa?.nama_program === filterBs);
  if (filterBulan !== 'all') data = data.filter(d => d.periode_bulan === filterBulan);
  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(d =>
      d.mahasiswa?.nama_lengkap?.toLowerCase().includes(q) ||
      d.beasiswa?.nama_program?.toLowerCase().includes(q) ||
      d.mahasiswa?.nim_nip?.includes(q)
    );
  }

  setEl('panelCount', data.length + ' penerima');

  if (!data.length) { listEl.innerHTML = ''; emptyEl.style.display = 'flex'; return; }
  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const cfg = STATUS_CFG[d.status] || STATUS_CFG.pending;
    const sudahUpload = !!d.bukti_transfer_url;

    let actionsHTML = '';
    if (d.status === 'pending') {
      actionsHTML = `
        <button class="btn-upload" onclick="openUpload('${d.id}')">
          <iconify-icon icon="solar:upload-minimalistic-bold-duotone" width="13"></iconify-icon>
          Upload Bukti
        </button>`;
    } else if (d.status === 'sedang_diproses') {
      actionsHTML = `
        <button class="btn-view" onclick="openDetail('${d.id}')">
          <iconify-icon icon="solar:eye-bold-duotone" width="13"></iconify-icon>
          Lihat Detail
        </button>
        <button class="btn-upload" onclick="openUpload('${d.id}')">
          <iconify-icon icon="solar:upload-minimalistic-bold-duotone" width="13"></iconify-icon>
          Upload Bukti
        </button>`;
    } else {
      actionsHTML = `
        <button class="btn-view" onclick="openDetail('${d.id}')">
          <iconify-icon icon="solar:eye-bold-duotone" width="13"></iconify-icon>
          Lihat Bukti
        </button>
        <button class="btn-edit" onclick="openUpload('${d.id}')">
          <iconify-icon icon="solar:pen-bold-duotone" width="13"></iconify-icon>
          Edit
        </button>`;
    }

    return `
      <div class="pencairan-card" style="--card-accent:${cfg.accent};animation-delay:${i*.06}s">
        <div class="card-avatar">${inisial(d.mahasiswa?.nama_lengkap || '?')}</div>

        <div class="card-main">
          <div class="card-nama">${d.mahasiswa?.nama_lengkap || '—'}</div>
          <div class="card-sub">
            NIM: ${d.mahasiswa?.nim_nip || '—'}
            &nbsp;·&nbsp;
            ${d.mahasiswa?.program_studi || '—'}
          </div>
          <div class="card-tags">
            <span class="card-tag">
              <iconify-icon icon="solar:card-bold-duotone" width="10"></iconify-icon>
              ${d.bank_tujuan || '—'} · ${d.no_rekening_tujuan || '—'}
            </span>
            <span class="card-tag">
              <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
              Periode: ${d.periode_bulan || '—'}
            </span>
            ${sudahUpload
              ? `<span class="card-tag" style="color:#047857;background:var(--mint-soft);border-color:#a7f3d0">
                   <iconify-icon icon="solar:file-check-bold-duotone" width="10"></iconify-icon>
                   Bukti tersedia
                 </span>`
              : `<span class="card-tag" style="color:#be123c;background:var(--coral-soft);border-color:#fecaca">
                   <iconify-icon icon="solar:file-corrupted-bold-duotone" width="10"></iconify-icon>
                   Belum ada bukti
                 </span>`
            }
          </div>
        </div>

        <div class="card-right">
          <div class="card-nominal">${formatRpShort(d.nominal_transfer)}</div>
          <div class="card-beasiswa">${d.beasiswa?.nama_program || '—'}</div>
          <span class="status-pill ${cfg.cls}">
            <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
            ${cfg.label}
          </span>
          <div class="card-actions">${actionsHTML}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── MODAL UPLOAD ── */
const modalUpload = document.getElementById('modalUpload');

function openUpload(id) {
  editingId    = id;
  selectedFile = null;
  const d      = dummyData.find(x => x.id === id);
  if (!d) return;

  setEl('modalUploadTitle',
    d.bukti_transfer_url ? 'Edit Data Transfer' : 'Upload Bukti Transfer');

  /* Info block */
  document.getElementById('uploadPenerimaInfo').innerHTML = `
    <div class="penerima-info-block">
      <div class="pib-avatar">${inisial(d.mahasiswa?.nama_lengkap || '?')}</div>
      <div>
        <div class="pib-nama">${d.mahasiswa?.nama_lengkap}</div>
        <div class="pib-sub">
          NIM: ${d.mahasiswa?.nim_nip}
          &nbsp;·&nbsp; ${d.beasiswa?.nama_program}
          &nbsp;·&nbsp; <strong>${formatRpShort(d.nominal_transfer)}/bln</strong>
        </div>
      </div>
    </div>
  `;

  /* Pre-fill form */
  const set = (fieldId, val) => { const el = document.getElementById(fieldId); if (el) el.value = val || ''; };
  set('fNominal',       d.nominal_transfer);
  set('fTanggalTransfer', d.tanggal_transfer);
  set('fPeriodeBulan',  d.periode_bulan);
  set('fRekening',      d.no_rekening_tujuan);
  set('fBank',          d.bank_tujuan);
  set('fReferensi',     d.no_referensi);
  set('fCatatanTransfer', d.catatan);

  /* Status radio */
  document.querySelectorAll('input[name="status_pencairan"]').forEach(r => {
    r.checked = r.value === d.status;
  });

  /* File preview */
  const preview = document.getElementById('filePreview');
  const dropZone = document.getElementById('fileDropZone');
  if (d.bukti_transfer_url) {
    document.getElementById('filePreviewName').textContent = d.bukti_transfer_url;
    preview.style.display  = 'flex';
    dropZone.style.display = 'none';
  } else {
    preview.style.display  = 'none';
    dropZone.style.display = 'block';
  }

  clearFormMsg('formUploadMsg');
  modalUpload?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeUpload() {
  modalUpload?.classList.remove('active');
  document.body.style.overflow = '';
  editingId    = null;
  selectedFile = null;
}

/* File drag & drop */
const dropZone = document.getElementById('fileDropZone');
dropZone?.addEventListener('click',  () => document.getElementById('fBuktiFile')?.click());
dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone?.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
document.getElementById('fBuktiFile')?.addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});
document.getElementById('fileRemove')?.addEventListener('click', () => {
  selectedFile = null;
  document.getElementById('filePreview').style.display  = 'none';
  document.getElementById('fileDropZone').style.display = 'block';
});

function handleFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    showFormMsg('formUploadMsg', 'error', '⚠ File terlalu besar. Maksimal 5MB.');
    return;
  }
  selectedFile = file;
  document.getElementById('filePreviewName').textContent = file.name;
  document.getElementById('filePreview').style.display  = 'flex';
  document.getElementById('fileDropZone').style.display = 'none';
}

/* Form submit */
document.getElementById('formUpload')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nominal  = document.getElementById('fNominal').value;
  const tanggal  = document.getElementById('fTanggalTransfer').value;
  const statusV  = document.querySelector('input[name="status_pencairan"]:checked')?.value;

  if (!nominal) { showFormMsg('formUploadMsg', 'error', '⚠ Nominal transfer wajib diisi.'); return; }
  if (!tanggal && statusV === 'sudah_cair') { showFormMsg('formUploadMsg', 'error', '⚠ Tanggal transfer wajib diisi jika status sudah cair.'); return; }

  setLoading('btnSimpanUpload', 'loaderUpload', true);
  await delay(1000);

  /* UPDATE — field sinkron dengan penerimaBeasiswa.js mahasiswa */
  const idx = dummyData.findIndex(d => d.id === editingId);
  if (idx !== -1) {
    dummyData[idx] = {
      ...dummyData[idx],
      nominal_transfer   : parseFloat(nominal) || 0,
      tanggal_transfer   : document.getElementById('fTanggalTransfer').value || null,
      periode_bulan      : document.getElementById('fPeriodeBulan').value || null,
      no_rekening_tujuan : document.getElementById('fRekening').value || null,
      bank_tujuan        : document.getElementById('fBank').value || null,
      no_referensi       : document.getElementById('fReferensi').value || null,
      catatan            : document.getElementById('fCatatanTransfer').value.trim() || null,
      bukti_transfer_url : selectedFile ? selectedFile.name : dummyData[idx].bukti_transfer_url,
      status             : statusV || 'sedang_diproses',
    };
  }

  showFormMsg('formUploadMsg', 'success', '✓ Data transfer berhasil disimpan! Mahasiswa dapat melihatnya di Penerimaan Dana.');
  setLoading('btnSimpanUpload', 'loaderUpload', false);
  loadStats();
  renderList();
  setTimeout(closeUpload, 1600);
});

document.getElementById('modalUploadClose')?.addEventListener('click',   closeUpload);
document.getElementById('cancelUpload')?.addEventListener('click',        closeUpload);
document.getElementById('modalUploadOverlay')?.addEventListener('click', closeUpload);

/* ── MODAL DETAIL ── */
const modalDetail = document.getElementById('modalDetail');

function openDetail(id) {
  const d = dummyData.find(x => x.id === id);
  if (!d) return;
  const cfg = STATUS_CFG[d.status] || STATUS_CFG.pending;

  document.getElementById('modalDetailContent').innerHTML = `
    <h3 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:6px">
      Detail Pencairan Dana
    </h3>
    <p style="font-size:13px;color:var(--text-3);margin-bottom:20px">
      ${d.mahasiswa?.nama_lengkap} &nbsp;·&nbsp; ${d.beasiswa?.nama_program}
    </p>

    <div class="detail-section-title">Informasi Penerima</div>
    <div class="info-row"><span class="info-label">Nama Lengkap</span><span class="info-val">${d.mahasiswa?.nama_lengkap || '—'}</span></div>
    <div class="info-row"><span class="info-label">NIM</span><span class="info-val">${d.mahasiswa?.nim_nip || '—'}</span></div>
    <div class="info-row"><span class="info-label">Program Studi</span><span class="info-val">${d.mahasiswa?.program_studi || '—'}</span></div>
    <div class="info-row"><span class="info-label">Beasiswa</span><span class="info-val">${d.beasiswa?.nama_program || '—'}</span></div>
    <div class="info-row"><span class="info-label">Sponsor</span><span class="info-val">${d.beasiswa?.sponsors?.nama_perusahaan || '—'}</span></div>

    <div class="detail-section-title">Data Transfer</div>
    <div class="info-row"><span class="info-label">Nominal Transfer</span><span class="info-val" style="color:var(--blue-700);font-size:16px;font-family:var(--font-display)">${formatRp(d.nominal_transfer)}</span></div>
    <div class="info-row"><span class="info-label">Tanggal Transfer</span><span class="info-val">${formatTgl(d.tanggal_transfer)}</span></div>
    <div class="info-row"><span class="info-label">Periode</span><span class="info-val">${d.periode_bulan || '—'}</span></div>
    <div class="info-row"><span class="info-label">Rekening Tujuan</span><span class="info-val">${d.bank_tujuan || '—'} · ${d.no_rekening_tujuan || '—'}</span></div>
    <div class="info-row"><span class="info-label">No. Referensi</span><span class="info-val">${d.no_referensi || '—'}</span></div>
    <div class="info-row"><span class="info-label">Status</span>
      <span class="info-val">
        <span class="status-pill ${cfg.cls}">
          <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
          ${cfg.label}
        </span>
      </span>
    </div>
    ${d.catatan ? `<div class="info-row"><span class="info-label">Catatan</span><span class="info-val" style="max-width:250px;text-align:right;line-height:1.4">${d.catatan}</span></div>` : ''}

    <div class="detail-section-title">Bukti Transfer</div>
    <div class="bukti-img-wrap">
      ${d.bukti_transfer_url
        ? `<div class="bukti-placeholder">
             <iconify-icon icon="solar:file-check-bold-duotone" width="48" style="color:#059669"></iconify-icon>
             <p>${d.bukti_transfer_url}</p>
             <p style="font-size:11px;color:var(--text-4)">(Preview tidak tersedia di mode demo)</p>
           </div>`
        : `<div class="bukti-placeholder">
             <iconify-icon icon="solar:file-corrupted-bold-duotone" width="48" style="color:var(--text-4)"></iconify-icon>
             <p>Bukti transfer belum diupload</p>
           </div>`
      }
    </div>

    <div class="detail-actions">
      <button class="btn-edit" style="flex:1" onclick="closeDetail(); openUpload('${d.id}')">
        <iconify-icon icon="solar:pen-bold-duotone" width="14"></iconify-icon>
        Edit / Upload Ulang
      </button>
    </div>
  `;

  modalDetail?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  modalDetail?.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modalDetailClose')?.addEventListener('click',   closeDetail);
document.getElementById('modalDetailOverlay')?.addEventListener('click', closeDetail);

/* ── TAB & SEARCH ── */
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
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => { searchQ = input.value.trim(); renderList(); });
}

/* ── HELPERS ── */
function showFormMsg(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'form-message ' + type;
  el.textContent = msg;
}
function clearFormMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'form-message';
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

/* ── SIDEBAR & LOGOUT ── */
const sidebar = document.getElementById('sidebar');
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
  if (e.key === 'Escape') { closeUpload(); closeDetail(); logoutModal?.classList.remove('active'); closeSidebar(); document.body.style.overflow=''; }
});

/* ── BG CANVAS & PARTICLES ── */
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
      g.addColorStop(0,`hsla(${o.hue},80%,60%,${o.alpha})`); g.addColorStop(1,`hsla(${o.hue},80%,60%,0)`);
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
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
  initBgCanvas(); initParticles(); initUserInfo();
  initTabs(); initSearch(); loadPencairanData();
  console.log('💰 pencairanDana.js loaded | Staff:', demoSession?.nama_lengkap);
});