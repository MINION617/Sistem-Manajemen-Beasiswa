import { supabaseAdmin } from '../../config/supabase.js'
import { notify } from '../notifikasi/notifikasi.service.js'

// status_penerima enum (DATABASE/migrations/0000_baseline.sql):
export const STATUS_DIUSULKAN = 'diusulkan'
export const STATUS_DISAHKAN = 'disahkan'
export const STATUS_DIBATALKAN = 'dibatalkan'

const PENERIMA_SELECT = `
  *,
  pendaftaran(
    id, mahasiswa_id, status,
    profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi),
    beasiswa(nama_program, nominal_dana, sponsors(nama_perusahaan))
  )
`

/** SELE-02: staff proposes a pendaftaran (already lolos_final) as a recipient. */
export async function propose(pendaftaranId, staffId) {
  const { data, error } = await supabaseAdmin
    .from('penerima_beasiswa')
    .insert({ pendaftaran_id: pendaftaranId, status: STATUS_DIUSULKAN, diusulkan_oleh: staffId })
    .select(PENERIMA_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** SELE-02/MGMT: Kabag ratifies a proposed recipient in the plenary decision. */
export async function approve(penerimaId, kabagId) {
  const { data, error } = await supabaseAdmin
    .from('penerima_beasiswa')
    .update({ status: STATUS_DISAHKAN, disahkan_oleh: kabagId, tanggal_acc: new Date().toISOString() })
    .eq('id', penerimaId)
    .select(PENERIMA_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Penerima not found'), { status: 404 })

  const mahasiswaId = data.pendaftaran?.mahasiswa_id
  const namaProgram = data.pendaftaran?.beasiswa?.nama_program ?? ''
  if (mahasiswaId) {
    await notify(
      mahasiswaId,
      'Kamu Ditetapkan Sebagai Penerima Beasiswa',
      `Selamat! Kamu ditetapkan sebagai penerima ${namaProgram}.`
    ).catch((err) => console.error('Failed to send penerima notification:', err.message))
  }

  return data
}

/** Kabag cancels a proposal (e.g. plenary decided against it). */
export async function cancel(penerimaId) {
  const { data, error } = await supabaseAdmin
    .from('penerima_beasiswa')
    .update({ status: STATUS_DIBATALKAN })
    .eq('id', penerimaId)
    .select(PENERIMA_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Penerima not found'), { status: 404 })
  return data
}

/** PAY-02: final recipient list, optionally filtered by status. */
export async function list(status) {
  let query = supabaseAdmin.from('penerima_beasiswa').select(PENERIMA_SELECT)
  if (status) query = query.eq('status', status)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}
