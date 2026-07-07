import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as pendaftaranController from './pendaftaran.controller.js'

export const pendaftaranRouter = Router()

// APPL-02: mahasiswa applies to a beasiswa and reads their own applications.
pendaftaranRouter.post(
  '/',
  auth,
  requireRole('mahasiswa'),
  asyncHandler(pendaftaranController.postCreate)
)
pendaftaranRouter.get(
  '/saya',
  auth,
  requireRole('mahasiswa'),
  asyncHandler(pendaftaranController.getOwn)
)
