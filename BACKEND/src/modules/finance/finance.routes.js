import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as financeController from './finance.controller.js'

export const financeRouter = Router()

// FIN-01/FIN-02: Wabag-only financial dashboard + sponsor allocation report.
financeRouter.get('/dashboard', auth, requireRole('wabag'), asyncHandler(financeController.getDashboard))
financeRouter.get(
  '/alokasi-sponsor',
  auth,
  requireRole('wabag'),
  asyncHandler(financeController.getAlokasiSponsor)
)

// FIN-04: budget realization per program (committed vs disbursed).
financeRouter.get(
  '/realisasi-anggaran',
  auth,
  requireRole('wabag'),
  asyncHandler(financeController.getRealisasiAnggaran)
)

// FIN-05: aging buckets for outstanding (not yet disbursed) queue items.
financeRouter.get(
  '/antrian-pencairan',
  auth,
  requireRole('wabag'),
  asyncHandler(financeController.getAntrianPencairan)
)

// FIN-06: year-over-year disbursement trend.
financeRouter.get(
  '/tren-penyaluran',
  auth,
  requireRole('wabag'),
  asyncHandler(financeController.getTrenPenyaluran)
)
