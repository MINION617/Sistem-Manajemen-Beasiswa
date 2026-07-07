import { supabaseAdmin } from '../../config/supabase.js'

const BUCKET_PENDAFTAR = 'dokumen-pendaftar'
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 30 // 30 hari — cukup untuk masa verifikasi berkas

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

/**
 * DOCS-01: mahasiswa mengunggah satu dokumen pendukung pendaftaran.
 * Belum ditautkan ke baris `pendaftaran` mana pun di sini — endpoint ini
 * hanya menaruh file ke storage dan mengembalikan metadatanya. Baris
 * `dokumen_pendaftaran` baru ditulis saat POST /api/pendaftaran (lihat
 * pendaftaran.service.js), karena pendaftaran_id belum ada sebelum
 * pendaftarannya sendiri dibuat.
 */
export async function uploadPendaftaran(mahasiswaId, jenisDokumen, file) {
  const path = `${mahasiswaId}/${Date.now()}-${sanitizeFileName(file.originalname)}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_PENDAFTAR)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false })

  if (uploadError) throw Object.assign(new Error(uploadError.message), { status: 502 })

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from(BUCKET_PENDAFTAR)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS)

  if (signError) throw Object.assign(new Error(signError.message), { status: 502 })

  return {
    jenisDokumen,
    filePath: path,
    fileUrl: signed.signedUrl,
    ukuranFile: file.size,
  }
}
