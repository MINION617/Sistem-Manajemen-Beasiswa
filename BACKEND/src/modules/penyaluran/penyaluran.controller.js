import { z } from 'zod'
import * as penyaluranService from './penyaluran.service.js'

const recordSchema = z.object({
  pendaftaranId: z.string().uuid(),
  nominal: z.number().positive(),
  buktiTransferUrl: z.string().url(),
})

const listQuerySchema = z.object({
  status: z.enum(['pending', 'sedang_diproses', 'sudah_cair']).optional(),
})

export async function postRecord(req, res) {
  const parsed = recordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const { pendaftaranId, nominal, buktiTransferUrl } = parsed.data
  const data = await penyaluranService.record(pendaftaranId, nominal, buktiTransferUrl)
  res.status(201).json({ data })
}

export async function patchCair(req, res) {
  const data = await penyaluranService.markPaid(req.params.penyaluranId)
  res.json({ data })
}

export async function patchVerifikasi(req, res) {
  const data = await penyaluranService.verify(req.params.penyaluranId, req.user.id)
  res.json({ data })
}

export async function getList(req, res) {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid query' })
  }
  const data = await penyaluranService.list(parsed.data.status)
  res.json({ data })
}
