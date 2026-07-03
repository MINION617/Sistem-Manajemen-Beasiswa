import * as statusService from './status.service.js'

export async function getMyStatus(req, res) {
  const data = await statusService.listMyPendaftaran(req.user.id)
  res.json({ data })
}
