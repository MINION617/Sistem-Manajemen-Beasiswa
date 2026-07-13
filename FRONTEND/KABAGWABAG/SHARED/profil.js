/* ============================================================
 * PROFIL.JS — Beasiswa Kampus
 * Role   : Kabag (khusus)
 * Fitur  : lihat & edit data diri, ganti foto, ganti password
 *
 * Catatan: file ini ada di folder /SHARED/ tapi secara navigasi
 * nyata hanya diakses Kabag. Wabag punya halaman profil sendiri
 * (/WABAG/profilWabag.*), berdiri sendiri, terpisah dari file ini.
 * ============================================================ */


/* ============================================================
 * 01. KONFIGURASI & SESSION
 * ============================================================ */


function getSession() {
  const raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
  return raw ? JSON.parse(raw) : null;
}

const session = getSession();

const demoSession = session || {
  nama_lengkap : 'Dr. Suharto, M.Pd.',
  role         : 'kabag',
  id           : 'demo-kabag-uuid',
};

const ROLE = demoSession.role;

const ROLE_CFG = {
  kabag : {
    label        : 'Kabag',
    dashboardUrl : '../KABAG/dashboardKabag.html',
    icon         : 'solar:star-bold-duotone',
  },
  /* Cabang ini tidak pernah tercapai lewat navigasi manapun saat ini —
     Wabag punya halaman profil sendiri (/WABAG/profilWabag.*) dan tidak
     pernah menautkan ke folder /SHARED/. Dipertahankan (bukan dihapus)
     supaya halaman ini tetap berfungsi benar kalau suatu saat memang
     dibuka lewat sesi wabag. */
  wabag : {
    label        : 'Wabag',
    dashboardUrl : '../WABAG/dashboardWabag.html',
    icon         : 'solar:wallet-bold-duotone',
  },
};

const roleCfg = ROLE_CFG[ROLE] || ROLE_CFG.kabag;


/* ============================================================
 * 02. DATA PROFIL DUMMY (per role)
 *     Ganti dengan data dari Supabase/API saat production
 * ============================================================ */

const DUMMY_PROFIL = {
  kabag : {
    nama      : 'Dr. Suharto, M.Pd.',
    nip       : '197505152003121001',
    email     : 'suharto@univ.ac.id',
    telp      : '0812-3456-7890',
    jabatan   : 'Kepala Bagian Kemahasiswaan',
    unit      : 'Biro Kemahasiswaan & Alumni',
    periode   : '2024 – 2028',
    bergabung : 'Maret 2024',
  },
  wabag : {
    nama      : 'Dra. Hartini, M.M.',
    nip       : '197808252005012002',
    email     : 'hartini@univ.ac.id',
    telp      : '0823-4567-8901',
    jabatan   : 'Wakil Bagian Keuangan',
    unit      : 'Biro Kemahasiswaan & Alumni',
    periode   : '2024 – 2028',
    bergabung : 'Maret 2024',
  },
};

/* Ambil profil dari localStorage jika ada perubahan sebelumnya,
   kalau tidak pakai dummy default */
function getProfilData() {
  const saved = localStorage.getItem('bk_profil_' + ROLE);
  if (saved) {
    return Object.assign({}, DUMMY_PROFIL[ROLE] || DUMMY_PROFIL.kabag, JSON.parse(saved));
  }
  return Object.assign({}, DUMMY_PROFIL[ROLE] || DUMMY_PROFIL.kabag);
}

/* Simpan perubahan profil ke localStorage */
function saveProfilData(patch) {
  const current = getProfilData();
  const updated = Object.assign({}, current, patch);
  localStorage.setItem('bk_profil_' + ROLE, JSON.stringify(updated));
  return updated;
}

/* State form */
let editMode       = false;
let originalValues = {};

const isRealSession = !!(session?.access_token && !session.access_token.startsWith('dummy-token-'));

/* Ambil profil asli dari backend dan simpan ke localStorage supaya
   getProfilData()/renderProfil() yang sudah ada langsung memakainya. */
