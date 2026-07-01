/* ============================================================
   PUSATLAPORANKENDALA.JS — Beasiswa Kampus (Staff Admin)
   Folder  : pusatLaporanKendala/
   ──────────────────────────────────────────────────────────
   TABEL YANG DIGUNAKAN:
     laporan_kendala  — id, mahasiswa_id, beasiswa_id,
                        judul_laporan, deskripsi, kategori,
                        status, tanggapan_staff,
                        tanggal_lapor, tanggal_selesai
     profiles         — nama_lengkap, nim_nip
     beasiswa         — nama_program
   ──────────────────────────────────────────────────────────
   SINKRON DENGAN MAHASISWA (laporanKendala.js):
     laporan_kendala.status enum IDENTIK:
       masuk | diproses | selesai
     Field yang dilihat mahasiswa:
       judul_laporan, deskripsi, status,
       tanggapan_staff, tanggal_lapor, tanggal_selesai
   ALUR:
     Mahasiswa buat laporan → status 'masuk'
     Staff tangani → status 'diproses' + isi tanggapan_staff
     Staff selesaikan → status 'selesai' + tanggal_selesai
   ============================================================ */

const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

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

/* ── DUMMY DATA ──
   Field name IDENTIK dengan laporanKendala.js mahasiswa:
   judul_laporan, deskripsi, status, tanggapan_staff,
   tanggal_lapor, tanggal_selesai
──────────────────────────────────────────────────────── */
let dummyData = [
  {
    id               : 'l-001',
    mahasiswa_id     : 'u-001',
    beasiswa_id      : 'b-001',
    /* laporan_kendala fields — IDENTIK dengan laporanKendala.js mahasiswa */
    judul_laporan    : 'Bukti transfer belum muncul di dashboard',
    deskripsi        : 'Sudah 3 hari sejak jadwal pencairan tapi status di dashboard masih "Menunggu". Saya sudah cek rekening tapi dana belum masuk. Mohon dicek kembali.',
    kategori         : 'dana',
    status           : 'masuk',
    tanggapan_staff  : null,
    tanggal_lapor    : '2026-06-20T08:00:00Z',
    tanggal_selesai  : null,
    /* JOIN profiles */
    mahasiswa : { nama_lengkap: 'Bagas Pratama Wijaya', nim_nip: '2021410043' },
    /* JOIN beasiswa */
    beasiswa  : { nama_program: 'Beasiswa Mandiri Prestasi' },
  },
  {
    id               : 'l-002',
    mahasiswa_id     : 'u-002',
    beasiswa_id      : 'b-002',
    judul_laporan    : 'Status seleksi tidak berubah setelah wawancara',
    deskripsi        : 'Saya sudah mengikuti wawancara pada 20 Mei 2026 tapi status di halaman Pendaftaran Saya masih "Wawancara". Apakah ada masalah dengan sistem?',
    kategori         : 'status',
    status           : 'masuk',
    tanggapan_staff  : null,
    tanggal_lapor    : '2026-06-19T14:00:00Z',
    tanggal_selesai  : null,
    mahasiswa : { nama_lengkap: 'Cahaya Nur Aisyah', nim_nip: '2021220032' },
    beasiswa  : { nama_program: 'Pertamina Sobat Bumi' },
  },
  {
    id               : 'l-003',
    mahasiswa_id     : 'u-003',
    beasiswa_id      : null,
    judul_laporan    : 'Gagal upload berkas KTM',
    deskripsi        : 'Saya mencoba upload KTM dalam format JPG ukuran 2MB tapi terus muncul error "format tidak didukung". Padahal sudah sesuai petunjuk.',
    kategori         : 'teknis',
    status           : 'diproses',
    tanggapan_staff  : 'Halo! Kami sedang menginvestigasi masalah upload ini. Sementara itu, coba konversi file ke PNG terlebih dahulu. Kami akan update dalam 24 jam.',
    tanggal_lapor    : '2026-06-18T09:15:00Z',
    tanggal_selesai  : null,
    mahasiswa : { nama_lengkap: 'Dimas Surya Atmaja', nim_nip: '2020130021' },
    beasiswa  : null,
  },
  {
    id               : 'l-004',
    mahasiswa_id     : 'u-004',
    beasiswa_id      : 'b-003',
    judul_laporan    : 'Nilai tes tidak sesuai dengan yang disampaikan penguji',
    deskripsi        : 'Pada saat tes, penguji menyampaikan nilai saya sekitar 85, namun yang tertera di sistem hanya 76. Mohon dilakukan pengecekan ulang.',
    kategori         : 'status',
    status           : 'diproses',
    tanggapan_staff  : 'Terima kasih telah melaporkan. Kami akan konfirmasi ke tim penguji dan melakukan verifikasi nilai dalam 2-3 hari kerja.',
    tanggal_lapor    : '2026-06-17T13:30:00Z',
    tanggal_selesai  : null,
    mahasiswa : { nama_lengkap: 'Elisa Rahayu Putri', nim_nip: '2022510017' },
    beasiswa  : { nama_program: 'Telkom Digital Talent' },
  },
  {
    id               : 'l-005',
    mahasiswa_id     : 'u-005',
    beasiswa_id      : 'b-001',
    judul_laporan    : 'Upload sertifikat prestasi gagal terus',
    deskripsi        : 'Sudah mencoba berkali-kali upload sertifikat dalam format PDF tapi selalu gagal dengan pesan "server error". Padahal ukuran file hanya 1.2MB.',
    kategori         : 'dokumen',
    status           : 'selesai',
    tanggapan_staff  : 'Halo! Masalah ini sudah kami perbaiki pada server. Silakan coba upload ulang menggunakan browser Chrome versi terbaru. Jika masih bermasalah, hubungi kami kembali. Terima kasih atas kesabarannya!',
    tanggal_lapor    : '2026-06-10T09:00:00Z',
    tanggal_selesai  : '2026-06-11T14:00:00Z',
    mahasiswa : { nama_lengkap: 'Fadhlan Rizki Maulana', nim_nip: '2021410043' },
    beasiswa  : { nama_program: 'Beasiswa Mandiri Prestasi' },
  },
  {
    id               : 'l-006',
    mahasiswa_id     : 'u-006',
    beasiswa_id      : null,
    judul_laporan    : 'Tidak bisa login ke portal beasiswa',
    deskripsi        : 'Sejak kemarin saya tidak bisa login. Sudah coba reset password tapi email verifikasi tidak masuk-masuk.',
    kategori         : 'teknis',
    status           : 'selesai',
    tanggapan_staff  : 'Akun Anda sempat terkunci karena terlalu banyak percobaan login. Kami sudah buka kuncinya. Silakan cek folder spam untuk email verifikasi, atau hubungi kami jika masih belum berhasil.',
    tanggal_lapor    : '2026-06-08T11:00:00Z',
    tanggal_selesai  : '2026-06-08T15:00:00Z',
    mahasiswa : { nama_lengkap: 'Gita Safira Dewi', nim_nip: '2023110029' },
    beasiswa  : null,
  },
];

