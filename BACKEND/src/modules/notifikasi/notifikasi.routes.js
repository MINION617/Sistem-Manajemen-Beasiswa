import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as notifikasiController from './notifikasi.controller.js'

export const notifikasiRouter = Router()

// NOTF-01: any authenticated role reads/marks-read their own notifications.
notifikasiRouter.get('/', auth, asyncHandler(notifikasiController.getOwn))
notifikasiRouter.patch('/:notifId/read', auth, asyncHandler(notifikasiController.patchRead))
