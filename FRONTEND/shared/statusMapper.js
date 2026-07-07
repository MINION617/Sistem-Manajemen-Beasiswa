/* ============================================================
   STATUS MAPPER — converts a raw GET /api/status/saya row into the
   canonical shape the mahasiswa pages (dashboard, pendaftaranSaya,
   historyBeasiswa) already render.
   ============================================================
   Load AFTER apiClient.js and BEFORE a page's own script:
     <script src="../shared/apiClient.js"></script>
     <script src="../shared/statusMapper.js"></script>
     <script src="dashboard.js"></script>

   NOTE: `pendaftaran` has no per-step history table in the DB — only
   the current `status` + `tanggal_daftar` + `catatan_verifikasi`
   (see DATABASE/migrations/0000_baseline.sql, 0001_add_pendaftaran_catatan_verifikasi.sql).
   The timeline below only includes real data points; it does not
   invent dates/notes for stage transitions the DB never recorded.
   ============================================================ */

const STATUS_ICON_MAP = {
  menunggu_verifikasi: { icon: 'solar:clock-circle-bold-duotone',   iconColor: '#d97706' },
  ditolak_berkas:      { icon: 'solar:close-circle-bold-duotone',   iconColor: '#be123c' },
  lolos_berkas:        { icon: 'solar:folder-check-bold-duotone',   iconColor: '#2563eb' },
  wawancara:           { icon: 'solar:microphone-bold-duotone',     iconColor: '#7c3aed' },
  lolos_final:         { icon: 'solar:cup-star-bold-duotone',       iconColor: '#059669' },
  tidak_lolos_final:   { icon: 'solar:close-circle-bold-duotone',   iconColor: '#be123c' },
};

function fileNameFromUrl(url) {
  if (!url) return 'dokumen';
  const clean = url.split('?')[0];
  return clean.substring(clean.lastIndexOf('/') + 1) || 'dokumen';
}

function mapPendaftaranRow(row) {
  const iconCfg = STATUS_ICON_MAP[row.status] || STATUS_ICON_MAP.menunggu_verifikasi;
  const hasilSeleksi = Array.isArray(row.hasil_seleksi) ? row.hasil_seleksi[0] || null : row.hasil_seleksi || null;
  const penyaluranDana = Array.isArray(row.penyaluran_dana) ? row.penyaluran_dana[0] || null : row.penyaluran_dana || null;

  const dokumen = (row.dokumen_pendaftaran || []).map(dok => ({
    jenis_dokumen: dok.jenis_dokumen,
    file_url: dok.file_url,
    nama_file: fileNameFromUrl(dok.file_url || dok.file_path),
    status: 'uploaded',
  }));

  const timeline = [
    { step: 'menunggu_verifikasi', tanggal: row.tanggal_daftar, catatan: 'Pendaftaran diterima sistem.' },
  ];
  if (row.status === 'ditolak_berkas') {
    timeline.push({
      step: 'ditolak_berkas',
      tanggal: row.tanggal_daftar,
      catatan: row.catatan_verifikasi || 'Berkas ditolak.',
    });
  }
  if (hasilSeleksi) {
    timeline.push({
      step: row.status,
      tanggal: hasilSeleksi.created_at,
      catatan: hasilSeleksi.catatan_staff || 'Hasil seleksi tercatat.',
    });
  }

  return {
    id: row.id,
    status: row.status,
    tanggal_daftar: row.tanggal_daftar,
    beasiswa: {
      nama_program: row.beasiswa?.nama_program,
      nominal_dana: row.beasiswa?.nominal_dana,
      tanggal_tes_wawancara: row.beasiswa?.tanggal_tes_wawancara || null,
      tanggal_penetapan: row.beasiswa?.tanggal_penetapan || null,
      sponsors: { nama_perusahaan: row.beasiswa?.sponsors?.nama_perusahaan },
    },
    icon: iconCfg.icon,
    iconColor: iconCfg.iconColor,
    iconBg: iconCfg.iconColor + '1a',
    bg: iconCfg.iconColor + '1a',
    hasil_seleksi: hasilSeleksi,
    dokumen,
    penyaluran_dana: penyaluranDana,
    timeline,
  };
}
