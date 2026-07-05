import { Router } from 'express'
import { auth } from '../../middleware/auth.js'
import { requireRole } from '../../middleware/requireRole.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import * as seleksiController from './seleksi.controller.js'

export const seleksiRouter = Router()

// SELE-01: staff lists applications ready for test/interview scoring, and
// records/updates those scores (including structured trait scores used by
// the Kabag recommendation feature).
seleksiRouter.get('/antrean', auth, requireRole('staff'), asyncHandler(seleksiController.getAntrean))
seleksiRouter.post('/:pendaftaranId', auth, requireRole('staff'), asyncHandler(seleksiController.postHasil))
