import { supabaseAdmin } from '../../config/supabase.js'

// Status flow corroborated across 3 frontend files (verifikasiPendaftar.js,
// penetapanPenerima.js, pendaftaranSaya.js — see DATABASE/SCHEMA_NOTES.md):
//   menunggu_verifikasi -> lolos_berkas | ditolak_berkas -> wawancara -> lolos_final | tidak_lolos_final
// Still unverified against a real schema dump (Phase 2 stabilization step S2).
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

/**
 * Move an application to Verified or Rejected. `alasan` is required for rejections
 * so the decision stays auditable (see AGENTS.md working rules). There is no dedicated
 * rejection-reason column — `catatan_staff` is the one staff-facing note field reused
 * at every stage of the pendaftaran workflow (see DATABASE/SCHEMA_NOTES.md).
 */
export async function decide(pendaftaranId, decision, alasan) {
  const newStatus = decision === 'verified' ? STATUS_VERIFIED : STATUS_REJECTED

  const updates = { status: newStatus }
  if (decision === 'rejected') {
    updates.catatan_staff = alasan
  }

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .update(updates)
    .eq('id', pendaftaranId)
    .select(PENDAFTARAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })

  // Seam for NOTF-01 (Phase 2 milestone 2C): insert a `notifikasi` row here once that
  // module lands, so students get realtime updates on verification decisions.

  return data
}
