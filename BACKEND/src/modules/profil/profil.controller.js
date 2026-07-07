import { z } from 'zod'
import * as profilService from './profil.service.js'

const updateSchema = z
  .object({
    nama_lengkap: z.string().min(1).optional(),
    email: z.string().email().optional(),
    nomor_whatsapp: z.string().nullable().optional(),
    alamat: z.string().nullable().optional(),
    program_studi: z.string().nullable().optional(),
    ipk: z.number().min(0).max(4).nullable().optional(),
    jabatan: z.string().nullable().optional(),
    unit: z.string().nullable().optional(),
  })
  .refine((v) => Object.values(v).some((val) => val !== undefined), {
    message: 'At least one field must be provided',
  })

const passwordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export async function getMe(req, res) {
  const data = await profilService.getOwn(req.user.id)
  res.json({ data })
}

export async function patchMe(req, res) {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await profilService.updateOwn(req.user.id, parsed.data)
  res.json({ data })
}

export async function patchPassword(req, res) {
  const parsed = passwordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  await profilService.changePassword(req.user.id, req.user.email, parsed.data.oldPassword, parsed.data.newPassword)
  res.json({ data: { ok: true } })
}
