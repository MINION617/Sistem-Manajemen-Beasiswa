import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as seleksiController from './seleksi.controller.js'

export const seleksiRouter = Router()

// SELE-01: staff melihat peserta tahap tes/wawancara dan menginput nilai.
seleksiRouter.get('/', auth, requireRole('staff'), asyncHandler(seleksiController.getList))
seleksiRouter.patch(
  '/:pendaftaranId',
  auth,
  requireRole('staff'),
  asyncHandler(seleksiController.patchNilai)
)
