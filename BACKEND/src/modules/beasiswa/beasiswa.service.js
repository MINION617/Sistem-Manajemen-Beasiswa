import { supabaseAdmin } from '../../config/supabase.js'

const BEASISWA_SELECT = '*, sponsors(id, nama_perusahaan, jenis_industri, warna)'

/** APPL-01: mahasiswa browses open scholarship programs; staff sees all statuses. */
export async function list({ status, kategori, sponsorId } = {}) {
  let query = supabaseAdmin.from('beasiswa').select(BEASISWA_SELECT)
  if (status) query = query.eq('status', status)
  if (kategori) query = query.eq('kategori', kategori)
  if (sponsorId) query = query.eq('sponsor_id', sponsorId)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

export async function getById(beasiswaId) {
  const { data, error } = await supabaseAdmin
    .from('beasiswa')
    .select(BEASISWA_SELECT)
    .eq('id', beasiswaId)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Beasiswa not found'), { status: 404 })
  return data
}

/** SCHL-01: staff creates a new scholarship program. */
export async function create(payload) {
  const { data, error } = await supabaseAdmin
    .from('beasiswa')
    .insert(payload)
    .select(BEASISWA_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** SCHL-01: staff edits a program, or closes it via `status`. */
export async function update(beasiswaId, payload) {
  const { data, error } = await supabaseAdmin
    .from('beasiswa')
    .update(payload)
    .eq('id', beasiswaId)
    .select(BEASISWA_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Beasiswa not found'), { status: 404 })
  return data
}