async function loadProfile() {
  if (!isRealSession) return;
  try {
    const { data } = await api.get('/profil');
    saveProfilData({
      nama: data.nama_lengkap,
      nip: data.nim_nip,
      email: data.email,
      telp: data.nomor_whatsapp,
      jabatan: data.jabatan,
      unit: data.unit,
    });
    initUserInfo();
    renderProfil();
  } catch (err) {
    console.warn('Gagal memuat profil, pakai data lokal:', err);
  }
}


/* ============================================================
 * 03. UTILS
 * ============================================================ */

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function inisial(nama) {
  return nama
    .replace(/[^a-zA-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}


/* ============================================================
 * 04. INIT USER INFO
 * ============================================================ */

function initUserInfo() {
  const profil     = getProfilData();
  const namaUser   = profil.nama;
  const inisialStr = inisial(namaUser);

  /* Sidebar */
  setEl('sidebarName',      namaUser);
  setEl('sidebarRoleLabel', roleCfg.label);

  const sidebarAv = document.getElementById('sidebarAvatar');
  if (sidebarAv) sidebarAv.textContent = namaUser.charAt(0).toUpperCase();

  /* Topbar */
  const topbarAv = document.getElementById('topbarAvatar');
  if (topbarAv) topbarAv.textContent = namaUser.charAt(0).toUpperCase();

  /* Nav dashboard link */
  const navDash = document.getElementById('navDashboard');
  if (navDash) navDash.href = roleCfg.dashboardUrl;

  /* Role tag icon di sidebar */
  const roleIcon = document.getElementById('roleTagIcon');
  if (roleIcon) roleIcon.setAttribute('icon', roleCfg.icon);

  /* Topbar: foto avatar (jika sudah pernah upload) */
  loadAvatarFromStorage();

  updateLaporanBadge();
}

/* Badge laporan kendala — dihitung dari laporan status 'masuk' yang BELUM
   PERNAH dilihat (bukan status mentah), sinkron dengan mekanisme yang sama
   di laporanKendala.js: 'bk_laporan_seen_<role>'. */
async function updateLaporanBadge() {
  const badge    = document.getElementById('badgeLaporan');
  const notifDot = document.getElementById('notifDot');
  if (!isRealSession) {
    if (badge) { badge.textContent = '0'; badge.classList.remove('show'); }
    if (notifDot) notifDot.style.display = 'none';
    return;
  }
  try {
    const { data } = await api.get('/laporan');
    const masuk = data.filter(d => d.status === 'masuk').length;
    const seen  = Number(localStorage.getItem('bk_laporan_seen_' + ROLE) || 0);
    const belumDilihat = Math.max(0, masuk - seen);
    if (badge) {
      badge.textContent = belumDilihat;
      badge.classList.toggle('show', belumDilihat > 0);
    }
    if (notifDot) notifDot.style.display = belumDilihat > 0 ? 'block' : 'none';
  } catch (err) {
    console.warn('Gagal memuat badge laporan:', err);
  }
}


/* ============================================================
 * 05. RENDER PROFIL KE HALAMAN
 * ============================================================ */

function renderProfil() {
  const profil = getProfilData();

  /* Kartu kiri */
  setEl('profileDisplayName', profil.nama);
  setEl('profileRoleLabel',   roleCfg.label);
  setEl('profileNipDisplay',  'NIP: ' + profil.nip);
  setEl('statUnitKerja',      profil.unit);
  setEl('statBergabung',      profil.bergabung);
  setEl('statPeriode',        profil.periode);

  /* Banner */
  setEl('bannerRole',      roleCfg.label);
  setEl('bannerBergabung', profil.bergabung);

  /* Avatar inisial */
  const avatarInitialEl = document.getElementById('avatarInitial');
  if (avatarInitialEl) avatarInitialEl.textContent = inisial(profil.nama);
  setEl('sidebarAvatar', profil.nama.charAt(0).toUpperCase());

  /* Form fields */
  setFormValue('inputNama',    profil.nama);
  setFormValue('inputNip',     profil.nip);
  setFormValue('inputEmail',   profil.email);
  setFormValue('inputTelp',    profil.telp);
  setFormValue('inputJabatan', profil.jabatan);
  setFormValue('inputUnit',    profil.unit);
}

function setFormValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}


/* ============================================================
 * 06. MODE EDIT / VIEW
 * ============================================================ */

/* Field yang bisa diedit (sisanya readonly by design).
   Email sengaja tidak diikutkan — endpoint PATCH /profil cuma mengubah
   kolom `profiles.email`, bukan email login Supabase Auth, jadi kalau
   diizinkan diedit sendiri, tampilan profil bisa desync dari email yang
   sebenarnya dipakai login. Backend juga sudah menolak field ini untuk
   role kabag/wabag (lihat profil.controller.js, EMAIL_LOCKED_ROLES). */
const EDITABLE_FIELDS = ['inputNama', 'inputTelp'];

function enableEditMode() {
  editMode = true;

  /* Simpan nilai asli untuk Batal */
  EDITABLE_FIELDS.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) originalValues[id] = el.value;
  });

  /* Aktifkan field */
  EDITABLE_FIELDS.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = false;
      el.classList.remove('is-readonly');
    }
  });

  /* Tampilkan tombol aksi, sembunyikan tombol Edit */
  const formActions  = document.getElementById('formActions');
  const btnEditToggle = document.getElementById('btnEditToggle');
  if (formActions)   formActions.classList.remove('is-hidden');
  if (btnEditToggle) btnEditToggle.style.display = 'none';

  /* Fokus ke field pertama */
  const firstField = document.getElementById(EDITABLE_FIELDS[0]);
  if (firstField) firstField.focus();
}

