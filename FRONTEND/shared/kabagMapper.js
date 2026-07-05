/* ============================================================
   KABAG MAPPER — converts raw GET /api/kabag/pendaftar rows into the
   shape dashboardKabag.js renders (Top Nilai, pipeline).
   ============================================================
   Load AFTER apiClient.js and BEFORE dashboardKabag.js.
   ============================================================ */

function mapKabagApplicantRow(row) {
  const hasilSeleksi = Array.isArray(row.hasil_seleksi) ? row.hasil_seleksi[0] || null : row.hasil_seleksi || null;

  return {
    id: row.id,
    beasiswa_id: row.beasiswa_id,
    nama: row.profiles?.nama_lengkap || '—',
    nim: row.profiles?.nim_nip || '—',
    beasiswa: row.beasiswa?.nama_program || '—',
    nilai_tes: hasilSeleksi?.nilai_tes ?? null,
    nilai_wawancara: hasilSeleksi?.nilai_wawancara ?? null,
    ipk: row.profiles?.ipk ?? null,
    status: row.status,
    tgl: row.tanggal_daftar,
  };
}
