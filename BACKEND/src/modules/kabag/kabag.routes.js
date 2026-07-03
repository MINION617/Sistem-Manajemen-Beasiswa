import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as kabagController from './kabag.controller.js'

export const kabagRouter = Router()

// MGMT-01: Kabag-only applicant list + summary statistics.
kabagRouter.get('/statistik', auth, requireRole('kabag'), asyncHandler(kabagController.getStatistik))
kabagRouter.get('/pendaftar', auth, requireRole('kabag'), asyncHandler(kabagController.getApplicants))

// MGMT-02: full applicant context (GPA, certificates, scores) for a plenary decision.
kabagRouter.get(
  '/pendaftar/:pendaftaranId',
  auth,
  requireRole('kabag'),
  asyncHandler(kabagController.getApplicantDetail)
)

// MGMT-03: complaint summary dashboard.
kabagRouter.get(
  '/laporan-statistik',
  auth,
  requireRole('kabag'),
  asyncHandler(kabagController.getLaporanStatistik)
)