function disableEditMode(restore) {
  editMode = false;

  /* Kembalikan nilai asli jika Batal */
  if (restore) {
    EDITABLE_FIELDS.forEach(function (id) {
      const el = document.getElementById(id);
      if (el && originalValues[id] !== undefined) el.value = originalValues[id];
    });
  }

  /* Nonaktifkan kembali */
  EDITABLE_FIELDS.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = true;
      el.classList.remove('has-error');
    }
  });

  /* Sembunyikan error */
  document.querySelectorAll('.form-error-msg').forEach(function (el) {
    el.classList.remove('is-visible');
  });

  /* Sembunyikan tombol aksi, tampilkan kembali tombol Edit */
  const formActions   = document.getElementById('formActions');
  const btnEditToggle = document.getElementById('btnEditToggle');
  if (formActions)   formActions.classList.add('is-hidden');
  if (btnEditToggle) btnEditToggle.style.display = '';
}


/* ============================================================
 * 07. VALIDASI & SIMPAN PROFIL
 * ============================================================ */

function validateProfileForm() {
  let valid = true;

  /* Nama: tidak boleh kosong */
  const nama = (document.getElementById('inputNama')?.value || '').trim();
  const errNama = document.getElementById('errNama');
  if (!nama) {
    errNama?.classList.add('is-visible');
    document.getElementById('inputNama')?.classList.add('has-error');
    valid = false;
  } else {
    errNama?.classList.remove('is-visible');
    document.getElementById('inputNama')?.classList.remove('has-error');
  }

  return valid;
}

async function handleSaveProfile() {
  if (!validateProfileForm()) return;

  const nama  = document.getElementById('inputNama').value.trim();
  const email = document.getElementById('inputEmail').value.trim(); // readonly, cuma buat tampilan
  const telp  = (document.getElementById('inputTelp')?.value || '').trim();

  if (isRealSession) {
    try {
      await api.patch('/profil', { nama_lengkap: nama, nomor_whatsapp: telp });
    } catch (err) {
      showToast(err?.message || 'Gagal menyimpan profil.', 'error');
      return;
    }
  }

  /* Simpan ke localStorage (juga dipakai sebagai cache tampilan saat real session) */
  const updated = saveProfilData({ nama, email, telp });

  /* Update tampilan kartu kiri & session */
  setEl('profileDisplayName', updated.nama);
  const avatarInitialEl = document.getElementById('avatarInitial');
  if (avatarInitialEl) avatarInitialEl.textContent = inisial(updated.nama);
  setEl('sidebarAvatar', updated.nama.charAt(0).toUpperCase());
  setEl('sidebarName',   updated.nama);
  const topbarAv = document.getElementById('topbarAvatar');
  if (topbarAv && !document.getElementById('avatarImg')?.style.display !== 'none') {
    topbarAv.textContent = updated.nama.charAt(0).toUpperCase();
  }

  /* Update bk_user di storage dengan nama baru */
  const bkUser = getSession();
  if (bkUser) {
    bkUser.nama_lengkap = updated.nama;
    const storage = sessionStorage.getItem('bk_user') ? sessionStorage : localStorage;
    storage.setItem('bk_user', JSON.stringify(bkUser));
  }

  disableEditMode(false);
  showToast('Data berhasil disimpan!', 'success');
}


