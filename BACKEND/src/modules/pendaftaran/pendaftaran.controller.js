import { z } from 'zod'
import * as pendaftaranService from './pendaftaran.service.js'

const dokumenSchema = z.object({
  jenisDokumen: z.string().min(1),
  fileUrl: z.string().min(1).optional(),
  filePath: z.string().min(1).optional(),
  ukuranFile: z.number().int().nonnegative().optional(),
})

const createSchema = z.object({
  beasiswaId: z.string().uuid(),
  dokumen: z.array(dokumenSchema).optional(),
})

export async function postCreate(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await pendaftaranService.create(req.user.id, parsed.data.beasiswaId, parsed.data.dokumen ?? [])
  res.status(201).json({ data })
}

export async function getOwn(req, res) {
  const data = await pendaftaranService.listOwn(req.user.id)
  res.json({ data })
}
