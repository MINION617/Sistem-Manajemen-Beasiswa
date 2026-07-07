import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Anon-key client — used only to re-verify a user's current password (via
// signInWithPassword) before letting them set a new one. Never used to read
// or write data; all data access goes through supabaseAdmin.
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/**
 * Resolve a Supabase Auth user from a bearer token.
 * Returns null if the token is missing, malformed, or invalid.
 */
export async function getUserFromToken(token) {
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user) return null

  return data.user
}
