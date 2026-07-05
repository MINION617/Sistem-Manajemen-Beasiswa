/* ============================================================
   SELEKSI MAPPER — converts a raw GET /api/seleksi/antrean row into the
   shape inputHasilSeleksi.js renders.
   ============================================================
   Load AFTER apiClient.js and BEFORE inputHasilSeleksi.js.

   NOTE: there is no `jadwal_wawancara` column in the real schema (the old
   dummy data invented one) — it's dropped here rather than fabricated.
   ============================================================ */

function mapSeleksiRow(row) {
  const hasilSeleksi = Array.isArray(row.hasil_seleksi) ? row.hasil_seleksi[0] || null : row.hasil_seleksi || null;

  return {
    id: row.id,
    mahasiswa_id: row.mahasiswa_id,
    beasiswa_id: row.beasiswa_id,
    status: row.status,
    tanggal_daftar: row.tanggal_daftar,
    mahasiswa: {
      nama_lengkap: row.profiles?.nama_lengkap || null,
      nim_nip: row.profiles?.nim_nip || null,
      program_studi: row.profiles?.program_studi || null,
      ipk: row.profiles?.ipk ?? null,
    },
    beasiswa: {
      nama_program: row.beasiswa?.nama_program || null,
      nominal_dana: row.beasiswa?.nominal_dana ?? null,
      sponsors: { nama_perusahaan: row.beasiswa?.sponsors?.nama_perusahaan || null },
    },
    hasil_seleksi: {
      nilai_tes: hasilSeleksi?.nilai_tes ?? null,
      nilai_wawancara: hasilSeleksi?.nilai_wawancara ?? null,
      catatan_staff: hasilSeleksi?.catatan_staff ?? null,
      catatan_prestasi: hasilSeleksi?.catatan_prestasi ?? null,
      nilai_kerja_keras: hasilSeleksi?.nilai_kerja_keras ?? null,
      nilai_kepemimpinan: hasilSeleksi?.nilai_kepemimpinan ?? null,
      nilai_komunikasi: hasilSeleksi?.nilai_komunikasi ?? null,
      nilai_keberanian: hasilSeleksi?.nilai_keberanian ?? null,
      skor_prestasi_akademik: hasilSeleksi?.skor_prestasi_akademik ?? null,
    },
  };
}
