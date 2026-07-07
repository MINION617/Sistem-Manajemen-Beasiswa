# Rumus Rekomendasi Kandidat (Kabag)

Dokumen ini menjelaskan cara kerja fitur **Rekomendasi Kandidat** yang dipakai Kabag
untuk meranking kandidat tahap wawancara terhadap "profil penerima yang berhasil".
Implementasinya ada di `BACKEND/src/modules/kabag/kabag.service.js` (fungsi
`getRekomendasi`, `computeSuccessProfile`, `scoreCandidate`), ditampilkan lewat
`FRONTEND/KABAGWABAG/KABAG/rekomendasiKandidat.js`.

**Prinsip dasar:** ini bukan model machine learning (tidak ada training data,
tidak ada black-box). Ini adalah **weighted similarity** — mirip menghitung
"seberapa dekat nilai kandidat ini dengan rata-rata nilai penerima yang sudah
terbukti berhasil", lalu diberi skor 0–100.

---

## 1. Siapa yang dianggap "berhasil"?

Penerima beasiswa (status `disahkan` di tabel `penerima_beasiswa`) dianggap
**berhasil** kalau IPK-nya (baik IPK awal di `profiles.ipk`, atau snapshot IPK
terbaru di `perkembangan_penerima.ipk_snapshot`) mencapai **≥ 3.0**
(`SUCCESS_IPK_THRESHOLD` di kode).

Kalau belum ada satu pun penerima yang memenuhi syarat ini (*cold start* — baru
mulai pakai sistem, belum ada histori), fitur ini otomatis **tidak menghitung
skor sama sekali** dan hanya mengurutkan kandidat berdasarkan IPK saja
(`profileAvailable: false`). Ini supaya sistem tidak memberi angka kepercayaan
diri yang palsu ketika belum ada data pembanding yang valid.

## 2. Profil "penerima berhasil" (`profileMean`)

Untuk tiap dimensi, dihitung rata-rata dari seluruh penerima berhasil, **setelah
dinormalisasi ke skala 0–1** (dibagi skala masing-masing dimensi). Dimensi yang
datanya kosong (`null`) untuk seorang penerima, dilewati (bukan dianggap 0) —
supaya penerima yang belum lengkap datanya tidak menyeret rata-rata ke bawah
secara tidak adil.

```
profileMean_k = rata-rata( nilai_k / skala_k )   dari semua penerima berhasil
                yang punya nilai_k (tidak null)
```

## 3. Skor kandidat

> **Revisi:** versi awal rumus ini mengukur jarak absolut dua arah (lihat
> catatan di bagian 7) — kandidat yang nilainya jauh DI ATAS profil penerima
> berhasil ikut kena "penalti jarak" yang sama besarnya dengan kandidat yang
> nilainya jauh DI BAWAH profil. Efeknya, kandidat IPK rendah yang kebetulan
> dekat dengan rata-rata historis bisa mengalahkan kandidat IPK tinggi yang
> jauh di atas rata-rata. Rumus di bawah ini sudah direvisi: nilai yang SAMA
> DENGAN atau DI ATAS profil tidak lagi dikurangi sama sekali.

Untuk tiap kandidat (pendaftar tahap wawancara) pada satu program beasiswa:

```
shortfall_k = max( 0, profileMean_k − (nilai_kandidat_k / skala_k) )

Score = round( 100 × ( 1 − Σ(bobot_k × shortfall_k) / Σ(bobot_k yang datanya tersedia) ) )
```

Kandidat yang nilainya menyamai atau melampaui `profileMean_k` pada suatu
dimensi mendapat skor penuh (`shortfall_k = 0`) di dimensi itu — tidak ada
lagi pengurangan karena "terlalu jauh di atas rata-rata". Hanya kandidat yang
nilainya di BAWAH profil yang skornya berkurang, sebanding dengan seberapa
jauh kekurangannya.

Dimensi yang datanya kosong pada kandidat ATAU pada profil (`profileMean_k`)
**dilewati sepenuhnya** — baik dari pembilang maupun penyebut (`weightTotal`).
Ini penting: kalau seorang kandidat belum punya nilai wawancara, dimensi itu
tidak dihitung sebagai "0% mirip", tapi benar-benar tidak diikutkan, dan sisa
bobotnya dinormalisasi ulang di antara dimensi yang tersedia.

