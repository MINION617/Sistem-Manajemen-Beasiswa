/* ============================================================
   PENYALURAN MAPPER — converts a raw GET /api/penyaluran row into a
   canonical shape used by pencairanDana.js (staff) and dashboardWabag.js.
   ============================================================
   Load AFTER apiClient.js and BEFORE a page's own script.

   NOTE: `penyaluran_dana` only has id, pendaftaran_id, nominal,
   bukti_transfer_url, status, tanggal_pencairan, diverifikasi_oleh,
   created_at (see DATABASE/migrations/0000_baseline.sql). Fields the old
   dummy data assumed — periode_bulan, no_rekening_tujuan, bank_tujuan,
   no_referensi, catatan, profiles.no_rekening — don't exist in the real
   schema, so they map to null instead of being fabricated.
   ============================================================ */

function mapPenyaluranRow(row) {
  return {
    id: row.id,
    pendaftaran_id: row.pendaftaran?.id ?? row.pendaftaran_id,
    nominal: row.nominal,
    bukti_transfer_url: row.bukti_transfer_url,
    status: row.status,
    tanggal_pencairan: row.tanggal_pencairan,
    created_at: row.created_at,
    periode_bulan: null,
    no_rekening_tujuan: null,
    bank_tujuan: null,
    no_referensi: null,
    catatan: null,
    mahasiswa: {
      nama_lengkap: row.pendaftaran?.profiles?.nama_lengkap ?? null,
      nim_nip: row.pendaftaran?.profiles?.nim_nip ?? null,
      program_studi: null,
      no_rekening: null,
    },
    beasiswa: {
      nama_program: row.pendaftaran?.beasiswa?.nama_program ?? null,
      nominal_dana: row.nominal,
      sponsors: { nama_perusahaan: row.pendaftaran?.beasiswa?.sponsors?.nama_perusahaan ?? null },
    },
  };
}
