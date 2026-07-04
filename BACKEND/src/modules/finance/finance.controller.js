import * as financeService from './finance.service.js'

export async function getDashboard(req, res) {
  const data = await financeService.getDashboard()
  res.json({ data })
}

export async function getAlokasiSponsor(req, res) {
  const data = await financeService.getAlokasiSponsor()
  res.json({ data })
}

export async function getRealisasiAnggaran(req, res) {
  const data = await financeService.getRealisasiAnggaran()
  res.json({ data })
}

export async function getAntrianPencairan(req, res) {
  const data = await financeService.getAntrianPencairan()
  res.json({ data })
}

export async function getTrenPenyaluran(req, res) {
  const data = await financeService.getTrenPenyaluran()
  res.json({ data })
}
