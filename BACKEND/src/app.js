import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { verifikasiRouter } from './modules/verifikasi/verifikasi.routes.js'
import { statusRouter } from './modules/status/status.routes.js'
import { notifikasiRouter } from './modules/notifikasi/notifikasi.routes.js'
import { laporanRouter } from './modules/laporan/laporan.routes.js'
import { kabagRouter } from './modules/kabag/kabag.routes.js'
import { penerimaRouter } from './modules/penerima/penerima.routes.js'
import { penyaluranRouter } from './modules/penyaluran/penyaluran.routes.js'
import { financeRouter } from './modules/finance/finance.routes.js'
import { beasiswaRouter } from './modules/beasiswa/beasiswa.routes.js'
import { sponsorsRouter } from './modules/sponsors/sponsors.routes.js'
import { pendaftaranRouter } from './modules/pendaftaran/pendaftaran.routes.js'
import { dokumenRouter } from './modules/dokumen/dokumen.routes.js'
import { seleksiRouter } from './modules/seleksi/seleksi.routes.js'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/verifikasi', verifikasiRouter)
app.use('/api/status', statusRouter)
app.use('/api/notifikasi', notifikasiRouter)
app.use('/api/laporan', laporanRouter)
app.use('/api/kabag', kabagRouter)
app.use('/api/penerima', penerimaRouter)
app.use('/api/penyaluran', penyaluranRouter)
app.use('/api/finance', financeRouter)
app.use('/api/beasiswa', beasiswaRouter)
app.use('/api/sponsors', sponsorsRouter)
app.use('/api/pendaftaran', pendaftaranRouter)
app.use('/api/dokumen', dokumenRouter)
app.use('/api/seleksi', seleksiRouter)

app.use(notFound)
app.use(errorHandler)
