/**
 * ============================================
 * SUPABASE CLIENT - Beasiswa Kampus
 * ============================================
 * File: supabaseClient.js
 * Untuk integrate dengan HTML frontend
 * 
 * Installation: npm install @supabase/supabase-js
 * Usage di HTML: <script type="module" src="supabaseClient.js"></script>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ===== KONFIGURASI =====
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ===== AUTHENTICATION =====

/**
 * Register mahasiswa baru
 * @param {string} email
 * @param {string} password
 * @param {object} profileData - nama_lengkap, nim, program_studi, ipk
 */
export async function registerMahasiswa(email, password, profileData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...profileData,
          role: 'mahasiswa'
        }
      }
    })

    if (authError) throw authError

    // Profile auto-created via trigger
    return { success: true, user: authData.user }
  } catch (error) {
    console.error('Register error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Get user profile
    const profile = await getProfile(data.user.id)
    
    return { 
      success: true, 
      user: data.user, 
      profile: profile,
      session: data.session 
    }
  } catch (error) {
    console.error('Login error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error('Get session error:', error.message)
    return null
  }
}

/**
 * Reset password
 */
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
    return { success: true, message: 'Reset password link sent to email' }
  } catch (error) {
    console.error('Reset password error:', error.message)
    return { success: false, error: error.message }
  }
}

// ===== PROFILE =====

/**
 * Get user profile
 */
export async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get profile error:', error.message)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Update profile error:', error.message)
    return { success: false, error: error.message }
  }
}

// ===== BEASISWA =====

/**
 * Get all beasiswa (public)
 */
export async function getAllBeasiswa(filter = {}) {
  try {
    let query = supabase
      .from('beasiswa')
      .select('*,sponsors(*)')

    // Apply filters
    if (filter.status) query = query.eq('status', filter.status)
    if (filter.kategori) query = query.eq('kategori', filter.kategori)
    if (filter.sponsor_id) query = query.eq('sponsor_id', filter.sponsor_id)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get beasiswa error:', error.message)
    return []
  }
}

/**
 * Get beasiswa detail
 */
export async function getBeasiswaDetail(id) {
  try {
    const { data, error } = await supabase
      .from('beasiswa')
      .select('*,sponsors(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get beasiswa detail error:', error.message)
    return null
  }
}

/**
 * Get all sponsors
 */
