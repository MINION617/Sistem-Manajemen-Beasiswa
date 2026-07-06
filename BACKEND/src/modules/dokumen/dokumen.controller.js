import { z } from 'zod'
import * as dokumenService from './dokumen.service.js'

const uploadBodySchema = z.object({
  jenisDokumen: z.string().min(1),
})

export async function postUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'File wajib diunggah' })
  }

  const parsed = uploadBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }

  const data = await dokumenService.uploadPendaftaran(req.user.id, parsed.data.jenisDokumen, req.file)
  res.status(201).json({ data })
}
