import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as perkembanganController from './perkembangan.controller.js'

export const perkembanganRouter = Router()

// Staff records a post-award progress entry (IPK snapshot + note) for a
// ratified recipient. Kabag reads the resulting data via GET /kabag/perkembangan.
perkembanganRouter.post(
  '/',
  auth,
  requireRole('staff'),
  asyncHandler(perkembanganController.postCreate)
)
