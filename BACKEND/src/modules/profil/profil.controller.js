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

const staffUpdateSchema = z.object({
  ipk: z.number().min(0).max(4).nullable(),
})

const passwordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

export async function getMe(req, res) {
  const data = await profilService.getOwn(req.user.id)
  res.json({ data })
}

// Per-role fields that cannot be changed via self-service PATCH /profil —
// identity/employment fields assigned by the institution (email is tied to
// the actual Supabase Auth login, which this endpoint never touches — only
// `profiles.email` — so letting it be self-edited would desync display
// from the real login email). Contact-only fields (nomor_whatsapp, alamat)
// are always left editable for every role. nim_nip/role are never in
// updateSchema at all, so they're already unconditionally locked for
// everyone regardless of this map.
const LOCKED_FIELDS_BY_ROLE = {
  kabag: ['email'],
  wabag: ['email'],
  staff: ['nama_lengkap', 'email', 'jabatan', 'unit'],
}

export async function patchMe(req, res) {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const lockedFields = LOCKED_FIELDS_BY_ROLE[req.user.role] || []
  const violatingField = lockedFields.find((field) => parsed.data[field] !== undefined)
  if (violatingField) {
    return res
      .status(400)
      .json({ error: `Field "${violatingField}" tidak dapat diubah sendiri untuk role ini. Hubungi admin.` })
  }
  const data = await profilService.updateOwn(req.user.id, parsed.data)
  res.json({ data })
}

export async function patchByStaff(req, res) {
  const parsed = staffUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid body' })
  }
  const data = await profilService.updateByStaff(req.params.mahasiswaId, parsed.data)
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