## 4. Tabel bobot & alasannya

| Dimensi | Bobot | Skala | Alasan |
|---|---|---|---|
| IPK | **0.20** | 0–4 | Indikator akademik objektif, mencerminkan performa berkelanjutan lintas semester (bukan cuma satu momen ujian) — makanya dibobot sedikit lebih tinggi dari nilai tes/wawancara. |
| Nilai Tes | **0.15** | 0–100 | Indikator objektif, tapi hanya potret satu hari ujian tertulis. |
| Nilai Wawancara | **0.15** | 0–100 | Indikator objektif dari sesi wawancara, sama levelnya dengan nilai tes. |
| Kerja Keras | **0.125** | 1–10 | Trait subjektif, dinilai staff saat wawancara. |
| Kepemimpinan | **0.125** | 1–10 | Trait subjektif. |
| Komunikasi | **0.125** | 1–10 | Trait subjektif. |
| Keberanian | **0.125** | 1–10 | Trait subjektif. |

**Total bobot = 1.00.** Tiga indikator "keras"/objektif (IPK, tes, wawancara)
digabung berbobot **0.50**, seimbang 50:50 dengan empat trait "lunak"/subjektif
wawancara yang juga digabung **0.50** — supaya rekomendasi tidak semata-mata
akademik, tapi juga mempertimbangkan penilaian kualitatif staff terhadap
karakter kandidat.

**Catatan:** `catatan_prestasi` dan `skor_prestasi_akademik` sengaja **tidak**
diikutkan dalam rumus ini, supaya himpunan dimensi yang dihitung tetap kecil
dan mudah dijelaskan ulang saat tanya jawab.

## 5. Fallback cold-start

Kalau `profileAvailable: false` (belum ada penerima berhasil sebagai
pembanding), kandidat **tidak diberi skor** dan daftar diurutkan murni
berdasarkan IPK tertinggi ke terendah. Perilaku ini konsisten di backend
(`kabag.service.js`, percabangan di `candidates.sort(...)`) maupun frontend
(`rekomendasiKandidat.js`, variabel `coldStart`).

---

## 6. Contoh Perhitungan Manual — Kandidat p-001 (Bagas Pratama Wijaya)

Data ini persis sama dengan yang tampil di `dummyRekomendasi` pada
`FRONTEND/KABAGWABAG/KABAG/rekomendasiKandidat.js` (dipakai saat demo tanpa
koneksi backend). Anggap profil penerima berhasil untuk program ini baru
punya 3 dimensi yang lengkap datanya: IPK, Nilai Tes, Nilai Wawancara.

**Data kandidat & profil:**

| Dimensi | Nilai Kandidat | Skala | Profil Penerima Berhasil (rata-rata, skala natural) |
|---|---|---|---|
| IPK | 3.82 | 4 | 3.70 |
| Nilai Tes | 88 | 100 | 85 |
| Nilai Wawancara | 85 | 100 | 84 |

**Langkah 1 — Normalisasi ke skala 0–1:**

```
IPK:              kandidat = 3.82 / 4   = 0.955     profil = 3.70 / 4   = 0.925
Nilai Tes:        kandidat = 88   / 100 = 0.88       profil = 85   / 100 = 0.85
Nilai Wawancara:  kandidat = 85   / 100 = 0.85       profil = 84   / 100 = 0.84
```

**Langkah 2 — Shortfall (kekurangan di bawah profil) per dimensi** — kandidat
di sini unggul di ketiga dimensi, jadi semua shortfall-nya 0:

```
shortfall_ipk         = max(0, 0.925 − 0.955) = 0
shortfall_tes         = max(0, 0.85  − 0.88 ) = 0
shortfall_wawancara   = max(0, 0.84  − 0.85 ) = 0
```

**Langkah 3 — Kalikan tiap shortfall dengan bobotnya, jumlahkan:**

```
weightedShortfallSum = (0.20 × 0) + (0.15 × 0) + (0.15 × 0) = 0
```

