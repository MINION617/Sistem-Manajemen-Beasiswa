import * as kabagService from './kabag.service.js'

export async function getStatistik(req, res) {
  const data = await kabagService.getStatistik()
  res.json({ data })
}

export async function getApplicants(req, res) {
  const data = await kabagService.listApplicants()
  res.json({ data })
}
