/* ============================================================
   roleNav.js — role-aware sidebar menu for Kabag & Wabag.
   Kabag (monitoring/seleksi/keputusan) and Wabag (keuangan)
   have DIFFERENT menus. Overwrites `.sidebar-nav` based on the
   logged-in role. Include on every KABAGWABAG page:
     <script src="../SHARED/roleNav.js"></script>
   Paths use ../<FOLDER>/ which resolves from KABAG/, WABAG/, SHARED/.
   ============================================================ */
(function () {
  'use strict';

  function getSession() {
    try {
      var raw = sessionStorage.getItem('bk_user') || localStorage.getItem('bk_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // Prefer the logged-in role; fall back to the page's folder (KABAG/WABAG).
  var role = (getSession() || {}).role;
  if (role !== 'kabag' && role !== 'wabag') {
    role = /\/WABAG\//i.test(location.pathname) ? 'wabag'
         : /\/KABAG\//i.test(location.pathname) ? 'kabag'
         : 'kabag';
  }

  var NAV = {
    kabag: [
      { label: 'Dashboard',           file: 'dashboardKabag.html',   href: '../KABAG/dashboardKabag.html',         icon: 'solar:home-2-bold-duotone' },
      { label: 'Monitoring Pendaftar',file: 'monitoringPendaftar.html', href: '../SHARED/monitoringPendaftar.html', icon: 'solar:users-group-two-rounded-bold-duotone' },
      { label: 'Penetapan Penerima',  file: 'penetapanPenerima.html', href: '../KABAG/penetapanPenerima.html',      icon: 'solar:clipboard-check-bold-duotone' },
      { label: 'Penerima Beasiswa',   file: 'penerima.html',         href: '../SHARED/penerima.html',              icon: 'solar:cup-star-bold-duotone' },
      { label: 'Laporan Kendala',     file: 'laporanKendala.html',   href: '../SHARED/laporanKendala.html',        icon: 'solar:chat-round-like-bold-duotone' },
    ],
    wabag: [
      { label: 'Dashboard',           file: 'dashboardWabag.html',   href: '../WABAG/dashboardWabag.html',         icon: 'solar:home-2-bold-duotone' },
      { label: 'Penerima & Pencairan',file: 'penerima.html',         href: '../SHARED/penerima.html',              icon: 'solar:wallet-money-bold-duotone' },
      { label: 'Laporan Alokasi Dana',file: 'laporanAlokasi.html',   href: '../WABAG/laporanAlokasi.html',         icon: 'solar:pie-chart-2-bold-duotone' },
      { label: 'Audit Bukti Transfer',file: 'auditTransfer.html',    href: '../WABAG/auditTransfer.html',          icon: 'solar:shield-check-bold-duotone' },
    ],
  };

  function render() {
    var nav = document.querySelector('.sidebar-nav');
    if (!nav) return;
    var items = NAV[role] || NAV.kabag;
    var current = location.pathname.split('/').pop();
    nav.innerHTML =
      '<div class="nav-section-label">Menu</div>' +
      items.map(function (n) {
        var active = current === n.file ? ' active' : '';
        return '<a href="' + n.href + '" class="nav-item' + active + '">' +
               '<span class="nav-icon"><iconify-icon icon="' + n.icon + '"></iconify-icon></span>' +
               '<span>' + n.label + '</span></a>';
      }).join('');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
