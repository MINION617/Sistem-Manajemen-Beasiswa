import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as penetapanController from './penetapan.controller.js'

export const penetapanRouter = Router()

// SELE-02: staff lists wawancara-stage applicants alongside already-decided
// ones (for the Sudah Ditetapkan/Tidak Lolos tabs), and sets/undoes the final
// lolos_final/tidak_lolos_final decision.
penetapanRouter.get('/', auth, requireRole('staff'), asyncHandler(penetapanController.getCandidates))
penetapanRouter.patch(
  '/:pendaftaranId',
  auth,
  requireRole('staff'),
  asyncHandler(penetapanController.patchDecide)
)
