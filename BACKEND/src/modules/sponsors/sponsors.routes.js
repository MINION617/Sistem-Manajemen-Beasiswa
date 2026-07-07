import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as sponsorsController from './sponsors.controller.js'

export const sponsorsRouter = Router()

// Any authenticated role can read the sponsor list (needed for the beasiswa catalogue).
sponsorsRouter.get('/', auth, asyncHandler(sponsorsController.getList))
sponsorsRouter.get('/:sponsorId', auth, asyncHandler(sponsorsController.getOne))

// SPON-01: staff manages sponsors.
sponsorsRouter.post('/', auth, requireRole('staff'), asyncHandler(sponsorsController.postCreate))
sponsorsRouter.patch(
  '/:sponsorId',
  auth,
  requireRole('staff'),
  asyncHandler(sponsorsController.patchUpdate)
)