/* ============================================================
 * 08. AVATAR — Upload & Preview
 * ============================================================ */

function initAvatarUpload() {
  const input = document.getElementById('avatarFileInput');
  if (!input) return;

  input.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    /* Validasi ukuran maks 2MB */
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maks 2 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;

      /* Tampilkan di kartu profil */
      const avatarImg     = document.getElementById('avatarImg');
      const avatarInitial = document.getElementById('avatarInitial');
      if (avatarImg) {
        avatarImg.src          = dataUrl;
        avatarImg.style.display = 'block';
      }
      if (avatarInitial) avatarInitial.style.display = 'none';

      /* Simpan ke localStorage */
      localStorage.setItem('bk_avatar_' + ROLE, dataUrl);

      /* Tampilkan di topbar avatar */
      updateTopbarAvatar(dataUrl);

      showToast('Foto profil diperbarui!', 'success');
    };
    reader.readAsDataURL(file);
  });
}

function loadAvatarFromStorage() {
  const saved = localStorage.getItem('bk_avatar_' + ROLE);
  if (!saved) return;

  const avatarImg     = document.getElementById('avatarImg');
  const avatarInitial = document.getElementById('avatarInitial');
  if (avatarImg) {
    avatarImg.src           = saved;
    avatarImg.style.display = 'block';
  }
  if (avatarInitial) avatarInitial.style.display = 'none';

  updateTopbarAvatar(saved);
}

function updateTopbarAvatar(dataUrl) {
  const topbarAv = document.getElementById('topbarAvatar');
  if (!topbarAv) return;

  /* Ganti teks inisial dengan foto */
  topbarAv.textContent = '';
  topbarAv.style.backgroundImage    = 'url(' + dataUrl + ')';
  topbarAv.style.backgroundSize     = 'cover';
  topbarAv.style.backgroundPosition = 'center';
}


/* ============================================================
 * 09. GANTI PASSWORD
 * ============================================================ */

/* Cek kekuatan password */
function checkStrength(pass) {
  if (!pass) return null;

  const hasUpper   = /[A-Z]/.test(pass);
  const hasNumber  = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  const isLong     = pass.length >= 8;

  if (!isLong) return 'lemah';
  if (isLong && (hasNumber || hasSpecial) && (hasUpper)) return 'kuat';
  if (isLong && (hasNumber || hasSpecial || hasUpper)) return 'sedang';
  return 'lemah';
}

function initPasswordStrength() {
  const inputNewPass = document.getElementById('inputNewPass');
  if (!inputNewPass) return;

  inputNewPass.addEventListener('input', function () {
    const val         = this.value;
    const strengthWrap = document.getElementById('strengthWrap');
    const strengthFill = document.getElementById('strengthFill');
    const strengthLabel = document.getElementById('strengthLabel');
    if (!strengthWrap || !strengthFill || !strengthLabel) return;

    if (!val) {
      strengthWrap.classList.remove('is-visible');
      return;
    }

    strengthWrap.classList.add('is-visible');

    const level = checkStrength(val);
    const labels = {
      lemah  : 'Lemah — tambah huruf besar, angka, atau simbol',
      sedang : 'Sedang — bisa lebih kuat',
      kuat   : 'Kuat',
    };

    strengthFill.className  = 'strength-fill ' + level;
    strengthLabel.className = 'strength-label ' + level;
    strengthLabel.textContent = labels[level] || '';
  });
}

