import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as profilController from './profil.controller.js'

export const profilRouter = Router()

// PROF-01: every role manages their own profile — no requireRole, just auth.
profilRouter.get('/', auth, asyncHandler(profilController.getMe))
profilRouter.patch('/', auth, asyncHandler(profilController.patchMe))
profilRouter.patch('/password', auth, asyncHandler(profilController.patchPassword))

// Staff sets a mahasiswa's IPK after reviewing their transcript during
// verification — mahasiswa can no longer self-report this value.
profilRouter.patch(
  '/:mahasiswaId',
  auth,
  requireRole('staff'),
  asyncHandler(profilController.patchByStaff)
)
