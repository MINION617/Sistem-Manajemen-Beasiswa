import { supabaseAdmin } from '../../config/supabase.js'
import { notify } from '../notifikasi/notifikasi.service.js'

// status_penyaluran enum (DATABASE/migrations/0000_baseline.sql):
export const STATUS_PENDING = 'pending'
export const STATUS_SEDANG_DIPROSES = 'sedang_diproses'
export const STATUS_SUDAH_CAIR = 'sudah_cair'

const PENYALURAN_SELECT = `
  *,
  pendaftaran(
    id, mahasiswa_id,
    profiles!mahasiswa_id(nama_lengkap, nim_nip),
    beasiswa(nama_program, sponsors(nama_perusahaan))
  )
`

/**
 * Auto-creates a pending disbursement record the moment Kabag ratifies a
 * recipient (see penerima.service.js's approve()) — mirrors the
 * find-then-insert pattern in penerima.service.js's propose(), so a
 * double-click/retry doesn't create duplicate pending rows for the same
 * pendaftaran. No transfer proof yet at this point (money hasn't moved),
 * so bukti_transfer_url starts null — staff attaches it later via
 * PATCH /:penyaluranId (update()).
 */
export async function ensurePending(pendaftaranId, nominal) {
  const { data: existing, error: findError } = await supabaseAdmin
    .from('penyaluran_dana')
    .select(PENYALURAN_SELECT)
    .eq('pendaftaran_id', pendaftaranId)
    .maybeSingle()

  if (findError) throw Object.assign(new Error(findError.message), { status: 502 })
  if (existing) return existing

  const { data, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .insert({ pendaftaran_id: pendaftaranId, nominal, status: STATUS_PENDING })
    .select(PENYALURAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/**
 * Staff updates a disbursement's editable fields (nominal, transfer proof,
 * status) — the "Upload Bukti Transfer" form's write path. Previously this
 * form only mutated frontend-local state and never reached the database
 * (PencairanDana/pencairanDana.js's submit handler had no real-session
 * branch at all), so nothing staff entered here was ever persisted.
 * Setting status to sudah_cair here also stamps tanggal_pencairan and
 * notifies the recipient, matching markPaid()'s behavior.
 */
export async function update(penyaluranId, { nominal, buktiTransferUrl, status }) {
  const patch = {}
  if (nominal !== undefined) patch.nominal = nominal
  if (buktiTransferUrl !== undefined) patch.bukti_transfer_url = buktiTransferUrl
  if (status !== undefined) {
    patch.status = status
    if (status === STATUS_SUDAH_CAIR) patch.tanggal_pencairan = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .update(patch)
    .eq('id', penyaluranId)
    .select(PENYALURAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Penyaluran not found'), { status: 404 })

  if (status === STATUS_SUDAH_CAIR) {
    const mahasiswaId = data.pendaftaran?.mahasiswa_id
    if (mahasiswaId) {
      await notify(
        mahasiswaId,
        'Dana Beasiswa Sudah Cair',
        `Dana sebesar Rp${Number(data.nominal).toLocaleString('id-ID')} sudah ditransfer.`
      ).catch((err) => console.error('Failed to send penyaluran notification:', err.message))
    }
  }

  return data
}

/**
 * PAY-01: staff records a disbursement with transfer proof. Only allowed for
 * applications already ratified as `lolos_final` — otherwise funds could be
 * recorded against a still-pending or rejected application (a data state
 * that has no legitimate meaning and previously showed up as inconsistent
 * "dana sudah cair" on a rejected mahasiswa's Penerimaan Dana page).
 */
export async function record(pendaftaranId, nominal, buktiTransferUrl) {
  const { data: pendaftaran, error: pendaftaranError } = await supabaseAdmin
    .from('pendaftaran')
    .select('id, status')
    .eq('id', pendaftaranId)
    .single()

  if (pendaftaranError) throw Object.assign(new Error(pendaftaranError.message), { status: 502 })
  if (!pendaftaran) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })
  if (pendaftaran.status !== 'lolos_final') {
    throw Object.assign(
      new Error('Pencairan dana hanya bisa dibuat untuk pendaftaran berstatus lolos_final'),
      { status: 409 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .insert({
      pendaftaran_id: pendaftaranId,
      nominal,
      bukti_transfer_url: buktiTransferUrl,
      status: STATUS_PENDING,
    })
    .select(PENYALURAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/** PAY-01: staff marks a disbursement as paid. */
export async function markPaid(penyaluranId) {
  const { data, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .update({ status: STATUS_SUDAH_CAIR, tanggal_pencairan: new Date().toISOString() })
    .eq('id', penyaluranId)
    .select(PENYALURAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Penyaluran not found'), { status: 404 })

  const mahasiswaId = data.pendaftaran?.mahasiswa_id
  if (mahasiswaId) {
    await notify(
      mahasiswaId,
      'Dana Beasiswa Sudah Cair',
      `Dana sebesar Rp${Number(data.nominal).toLocaleString('id-ID')} sudah ditransfer.`
    ).catch((err) => console.error('Failed to send penyaluran notification:', err.message))
  }

  return data
}

/** FIN-03: Wabag audits a disbursement's transfer proof. */
export async function verify(penyaluranId, wabagId) {
  const { data, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .update({ diverifikasi_oleh: wabagId })
    .eq('id', penyaluranId)
    .select(PENYALURAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Penyaluran not found'), { status: 404 })
  return data
}

/** Staff/Kabag/Wabag list view, optionally filtered by status. */
export async function list(status) {
  let query = supabaseAdmin.from('penyaluran_dana').select(PENYALURAN_SELECT)
  if (status) query = query.eq('status', status)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}
