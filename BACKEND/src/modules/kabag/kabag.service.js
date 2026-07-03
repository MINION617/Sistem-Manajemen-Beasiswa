import { supabaseAdmin } from '../../config/supabase.js'

/**
 * MGMT-01: applicant counts per status + total active applicants, for the
 * Kabag dashboard. One query per status count — pendaftaran rows are not
 * expected to be large enough in this system to warrant a single grouped
 * aggregate RPC yet; revisit if that changes.
 */
export async function getStatistik() {
  const { data: rows, error } = await supabaseAdmin.from('pendaftaran').select('status')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const perStatus = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  return {
    total: rows.length,
    perStatus,
  }
}

/** MGMT-01: realtime applicant list for the active cycle, most recent first. */
export async function listApplicants() {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(`
      id, status, tanggal_daftar,
      profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi),
      beasiswa(nama_program, sponsors(nama_perusahaan))
    `)
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}
