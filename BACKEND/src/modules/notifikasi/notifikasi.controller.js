import * as notifikasiService from './notifikasi.service.js'

export async function getOwn(req, res) {
  const data = await notifikasiService.listOwn(req.user.id)
  res.json({ data })
}

export async function patchRead(req, res) {
  const data = await notifikasiService.markRead(req.params.notifId, req.user.id)
  res.json({ data })
}
