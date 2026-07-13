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
    beasiswa(nama_program, ipk_minimum, sponsors(nama_perusahaan))
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

// A program only switches from staff's manual target (beasiswa.target_*) to
// the automatically-derived historical profile once it has accumulated this
// many successful recipients — a handful of early graduates isn't a reliable
// enough sample to trust over what staff deliberately set at program
// creation. Below this count, manual targets (if any were set) are used
// instead; see buildManualProfile() and getRekomendasi().
const MIN_HISTORICAL_SAMPLE = 10

// Recommendation dimensions and their weights (sum to 1). IPK and nilai tes
// are the two dominant indicators (0.40 each, 0.80 combined) since they're
// the most objective, comparable-across-candidates signals. The remaining
// 0.20 covers interview performance + character fit (nilai_wawancara plus
// the 4 personality traits), split evenly five ways (0.04 each) rather than
// weighted individually. Full reasoning + a worked manual example: see
// RUMUS_REKOMENDASI.md. skor_prestasi_akademik is captured at interview time
// but not folded into this formula, keeping the weighted dimensions to a
// clean, explainable set.
const DIMENSION_WEIGHTS = {
  ipk: 0.40,
  nilai_tes: 0.40,
  nilai_wawancara: 0.04,
  nilai_kerja_keras: 0.04,
  nilai_kepemimpinan: 0.04,
  nilai_komunikasi: 0.04,
  nilai_keberanian: 0.04,
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

/**
 * Staff-set target scores (beasiswa.target_ipk etc.), normalized the same
 * way as computeSuccessProfile so scoreCandidate() can't tell the two apart.
 * Returns null if staff left every target column unset (nothing to fall
 * back to — caller stays in cold-start mode).
 */
function buildManualProfile(beasiswaRow) {
  const raw = {
    ipk: beasiswaRow?.target_ipk,
    nilai_tes: beasiswaRow?.target_nilai_tes,
    nilai_wawancara: beasiswaRow?.target_nilai_wawancara,
    nilai_kerja_keras: beasiswaRow?.target_kerja_keras,
    nilai_kepemimpinan: beasiswaRow?.target_kepemimpinan,
    nilai_komunikasi: beasiswaRow?.target_komunikasi,
    nilai_keberanian: beasiswaRow?.target_keberanian,
  }
  if (Object.values(raw).every((v) => v == null)) return null

  const profile = {}
  for (const key of Object.keys(DIMENSION_WEIGHTS)) {
    profile[key] = raw[key] != null ? raw[key] / DIMENSION_SCALE[key] : null
  }
  return profile
}

/**
 * Weighted score (0-100, higher = better). Missing dimensions are skipped,
 * not zero-filled.
 *
 * Only SHORTFALL below the successful-recipient profile is penalized — a
 * candidate at or above the profile mean on a dimension gets full marks on
 * it, same as one sitting exactly on the mean. Previously this used
 * absolute distance in both directions, so a candidate far ABOVE the
 * profile (e.g. IPK 4.0 against a 3.3 mean) scored WORSE than one sitting
 * right on a mediocre mean — a low-IPK candidate could rank above a
 * clearly stronger one just for being "typical". See RUMUS_REKOMENDASI.md
 * for the previous symmetric-distance rationale this replaces.
 */
function scoreCandidate(dims, profile) {
  let weightedShortfallSum = 0
  let weightTotal = 0
  const breakdown = {}

  for (const [key, weight] of Object.entries(DIMENSION_WEIGHTS)) {
    const candidateVal = dims[key]
    const profileVal = profile[key]
    if (candidateVal == null || profileVal == null) continue

    const normalizedCandidate = candidateVal / DIMENSION_SCALE[key]
    const shortfall = Math.max(0, profileVal - normalizedCandidate)
    weightedShortfallSum += weight * shortfall
    weightTotal += weight
    breakdown[key] = { candidate: candidateVal, profileMean: profileVal * DIMENSION_SCALE[key], diff: Math.abs(normalizedCandidate - profileVal) }
  }

  if (weightTotal === 0) return { score: null, breakdown }
  const score = Math.round(100 * (1 - weightedShortfallSum / weightTotal))
  return { score, breakdown }
}

/**
 * Ranks current wawancara-stage candidates for a scholarship program against
 * an "acuan penerima berhasil" profile. Once the program has at least
 * MIN_HISTORICAL_SAMPLE successful recipients, the profile is the
 * automatically-derived average of their scores (profileSource: 'historis').
 * Below that, it falls back to staff's manual target_* columns on beasiswa
 * if any were set (profileSource: 'manual'). If neither is available, this
 * is cold-start: profileAvailable: false, candidates just sorted by IPK.
 */
export async function getRekomendasi(beasiswaId) {
  const { data: beasiswaRow, error: beasiswaRowError } = await supabaseAdmin
    .from('beasiswa')
    .select('id, ipk_minimum, target_ipk, target_nilai_tes, target_nilai_wawancara, target_kerja_keras, target_kepemimpinan, target_komunikasi, target_keberanian')
    .eq('id', beasiswaId)
    .single()

  if (beasiswaRowError) throw Object.assign(new Error(beasiswaRowError.message), { status: 502 })

  const { data: penerimaRows, error: penerimaError } = await supabaseAdmin
    .from('penerima_beasiswa')
    .select(`
      status,
      pendaftaran(
        beasiswa_id,
        profiles!mahasiswa_id(ipk),
        hasil_seleksi(*)
      ),
      perkembangan_penerima(ipk_snapshot)
    `)
    .eq('status', 'disahkan')

  if (penerimaError) throw Object.assign(new Error(penerimaError.message), { status: 502 })

  // Acuan "penerima berhasil" harus dihitung KHUSUS dari penerima program ini
  // saja — sebelumnya tidak difilter sama sekali, jadi ketiga program
  // beasiswa (yang profil sukses-nya semestinya beda-beda) semuanya memakai
  // satu acuan gabungan yang identik.
  const penerimaProgramIni = penerimaRows.filter((row) => row.pendaftaran?.beasiswa_id === beasiswaId)

  const successfulDimensions = penerimaProgramIni
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

  const historicalAvailable = successfulDimensions.length >= MIN_HISTORICAL_SAMPLE
  const manualProfile = buildManualProfile(beasiswaRow)
  const profileSource = historicalAvailable ? 'historis' : manualProfile ? 'manual' : null
  const profile = historicalAvailable ? computeSuccessProfile(successfulDimensions) : manualProfile
  const profileAvailable = profile != null

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

  // Pendaftaran itself has no IPK gate (daftar/verifikasi berkas tetap
  // terbuka untuk semua, keputusan manual staff) — tapi Kabag tidak boleh
  // direkomendasikan kandidat yang IPK-nya di bawah syarat minimum program
  // ini, berapa pun bagus dimensi lainnya. Dipisah dari daftar utama (bukan
  // di-drop diam-diam) supaya Kabag tahu ada yang disaring dan kenapa.
  const ipkMinimum = beasiswaRow?.ipk_minimum ?? null
  const belowMinimumRows = ipkMinimum != null
    ? candidateRows.filter((row) => row.profiles?.ipk != null && row.profiles.ipk < ipkMinimum)
    : []
  const eligibleRows = ipkMinimum != null
    ? candidateRows.filter((row) => row.profiles?.ipk == null || row.profiles.ipk >= ipkMinimum)
    : candidateRows

  const candidates = eligibleRows.map((row) => {
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

  const excludedBelowMinimum = belowMinimumRows.map((row) => ({
    id: row.id,
    mahasiswa: row.profiles,
    ipkMinimum,
  }))

  return { profileAvailable, profileSource, profile, candidates, ipkMinimum, excludedBelowMinimum }
}
