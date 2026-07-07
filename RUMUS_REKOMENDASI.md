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

## 3. Skor kemiripan kandidat

Untuk tiap kandidat (pendaftar tahap wawancara) pada satu program beasiswa:

```
similarity_k = 1 − | (nilai_kandidat_k / skala_k) − profileMean_k |

Score = round( 100 × Σ(bobot_k × similarity_k) / Σ(bobot_k yang datanya tersedia) )
```

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

**Langkah 2 — Selisih absolut (`diff`) per dimensi:**

```
diff_ipk         = |0.955 − 0.925| = 0.030
diff_tes         = |0.88  − 0.85 | = 0.030
diff_wawancara   = |0.85  − 0.84 | = 0.010
```

**Langkah 3 — Kalikan tiap diff dengan bobotnya, jumlahkan:**

```
weightedDiffSum = (0.20 × 0.030) + (0.15 × 0.030) + (0.15 × 0.010)
                = 0.0060 + 0.0045 + 0.0015
                = 0.0120
```

**Langkah 4 — Total bobot yang datanya tersedia** (di contoh ini cuma 3 dari 7
dimensi yang punya data, jadi `weightTotal` bukan 1.0 penuh):

```
weightTotal = 0.20 + 0.15 + 0.15 = 0.50
```

**Langkah 5 — Hitung skor akhir:**

```
Score = round( 100 × (1 − weightedDiffSum / weightTotal) )
      = round( 100 × (1 − 0.0120 / 0.50) )
      = round( 100 × (1 − 0.024) )
      = round( 100 × 0.976 )
      = round( 97.6 )
      = 98
```

**Hasil: Bagas Pratama Wijaya mendapat skor rekomendasi 98/100** — sangat
dekat dengan profil rata-rata penerima yang sudah terbukti berhasil di program
ini, karena selisih di ketiga dimensi yang tersedia semuanya kecil (≤ 0.03
pada skala 0–1).

Sebagai pembanding, kandidat p-002 (Dimas Surya Atmaja: IPK 3.65, Tes 79,
Wawancara 82) dengan profil yang sama menghasilkan skor **97** — sedikit lebih
rendah, terutama karena selisih nilai tesnya lebih besar (`|0.79−0.85|=0.06`,
dua kali lipat selisih Bagas).

> **Catatan verifikasi:** kedua angka ini (98 dan 97) dihasilkan dari
> menjalankan ulang rumus `scoreCandidate()` secara manual di luar aplikasi,
> memakai persis nilai kandidat & profil yang sudah ada di data contoh
> (`dummyRekomendasi`) — bukan angka yang dieyeball. Nilai `score` di
> `rekomendasiKandidat.js` sudah disesuaikan supaya cocok dengan hasil ini.

## 7. Catatan tambahan untuk sesi tanya jawab

- **Kenapa dua kandidat contoh sama-sama skornya tinggi (97–98), padahal salah
  satu terlihat "lebih baik"?** Karena rumus ini mengukur *jarak relatif
  terhadap skala penuh dimensi* (mis. skala nilai tes 0–100). Selisih beberapa
  poin nilai tes hanya menggeser skor sedikit karena dibagi skala besar (100).
  Efek praktisnya: kandidat dengan profil yang berdekatan dengan penerima
  sukses cenderung sama-sama mendapat skor tinggi di rentang atas — rumus ini
  lebih cocok dibaca sebagai "seberapa dekat", bukan "seberapa jauh lebih
  unggul" satu kandidat dari yang lain.
- **Kenapa bukan model Machine Learning?** Karena data historis penerima masih
  sangat sedikit (belum cukup untuk melatih model yang andal), dan rumus
  weighted-similarity ini transparan — setiap angka bisa dilacak dan
  dipertanggungjawabkan manual, cocok untuk konteks keputusan akademik yang
  perlu bisa dijelaskan ke pihak manapun yang bertanya.
