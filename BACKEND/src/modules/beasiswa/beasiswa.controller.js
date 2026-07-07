import { z } from 'zod'
import * as beasiswaService from './beasiswa.service.js'

const listQuerySchema = z.object({
  status: z.string().min(1).optional(),
  kategori: z.string().min(1).optional(),
  sponsorId: z.string().uuid().optional(),
})

const createSchema = z.object({
  sponsorId: z.string().uuid().nullable().optional(),
  namaProgram: z.string().min(1),
  tahunAkademik: z.string().min(1).optional(),
  deskripsi: z.string().min(1).optional(),
  kategori: z.string().min(1).optional(),
  nominalDana: z.number().int().nonnegative().optional(),
  kuota: z.number().int().nonnegative().optional(),
  status: z.string().min(1).optional(),
  tanggalBuka: z.string().min(1).optional(),
  tanggalTutup: z.string().min(1).optional(),
  tanggalTesWawancara: z.string().min(1).nullable().optional(),
  tanggalPenetapan: z.string().min(1).nullable().optional(),
  persyaratan: z.array(z.string()).optional(),
})

const updateSchema = createSchema.partial()

function toRow({ sponsorId, namaProgram, tahunAkademik, deskripsi, kategori, nominalDana, kuota, status, tanggalBuka, tanggalTutup, tanggalTesWawancara, tanggalPenetapan, persyaratan }) {
  const row = {}
  if (sponsorId !== undefined) row.sponsor_id = sponsorId
  if (namaProgram !== undefined) row.nama_program = namaProgram
  if (tahunAkademik !== undefined) row.tahun_akademik = tahunAkademik
  if (deskripsi !== undefined) row.deskripsi = deskripsi
  if (kategori !== undefined) row.kategori = kategori
  if (nominalDana !== undefined) row.nominal_dana = nominalDana
  if (kuota !== undefined) row.kuota = kuota
  if (status !== undefined) row.status = status
  if (tanggalBuka !== undefined) row.tanggal_buka = tanggalBuka
  if (tanggalTutup !== undefined) row.tanggal_tutup = tanggalTutup
  if (tanggalTesWawancara !== undefined) row.tanggal_tes_wawancara = tanggalTesWawancara
  if (tanggalPenetapan !== undefined) row.tanggal_penetapan = tanggalPenetapan
  if (persyaratan !== undefined) row.persyaratan = persyaratan
  return row
}

export async function getList(req, res) {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid query' })
  }
  const data = await beasiswaService.list(parsed.data)
  res.json({ data })
}

export async function getOne(req, res) {
  const data = await beasiswaService.getById(req.params.beasiswaId)
  res.json({ data })
}

export async function postCreate(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await beasiswaService.create(toRow(parsed.data))
  res.status(201).json({ data })
}

export async function patchUpdate(req, res) {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await beasiswaService.update(req.params.beasiswaId, toRow(parsed.data))
  res.json({ data })
}
