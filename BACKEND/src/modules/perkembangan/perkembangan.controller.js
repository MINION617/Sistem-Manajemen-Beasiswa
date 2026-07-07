import { z } from 'zod'
import * as perkembanganService from './perkembangan.service.js'

const createSchema = z.object({
  penerimaId: z.string().uuid(),
  periode: z.string().min(1),
  ipkSnapshot: z.number().min(0).max(4).nullable().optional(),
  catatan: z.string().min(1).nullable().optional(),
})

export async function postCreate(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const { penerimaId, periode, ipkSnapshot, catatan } = parsed.data
  const data = await perkembanganService.create(penerimaId, periode, ipkSnapshot ?? null, catatan ?? null, req.user.id)
  res.status(201).json({ data })
}
