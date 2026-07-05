import { supabaseAdmin } from '../../config/supabase.js'
import { notify } from '../notifikasi/notifikasi.service.js'

const PENDAFTARAN_SELECT = `
  *,
  profiles!mahasiswa_id(nama_lengkap, nim_nip, ipk, program_studi),
  beasiswa(nama_program, nominal_dana, sponsors(nama_perusahaan)),
  hasil_seleksi(*)
`

/** SELE-01: applications ready for test/interview score entry. */
export async function listAntrean() {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_SELECT)
    .in('status', ['lolos_berkas', 'wawancara'])
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/**
 * SELE-01: staff records/updates test+interview scores (including the
 * structured trait scores used by the Kabag recommendation feature).
 * `hasil_seleksi` has no unique constraint on `pendaftaran_id`, so this is a
 * manual select-then-insert-or-update rather than a Supabase `.upsert()`.
 * When `nilai_tes` is entered for the first time while status is still
 * `lolos_berkas`, the application moves to `wawancara` (mirrors the staff
 * workflow already documented in the frontend).
 */
export async function upsertHasil(pendaftaranId, payload) {
  const { data: pendaftaran, error: pendaftaranError } = await supabaseAdmin
    .from('pendaftaran')
    .select('id, status, mahasiswa_id')
    .eq('id', pendaftaranId)
    .single()

  if (pendaftaranError) throw Object.assign(new Error(pendaftaranError.message), { status: 502 })
  if (!pendaftaran) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('hasil_seleksi')
    .select('*')
    .eq('pendaftaran_id', pendaftaranId)
    .maybeSingle()

  if (existingError) throw Object.assign(new Error(existingError.message), { status: 502 })

  const isFirstNilaiTes = payload.nilai_tes != null && existing?.nilai_tes == null

  if (existing) {
    const { error } = await supabaseAdmin
      .from('hasil_seleksi')
      .update(payload)
      .eq('id', existing.id)
    if (error) throw Object.assign(new Error(error.message), { status: 502 })
  } else {
    const { error } = await supabaseAdmin
      .from('hasil_seleksi')
      .insert({ pendaftaran_id: pendaftaranId, ...payload })
    if (error) throw Object.assign(new Error(error.message), { status: 502 })
  }

  if (isFirstNilaiTes && pendaftaran.status === 'lolos_berkas') {
    const { error } = await supabaseAdmin
      .from('pendaftaran')
      .update({ status: 'wawancara' })
      .eq('id', pendaftaranId)
    if (error) throw Object.assign(new Error(error.message), { status: 502 })

    await notify(
      pendaftaran.mahasiswa_id,
      'Lanjut ke Tahap Wawancara',
      'Nilai tes kamu sudah diinput. Pendaftaran kamu lanjut ke tahap wawancara.'
    ).catch((err) => console.error('Failed to send seleksi notification:', err.message))
  }

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_SELECT)
    .eq('id', pendaftaranId)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}