function validatePasswordForm() {
  let valid = true;

  /* Password lama tidak boleh kosong */
  const oldPass    = document.getElementById('inputOldPass')?.value || '';
  const errOldPass = document.getElementById('errOldPass');
  if (!oldPass) {
    errOldPass?.classList.add('is-visible');
    document.getElementById('inputOldPass')?.classList.add('has-error');
    valid = false;
  } else {
    errOldPass?.classList.remove('is-visible');
    document.getElementById('inputOldPass')?.classList.remove('has-error');
  }

  /* Password baru minimal 8 karakter */
  const newPass    = document.getElementById('inputNewPass')?.value || '';
  const errNewPass = document.getElementById('errNewPass');
  if (newPass.length < 8) {
    errNewPass?.classList.add('is-visible');
    document.getElementById('inputNewPass')?.classList.add('has-error');
    valid = false;
  } else {
    errNewPass?.classList.remove('is-visible');
    document.getElementById('inputNewPass')?.classList.remove('has-error');
  }

  /* Konfirmasi harus sama */
  const confirmPass    = document.getElementById('inputConfirmPass')?.value || '';
  const errConfirmPass = document.getElementById('errConfirmPass');
  if (newPass !== confirmPass) {
    errConfirmPass?.classList.add('is-visible');
    document.getElementById('inputConfirmPass')?.classList.add('has-error');
    valid = false;
  } else {
    errConfirmPass?.classList.remove('is-visible');
    document.getElementById('inputConfirmPass')?.classList.remove('has-error');
  }

  return valid;
}

async function handleSavePassword() {
  if (!validatePasswordForm()) return;

  const oldPassword = document.getElementById('inputOldPass').value;
  const newPassword = document.getElementById('inputNewPass').value;

  if (isRealSession) {
    try {
      await api.patch('/profil/password', { oldPassword, newPassword });
    } catch (err) {
      showToast(err?.message || 'Gagal mengubah password.', 'error');
      return;
    }
  }

  /* Reset field password setelah berhasil */
  ['inputOldPass', 'inputNewPass', 'inputConfirmPass'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  /* Sembunyikan indikator kekuatan */
  const strengthWrap = document.getElementById('strengthWrap');
  if (strengthWrap) strengthWrap.classList.remove('is-visible');

  showToast('Password berhasil diubah!', 'success');
}


/* ============================================================
 * 10. TOGGLE TAMPILKAN / SEMBUNYIKAN PASSWORD
 * ============================================================ */

function initPasswordToggles() {
  document.querySelectorAll('.password-toggle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = this.dataset.target;
      const input    = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      /* Ganti ikon */
      const icon = this.querySelector('iconify-icon');
      if (icon) {
        icon.setAttribute(
          'icon',
          isPassword
            ? 'solar:eye-closed-bold-duotone'
            : 'solar:eye-bold-duotone'
        );
      }
    });
  });
}


/* ============================================================
 * 11. TOAST NOTIFIKASI
 * ============================================================ */

function showToast(msg, type) {
  type = type || 'success';

  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  const icon = type === 'success'
    ? 'solar:check-circle-bold-duotone'
    : 'solar:close-circle-bold-duotone';

  toast.innerHTML =
    '<iconify-icon class="toast-icon" icon="' + icon + '" width="16"></iconify-icon>' +
    '<span class="toast-msg">' + msg + '</span>';

  container.appendChild(toast);

  /* Animasi masuk */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });
  });

  /* Auto dismiss setelah 3 detik */
  setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 3000);
}


/* ============================================================
 * 12. SIDEBAR & LOGOUT
 * ============================================================ */

const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar?.classList.add('open');
  sidebarOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar?.classList.remove('open');
  sidebarOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('hamburgerBtn')?.addEventListener('click', openSidebar);
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

const logoutModal = document.getElementById('logoutModal');

document.getElementById('btnLogout')?.addEventListener('click', function () {
  logoutModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
});