/* ── STATUS CONFIG — IDENTIK dengan laporanKendala.js mahasiswa ── */
const STATUS_CFG = {
  masuk     : { label: 'Baru Masuk',  cls: 'status-masuk',    accent: '#e11d48', icon: 'solar:chat-round-unread-bold-duotone' },
  diproses  : { label: 'Diproses',    cls: 'status-diproses', accent: '#d97706', icon: 'solar:hourglass-bold-duotone' },
  selesai   : { label: 'Selesai',     cls: 'status-selesai',  accent: '#059669', icon: 'solar:check-circle-bold-duotone' },
};

const KATEGORI_CFG = {
  dokumen  : { label: 'Dokumen & Berkas', icon: 'solar:document-text-bold-duotone' },
  status   : { label: 'Status Pendaftaran', icon: 'solar:diploma-bold-duotone' },
  dana     : { label: 'Dana & Transfer', icon: 'solar:banknote-bold-duotone' },
  teknis   : { label: 'Masalah Teknis', icon: 'solar:laptop-bold-duotone' },
  lainnya  : { label: 'Lainnya', icon: 'solar:info-circle-bold-duotone' },
};

/* ── STATE ── */
let activeTab    = 'masuk';
let filterKat    = 'all';
let searchQ      = '';
let editingId    = null;

