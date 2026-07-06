import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as beasiswaController from './beasiswa.controller.js'

export const beasiswaRouter = Router()

// APPL-01: any authenticated role can browse programs (mahasiswa sees them to apply,
// staff/kabag/wabag see them for management and reporting).
beasiswaRouter.get('/', auth, asyncHandler(beasiswaController.getList))
beasiswaRouter.get('/:beasiswaId', auth, asyncHandler(beasiswaController.getOne))

// SCHL-01: staff manages the scholarship catalogue.
beasiswaRouter.post('/', auth, requireRole('staff'), asyncHandler(beasiswaController.postCreate))
beasiswaRouter.patch(
  '/:beasiswaId',
  auth,
  requireRole('staff'),
  asyncHandler(beasiswaController.patchUpdate)
)
