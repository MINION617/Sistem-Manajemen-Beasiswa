/* =============================================================
   SHARED-NAVBAR.JS — BeasiswaKampus
   Satu file untuk semua perilaku navbar: scroll, hamburger,
   mobile drawer, user info, dropdown logout.

   Cara pakai: <script src="../shared/shared-navbar.js"></script>
   Taruh SETELAH script halaman utama.

   Prasyarat HTML (id-id ini harus ada di setiap halaman):
     #navbar, #hamburgerBtn, #mobileNav, #mobileNavOverlay,
     #topbarAvatar, #sidebarAvatar (mobile drawer avatar),
     #sidebarName  (mobile drawer name),
     #sidebarNim   (mobile drawer nim),
     #mobileName   (alias mobile name),
     #btnLogout    (tombol logout di dropdown),
     #mobileBtnLogout (logout di mobile drawer),
     #logoutModal, #logoutOverlay, #cancelLogout, #confirmLogout,
     #badgeNotif   (opsional badge notif di dropdown)
   ============================================================= */

(function () {
  'use strict';

  /* ── Helper: ambil session ── */
  function getSession() {
    try {
      const raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* ── Isi info user di navbar ── */
  function fillUserInfo() {
    const s     = getSession();
    const nama  = s?.nama_lengkap || 'Mahasiswa';
    const nim   = s?.nim_nip || '—';
    const inits = nama.charAt(0).toUpperCase();
    const first = nama.split(' ')[0];

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('topbarAvatar', inits);     /* nav chip avatar */
    set('sidebarName',  first);     /* nav chip username */
    set('sidebarAvatar', inits);    /* mobile drawer avatar */
    set('mobileName',    nama);
    set('sidebarNim',   'NIM: ' + nim);
  }

  /* ── Scroll: tambah class .scrolled ── */
  function initScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* set initial state */
  }

  /* ── Mobile Drawer ── */
  function initMobileNav() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const overlay   = document.getElementById('mobileNavOverlay');
    if (!hamburger || !mobileNav) return;

    function open() {
      mobileNav.classList.add('open');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
      hamburger.classList.add('open');
    }
    function close() {
      mobileNav.classList.remove('open');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
      hamburger.classList.remove('open');
    }

    hamburger.addEventListener('click', () =>
      mobileNav.classList.contains('open') ? close() : open()
    );
    overlay?.addEventListener('click', close);

    /* Mobile logout — buka modal logout */
    const mobileLogout = document.getElementById('mobileBtnLogout');
    if (mobileLogout) {
      mobileLogout.addEventListener('click', () => {
        close();
        setTimeout(() => showLogoutModal(), 220);
      });
    }

    /* Escape key tutup drawer */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  /* ── Logout Modal ── */
  function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function hideLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function initLogout() {
    document.getElementById('btnLogout')?.addEventListener('click', showLogoutModal);
    document.getElementById('cancelLogout')?.addEventListener('click', hideLogoutModal);
    document.getElementById('logoutOverlay')?.addEventListener('click', hideLogoutModal);
    document.getElementById('confirmLogout')?.addEventListener('click', () => {
      sessionStorage.removeItem('bk_user');
      localStorage.removeItem('bk_user');
      window.location.href = '../LOGIN/login.html';
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideLogoutModal();
    });
  }

  /* ── Init semua ── */
  document.addEventListener('DOMContentLoaded', () => {
    fillUserInfo();
    initScroll();
    initMobileNav();
    initLogout();
  });

})();