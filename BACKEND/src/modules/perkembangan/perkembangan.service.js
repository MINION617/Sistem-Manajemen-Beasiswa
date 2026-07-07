import { supabaseAdmin } from '../../config/supabase.js'

/**
 * Staff records a post-award progress entry (IPK snapshot + note) for a
 * ratified recipient. Previously perkembangan_penerima rows only ever
 * existed via direct DB seeding — there was no write path in the app at
 * all, so Kabag's "Perkembangan Penerima" page stayed empty for any
 * recipient ratified through the real UI.
 */
export async function create(penerimaId, periode, ipkSnapshot, catatan, staffId) {
  const { data: penerima, error: penerimaError } = await supabaseAdmin
    .from('penerima_beasiswa')
    .select('id, status')
    .eq('id', penerimaId)
    .single()

  if (penerimaError) throw Object.assign(new Error(penerimaError.message), { status: 502 })
  if (!penerima) throw Object.assign(new Error('Penerima not found'), { status: 404 })
  if (penerima.status !== 'disahkan') {
    throw Object.assign(
      new Error('Perkembangan hanya bisa dicatat untuk penerima yang sudah disahkan'),
      { status: 409 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('perkembangan_penerima')
    .insert({ penerima_id: penerimaId, periode, ipk_snapshot: ipkSnapshot, catatan, dicatat_oleh: staffId })
    .select('*')
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}
