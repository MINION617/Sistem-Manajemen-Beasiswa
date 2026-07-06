import { z } from 'zod'
import * as sponsorsService from './sponsors.service.js'

const listQuerySchema = z.object({
  aktif: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
})

const createSchema = z.object({
  namaPerusahaan: z.string().min(1),
  kontakPerusahaan: z.string().min(1).optional(),
  alamatPerusahaan: z.string().min(1).optional(),
  jenisIndustri: z.string().min(1).optional(),
  tagline: z.string().min(1).optional(),
  tentang: z.string().min(1).optional(),
  narahubung: z.string().min(1).optional(),
  email: z.string().email().optional(),
  warna: z.string().min(1).optional(),
  isAktif: z.boolean().optional(),
})

const updateSchema = createSchema.partial()

function toRow({ namaPerusahaan, kontakPerusahaan, alamatPerusahaan, jenisIndustri, tagline, tentang, narahubung, email, warna, isAktif }) {
  const row = {}
  if (namaPerusahaan !== undefined) row.nama_perusahaan = namaPerusahaan
  if (kontakPerusahaan !== undefined) row.kontak_perusahaan = kontakPerusahaan
  if (alamatPerusahaan !== undefined) row.alamat_perusahaan = alamatPerusahaan
  if (jenisIndustri !== undefined) row.jenis_industri = jenisIndustri
  if (tagline !== undefined) row.tagline = tagline
  if (tentang !== undefined) row.tentang = tentang
  if (narahubung !== undefined) row.narahubung = narahubung
  if (email !== undefined) row.email = email
  if (warna !== undefined) row.warna = warna
  if (isAktif !== undefined) row.is_aktif = isAktif
  return row
}

export async function getList(req, res) {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid query' })
  }
  const data = await sponsorsService.list(parsed.data)
  res.json({ data })
}

export async function getOne(req, res) {
  const data = await sponsorsService.getById(req.params.sponsorId)
  res.json({ data })
}

export async function postCreate(req, res) {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await sponsorsService.create(toRow(parsed.data))
  res.status(201).json({ data })
}

export async function patchUpdate(req, res) {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await sponsorsService.update(req.params.sponsorId, toRow(parsed.data))
  res.json({ data })
}
