import { supabaseAdmin } from '../../config/supabase.js'

/** FIN-01: total disbursed funds + counts per disbursement status. */
export async function getDashboard() {
  const { data: rows, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .select('nominal, status')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const totalDisbursed = rows
    .filter((r) => r.status === 'sudah_cair')
    .reduce((sum, r) => sum + Number(r.nominal || 0), 0)

  const perStatus = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  return { totalDisbursed, perStatus }
}

/**
 * FIN-02: sponsor-based fund allocation report. Aggregated in JS (same
 * approach as modules/kabag) since the query builder doesn't do SQL
 * group-by directly — fine at this data scale.
 */
export async function getAlokasiSponsor() {
  const { data: rows, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .select('nominal, status, pendaftaran(beasiswa(sponsors(id, nama_perusahaan)))')
    .eq('status', 'sudah_cair')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const bySponsor = new Map()
  for (const row of rows) {
    const sponsor = row.pendaftaran?.beasiswa?.sponsors
    if (!sponsor) continue
    const entry = bySponsor.get(sponsor.id) || { sponsorId: sponsor.id, namaPerusahaan: sponsor.nama_perusahaan, total: 0 }
    entry.total += Number(row.nominal || 0)
    bySponsor.set(sponsor.id, entry)
  }

  return Array.from(bySponsor.values()).sort((a, b) => b.total - a.total)
}
