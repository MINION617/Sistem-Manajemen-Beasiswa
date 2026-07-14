import { supabaseAdmin } from '../../config/supabase.js'
import { notify } from '../notifikasi/notifikasi.service.js'
import * as penerimaService from '../penerima/penerima.service.js'

// status_pendaftaran enum (DATABASE/migrations/0000_baseline.sql) — final
// decision stage (SELE-02), reached after seleksi (wawancara):
export const STATUS_WAWANCARA = 'wawancara'
export const STATUS_LOLOS_FINAL = 'lolos_final'
export const STATUS_TIDAK_LOLOS_FINAL = 'tidak_lolos_final'

const PENDAFTARAN_SELECT = `
  *,
  mahasiswa:profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi, ipk),
  beasiswa(nama_program, nominal_dana, kuota, tanggal_penetapan, sponsors(nama_perusahaan)),
  hasil_seleksi(*)
`

function mapRow(row) {
  const hasil_seleksi = Array.isArray(row.hasil_seleksi) ? row.hasil_seleksi[0] ?? null : row.hasil_seleksi
  const beasiswa = row.beasiswa ? { ...row.beasiswa, kuota_penerima: row.beasiswa.kuota } : row.beasiswa
  return { ...row, hasil_seleksi, beasiswa }
}

/** SELE-02: applications ready for (or already given) a final decision. */
export async function listCandidates() {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(PENDAFTARAN_SELECT)
    .in('status', [STATUS_WAWANCARA, STATUS_LOLOS_FINAL, STATUS_TIDAK_LOLOS_FINAL])
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data.map(mapRow)
}

/**
 * SELE-02: staff sets the final decision, or undoes one.
 * `tetapkan` also proposes the applicant to Kabag as a recipient candidate
 * (penerima_beasiswa: diusulkan) so the plenary-approval feature is reached
 * without a separate manual step. `batal` reverses to `wawancara` and cancels
 * that proposal — but only while it's still `diusulkan`. Once Kabag has
 * ratified it (`disahkan`, which also opens the disbursement pipeline via
 * ensurePending()), staff can no longer unilaterally revert the pendaftaran:
 * that used to silently reset pendaftaran.status to `wawancara` while leaving
 * the ratified penerima_beasiswa/penyaluran_dana rows untouched, an
 * inconsistent state. Cancelling a ratified recipient is Kabag's own call
 * (PATCH /penerima/:id/batalkan).
 */
export async function decide(pendaftaranId, decision, catatan, staffId) {
  if (decision === 'batal') {
    const { data: ratified, error: ratifiedError } = await supabaseAdmin
      .from('penerima_beasiswa')
      .select('id')
      .eq('pendaftaran_id', pendaftaranId)
      .eq('status', 'disahkan')
      .maybeSingle()

    if (ratifiedError) throw Object.assign(new Error(ratifiedError.message), { status: 502 })
    if (ratified) {
      throw Object.assign(
        new Error('Penerima ini sudah diratifikasi Kabag — pembatalan hanya bisa dilakukan Kabag di halaman Perkembangan Penerima'),
        { status: 409 }
      )
    }
  }

  const newStatus =
    decision === 'tetapkan'
      ? STATUS_LOLOS_FINAL
      : decision === 'tolak'
        ? STATUS_TIDAK_LOLOS_FINAL
        : STATUS_WAWANCARA

  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .update({ status: newStatus, catatan_penetapan: catatan ?? null, updated_at: new Date().toISOString() })
    .eq('id', pendaftaranId)
    .select(PENDAFTARAN_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })

  if (decision === 'tetapkan') {
    await penerimaService.propose(pendaftaranId, staffId)
  } else if (decision === 'batal') {
    const { data: proposal } = await supabaseAdmin
      .from('penerima_beasiswa')
      .select('id')
      .eq('pendaftaran_id', pendaftaranId)
      .eq('status', 'diusulkan')
      .maybeSingle()
    if (proposal) await penerimaService.cancel(proposal.id)
  }

  const judul =
    decision === 'tetapkan'
      ? 'Ditetapkan Sebagai Penerima'
      : decision === 'tolak'
        ? 'Tidak Lolos Seleksi Final'
        : 'Status Penetapan Diperbarui'
  const pesan =
    decision === 'tetapkan'
      ? `Selamat! Kamu ditetapkan sebagai penerima ${data.beasiswa?.nama_program ?? ''} dan menunggu ratifikasi Kabag.`
      : decision === 'tolak'
        ? `Kamu belum berhasil lolos seleksi final ${data.beasiswa?.nama_program ?? ''}.${catatan ? ` Catatan: ${catatan}` : ''}`
        : `Status pendaftaran ${data.beasiswa?.nama_program ?? ''} kamu dikembalikan ke tahap wawancara.`
  await notify(data.mahasiswa_id, judul, pesan).catch((err) =>
    console.error('Failed to send penetapan notification:', err.message)
  )

  return mapRow(data)
}
