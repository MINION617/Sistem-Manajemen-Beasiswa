/* ============================================================
   VERIFIKASI MAPPER — converts a raw GET /api/verifikasi row into
   the shape verifikasiPendaftar.js (staff) renders.
   ============================================================
   Load AFTER apiClient.js and BEFORE verifikasiPendaftar.js.

   NOTE: the note column staff writes on reject is `catatan_verifikasi`
   (pendaftaran table, migration 0001) — not `catatan_staff` (that
   belongs to hasil_seleksi, a later stage). Kept as `catatan_staff`
   here only so the existing frontend field name keeps working.

   `dokumen_pendaftaran` has no per-row status column — a row only
   exists once a document is actually uploaded, so every row mapped
   here is 'ada'. There is no way to show an expected-but-missing
   document from this table alone.
   ============================================================ */

function mapVerifikasiRow(row) {
  return {
    id: row.id,
    mahasiswa_id: row.mahasiswa_id,
    beasiswa_id: row.beasiswa_id,
    status: row.status,
    tanggal_daftar: row.tanggal_daftar,
    catatan_staff: row.catatan_verifikasi ?? null,
    mahasiswa: {
      nama_lengkap: row.profiles?.nama_lengkap ?? '—',
      nim_nip: row.profiles?.nim_nip ?? '—',
      program_studi: row.profiles?.program_studi ?? '—',
      ipk: row.profiles?.ipk ?? null,
    },
    beasiswa: {
      nama_program: row.beasiswa?.nama_program ?? '—',
      nominal_dana: row.beasiswa?.nominal_dana ?? 0,
      sponsors: { nama_perusahaan: row.beasiswa?.sponsors?.nama_perusahaan ?? '—' },
    },
    dokumen_pendaftaran: (row.dokumen_pendaftaran || []).map(d => ({
      id: d.id,
      jenis_dokumen: d.jenis_dokumen,
      file_url: d.file_url,
      status: 'ada',
    })),
  };
}
