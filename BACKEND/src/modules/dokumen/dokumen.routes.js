import { Router } from 'express'
import multer from 'multer'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as dokumenController from './dokumen.controller.js'

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — sesuai keterangan di form daftarBeasiswa.html
  fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(Object.assign(new Error('Format file harus PDF, JPG, atau PNG'), { status: 400 }))
    }
    cb(null, true)
  },
})

/** Semua kegagalan multer (file kosong, terlalu besar, tipe salah) adalah
 * kesalahan input pengguna, bukan server — dipetakan ke 400. */
function uploadSingle(fieldName) {
  const middleware = upload.single(fieldName)
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) return next(Object.assign(new Error(err.message), { status: 400 }))
      next()
    })
  }
}

export const dokumenRouter = Router()

// DOCS-01: mahasiswa mengunggah dokumen pendukung pendaftaran (sebelum baris
// pendaftaran dibuat — lihat catatan di dokumen.service.js).
dokumenRouter.post(
  '/upload',
  auth,
  requireRole('mahasiswa'),
  uploadSingle('file'),
  asyncHandler(dokumenController.postUpload)
)
