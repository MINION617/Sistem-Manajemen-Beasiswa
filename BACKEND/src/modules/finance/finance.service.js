import { supabaseAdmin } from '../../config/supabase.js'

/** FIN-01: total disbursed funds + counts per disbursement status. */
export async function getDashboard() {
  const { data: rows, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .select('nominal, status')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const totalDisbursed = rows
    .filter((r) => r.status === 'sudah_cair')
    .reduce((sum, r) => sum + Number(r.nominal || 0), 0)

  const perStatus = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1
    return acc
  }, {})

  return { totalDisbursed, perStatus }
}

/**
 * FIN-02: sponsor-based fund allocation report. Aggregated in JS (same
 * approach as modules/kabag) since the query builder doesn't do SQL
 * group-by directly — fine at this data scale.
 */
export async function getAlokasiSponsor() {
  const { data: rows, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .select('nominal, status, pendaftaran(beasiswa(sponsors(id, nama_perusahaan)))')
    .eq('status', 'sudah_cair')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const bySponsor = new Map()
  for (const row of rows) {
    const sponsor = row.pendaftaran?.beasiswa?.sponsors
    if (!sponsor) continue
    const entry = bySponsor.get(sponsor.id) || { sponsorId: sponsor.id, namaPerusahaan: sponsor.nama_perusahaan, total: 0, count: 0 }
    entry.total += Number(row.nominal || 0)
    entry.count += 1
    bySponsor.set(sponsor.id, entry)
  }

  return Array.from(bySponsor.values()).sort((a, b) => b.total - a.total)
}

/**
 * FIN-04: budget realization per program — committed funds (nominal_dana ×
 * ratified recipients) vs funds actually disbursed (sudah_cair).
 */
export async function getRealisasiAnggaran() {
  const [beasiswaRes, penerimaRes, penyaluranRes] = await Promise.all([
    supabaseAdmin.from('beasiswa').select('id, nama_program, nominal_dana, kuota, sponsors(nama_perusahaan)'),
    supabaseAdmin.from('penerima_beasiswa').select('pendaftaran(beasiswa_id)').eq('status', 'disahkan'),
    supabaseAdmin.from('penyaluran_dana').select('nominal, pendaftaran(beasiswa_id)').eq('status', 'sudah_cair'),
  ])
  for (const res of [beasiswaRes, penerimaRes, penyaluranRes]) {
    if (res.error) throw Object.assign(new Error(res.error.message), { status: 502 })
  }

  const disahkanCount = {}
  for (const row of penerimaRes.data) {
    const id = row.pendaftaran?.beasiswa_id
    if (id) disahkanCount[id] = (disahkanCount[id] || 0) + 1
  }
  const tersalurSum = {}
  for (const row of penyaluranRes.data) {
    const id = row.pendaftaran?.beasiswa_id
    if (id) tersalurSum[id] = (tersalurSum[id] || 0) + Number(row.nominal || 0)
  }

  const programs = beasiswaRes.data
    .map((b) => {
      const penerimaDisahkan = disahkanCount[b.id] || 0
      const komitmen = Number(b.nominal_dana || 0) * penerimaDisahkan
      const tersalur = tersalurSum[b.id] || 0
      return {
        beasiswaId: b.id,
        namaProgram: b.nama_program,
        sponsor: b.sponsors?.nama_perusahaan || null,
        nominalPerPenerima: Number(b.nominal_dana || 0),
        kuota: b.kuota,
        penerimaDisahkan,
        komitmen,
        tersalur,
        persentase: komitmen > 0 ? Math.round((tersalur / komitmen) * 100) : null,
      }
    })
    .filter((p) => p.komitmen > 0 || p.tersalur > 0)
    .sort((a, b) => b.komitmen - a.komitmen)

  const totalKomitmen = programs.reduce((s, p) => s + p.komitmen, 0)
  const totalTersalur = programs.reduce((s, p) => s + p.tersalur, 0)
  return {
    programs,
    overall: {
      totalKomitmen,
      totalTersalur,
      persentase: totalKomitmen > 0 ? Math.round((totalTersalur / totalKomitmen) * 100) : null,
    },
  }
}

/**
 * FIN-06: year-over-year disbursement trend, grouped by created_at year
 * (not tanggal_pencairan, which is null until the funds are released).
 */
export async function getTrenPenyaluran() {
  const { data: rows, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .select('nominal, status, created_at')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const byYear = {}
  for (const row of rows) {
    const year = String(new Date(row.created_at).getFullYear())
    if (!byYear[year]) byYear[year] = { totalNominal: 0, totalCair: 0, count: 0, perStatus: {} }
    const nominal = Number(row.nominal || 0)
    byYear[year].totalNominal += nominal
    if (row.status === 'sudah_cair') byYear[year].totalCair += nominal
    byYear[year].count += 1
    byYear[year].perStatus[row.status] = (byYear[year].perStatus[row.status] || 0) + 1
  }

  const years = Object.keys(byYear).sort()
  return { years, byYear }
}

/**
 * FIN-05: aging of outstanding disbursements (pending / sedang_diproses),
 * bucketed by days since the row entered the queue (created_at).
 */
const AGING_BUCKETS = [
  { key: '0-7', maxDays: 7 },
  { key: '8-14', maxDays: 14 },
  { key: '15-30', maxDays: 30 },
  { key: '>30', maxDays: Infinity },
]

export async function getAntrianPencairan() {
  const { data: rows, error } = await supabaseAdmin
    .from('penyaluran_dana')
    .select(
      `id, nominal, status, created_at,
       pendaftaran(profiles!mahasiswa_id(nama_lengkap, nim_nip), beasiswa(nama_program, sponsors(nama_perusahaan)))`
    )
    .neq('status', 'sudah_cair')

  if (error) throw Object.assign(new Error(error.message), { status: 502 })

  const now = Date.now()
  const buckets = Object.fromEntries(AGING_BUCKETS.map((b) => [b.key, { count: 0, nominal: 0 }]))
  const items = rows.map((row) => {
    const umurHari = Math.max(0, Math.floor((now - new Date(row.created_at).getTime()) / 86_400_000))
    const bucket = AGING_BUCKETS.find((b) => umurHari <= b.maxDays)
    buckets[bucket.key].count += 1
    buckets[bucket.key].nominal += Number(row.nominal || 0)
    return {
      id: row.id,
      nama: row.pendaftaran?.profiles?.nama_lengkap || null,
      nim: row.pendaftaran?.profiles?.nim_nip || null,
      beasiswa: row.pendaftaran?.beasiswa?.nama_program || null,
      sponsor: row.pendaftaran?.beasiswa?.sponsors?.nama_perusahaan || null,
      nominal: Number(row.nominal || 0),
      status: row.status,
      umurHari,
    }
  })

  return {
    totalCount: items.length,
    totalNominal: items.reduce((s, i) => s + i.nominal, 0),
    buckets,
    tertua: items.sort((a, b) => b.umurHari - a.umurHari).slice(0, 5),
  }
}
