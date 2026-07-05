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

// Year-over-year applicant volume trend.
kabagRouter.get(
  '/tren-pendaftaran',
  auth,
  requireRole('kabag'),
  asyncHandler(kabagController.getTrenPendaftaran)
)

// Post-award recipient progress tracking (view-only — MIS reports on data,
// it doesn't do TPS-style data entry; perkembangan_penerima rows are seeded
// directly in the database, not created through the app).
kabagRouter.get(
  '/perkembangan',
  auth,
  requireRole('kabag'),
  asyncHandler(kabagController.getPerkembangan)
)

// Candidate recommendation ranking for a scholarship program.
kabagRouter.get(
  '/rekomendasi/:beasiswaId',
  auth,
  requireRole('kabag'),
  asyncHandler(kabagController.getRekomendasi)
)