/* ── UTILS ── */
function setEl(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
function inisial(nama)  { return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }
function formatTgl(str) { if (!str) return '—'; return new Date(str).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }); }
function timeAgo(str)   {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return m + ' menit lalu';
  const h = Math.floor(m/60);
  if (h < 24) return h + ' jam lalu';
  return Math.floor(h/24) + ' hari lalu';
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function animateNum(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (target === 0) { el.textContent = '0'; return; }
  let cur = 0;
  const step = Math.max(1, Math.ceil(target/22));
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
  const masuk    = dummyData.filter(d => d.status === 'masuk').length;
  const diproses = dummyData.filter(d => d.status === 'diproses').length;
  const selesai  = dummyData.filter(d => d.status === 'selesai').length;
  const total    = dummyData.length;

  animateNum('statMasuk',    masuk);
  animateNum('statDiproses', diproses);
  animateNum('statSelesai',  selesai);
  animateNum('statTotal',    total);

  setEl('bannerMasuk',    masuk);
  setEl('bannerDiproses', diproses);

  setEl('tcMasuk',    masuk);
  setEl('tcDiproses', diproses);
  setEl('tcSelesai',  selesai);
  setEl('tcAll',      total);

  /* Badge sidebar */
  const badge = document.getElementById('badgeLaporan');
  if (badge) {
    const belumDitangani = masuk + diproses;
    badge.textContent = belumDitangani;
    badge.classList.toggle('show', belumDitangani > 0);
  }

  /* Notif dot */
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = masuk > 0 ? 'block' : 'none';
}

/* ── RENDER LIST ── */
function renderList() {
  const listEl  = document.getElementById('laporanList');
  const emptyEl = document.getElementById('emptyState');

  let data = [...dummyData];
  if (activeTab !== 'all') data = data.filter(d => d.status === activeTab);
  if (filterKat !== 'all') data = data.filter(d => d.kategori === filterKat);
  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(d =>
      d.judul_laporan.toLowerCase().includes(q) ||
      d.mahasiswa?.nama_lengkap?.toLowerCase().includes(q) ||
      d.deskripsi.toLowerCase().includes(q)
    );
  }

  /* Sort: masuk & diproses paling baru di atas, selesai dari terlama */
  data.sort((a, b) => {
    if (a.status === 'selesai' && b.status === 'selesai') {
      return new Date(b.tanggal_selesai) - new Date(a.tanggal_selesai);
    }
    return new Date(b.tanggal_lapor) - new Date(a.tanggal_lapor);
  });

  setEl('panelCount', data.length + ' laporan');

  if (!data.length) {
    listEl.innerHTML = '';
    /* ── FIX: gunakan 'flex' agar center vertikal & horizontal bekerja ── */
    emptyEl.style.display = 'flex';
    return;
  }
  emptyEl.style.display = 'none';

  listEl.innerHTML = data.map((d, i) => {
    const cfg   = STATUS_CFG[d.status] || STATUS_CFG.masuk;
    const katCfg = KATEGORI_CFG[d.kategori] || KATEGORI_CFG.lainnya;
    const belumDitangani = d.status === 'masuk';

    return `
      <div class="laporan-card" style="--card-accent:${cfg.accent};animation-delay:${i*.06}s"
           onclick="openTangani('${d.id}')">
        <div class="laporan-head">
          <div class="laporan-avatar">${inisial(d.mahasiswa?.nama_lengkap || '?')}</div>
          <div class="laporan-head-main">
            <div class="laporan-judul">${d.judul_laporan}</div>
            <div class="laporan-meta">
              <span class="laporan-meta-item">
                <iconify-icon icon="solar:user-bold-duotone" width="10"></iconify-icon>
                ${d.mahasiswa?.nama_lengkap || '—'}
              </span>
              <span class="laporan-meta-item">
                <iconify-icon icon="solar:document-text-bold-duotone" width="10"></iconify-icon>
                NIM: ${d.mahasiswa?.nim_nip || '—'}
              </span>
              ${d.beasiswa ? `
                <span class="laporan-meta-item">
                  <iconify-icon icon="solar:diploma-bold-duotone" width="10"></iconify-icon>
                  ${d.beasiswa.nama_program}
                </span>` : ''}
              <span class="laporan-meta-item">
                <iconify-icon icon="solar:clock-circle-bold-duotone" width="10"></iconify-icon>
                ${timeAgo(d.tanggal_lapor)}
              </span>
            </div>
          </div>
          <div class="laporan-head-right">
            <span class="status-pill ${cfg.cls}">
              <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
              ${cfg.label}
            </span>
          </div>
        </div>

        <div class="laporan-body">${d.deskripsi}</div>

        ${d.tanggapan_staff ? `
          <div class="tanggapan-preview">
            <div class="tanggapan-preview-icon">
              <iconify-icon icon="solar:chat-round-dots-bold-duotone" width="14" style="color:#059669"></iconify-icon>
            </div>
            <div class="tanggapan-preview-text">${d.tanggapan_staff}</div>
          </div>
        ` : ''}

        <div class="laporan-footer">
          <div class="laporan-tags">
            <span class="laporan-tag">
              <iconify-icon icon="${katCfg.icon}" width="10"></iconify-icon>
              ${katCfg.label}
            </span>
            <span class="laporan-tag">
              <iconify-icon icon="solar:calendar-bold-duotone" width="10"></iconify-icon>
              ${formatTgl(d.tanggal_lapor)}
            </span>
            ${d.status === 'selesai' && d.tanggal_selesai ? `
              <span class="laporan-tag" style="color:#047857;background:var(--mint-soft);border-color:#a7f3d0">
                <iconify-icon icon="solar:check-circle-bold-duotone" width="10"></iconify-icon>
                Selesai ${formatTgl(d.tanggal_selesai)}
              </span>` : ''}
          </div>
          <button
            class="${belumDitangani ? 'laporan-btn btn-tangani' : 'laporan-btn btn-lihat'}"
            onclick="event.stopPropagation(); openTangani('${d.id}')"
          >
            <iconify-icon
              icon="${belumDitangani ? 'solar:plain-bold-duotone' : 'solar:eye-bold-duotone'}"
              width="13"
            ></iconify-icon>
            ${belumDitangani ? 'Tangani' : 'Lihat Detail'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

/* ── MODAL TANGANI ── */
const modalTangani = document.getElementById('modalTangani');

function openTangani(id) {
  editingId = id;
  const d   = dummyData.find(x => x.id === id);
  if (!d) return;
  const cfg     = STATUS_CFG[d.status] || STATUS_CFG.masuk;
  const katCfg  = KATEGORI_CFG[d.kategori] || KATEGORI_CFG.lainnya;

  /* Isi konten detail laporan */
  document.getElementById('modalTanganiContent').innerHTML = `
    <div class="detail-laporan-head">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span class="status-pill ${cfg.cls}">
          <iconify-icon icon="${cfg.icon}" width="10"></iconify-icon>
          ${cfg.label}
        </span>
        <span style="font-size:11px;color:var(--text-4)">${timeAgo(d.tanggal_lapor)}</span>
      </div>
      <div class="detail-laporan-judul">${d.judul_laporan}</div>
      <div class="detail-meta-row">
        <span class="detail-meta-item">
          <iconify-icon icon="solar:user-bold-duotone" width="11"></iconify-icon>
          ${d.mahasiswa?.nama_lengkap || '—'}
        </span>
        <span class="detail-meta-item">NIM: ${d.mahasiswa?.nim_nip || '—'}</span>
        ${d.beasiswa ? `<span class="detail-meta-item">
          <iconify-icon icon="solar:diploma-bold-duotone" width="11"></iconify-icon>
          ${d.beasiswa.nama_program}
        </span>` : ''}
        <span class="detail-meta-item">
          <iconify-icon icon="${katCfg.icon}" width="11"></iconify-icon>
          ${katCfg.label}
        </span>
      </div>
    </div>

    <div class="detail-section-title">Deskripsi Masalah dari Mahasiswa</div>
    <div class="detail-deskripsi">${d.deskripsi}</div>

    <div class="detail-section-title">Riwayat Tanggapan Staff</div>
    <div class="riwayat-tanggapan">
      ${d.tanggapan_staff
        ? `<div class="tanggapan-item">
             <div class="tanggapan-item-header">
               <span class="tanggapan-item-role">
                 <iconify-icon icon="solar:user-id-bold-duotone" width="12"></iconify-icon>
                 Staff Admin
               </span>
               <span class="tanggapan-item-tgl">${formatTgl(d.tanggal_lapor)}</span>
             </div>
             <div class="tanggapan-item-text">${d.tanggapan_staff}</div>
           </div>`
        : `<div class="belum-tanggapan">
             <iconify-icon icon="solar:chat-round-dots-bold-duotone" width="24" style="color:var(--text-4);display:block;margin:0 auto 8px"></iconify-icon>
             Belum ada tanggapan. Balas laporan ini di bawah.
           </div>`
      }
    </div>
  `;

  /* Pre-fill tanggapan jika sudah ada */
  const fTanggapan = document.getElementById('fTanggapan');
  if (fTanggapan) fTanggapan.value = d.tanggapan_staff || '';

  /* Set radio status */
  document.querySelectorAll('input[name="status_laporan"]').forEach(r => {
    if (d.status === 'selesai') r.value === 'selesai' ? r.checked = true : r.checked = false;
    else r.value === 'diproses' ? r.checked = true : r.checked = false;
  });

  clearFormMsg('formTanggapanMsg');

  modalTangani?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeTangani() {
  modalTangani?.classList.remove('active');
  document.body.style.overflow = '';
  editingId = null;
}

/* Form submit tanggapan */
document.getElementById('formTanggapan')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tanggapan = document.getElementById('fTanggapan').value.trim();
  const status    = document.querySelector('input[name="status_laporan"]:checked')?.value;

  if (!tanggapan) {
    showFormMsg('formTanggapanMsg', 'error', '⚠ Tanggapan wajib diisi sebelum dikirim.');
    return;
  }

  setLoading('btnKirimTanggapan', 'loaderTanggapan', true);
  await delay(900);

  /* UPDATE — field sinkron dengan laporanKendala.js mahasiswa */
  const idx = dummyData.findIndex(d => d.id === editingId);
  if (idx !== -1) {
    dummyData[idx].tanggapan_staff = tanggapan;
    dummyData[idx].status          = status || 'diproses';
    if (status === 'selesai') {
      dummyData[idx].tanggal_selesai = new Date().toISOString();
    }
  }

  showFormMsg('formTanggapanMsg', 'success',
    status === 'selesai'
      ? '✓ Laporan ditandai selesai! Mahasiswa dapat melihat tanggapan di halaman Laporan Kendala.'
      : '✓ Tanggapan terkirim! Status diperbarui ke "Diproses".'
  );
  setLoading('btnKirimTanggapan', 'loaderTanggapan', false);

  loadStats();
  renderList();
  setTimeout(closeTangani, 1600);
});

document.getElementById('modalTanganiClose')?.addEventListener('click',   closeTangani);
document.getElementById('cancelTangani')?.addEventListener('click',        closeTangani);
document.getElementById('modalTanganiOverlay')?.addEventListener('click', closeTangani);

/* ── TABS & SEARCH & FILTER ── */
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
function initFilter() {
  const sel = document.getElementById('filterKategori');
  if (!sel) return;
  sel.addEventListener('change', () => { filterKat = sel.value; renderList(); });
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
  if (e.key === 'Escape') { closeTangani(); logoutModal?.classList.remove('active'); closeSidebar(); document.body.style.overflow=''; }
});

/* ── BG CANVAS & PARTICLES ── */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const orbs=Array.from({length:5},()=>({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:100+Math.random()*160,dx:(Math.random()-.5)*.3,dy:(Math.random()-.5)*.3,hue:210+Math.random()*30,alpha:.04+Math.random()*.04}));
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    orbs.forEach(o=>{
      o.x+=o.dx;o.y+=o.dy;
      if(o.x<-o.r)o.x=canvas.width+o.r;if(o.x>canvas.width+o.r)o.x=-o.r;
      if(o.y<-o.r)o.y=canvas.height+o.r;if(o.y>canvas.height+o.r)o.y=-o.r;
      const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
      g.addColorStop(0,`hsla(${o.hue},80%,60%,${o.alpha})`);g.addColorStop(1,`hsla(${o.hue},80%,60%,0)`);
      ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
function initParticles() {
  const container=document.getElementById('particles');
  if(!container) return;

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
  loadStats(); initTabs(); initFilter(); initSearch(); renderList();
  console.log('💬 pusatLaporanKendala.js loaded | Staff:', demoSession?.nama_lengkap);
});