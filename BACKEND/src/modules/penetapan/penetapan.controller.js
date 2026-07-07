import { z } from 'zod'
import * as penetapanService from './penetapan.service.js'

const decideSchema = z.object({
  decision: z.enum(['tetapkan', 'tolak', 'batal']),
  catatan: z.string().min(1).optional(),
})

export async function getCandidates(req, res) {
  const data = await penetapanService.listCandidates()
  res.json({ data })
}

export async function patchDecide(req, res) {
  const parsed = decideSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await penetapanService.decide(req.params.pendaftaranId, parsed.data.decision, parsed.data.catatan, req.user.id)
  res.json({ data })
}
