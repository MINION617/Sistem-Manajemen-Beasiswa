import { z } from 'zod'
import * as penerimaService from './penerima.service.js'

const proposeSchema = z.object({ pendaftaranId: z.string().uuid() })
const listQuerySchema = z.object({
  status: z.enum(['diusulkan', 'disahkan', 'dibatalkan']).optional(),
})

export async function postPropose(req, res) {
  const parsed = proposeSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await penerimaService.propose(parsed.data.pendaftaranId, req.user.id)
  res.status(201).json({ data })
}

export async function patchApprove(req, res) {
  const data = await penerimaService.approve(req.params.penerimaId, req.user.id)
  res.json({ data })
}

export async function patchCancel(req, res) {
  const data = await penerimaService.cancel(req.params.penerimaId)
  res.json({ data })
}

export async function getList(req, res) {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid query' })
  }
  const data = await penerimaService.list(parsed.data.status)
  res.json({ data })
}
