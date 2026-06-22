/* ============================================================
   AUDITTRANSFER.JS — Wabag (FIN-03)
   Verifikasi bukti transfer penyaluran dana. Prototype dummy data.
   status penyaluran: pending | sedang_diproses | sudah_cair
   ============================================================ */

let penyaluran = [
  { id: 'p-1', nama: 'Adinda Putri Lestari', beasiswa: 'Mandiri Prestasi', nominal: 5000000, tanggal: '2026-05-22', status: 'sudah_cair' },
  { id: 'p-2', nama: 'Bagas Pratama Wijaya',  beasiswa: 'Pertamina Sobat Bumi', nominal: 7500000, tanggal: '2026-05-24', status: 'sedang_diproses' },
  { id: 'p-3', nama: 'Citra Maharani',        beasiswa: 'Telkom Digital', nominal: 4500000, tanggal: '2026-05-25', status: 'pending' },
  { id: 'p-4', nama: 'Dimas Anggoro',         beasiswa: 'BCA Finance', nominal: 5500000, tanggal: '2026-05-26', status: 'sedang_diproses' },
  { id: 'p-5', nama: 'Erika Wulandari',       beasiswa: 'Astra Future Leader', nominal: 10000000, tanggal: '2026-05-20', status: 'sudah_cair' },
  { id: 'p-6', nama: 'Fajar Nugraha',         beasiswa: 'Garuda Aviation', nominal: 8000000, tanggal: '2026-05-27', status: 'pending' },
];

const STP = {
  pending:         { label: 'Belum Cair',  cls: 'status-belum' },
  sedang_diproses: { label: 'Diproses',    cls: 'status-proses' },
  sudah_cair:      { label: 'Sudah Cair',  cls: 'status-cair' },
};

function renderStats() {
  const verified = penyaluran.filter(p => p.status === 'sudah_cair').length;
  setEl('statMenunggu', penyaluran.length - verified);
  setEl('statVerified', verified);
  setEl('statTotal', penyaluran.length);
}

function renderTable() {
  const tbody = document.getElementById('tbodyAudit');
  if (!tbody) return;
  tbody.innerHTML = penyaluran.map(p => {
    const st = STP[p.status] || STP.pending;
    const aksi = p.status === 'sudah_cair'
      ? `<span class="badge-readonly"><iconify-icon icon="solar:check-read-line-duotone" width="13"></iconify-icon>Terverifikasi</span>`
      : `<button class="btn-primary" data-verif="${p.id}" style="padding:7px 14px;font-size:12px">
           <iconify-icon icon="solar:shield-check-bold-duotone" width="14"></iconify-icon> Verifikasi
         </button>`;
    return `
    <tr>
      <td class="td-nama">${p.nama}</td>
      <td>${p.beasiswa}</td>
      <td class="td-dana">${formatRupiah(p.nominal)}</td>
      <td>${formatTgl(p.tanggal)}</td>
      <td><a href="#" data-bukti="${p.id}" style="color:var(--blue-600);font-weight:600;display:inline-flex;align-items:center;gap:4px">
        <iconify-icon icon="solar:document-bold-duotone" width="15"></iconify-icon>Lihat bukti</a></td>
      <td><span class="status-pill-sm ${st.cls}">${st.label}</span></td>
      <td>${aksi}</td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-verif]').forEach(b => b.addEventListener('click', () => {
    const p = penyaluran.find(x => x.id === b.dataset.verif);
    if (p) { p.status = 'sudah_cair'; renderStats(); renderTable(); }
  }));
  tbody.querySelectorAll('[data-bukti]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    alert('Pratinjau bukti transfer (prototipe). Integrasi storage bukti-transfer menampilkan file asli.');
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  initUserInfo();
  initBgCanvas();
  initParticles();
  renderStats();
  renderTable();

  const search = document.getElementById('searchInput');
  search && search.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#tbodyAudit tr').forEach(tr => {
      tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  console.log('🔍 auditTransfer.js (Wabag) loaded');
});
