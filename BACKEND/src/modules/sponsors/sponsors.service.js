import { supabaseAdmin } from '../../config/supabase.js'

/** SPON-01: list sponsors (mahasiswa/staff read; used for the beasiswa catalogue too). */
export async function list({ aktif } = {}) {
  let query = supabaseAdmin.from('sponsors').select('*')
  if (aktif !== undefined) query = query.eq('is_aktif', aktif)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/**
 * kumpulanPerusahaanBeasiswa / profilPerusahaanBeasiswa: real aggregate
 * counts per sponsor — jumlahProgram/totalKuota (from beasiswa),
 * penerimaAktif (ratified penerima_beasiswa rows), totalDanaDisalurkan (sum
 * of disbursed penyaluran_dana). Sequential lookups rather than a single
 * join query, matching the rest of this codebase's style.
 */
export async function getStats(sponsorId) {
  const { data: programs, error: programsError } = await supabaseAdmin
    .from('beasiswa')
    .select('id, kuota')
    .eq('sponsor_id', sponsorId)
  if (programsError) throw Object.assign(new Error(programsError.message), { status: 502 })

  const jumlahProgram = programs.length
  const totalKuota = programs.reduce((sum, p) => sum + (p.kuota || 0), 0)
  const beasiswaIds = programs.map((p) => p.id)

  if (!beasiswaIds.length) {
    return { jumlahProgram, totalKuota, penerimaAktif: 0, totalDanaDisalurkan: 0 }
  }

  const { data: pendaftaranRows, error: pendaftaranError } = await supabaseAdmin
    .from('pendaftaran')
    .select('id')
    .in('beasiswa_id', beasiswaIds)
  if (pendaftaranError) throw Object.assign(new Error(pendaftaranError.message), { status: 502 })

  const pendaftaranIds = pendaftaranRows.map((p) => p.id)
  if (!pendaftaranIds.length) {
    return { jumlahProgram, totalKuota, penerimaAktif: 0, totalDanaDisalurkan: 0 }
  }

  const { count: penerimaAktif, error: penerimaError } = await supabaseAdmin
    .from('penerima_beasiswa')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'disahkan')
    .in('pendaftaran_id', pendaftaranIds)
  if (penerimaError) throw Object.assign(new Error(penerimaError.message), { status: 502 })

  const { data: penyaluranRows, error: penyaluranError } = await supabaseAdmin
    .from('penyaluran_dana')
    .select('nominal')
    .eq('status', 'sudah_cair')
    .in('pendaftaran_id', pendaftaranIds)
  if (penyaluranError) throw Object.assign(new Error(penyaluranError.message), { status: 502 })

  const totalDanaDisalurkan = penyaluranRows.reduce((sum, p) => sum + (p.nominal || 0), 0)

  return { jumlahProgram, totalKuota, penerimaAktif: penerimaAktif ?? 0, totalDanaDisalurkan }
}

export async function getById(sponsorId) {
  const { data, error } = await supabaseAdmin
    .from('sponsors')
    .select('*')
    .eq('id', sponsorId)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Sponsor not found'), { status: 404 })
  return data
}

/** SPON-01: staff onboards a new sponsor. */
export async function create(payload) {
  const { data, error } = await supabaseAdmin
    .from('sponsors')
    .insert(payload)
    .select()
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** SPON-01: staff edits a sponsor, or deactivates it via `is_aktif` (no hard delete —
 * sponsors are referenced by beasiswa rows). */
export async function update(sponsorId, payload) {
  const { data, error } = await supabaseAdmin
    .from('sponsors')
    .update(payload)
    .eq('id', sponsorId)
    .select()
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Sponsor not found'), { status: 404 })
  return data
}
