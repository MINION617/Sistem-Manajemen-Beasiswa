import { supabaseAdmin } from '../../config/supabase.js'

/** SPON-01: list sponsors (mahasiswa/staff read; used for the beasiswa catalogue too). */
export async function list({ aktif } = {}) {
  let query = supabaseAdmin.from('sponsors').select('*')
  if (aktif !== undefined) query = query.eq('is_aktif', aktif)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
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
