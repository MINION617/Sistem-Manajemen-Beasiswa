import * as kabagService from './kabag.service.js'

export async function getStatistik(req, res) {
  const data = await kabagService.getStatistik()
  res.json({ data })
}

export async function getApplicants(req, res) {
  const data = await kabagService.listApplicants()
  res.json({ data })
}

export async function getApplicantDetail(req, res) {
  const data = await kabagService.getApplicantDetail(req.params.pendaftaranId)
  res.json({ data })
}

export async function getLaporanStatistik(req, res) {
  const data = await kabagService.getLaporanStatistik()
  res.json({ data })
}

export async function getTrenPendaftaran(req, res) {
  const data = await kabagService.getTrenPendaftaran()
  res.json({ data })
}

export async function getPerkembangan(req, res) {
  const data = await kabagService.getPerkembangan()
  res.json({ data })
}

export async function getRekomendasi(req, res) {
  const data = await kabagService.getRekomendasi(req.params.beasiswaId)
  res.json({ data })
}
