import { supabaseAdmin } from '../../config/supabase.js'

// TODO(schema): confirm these against the real Postgres enum once DATABASE/schema.sql
// is dumped from the live Supabase project (Phase 2 stabilization, step S2). Values below
// mirror backend/supabaseclient.js, which is the closest thing to a source of truth today.
export const STATUS_PENDING = 'menunggu_verifikasi'
export const STATUS_VERIFIED = 'diverifikasi'
export const STATUS_REJECTED = 'ditolak'

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
 * so the decision stays auditable (see AGENTS.md working rules).
 */
export async function decide(pendaftaranId, decision, alasan) {
  const newStatus = decision === 'verified' ? STATUS_VERIFIED : STATUS_REJECTED

  const updates = { status: newStatus }
  if (decision === 'rejected') {
    updates.alasan_penolakan = alasan
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
