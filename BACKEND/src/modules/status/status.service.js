import { supabaseAdmin } from '../../config/supabase.js'

const PENDAFTARAN_STATUS_SELECT = `
  *,
  beasiswa(nama_program, nominal_dana, tanggal_tes_wawancara, tanggal_penetapan, sponsors(nama_perusahaan)),
  dokumen_pendaftaran(*),
  hasil_seleksi(*),
  penerima_beasiswa(*),
  penyaluran_dana(*)
`

/**
 * A mahasiswa's own applications with full status/disbursement context
 * (STAT-01: selection status, STAT-02: disbursement status).
 */
export async function listMyPendaftaran(mahasiswaId) {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_STATUS_SELECT)
    .eq('mahasiswa_id', mahasiswaId)
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}