**Langkah 4 — Total bobot yang datanya tersedia** (di contoh ini cuma 3 dari 7
dimensi yang punya data, jadi `weightTotal` bukan 1.0 penuh):

```
weightTotal = 0.20 + 0.15 + 0.15 = 0.50
```

**Langkah 5 — Hitung skor akhir:**

```
Score = round( 100 × (1 − weightedShortfallSum / weightTotal) )
      = round( 100 × (1 − 0 / 0.50) )
      = round( 100 × 1 )
      = 100
```

**Hasil: Bagas Pratama Wijaya mendapat skor rekomendasi 100/100** — unggul
atau menyamai profil rata-rata penerima berhasil di ketiga dimensi yang
tersedia, jadi tidak ada shortfall sama sekali.

Sebagai pembanding, kandidat p-002 (Dimas Surya Atmaja: IPK 3.65, Tes 79,
Wawancara 82) dengan profil yang sama berada DI BAWAH profil di ketiga
dimensi, jadi shortfall-nya bukan nol:

```
shortfall_ipk       = max(0, 0.925 − 0.9125) = 0.0125   (IPK 3.65/4 = 0.9125)
shortfall_tes       = max(0, 0.85  − 0.79  ) = 0.06
shortfall_wawancara = max(0, 0.84  − 0.82  ) = 0.02

weightedShortfallSum = (0.20×0.0125) + (0.15×0.06) + (0.15×0.02) = 0.0145
Score = round(100 × (1 − 0.0145/0.50)) = round(97.1) = 97
```

**Dimas mendapat skor 97** — tidak berubah dari rumus sebelumnya, karena dia
memang di bawah profil di semua dimensi (rumus lama dan baru sama-sama
menghukum kekurangan itu). Yang berubah hanya kasus Bagas: rumus lama
menghukumnya juga (walau kecil) karena dianggap "terlalu jauh DI ATAS
profil", sekarang tidak lagi.

> **Catatan verifikasi:** angka-angka ini dihasilkan dari menjalankan ulang
> rumus `scoreCandidate()` (versi shortfall-only, lihat revisi di bagian 3)
> secara manual di luar aplikasi, memakai persis nilai kandidat & profil yang
> sudah ada di data contoh (`dummyRekomendasi`) — bukan angka yang dieyeball.

## 7. Catatan tambahan untuk sesi tanya jawab

- **Kenapa dua kandidat yang jelas unggul di semua dimensi bisa sama-sama
  dapat skor 100?** Karena rumus (versi shortfall-only) tidak memberi bonus
  untuk melampaui profil — begitu kandidat menyamai atau melewati
  `profileMean_k` di suatu dimensi, dimensi itu langsung dianggap "penuh",
  berapa pun jauhnya dia melampaui. Ini didesain sengaja: tujuan rumus ini
  adalah menyaring kandidat yang **tidak kekurangan** dibanding profil
  penerima berhasil, bukan meranking siapa yang paling jauh melampauinya.
  Kalau butuh pembeda di antara sesama kandidat yang sudah skor 100, lihat
  nilai mentahnya langsung di breakdown/grafik radar, bukan dari skor akhir.
- **Kenapa versi sebelumnya bisa merekomendasikan kandidat IPK rendah di atas
  kandidat IPK tinggi?** Rumus versi awal (lihat riwayat git) mengukur jarak
  absolut dua arah — kandidat yang jauh DI ATAS profil kena "penalti jarak"
  yang sama seperti yang jauh DI BAWAH. Kandidat IPK rendah yang kebetulan
  dekat rata-rata historis bisa menang atas kandidat IPK tinggi yang jauh di
  atas rata-rata. Revisi di bagian 3 (shortfall-only) menutup celah ini.
- **Kenapa bukan model Machine Learning?** Karena data historis penerima masih
  sangat sedikit (belum cukup untuk melatih model yang andal), dan rumus
  weighted-similarity ini transparan — setiap angka bisa dilacak dan
  dipertanggungjawabkan manual, cocok untuk konteks keputusan akademik yang
  perlu bisa dijelaskan ke pihak manapun yang bertanya.
