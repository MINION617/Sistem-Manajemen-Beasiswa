import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as verifikasiController from './verifikasi.controller.js'

export const verifikasiRouter = Router()

verifikasiRouter.get(
  '/antrean',
  auth,
  requireRole('staff'),
  asyncHandler(verifikasiController.getAntrean)
)

verifikasiRouter.post(
  '/:pendaftaranId',
  auth,
  requireRole('staff'),
  asyncHandler(verifikasiController.postDecision)
)
