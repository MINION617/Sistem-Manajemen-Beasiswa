import { getUserFromToken, supabaseAdmin } from '../config/supabase.js'

/**
 * Verifies the bearer token against Supabase Auth, then loads the caller's
 * role from public.profiles. Role is never trusted from the request body
 * or client-side storage — only from this server-side lookup.
 */
export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null

    const authUser = await getUserFromToken(token)
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized: missing or invalid token' })
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, nama_lengkap, nim_nip')
      .eq('id', authUser.id)
      .single()

    if (error || !profile) {
      return res.status(401).json({ error: 'Unauthorized: profile not found' })
    }

    req.user = {
      id: authUser.id,
      email: authUser.email,
      role: profile.role,
      nama_lengkap: profile.nama_lengkap,
      nim_nip: profile.nim_nip,
    }

    next()
  } catch (err) {
    next(err)
  }
}
