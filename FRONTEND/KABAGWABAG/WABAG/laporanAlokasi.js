/* ============================================================
   LAPORANALOKASI.JS — Wabag (FIN-02)
   Laporan alokasi dana beasiswa per sponsor. Prototype dummy data.
   ============================================================ */

const sponsorAlokasi = [
  { sponsor: 'Bank Mandiri',       penerima: 25, dana: 125000000 },
  { sponsor: 'Pertamina',          penerima: 15, dana: 112500000 },
  { sponsor: 'Telkom Indonesia',   penerima: 20, dana:  90000000 },
  { sponsor: 'Astra International', penerima: 12, dana: 120000000 },
  { sponsor: 'BCA',                penerima: 18, dana:  99000000 },
  { sponsor: 'Djarum Foundation',  penerima: 30, dana: 120000000 },
];

function renderAlokasi() {
  const total = sponsorAlokasi.reduce((a, s) => a + s.dana, 0);
  const totPenerima = sponsorAlokasi.reduce((a, s) => a + s.penerima, 0);

  setEl('statTotalDana', formatRupiah(total));
  setEl('statSponsor', sponsorAlokasi.length);
  setEl('statPenerima', totPenerima);

  const tbody = document.getElementById('tbodyAlokasi');
  if (!tbody) return;
  tbody.innerHTML = sponsorAlokasi
    .slice()
    .sort((a, b) => b.dana - a.dana)
    .map(s => {
      const pct = total ? (s.dana / total * 100) : 0;
      return `
      <tr>
        <td class="td-nama">
          <iconify-icon icon="solar:buildings-2-bold-duotone" width="16" style="color:#2563eb;vertical-align:middle;margin-right:6px"></iconify-icon>
          ${s.sponsor}
        </td>
        <td>${s.penerima} orang</td>
        <td class="td-dana">${formatRupiah(s.dana)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="flex:1;max-width:160px;height:8px;background:var(--blue-50);border-radius:100px;overflow:hidden">
              <div style="height:100%;width:${pct.toFixed(1)}%;background:linear-gradient(90deg,var(--blue-500),var(--blue-700));border-radius:100px"></div>
            </div>
            <span style="font-weight:700;color:var(--blue-700);font-size:12px">${pct.toFixed(1)}%</span>
          </div>
        </td>
      </tr>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initUserInfo();
  initBgCanvas();
  initParticles();
  renderAlokasi();

  const btn = document.getElementById('btnEkspor');
  btn && btn.addEventListener('click', () => alert('Ekspor laporan alokasi dana (prototipe) — fitur ekspor akan tersedia setelah integrasi laporan.'));

  const search = document.getElementById('searchInput');
  search && search.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#tbodyAlokasi tr').forEach(tr => {
      tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
  console.log('💵 laporanAlokasi.js (Wabag) loaded');
});
