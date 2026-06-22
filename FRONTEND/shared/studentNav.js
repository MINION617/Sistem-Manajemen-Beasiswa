/* ============================================================
   studentNav.js — injects the shared mahasiswa SIDEBAR + mobile
   topbar + logout modal into every student page. Self-contained:
   reads `bk_user` directly (works with or without the BK layer).
   Replaces the old per-page top navbar.

   Usage (per page, after the page's own CSS):
     <link rel="stylesheet" href="../shared/studentNav.css" />
     ...
     <script src="../shared/studentNav.js"></script>
   ============================================================ */
(function () {
  'use strict';

  function getSession() {
    try {
      var raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // label, href (relative to a FRONTEND/<page>/ folder), icon, match (path fragment)
  var NAV = [
    { label: 'Dashboard',        href: '../dashboard/dashboard.html',                            icon: 'solar:home-2-bold-duotone',          match: '/dashboard/' },
    { label: 'Daftar Beasiswa',  href: '../daftarBeasiswa/daftarBeasiswa.html',                  icon: 'solar:diploma-bold-duotone',         match: '/daftarBeasiswa/' },
    { label: 'Pendaftaran Saya', href: '../pendaftaranSaya/pendaftaranSaya.html',                icon: 'solar:document-text-bold-duotone',   match: '/pendaftaranSaya/' },
    { label: 'Penerimaan Dana',  href: '../penerimaBeasiswa/penerimaBeasiswa.html',              icon: 'solar:wallet-money-bold-duotone',    match: '/penerimaBeasiswa/' },
    { label: 'Perusahaan',       href: '../kumpulanPerusahaanBeasiswa/kumpulanPerusahaanBeasiswa.html', icon: 'solar:buildings-2-bold-duotone', match: 'erusahaanBeasiswa/' },
    { label: 'Laporan Kendala',  href: '../laporanKendala/laporanKendala.html',                  icon: 'solar:chat-round-like-bold-duotone', match: '/laporanKendala/' },
    { label: 'Riwayat',          href: '../historyBeasiswa/historyBeasiswa.html',                icon: 'solar:calendar-bold-duotone',        match: '/historyBeasiswa/' },
    { label: 'Notifikasi',       href: '../notifikasi/notifikasi.html',                          icon: 'solar:bell-bold-duotone',            match: '/notifikasi/' },
    { label: 'Profil Saya',      href: '../profilMahasiswa/profilMahasiswa.html',                icon: 'solar:user-bold-duotone',            match: '/profilMahasiswa/' },
  ];

  function build() {
    var s = getSession();
    var nama = (s && s.nama_lengkap) || 'Mahasiswa';
    var initial = nama.charAt(0).toUpperCase();
    var path = location.pathname;

    var items = NAV.map(function (n) {
      var active = path.indexOf(n.match) !== -1 ? ' active' : '';
      return '<a class="mhs-item' + active + '" href="' + n.href + '">' +
             '<iconify-icon icon="' + n.icon + '"></iconify-icon><span>' + n.label + '</span></a>';
    }).join('');

    var logoHTML =
      '<a class="mhs-logo" href="../beranda.html"><span class="mhs-logo-mark">B</span>' +
      '<span>Beasiswa<strong>Kampus</strong></span></a>';

    var sidebar =
      '<aside class="mhs-sidebar" id="mhsSidebar">' +
        '<div class="mhs-sb-header">' + logoHTML +
          '<button class="mhs-sb-close" id="mhsSbClose" aria-label="Tutup menu">' +
          '<iconify-icon icon="solar:close-circle-bold-duotone"></iconify-icon></button></div>' +
        '<div class="mhs-sb-user">' +
          '<div class="mhs-avatar" id="mhsAvatar">' + initial + '</div>' +
          '<div><div class="mhs-uname" id="mhsName">' + nama + '</div>' +
          '<span class="mhs-role"><iconify-icon icon="solar:square-academic-cap-bold-duotone" width="11"></iconify-icon>Mahasiswa</span></div>' +
        '</div>' +
        '<nav class="mhs-nav"><div class="mhs-nav-label">Menu</div>' + items + '</nav>' +
        '<div class="mhs-sb-footer"><button class="mhs-logout" id="mhsLogout">' +
          '<iconify-icon icon="solar:logout-2-bold-duotone"></iconify-icon>Keluar</button></div>' +
      '</aside>';

    var firstName = nama.split(' ')[0];
    var topbar =
      '<div class="mhs-topbar">' +
        '<div class="mhs-tb-left">' +
          '<button class="mhs-burger" id="mhsBurger" aria-label="Buka menu">' +
          '<iconify-icon icon="solar:hamburger-menu-bold-duotone"></iconify-icon></button>' + logoHTML +
        '</div>' +
        '<div class="mhs-tb-right">' +
          '<a class="mhs-bell" href="../notifikasi/notifikasi.html" title="Notifikasi">' +
          '<iconify-icon icon="solar:bell-bold-duotone"></iconify-icon></a>' +
          '<div class="mhs-chip"><span class="mhs-avatar sm">' + initial + '</span>' +
          '<span class="mhs-chip-name">' + firstName + '</span></div>' +
        '</div>' +
      '</div>';

    var overlay = '<div class="mhs-overlay" id="mhsOverlay"></div>';

    var modal =
      '<div class="mhs-modal" id="mhsLogoutModal"><div class="mhs-modal-ov" id="mhsLogoutOv"></div>' +
        '<div class="mhs-modal-box">' +
          '<iconify-icon icon="solar:door-open-bold-duotone" width="46" style="color:#be123c"></iconify-icon>' +
          '<h3>Keluar dari Portal?</h3><p>Kamu akan keluar dari sesi ini.</p>' +
          '<div class="mhs-modal-actions">' +
            '<button class="mhs-btn-cancel" id="mhsLogoutCancel">Batal</button>' +
            '<button class="mhs-btn-danger" id="mhsLogoutConfirm">Ya, Keluar</button>' +
          '</div></div></div>';

    // topbar first (sticky, normal flow), then sidebar/overlay/modal
    document.body.insertAdjacentHTML('afterbegin', topbar + sidebar + overlay + modal);
    wire();
  }

  function wire() {
    var sidebar = document.getElementById('mhsSidebar');
    var overlay = document.getElementById('mhsOverlay');
    function open() { sidebar.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function close() { sidebar.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow = ''; }

    document.getElementById('mhsBurger') && document.getElementById('mhsBurger').addEventListener('click', open);
    document.getElementById('mhsSbClose').addEventListener('click', close);
    overlay.addEventListener('click', close);

    var modal = document.getElementById('mhsLogoutModal');
    var showModal = function () { modal.classList.add('active'); };
    var hideModal = function () { modal.classList.remove('active'); };
    document.getElementById('mhsLogout').addEventListener('click', showModal);
    document.getElementById('mhsLogoutCancel').addEventListener('click', hideModal);
    document.getElementById('mhsLogoutOv').addEventListener('click', hideModal);
    document.getElementById('mhsLogoutConfirm').addEventListener('click', function () {
      if (window.BK && window.BK.session) window.BK.session.clearSession();
      else { sessionStorage.removeItem('bk_user'); localStorage.removeItem('bk_user'); }
      window.location.href = '../LOGIN/login.html';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); hideModal(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
