import { z } from 'zod'
import * as seleksiService from './seleksi.service.js'

const traitScore = z.number().min(1).max(10)

const hasilSchema = z
  .object({
    nilai_tes: z.number().min(0).max(100).optional(),
    nilai_wawancara: z.number().min(0).max(100).optional(),
    catatan_staff: z.string().optional(),
    catatan_prestasi: z.string().optional(),
    nilai_kerja_keras: traitScore.optional(),
    nilai_kepemimpinan: traitScore.optional(),
    nilai_komunikasi: traitScore.optional(),
    nilai_keberanian: traitScore.optional(),
    skor_prestasi_akademik: traitScore.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  })

export async function getAntrean(req, res) {
  const data = await seleksiService.listAntrean()
  res.json({ data })
}

export async function postHasil(req, res) {
  const parsed = hasilSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }

  const data = await seleksiService.upsertHasil(req.params.pendaftaranId, parsed.data)
  res.json({ data })
}
