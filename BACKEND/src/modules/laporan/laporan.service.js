import { supabaseAdmin } from '../../config/supabase.js'

// status_laporan enum (DATABASE/migrations/0000_baseline.sql): masuk | diproses | selesai
export const STATUS_MASUK = 'masuk'

const LAPORAN_SELECT = '*, beasiswa(nama_program)'

/** COMP-01: mahasiswa submits a complaint tied to their own account. */
export async function create(mahasiswaId, { beasiswaId, judul, deskripsi, kategori }) {
  const { data, error } = await supabaseAdmin
    .from('laporan_kendala')
    .insert({
      mahasiswa_id: mahasiswaId,
      beasiswa_id: beasiswaId ?? null,
      judul_laporan: judul,
      deskripsi,
      kategori,
      status: STATUS_MASUK,
    })
    .select(LAPORAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** A mahasiswa's own complaints. */
export async function listOwn(mahasiswaId) {
  const { data, error } = await supabaseAdmin
    .from('laporan_kendala')
    .select(LAPORAN_SELECT)
    .eq('mahasiswa_id', mahasiswaId)
    .order('tanggal_lapor', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** COMP-02: staff sees every complaint, across all students. */
export async function listAll() {
  const { data, error } = await supabaseAdmin
    .from('laporan_kendala')
    .select(`${LAPORAN_SELECT}, profiles!mahasiswa_id(nama_lengkap, nim_nip)`)
    .order('tanggal_lapor', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** COMP-02: staff updates status + responds. */
export async function resolve(laporanId, status, tanggapanStaff) {
  const updates = { status }
  if (tanggapanStaff !== undefined) updates.tanggapan_staff = tanggapanStaff

  const { data, error } = await supabaseAdmin
    .from('laporan_kendala')
    .update(updates)
    .eq('id', laporanId)
    .select(LAPORAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Laporan not found'), { status: 404 })
  return data
}
