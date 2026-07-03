import * as financeService from './finance.service.js'

export async function getDashboard(req, res) {
  const data = await financeService.getDashboard()
  res.json({ data })
}

export async function getAlokasiSponsor(req, res) {
  const data = await financeService.getAlokasiSponsor()
  res.json({ data })
}
