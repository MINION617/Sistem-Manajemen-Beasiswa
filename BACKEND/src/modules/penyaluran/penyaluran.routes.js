import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as penyaluranController from './penyaluran.controller.js'

export const penyaluranRouter = Router()

// PAY-01: staff records a disbursement and marks it paid.
penyaluranRouter.post('/', auth, requireRole('staff'), asyncHandler(penyaluranController.postRecord))
penyaluranRouter.patch(
  '/:penyaluranId/cair',
  auth,
  requireRole('staff'),
  asyncHandler(penyaluranController.patchCair)
)

// FIN-03: Wabag audits/verifies the transfer proof.
penyaluranRouter.patch(
  '/:penyaluranId/verifikasi',
  auth,
  requireRole('wabag'),
  asyncHandler(penyaluranController.patchVerifikasi)
)

// Shared read access for operational + oversight roles.
penyaluranRouter.get(
  '/',
  auth,
  requireRole('staff', 'kabag', 'wabag'),
  asyncHandler(penyaluranController.getList)
)
