import { z } from 'zod'
import * as seleksiService from './seleksi.service.js'

const traitScore = z.number().min(1).max(10).nullable()

const nilaiSchema = z
  .object({
    nilaiTes: z.number().min(0).max(100).nullable().optional(),
    nilaiWawancara: z.number().min(0).max(100).nullable().optional(),
    catatanStaff: z.string().nullable().optional(),
    nilaiKerjaKeras: traitScore.optional(),
    nilaiKepemimpinan: traitScore.optional(),
    nilaiKomunikasi: traitScore.optional(),
    nilaiKeberanian: traitScore.optional(),
    skorPrestasiAkademik: traitScore.optional(),
  })
  .refine(
    (v) => Object.values(v).some((val) => val !== undefined),
    { message: 'Isi minimal salah satu nilai' }
  )

export async function getList(req, res) {
  const data = await seleksiService.listActive()
  res.json({ data })
}

export async function patchNilai(req, res) {
  const parsed = nilaiSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await seleksiService.upsertNilai(req.params.pendaftaranId, parsed.data)
  res.json({ data })
}
