import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as statusController from './status.controller.js'

export const statusRouter = Router()

// STAT-01/STAT-02: mahasiswa checks their own application + disbursement status.
statusRouter.get(
  '/saya',
  auth,
  requireRole('mahasiswa'),
  asyncHandler(statusController.getMyStatus)
)
