import { supabaseAdmin } from '../../config/supabase.js'

/**
 * MGMT-01: applicant counts per status + total active applicants, for the
 * Kabag dashboard. One query per status count — pendaftaran rows are not
 * expected to be large enough in this system to warrant a single grouped
 * aggregate RPC yet; revisit if that changes.
 */
export async function getStatistik() {
  const { data: rows, error } = await supabaseAdmin.from('pendaftaran').select('status')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const perStatus = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  return {
    total: rows.length,
    perStatus,
  }
}

/** MGMT-01: realtime applicant list for the active cycle, most recent first. */
export async function listApplicants() {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(`
      id, status, tanggal_daftar, beasiswa_id,
      profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi, ipk),
      beasiswa(nama_program, sponsors(nama_perusahaan)),
      hasil_seleksi(nilai_tes, nilai_wawancara)
    `)
    .order('tanggal_daftar', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

/**
 * MGMT-02: full applicant context for a plenary decision — GPA, certificates
 * (dokumen_pendaftaran), and scores (hasil_seleksi) in one call.
 */
export async function getApplicantDetail(pendaftaranId) {
  const { data, error } = await supabaseAdmin
    .from('pendaftaran')
    .select(`
      *,
      profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi, ipk),
      beasiswa(nama_program, nominal_dana, sponsors(nama_perusahaan)),
      dokumen_pendaftaran(*),
      hasil_seleksi(*),
      penerima_beasiswa(*)
    `)
    .eq('id', pendaftaranId)
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  if (!data) throw Object.assign(new Error('Pendaftaran not found'), { status: 404 })
  return data
}

/** MGMT-03: complaint counts per status, for the Kabag summary dashboard. */
export async function getLaporanStatistik() {
  const { data: rows, error } = await supabaseAdmin.from('laporan_kendala').select('status')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const perStatus = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  return { total: rows.length, perStatus }
}

/**
 * Year-over-year applicant volume. `beasiswa.tahun_akademik` exists but is
 * unpopulated everywhere in this system, so the year is derived from
 * `tanggal_daftar` (always set) instead — aggregated in JS, same style as
 * getStatistik/getLaporanStatistik above.
 */
export async function getTrenPendaftaran() {
  const { data: rows, error } = await supabaseAdmin.from('pendaftaran').select('status, tanggal_daftar')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const byYear = {}
  for (const row of rows) {
    const year = String(new Date(row.tanggal_daftar).getFullYear())
    if (!byYear[year]) byYear[year] = { total: 0, perStatus: {} }
    byYear[year].total += 1
    byYear[year].perStatus[row.status] = (byYear[year].perStatus[row.status] || 0) + 1
  }

  const years = Object.keys(byYear).sort()
  return { years, byYear }
}

const PENERIMA_PERKEMBANGAN_SELECT = `
  *,
  pendaftaran(
    mahasiswa_id, beasiswa_id,
    profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi, ipk),
    beasiswa(nama_program, sponsors(nama_perusahaan))
  ),
  perkembangan_penerima(*)
`

/** Ratified recipients + their post-award progress entries, for the Kabag "Perkembangan Penerima" view. */
export async function getPerkembangan() {
  const { data, error } = await supabaseAdmin
    .from('penerima_beasiswa')
    .select(PENERIMA_PERKEMBANGAN_SELECT)
    .eq('status', 'disahkan')
    .order('created_at', { ascending: false })

  if (error) throw Object.assign(new Error(error.message), { status: 502 })
  return data
}

// A ratified recipient counts as "successful" for the recommendation profile
// if their current IPK, or any recorded post-award IPK snapshot, clears this
// bar. Named constant so the threshold is a documented, tunable decision.
const SUCCESS_IPK_THRESHOLD = 3.0

// Recommendation dimensions and their weights (sum to 1). The 3 "hard"
// academic/objective indicators (ipk, nilai_tes, nilai_wawancara) combine
// to 0.50 of the total weight, split evenly with the 4 subjective interview
// traits (also 0.50 combined, 0.125 each) — an even split between objective
// and subjective evidence. Within the hard indicators, ipk (0.20) is
// weighted above nilai_tes/nilai_wawancara (0.15 each) because it reflects
// sustained multi-semester performance rather than a single test/interview
// day. Full reasoning + a worked manual example: see RUMUS_REKOMENDASI.md.
// skor_prestasi_akademik is captured at interview time but not folded into
// this formula, keeping the weighted dimensions to a clean, explainable set.
const DIMENSION_WEIGHTS = {
  ipk: 0.20,
  nilai_tes: 0.15,
  nilai_wawancara: 0.15,
  nilai_kerja_keras: 0.125,
  nilai_kepemimpinan: 0.125,
  nilai_komunikasi: 0.125,
  nilai_keberanian: 0.125,
}

const DIMENSION_SCALE = {
  ipk: 4,
  nilai_tes: 100,
  nilai_wawancara: 100,
  nilai_kerja_keras: 10,
  nilai_kepemimpinan: 10,
  nilai_komunikasi: 10,
  nilai_keberanian: 10,
}

function extractDimensions(ipk, hasilSeleksi) {
  const hs = hasilSeleksi || {}
  return {
    ipk: ipk ?? null,
    nilai_tes: hs.nilai_tes ?? null,
    nilai_wawancara: hs.nilai_wawancara ?? null,
    nilai_kerja_keras: hs.nilai_kerja_keras ?? null,
    nilai_kepemimpinan: hs.nilai_kepemimpinan ?? null,
    nilai_komunikasi: hs.nilai_komunikasi ?? null,
    nilai_keberanian: hs.nilai_keberanian ?? null,
  }
}

/** Mean of each normalized dimension across the successful-recipient set. */
function computeSuccessProfile(dimensionRows) {
  const sums = {}
  const counts = {}
  for (const dims of dimensionRows) {
    for (const key of Object.keys(DIMENSION_WEIGHTS)) {
      const val = dims[key]
      if (val == null) continue
      const normalized = val / DIMENSION_SCALE[key]
      sums[key] = (sums[key] || 0) + normalized
      counts[key] = (counts[key] || 0) + 1
    }
  }
  const profile = {}
  for (const key of Object.keys(DIMENSION_WEIGHTS)) {
    profile[key] = counts[key] ? sums[key] / counts[key] : null
  }
  return profile
}

/** Weighted-mean-absolute-difference score (0-100, higher = closer match). Missing dimensions are skipped, not zero-filled. */
function scoreCandidate(dims, profile) {
  let weightedDiffSum = 0
  let weightTotal = 0
  const breakdown = {}

  for (const [key, weight] of Object.entries(DIMENSION_WEIGHTS)) {
    const candidateVal = dims[key]
    const profileVal = profile[key]
    if (candidateVal == null || profileVal == null) continue

    const normalizedCandidate = candidateVal / DIMENSION_SCALE[key]
    const diff = Math.abs(normalizedCandidate - profileVal)
    weightedDiffSum += weight * diff
    weightTotal += weight
    breakdown[key] = { candidate: candidateVal, profileMean: profileVal * DIMENSION_SCALE[key], diff }
  }

  if (weightTotal === 0) return { score: null, breakdown }
  const score = Math.round(100 * (1 - weightedDiffSum / weightTotal))
  return { score, breakdown }
}

/**
 * Ranks current wawancara-stage candidates for a scholarship program against
 * the automatically-derived profile of past successful recipients. Cold-start
 * (no successful recipients yet) returns profileAvailable: false and an
 * unranked candidate list sorted by IPK instead.
 */
export async function getRekomendasi(beasiswaId) {
  const { data: penerimaRows, error: penerimaError } = await supabaseAdmin
    .from('penerima_beasiswa')
    .select(`
      status,
      pendaftaran(
        profiles!mahasiswa_id(ipk),
        hasil_seleksi(*)
      ),
      perkembangan_penerima(ipk_snapshot)
    `)
    .eq('status', 'disahkan')

  if (penerimaError) throw Object.assign(new Error(penerimaError.message), { status: 502 })

  const successfulDimensions = penerimaRows
    .filter((row) => {
      const ipk = row.pendaftaran?.profiles?.ipk
      const bestSnapshot = Math.max(0, ...(row.perkembangan_penerima || []).map((p) => p.ipk_snapshot || 0))
      return (ipk != null && ipk >= SUCCESS_IPK_THRESHOLD) || bestSnapshot >= SUCCESS_IPK_THRESHOLD
    })
    .map((row) => {
      const hs = Array.isArray(row.pendaftaran?.hasil_seleksi)
        ? row.pendaftaran.hasil_seleksi[0]
        : row.pendaftaran?.hasil_seleksi
      return extractDimensions(row.pendaftaran?.profiles?.ipk, hs)
    })

  const profileAvailable = successfulDimensions.length > 0
  const profile = profileAvailable ? computeSuccessProfile(successfulDimensions) : null

  const { data: candidateRows, error: candidateError } = await supabaseAdmin
    .from('pendaftaran')
    .select(`
      id, status, tanggal_daftar,
      profiles!mahasiswa_id(nama_lengkap, nim_nip, program_studi, ipk),
      beasiswa(nama_program),
      hasil_seleksi(*)
    `)
    .eq('beasiswa_id', beasiswaId)
    .eq('status', 'wawancara')

  if (candidateError) throw Object.assign(new Error(candidateError.message), { status: 502 })

  const candidates = candidateRows.map((row) => {
    const hs = Array.isArray(row.hasil_seleksi) ? row.hasil_seleksi[0] : row.hasil_seleksi
    const dims = extractDimensions(row.profiles?.ipk, hs)
    const { score, breakdown } = profileAvailable
      ? scoreCandidate(dims, profile)
      : { score: null, breakdown: {} }

    return {
      id: row.id,
      mahasiswa: row.profiles,
      beasiswa: row.beasiswa,
      score,
      breakdown,
    }
  })

  candidates.sort((a, b) => {
    if (profileAvailable) return (b.score ?? -1) - (a.score ?? -1)
    return (b.mahasiswa?.ipk ?? 0) - (a.mahasiswa?.ipk ?? 0)
  })

  return { profileAvailable, profile, candidates }
}
