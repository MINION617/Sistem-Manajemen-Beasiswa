import { supabaseAdmin } from '../../config/supabase.js'
import { notify } from '../notifikasi/notifikasi.service.js'

// status_pendaftaran enum (DATABASE/migrations/0000_baseline.sql) — tahap
// yang relevan untuk seleksi (tes tertulis + wawancara):
const STATUS_LOLOS_BERKAS = 'lolos_berkas'
const STATUS_WAWANCARA = 'wawancara'

const PESERTA_SELECT = `
  id, mahasiswa_id, beasiswa_id, status, tanggal_daftar,
  mahasiswa:profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi, ipk),
  beasiswa(nama_program, nominal_dana, sponsors(nama_perusahaan)),
  hasil_seleksi(*)
`

/** hasil_seleksi tidak unik per pendaftaran_id di skema, jadi Supabase
 * mengembalikannya sebagai array — di sini diratakan jadi objek tunggal
 * (atau null) supaya sesuai bentuk yang dipakai frontend. */
function flattenHasilSeleksi(row) {
  const hasil = Array.isArray(row.hasil_seleksi) ? row.hasil_seleksi[0] ?? null : row.hasil_seleksi
  return { ...row, hasil_seleksi: hasil }
}

/** SELE-01: daftar peserta yang sedang di tahap tes/wawancara. */
export async function listActive() {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PESERTA_SELECT)
    .in('status', [STATUS_LOLOS_BERKAS, STATUS_WAWANCARA])
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data.map(flattenHasilSeleksi)
}

/**
 * SELE-01: staff menyimpan nilai tes/wawancara. Upsert manual (bukan
 * supabase .upsert()) karena constraint unik belum ada di kolom
 * pendaftaran_id — insert kalau belum ada baris, update kalau sudah.
 * Hanya field yang dikirim yang ditulis, supaya kolom skor lain yang
 * sudah terisi (nilai_kepemimpinan, dll — belum dipakai UI mana pun)
 * tidak ikut tertimpa null.
 */
export async function upsertNilai(pendaftaranId, { nilaiTes, nilaiWawancara, catatanStaff }) {
  const patch = {}
  if (nilaiTes !== undefined) patch.nilai_tes = nilaiTes
  if (nilaiWawancara !== undefined) patch.nilai_wawancara = nilaiWawancara
  if (catatanStaff !== undefined) patch.catatan_staff = catatanStaff

  const { data: existing, error: findError } = await supabaseAdmin
    .from('hasil_seleksi')
    .select('id')
    .eq('pendaftaran_id', pendaftaranId)
    .maybeSingle()

  if (findError) throw Object.assign(new Error(findError.message), { status: 502 })

  const { error: writeError } = existing
    ? await supabaseAdmin.from('hasil_seleksi').update(patch).eq('id', existing.id)
    : await supabaseAdmin.from('hasil_seleksi').insert({ pendaftaran_id: pendaftaranId, ...patch })

  if (writeError) throw Object.assign(new Error(writeError.message), { status: 502 })

  // Alur nilai (lihat inputHasilSeleksi.js): begitu nilai tes pertama kali
  // diisi, pendaftaran otomatis naik tahap ke wawancara.
  if (nilaiTes !== undefined && nilaiTes !== null) {
    const { data: pendaftaran, error: pendaftaranError } = await supabaseAdmin
      .from('pendaftaran')
      .select('status, mahasiswa_id, beasiswa(nama_program)')
      .eq('id', pendaftaranId)
      .single()

    if (pendaftaranError) throw Object.assign(new Error(pendaftaranError.message), { status: 502 })

    if (pendaftaran?.status === STATUS_LOLOS_BERKAS) {
      const { error: statusError } = await supabaseAdmin
        .from('pendaftaran')
        .update({ status: STATUS_WAWANCARA })
        .eq('id', pendaftaranId)

      if (statusError) throw Object.assign(new Error(statusError.message), { status: 502 })

      await notify(
        pendaftaran.mahasiswa_id,
        'Lolos ke Tahap Wawancara',
        `Kamu lolos tes tertulis untuk ${pendaftaran.beasiswa?.nama_program ?? ''} dan lanjut ke tahap wawancara.`
      ).catch((err) => console.error('Failed to send seleksi notification:', err.message))
    }
  }

  return getOne(pendaftaranId)
}

export async function getOne(pendaftaranId) {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PESERTA_SELECT)
    .eq('id', pendaftaranId)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })
  return flattenHasilSeleksi(data)
}
