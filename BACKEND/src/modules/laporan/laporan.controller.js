import { z } from 'zod'
import * as laporanService from './laporan.service.js'

const createSchema = z.object({
  beasiswaId: z.string().uuid().optional(),
  judul: z.string().min(1),
  deskripsi: z.string().min(1),
  kategori: z.enum(['dokumen', 'status', 'dana', 'teknis', 'lainnya']).optional(),
})

const resolveSchema = z.object({
  status: z.enum(['masuk', 'diproses', 'selesai']),
  tanggapanStaff: z.string().min(1).optional(),
})

export async function postLaporan(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }

  const data = await laporanService.create(req.user.id, parsed.data)
  res.status(201).json({ data })
}

export async function getOwn(req, res) {
  const data = await laporanService.listOwn(req.user.id)
  res.json({ data })
}

export async function getAll(req, res) {
  const data = await laporanService.listAll()
  res.json({ data })
}

export async function patchResolve(req, res) {
  const parsed = resolveSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }

  const { status, tanggapanStaff } = parsed.data
  const data = await laporanService.resolve(req.params.laporanId, status, tanggapanStaff)
  res.json({ data })
}
