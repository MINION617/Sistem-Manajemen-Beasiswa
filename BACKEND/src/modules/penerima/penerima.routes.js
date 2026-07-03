import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as penerimaController from './penerima.controller.js'

export const penerimaRouter = Router()

// SELE-02: staff proposes a recipient.
penerimaRouter.post('/', auth, requireRole('staff'), asyncHandler(penerimaController.postPropose))

// Kabag ratifies or cancels a proposal in the plenary decision.
penerimaRouter.patch(
  '/:penerimaId/sahkan',
  auth,
  requireRole('kabag'),
  asyncHandler(penerimaController.patchApprove)
)
penerimaRouter.patch(
  '/:penerimaId/batalkan',
  auth,
  requireRole('kabag'),
  asyncHandler(penerimaController.patchCancel)
)

// PAY-02: Kabag (and staff, for operational tracking) view the recipient list.
penerimaRouter.get(
  '/',
  auth,
  requireRole('staff', 'kabag'),
  asyncHandler(penerimaController.getList)
)
