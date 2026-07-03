import { supabaseAdmin } from '../../config/supabase.js'

/** A user's own notifications, most recent first. */
export async function listOwn(userId) {
  const { data, error } = await supabaseAdmin
    .from('notifikasi')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/**
 * Marks one notification read. Scoped to `userId` in the query itself —
 * this uses the service-role client (bypasses RLS), so ownership has to be
 * enforced here rather than relying on a database policy.
 */
export async function markRead(notifId, userId) {
  const { data, error } = await supabaseAdmin
    .from('notifikasi')
    .update({ is_read: true })
    .eq('id', notifId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Notifikasi not found'), { status: 404 })
  return data
}

/**
 * Insert a notification for a user. Called by other modules (verifikasi,
 * penyaluran, ...) when a status change happens — not exposed as a route.
 */
export async function notify(userId, judul, pesan) {
  const { error } = await supabaseAdmin
    .from('notifikasi')
    .insert({ user_id: userId, judul, pesan })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
}
