import { supabaseAdmin, supabaseAnon } from '../../config/supabase.js'

const PROFIL_SELECT = 'id, nim_nip, nama_lengkap, role, email, program_studi, ipk, nomor_whatsapp, alamat, jabatan, unit, created_at'

/** Own profile — every role. */
export async function getOwn(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFIL_SELECT)
    .eq('id', userId)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Profile not found'), { status: 404 })
  return data
}

/**
 * Partial update of the caller's own profile. `nim_nip` and `role` are
 * intentionally not accepted here — they're identity/access fields, not
 * self-service profile data.
 */
export async function updateOwn(userId, patch) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select(PROFIL_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Profile not found'), { status: 404 })
  return data
}

/**
 * SELE-01/COMP: staff corrects a specific mahasiswa's IPK after reviewing
 * their transcript during verification — mahasiswa can no longer self-report
 * this (see profilMahasiswa.js), so staff needs their own write path.
 */
export async function updateByStaff(mahasiswaId, patch) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(patch)
    .eq('id', mahasiswaId)
    .eq('role', 'mahasiswa')
    .select(PROFIL_SELECT)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Mahasiswa not found'), { status: 404 })
  return data
}

/**
 * Changes the caller's own password. Re-verifies `oldPassword` via a real
 * sign-in (anon client) before writing — proves the caller still knows the
 * current credential, not just that their session token hasn't expired yet
 * (e.g. an already-open, unattended tab).
 */
export async function changePassword(userId, email, oldPassword, newPassword) {
  const { error: verifyError } = await supabaseAnon.auth.signInWithPassword({ email, password: oldPassword })
  if (verifyError) throw Object.assign(new Error('Password lama tidak sesuai'), { status: 401 })

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) throw Object.assign(new Error(error.message), { status: 502 })
}
