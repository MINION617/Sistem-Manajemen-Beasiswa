import { z } from 'zod'
import * as verifikasiService from './verifikasi.service.js'

const decideSchema = z
  .object({
    decision: z.enum(['verified', 'rejected']),
    alasan: z.string().min(1).optional(),
  })
  .refine((body) => body.decision !== 'rejected' || !!body.alasan, {
    message: 'alasan is required when decision is "rejected"',
    path: ['alasan'],
  })

export async function getAntrean(req, res) {
  const data = await verifikasiService.listAntrean()
  res.json({ data })
}

export async function postDecision(req, res) {
  const parsed = decideSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }

  const { pendaftaranId } = req.params
  const { decision, alasan } = parsed.data

  const data = await verifikasiService.decide(pendaftaranId, decision, alasan)
  res.json({ data })
}
