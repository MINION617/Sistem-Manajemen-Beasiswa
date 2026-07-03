import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { verifikasiRouter } from './modules/verifikasi/verifikasi.routes.js'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/verifikasi', verifikasiRouter)

app.use(notFound)
app.use(errorHandler)