document.getElementById('cancelLogout')?.addEventListener('click', function () {
  logoutModal?.classList.remove('active');
  document.body.style.overflow = '';
});

document.getElementById('logoutOverlay')?.addEventListener('click', function () {
  logoutModal?.classList.remove('active');
  document.body.style.overflow = '';
});

document.getElementById('confirmLogout')?.addEventListener('click', function () {
  sessionStorage.removeItem('bk_user');
  localStorage.removeItem('bk_user');
  window.location.href = '../../LOGIN/login.html';
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    logoutModal?.classList.remove('active');
    closeSidebar();
    document.body.style.overflow = '';
  }
});


/* ============================================================
 * 13. BACKGROUND CANVAS
 * ============================================================ */

function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const orbs = Array.from({ length: 5 }, function () {
    return {
      x     : Math.random() * window.innerWidth,
      y     : Math.random() * window.innerHeight,
      r     : 100 + Math.random() * 160,
      dx    : (Math.random() - 0.5) * 0.3,
      dy    : (Math.random() - 0.5) * 0.3,
      hue   : 210 + Math.random() * 30,
      alpha : 0.04 + Math.random() * 0.04,
    };
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    orbs.forEach(function (o) {
      o.x += o.dx;
      o.y += o.dy;

      if (o.x < -o.r)                o.x = canvas.width  + o.r;
      if (o.x > canvas.width  + o.r) o.x = -o.r;
      if (o.y < -o.r)                o.y = canvas.height + o.r;
      if (o.y > canvas.height + o.r) o.y = -o.r;

      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, 'hsla(' + o.hue + ', 80%, 60%, ' + o.alpha + ')');
      g.addColorStop(1, 'hsla(' + o.hue + ', 80%, 60%, 0)');

      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}


/* ============================================================
 * 14. PARTIKEL
 * ============================================================ */

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const icons = [
    ['solar:user-circle-bold-duotone',        'rgba(245, 158, 11, 0.16)'],
    ['solar:shield-check-bold-duotone',        'rgba(37, 99, 235, 0.14)'],
    ['solar:lock-password-bold-duotone',       'rgba(124, 58, 237, 0.14)'],
    ['solar:diploma-bold-duotone',             'rgba(37, 99, 235, 0.14)'],
    ['solar:star-bold-duotone',                'rgba(245, 158, 11, 0.16)'],
  ];

  for (var i = 0; i < 14; i++) {
    var pair = icons[i % icons.length];
    var icon  = pair[0];
    var color = pair[1];

    var p   = document.createElement('iconify-icon');
    var dur = 7  + Math.random() * 8;
    var dl  = Math.random() * 10;

    p.setAttribute('icon', icon);
    p.className = 'particle';
    p.style.cssText =
      'left:'            + (Math.random() * 100) + '%;' +
      'bottom:-40px;'    +
      'font-size:'       + (12 + Math.random() * 10) + 'px;' +
      'color:'           + color + ';' +
      '--dur:'           + dur + 's;' +
      '--delay:'         + dl  + 's;' +
      'animation-delay:' + dl  + 's';

    container.appendChild(p);
  }
}


/* ============================================================
 * 15. INIT — DOMContentLoaded
 * ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* Inisialisasi dasar */
  initBgCanvas();
  initParticles();
  initUserInfo();
  renderProfil();
  loadProfile();

  /* Avatar upload */
  initAvatarUpload();

  /* Password strength & toggle */
  initPasswordStrength();
  initPasswordToggles();

  /* Tombol Edit */
  document.getElementById('btnEditToggle')?.addEventListener('click', enableEditMode);

  /* Tombol Simpan Profil */
  document.getElementById('btnSaveProfile')?.addEventListener('click', handleSaveProfile);

  /* Tombol Batal Edit */
  document.getElementById('btnCancelEdit')?.addEventListener('click', function () {
    disableEditMode(true);
  });

  /* Tombol Ubah Password */
  document.getElementById('btnSavePassword')?.addEventListener('click', handleSavePassword);

  console.log('👤 profil.js loaded | Role:', ROLE, '| User:', demoSession.nama_lengkap);
});