export async function getAllSponsors() {
  try {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('nama_perusahaan', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get sponsors error:', error.message)
    return []
  }
}

// ===== PENDAFTARAN =====

/**
 * Create pendaftaran (register for scholarship)
 */
export async function createPendaftaran(mahasiswaId, beasiswaId) {
  try {
    const { data, error } = await supabase
      .from('pendaftaran')
      .insert({
        mahasiswa_id: mahasiswaId,
        beasiswa_id: beasiswaId,
        status: 'menunggu_verifikasi'
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Create pendaftaran error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's pendaftaran
 */
export async function getUserPendaftaran(mahasiswaId) {
  try {
    const { data, error } = await supabase
      .from('pendaftaran')
      .select(`
        *,
        beasiswa(id, nama_program, nominal_dana, sponsors(nama_perusahaan)),
        dokumen_pendaftaran(*),
        hasil_seleksi(*),
        penerima_beasiswa(*),
        penyaluran_dana(*)
      `)
      .eq('mahasiswa_id', mahasiswaId)
      .order('tanggal_daftar', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get pendaftaran error:', error.message)
    return []
  }
}

/**
 * Get pendaftaran detail
 */
export async function getPendaftaranDetail(pendaftaranId) {
  try {
    const { data, error } = await supabase
      .from('pendaftaran')
      .select(`
        *,
        beasiswa(*,sponsors(*)),
        dokumen_pendaftaran(*),
        hasil_seleksi(*),
        penerima_beasiswa(*),
        penyaluran_dana(*)
      `)
      .eq('id', pendaftaranId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get pendaftaran detail error:', error.message)
    return null
  }
}

// ===== DOKUMEN PENDAFTARAN =====

/**
 * Upload dokumen ke storage
 * @param {string} mahasiswaId
 * @param {string} jenisDokumen - 'sertifikat_prestasi', 'sertifikat_bahasa', 'berkas_pendukung'
 * @param {File} file
 */
export async function uploadDokumen(mahasiswaId, jenisDokumen, file) {
  try {
    if (!file) throw new Error('File tidak ada')

    const fileExt = file.name.split('.').pop()
    const fileName = `${jenisDokumen}_${Date.now()}.${fileExt}`
    const filePath = `${mahasiswaId}/${fileName}`

    // Upload ke storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('dokumen-pendaftar')
      .upload(filePath, file, { upsert: false })

    if (storageError) throw storageError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('dokumen-pendaftar')
      .getPublicUrl(filePath)

    return {
      success: true,
      filePath: storageData.path,
      fileUrl: urlData.publicUrl,
      fileName: fileName,
      fileSize: file.size
    }
  } catch (error) {
    console.error('Upload dokumen error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Record dokumen di database
 */
export async function recordDokumen(pendaftaranId, jenisDokumen, filePath, fileUrl, ukuranFile) {
  try {
    const { data, error } = await supabase
      .from('dokumen_pendaftaran')
      .insert({
        pendaftaran_id: pendaftaranId,
        jenis_dokumen: jenisDokumen,
        file_path: filePath,
        file_url: fileUrl,
        ukuran_file: ukuranFile
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Record dokumen error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get dokumen pendaftaran
 */
export async function getDokumenPendaftaran(pendaftaranId) {
  try {
    const { data, error } = await supabase
      .from('dokumen_pendaftaran')
      .select('*')
      .eq('pendaftaran_id', pendaftaranId)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get dokumen error:', error.message)
    return []
  }
}

// ===== STATUS PENDAFTARAN =====

/**
 * Check pendaftaran status
 */
export async function checkPendaftaranStatus(nim) {
  try {
    // Get mahasiswa by NIM
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('nim_nip', nim)
      .single()

    if (profileError) throw new Error('NIM tidak ditemukan')

    // Get pendaftaran
    const { data: pendaftaranData, error: pendaftaranError } = await supabase
      .from('pendaftaran')
      .select(`
        *,
        beasiswa(nama_program, sponsors(nama_perusahaan)),
        hasil_seleksi(*),
        penerima_beasiswa(*),
        penyaluran_dana(*)
      `)
      .eq('mahasiswa_id', profileData.id)

    if (pendaftaranError) throw pendaftaranError

    return { success: true, data: pendaftaranData }
  } catch (error) {
    console.error('Check status error:', error.message)
    return { success: false, error: error.message }
  }
}

// ===== LAPORAN KENDALA =====

/**
 * Create laporan kendala
 */
export async function createLaporanKendala(mahasiswaId, beasiswaId, judul, deskripsi, kategori) {
  try {
    const { data, error } = await supabase
      .from('laporan_kendala')
      .insert({
        mahasiswa_id: mahasiswaId,
        beasiswa_id: beasiswaId,
        judul_laporan: judul,
        deskripsi: deskripsi,
        kategori: kategori,
        status: 'masuk'
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Create laporan error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's laporan
 */
export async function getUserLaporan(mahasiswaId) {
  try {
    const { data, error } = await supabase
      .from('laporan_kendala')
      .select('*,beasiswa(nama_program)')
      .eq('mahasiswa_id', mahasiswaId)
      .order('tanggal_lapor', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get laporan error:', error.message)
    return []
  }
}

// ===== NOTIFIKASI =====

/**
 * Get user's notifikasi
 */
export async function getUserNotifikasi(userId) {
  try {
    const { data, error } = await supabase
      .from('notifikasi')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get notifikasi error:', error.message)
    return []
  }
}

/**
 * Mark notifikasi as read
 */
export async function markNotifikasiAsRead(notifikasiId) {
  try {
    const { data, error } = await supabase
      .from('notifikasi')
      .update({ is_read: true })
      .eq('id', notifikasiId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Mark notifikasi read error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Subscribe to notifikasi (realtime)
 */
export function subscribeToNotifikasi(userId, callback) {
  return supabase
    .channel(`user_${userId}_notifications`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifikasi',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new)
      }
    )
    .subscribe()
}

// ===== ADMIN/STAFF FUNCTIONS =====

/**
 * Get all pendaftaran (Staff only)
 */
export async function getAllPendaftaran(filters = {}) {
  try {
    let query = supabase
      .from('pendaftaran')
      .select(`
        *,
        profiles!mahasiswa_id(nama_lengkap, nim_nip, ipk, program_studi),
        beasiswa(nama_program, sponsors(nama_perusahaan)),
        dokumen_pendaftaran(*),
        hasil_seleksi(*)
      `)

    // Filters
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.beasiswa_id) query = query.eq('beasiswa_id', filters.beasiswa_id)

    const { data, error } = await query.order('tanggal_daftar', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Get all pendaftaran error:', error.message)
    return []
  }
}

/**
 * Update pendaftaran status (Staff only)
 */
export async function updatePendaftaranStatus(pendaftaranId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('pendaftaran')
      .update({ status: newStatus })
      .eq('id', pendaftaranId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Update status error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Input hasil seleksi (Staff only)
 */
export async function inputHasilSeleksi(pendaftaranId, nilaiTes, nilaiWawancara, catatan) {
  try {
    const { data, error } = await supabase
      .from('hasil_seleksi')
      .insert({
        pendaftaran_id: pendaftaranId,
        nilai_tes: nilaiTes,
        nilai_wawancara: nilaiWawancara,
        catatan_prestasi: catatan.prestasi || '',
        catatan_staff: catatan.staff || ''
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Input hasil seleksi error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Upload bukti transfer (Staff only)
 */
export async function uploadBuktiTransfer(pendaftaranId, file) {
  try {
    if (!file) throw new Error('File tidak ada')

    const fileExt = file.name.split('.').pop()
    const fileName = `bukti_transfer_${Date.now()}.${fileExt}`
    const filePath = `${pendaftaranId}/${fileName}`

    const { data: storageData, error: storageError } = await supabase.storage
      .from('bukti-transfer')
      .upload(filePath, file, { upsert: false })

    if (storageError) throw storageError

    const { data: urlData } = supabase.storage
      .from('bukti-transfer')
      .getPublicUrl(filePath)

    return {
      success: true,
      filePath: storageData.path,
      fileUrl: urlData.publicUrl
    }
  } catch (error) {
    console.error('Upload bukti transfer error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Record penyaluran dana (Staff only)
 */
export async function recordPenyaluranDana(pendaftaranId, nominal, buktiUrl, tanggalCair) {
  try {
    const { data, error } = await supabase
      .from('penyaluran_dana')
      .insert({
        pendaftaran_id: pendaftaranId,
        nominal: nominal,
        bukti_transfer_url: buktiUrl,
        status: 'pending',
        tanggal_pencairan: tanggalCair
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Record penyaluran dana error:', error.message)
    return { success: false, error: error.message }
  }
}

// ===== EXPORT =====
export default {
  supabase,
  registerMahasiswa,
  loginUser,
  logoutUser,
  getCurrentSession,
  resetPassword,
  getProfile,
  updateProfile,
  getAllBeasiswa,
  getBeasiswaDetail,
  getAllSponsors,
  createPendaftaran,
  getUserPendaftaran,
  getPendaftaranDetail,
  uploadDokumen,
  recordDokumen,
  getDokumenPendaftaran,
  checkPendaftaranStatus,
  createLaporanKendala,
  getUserLaporan,
  getUserNotifikasi,
  markNotifikasiAsRead,
  subscribeToNotifikasi,
  getAllPendaftaran,
  updatePendaftaranStatus,
  inputHasilSeleksi,
  uploadBuktiTransfer,
  recordPenyaluranDana
}