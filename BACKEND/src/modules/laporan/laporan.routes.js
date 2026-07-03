import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as laporanController from './laporan.controller.js'

export const laporanRouter = Router()

// COMP-01: mahasiswa submits and reads their own complaints.
laporanRouter.post(
  '/',
  auth,
  requireRole('mahasiswa'),
  asyncHandler(laporanController.postLaporan)
)
laporanRouter.get(
  '/saya',
  auth,
  requireRole('mahasiswa'),
  asyncHandler(laporanController.getOwn)
)

// COMP-02: staff reads every complaint and resolves them.
laporanRouter.get(
  '/',
  auth,
  requireRole('staff'),
  asyncHandler(laporanController.getAll)
)
laporanRouter.patch(
  '/:laporanId',
  auth,
  requireRole('staff'),
  asyncHandler(laporanController.patchResolve)
)
