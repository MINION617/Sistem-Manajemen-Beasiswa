import { supabaseAdmin } from '../../config/supabase.js'
import { notify } from '../notifikasi/notifikasi.service.js'

// Status flow — confirmed against the live status_pendaftaran enum
// (DATABASE/migrations/0000_baseline.sql):
//   menunggu_verifikasi -> lolos_berkas | ditolak_berkas -> wawancara -> lolos_final | tidak_lolos_final
export const STATUS_PENDING = 'menunggu_verifikasi'
export const STATUS_VERIFIED = 'lolos_berkas'
export const STATUS_REJECTED = 'ditolak_berkas'

const PENDAFTARAN_SELECT = `
  *,
  profiles!mahasiswa_id(nama_lengkap, nim_nip, ipk, program_studi),
  beasiswa(nama_program, sponsors(nama_perusahaan)),
  dokumen_pendaftaran(*),
  hasil_seleksi(*)
`

/** List applications awaiting document verification. */
export async function listAntrean() {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_SELECT)
    .eq('status', STATUS_PENDING)
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** Full history (all statuses) for the staff verification page's tabs (Semua/Lolos/Ditolak). */
export async function listAll() {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_SELECT)
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/**
 * Move an application to Verified or Rejected. `alasan` is required for rejections
 * so the decision stays auditable (see AGENTS.md working rules). Written to
 * `catatan_verifikasi`, added by DATABASE/migrations/0001_add_pendaftaran_catatan_verifikasi.sql
 * — the baseline `pendaftaran` table has no notes column of its own
 * (`hasil_seleksi.catatan_staff` belongs to a later stage of the workflow).
 */
export async function decide(pendaftaranId, decision, alasan) {
  const newStatus = decision === 'verified' ? STATUS_VERIFIED : STATUS_REJECTED

  const updates = { status: newStatus }
  if (decision === 'rejected') {
    updates.catatan_verifikasi = alasan
  }

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .update(updates)
    .eq('id', pendaftaranId)
    .select(PENDAFTARAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })

  const judul = decision === 'verified' ? 'Berkas Diverifikasi' : 'Berkas Ditolak'
  const pesan =
    decision === 'verified'
      ? `Berkas pendaftaran ${data.beasiswa?.nama_program ?? ''} kamu lolos verifikasi.`
      : `Berkas pendaftaran ${data.beasiswa?.nama_program ?? ''} kamu ditolak. Alasan: ${alasan}`
  // Best-effort: a failed notification shouldn't roll back a verification decision
  // that already succeeded. Logged, not thrown.
  await notify(data.mahasiswa_id, judul, pesan).catch((err) =>
    console.error('Failed to send verifikasi notification:', err.message)
  )

  return data
}
