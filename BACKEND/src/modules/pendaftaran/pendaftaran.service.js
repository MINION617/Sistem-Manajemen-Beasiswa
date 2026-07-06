import { supabaseAdmin } from '../../config/supabase.js'
import { notify } from '../notifikasi/notifikasi.service.js'

// status_pendaftaran enum (DATABASE/migrations/0000_baseline.sql):
export const STATUS_PENDING = 'menunggu_verifikasi'

const PENDAFTARAN_SELECT = `
  *,
  beasiswa(nama_program, nominal_dana, tanggal_tutup, sponsors(nama_perusahaan)),
  dokumen_pendaftaran(*)
`

/** APPL-02: mahasiswa applies to a beasiswa. One application per (mahasiswa, beasiswa). */
export async function create(mahasiswaId, beasiswaId, dokumen = []) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('pendaftaran')
    .select('id')
    .eq('mahasiswa_id', mahasiswaId)
    .eq('beasiswa_id', beasiswaId)
    .maybeSingle()

  if (existingError) throw Object.assign(new Error(existingError.message), { status: 502 })
  if (existing) throw Object.assign(new Error('Kamu sudah mendaftar beasiswa ini'), { status: 409 })

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .insert({ mahasiswa_id: mahasiswaId, beasiswa_id: beasiswaId, status: STATUS_PENDING })
    .select(PENDAFTARAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  if (dokumen.length) {
    const rows = dokumen.map((d) => ({
      pendaftaran_id: data.id,
      jenis_dokumen: d.jenisDokumen,
      file_path: d.filePath ?? null,
      file_url: d.fileUrl ?? null,
      ukuran_file: d.ukuranFile ?? null,
    }))
    const { error: dokError } = await supabaseAdmin.from('dokumen_pendaftaran').insert(rows)
    if (dokError) throw Object.assign(new Error(dokError.message), { status: 502 })
  }

  await notify(
    mahasiswaId,
    'Pendaftaran Terkirim',
    `Pendaftaran ${data.beasiswa?.nama_program ?? ''} kamu sudah masuk dan menunggu verifikasi berkas.`
  ).catch((err) => console.error('Failed to send pendaftaran notification:', err.message))

  return getById(data.id)
}

/** APPL-02/COMP-01 support: a mahasiswa's own applications, most recent first. */
export async function listOwn(mahasiswaId) {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_SELECT)
    .eq('mahasiswa_id', mahasiswaId)
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

export async function getById(pendaftaranId) {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_SELECT)
    .eq('id', pendaftaranId)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })
  return data
}
