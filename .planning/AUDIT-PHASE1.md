# AUDIT PHASE 1 — Sistem Informasi Manajemen Beasiswa

**Auditor:** Senior Software Architect (review atas hasil kerja Codex)
**Tanggal audit:** 2026-06-21
**Status proyek saat audit:** Phase 1 *planned but NOT executed* (`STATE.md` → "Ready to execute", `completed_plans: 0`)
**Scope audit:** Planning Phase 1 (ROADMAP/REQUIREMENTS/STATE/PROJECT + CONTEXT/RESEARCH/SKELETON/3 PLAN) + partial frontend (prototype 1.2) + BACKEND + DATABASE.

---

## 0. TEMUAN UTAMA (baca ini dulu)

Ada **tiga kenyataan struktural** yang mengubah cara phase 2 harus dipikirkan:

1. **Plan Phase 1 sudah usang (stale) terhadap kode yang ada.**
   Plan dibuat **17 Jun 2026**. Frontend di-*update* menjadi **"prototype 1.2" pada 21 Jun 2026** (lihat git: `9971b9a feat: update FRONTEND prototype 1.2`). Akibatnya asumsi inti di `01-RESEARCH.md` sudah tidak benar lagi:
   - RESEARCH bilang *"login is mahasiswa-only and redirects straight to dashboard.html"* → **SALAH**. `FRONTEND/LOGIN/login.js` (704 baris) sekarang adalah router **4-role penuh** (mahasiswa/staff/kabag/wabag) + mode gabungan `kabag_wabag`.
   - RESEARCH bilang *"sponsor.js is empty"* → benar, **tetapi** sudah ada `STAFFADMIN/sponsorDanBeasiswa/manajemenSponsorBeasiswa.js` (1109 baris) yang melakukan **CRUD sponsor + beasiswa lengkap**. Task plan untuk membangun `SPONSOR/sponsor.js` jadi **redundant**.

2. **Plan & prototype memilih jalur data yang BERTENTANGAN dengan requirement, dan keputusan ini belum diselesaikan.**
   - `REQUIREMENTS.md` AUTH-01 / FR-001: *"Login using NIM and Password **via Supabase Auth**"*.
   - `01-CONTEXT.md` D-12: *"use **JavaScript dummy data**"* untuk Phase 1.
   - Realitanya prototype memakai **3 pendekatan berbeda sekaligus** yang tidak ada yang jalan: (a) dummy JS inline di tiap halaman, (b) `fetch()` mentah ke REST Supabase dengan konstanta placeholder `https://YOUR_PROJECT.supabase.co`, (c) `BACKEND/supabaseclient.js` (SDK + `import.meta.env`) yang **tidak pernah di-import** siapa pun.

3. **Tidak ada backend nyata sama sekali — dan ini risiko terbesar untuk phase 2–4.**
   - `BACKEND/server.js` = **0 byte (kosong)**.
   - **Tidak ada schema Supabase / DDL / migration di mana pun.** Yang ada cuma `DATABASE/beasiswa.sql` = dump **MySQL lama** dengan nama tabel/kolom yang **tidak cocok** dengan kode (`nama_beasiswa` vs `nama_program`, `id_beasiswa` vs `id`, role `WAREK` vs `wabag`).
   - **Tidak ada definisi RLS, tidak ada storage bucket, tidak ada `.gitignore`.**

> **Implikasi strategis:** Seluruh UI untuk Phase 1–4 sebenarnya *sudah ada* sebagai prototype (≈14.700 baris JS). Yang BELUM ada adalah fondasi backend yang menjadi tumpuan setiap requirement. PITFALLS.md sudah memperingatkan ini: *"Existing UI pages may create a false sense of completeness even where backend workflow logic is missing."* Peringatan itu sekarang terbukti.

---

## 1. SUMMARY (checklist area audit)

| Area Audit | Status | Verdict singkat |
|---|:---:|---|
| 1A. Role coverage di plan | ⚠️ `[~]` | Mahasiswa kuat; Staff Phase 1 sengaja minimal; **Kabag & Wabag tidak ada di Phase 1 (by design)**, tapi ada ambiguitas siapa yang "approve". |
| 1B. Supabase schema review | ❌ `[ ]` | **Tidak ada schema, RLS, storage, atau strategi auth yang konkret.** Gap terbesar. |
| 1C. Kualitas acceptance criteria | ⚠️ `[~]` | Banyak AC bersifat *structural/existence* ("file ada & berisi X"), bukan *behavioral*. `<verify>` cuma grep keyword. |
| 1D. Dependency & sequencing | ✅ `[x]` | Urutan logis (foundation→mahasiswa+admin), tidak ada circular dep, ukuran task wajar. **Tapi** dibangun di atas peta kode yang usang. |
| 1E. Gap analysis | ❌ `[ ]` | Banyak keputusan teknis penting tidak ada (schema, RLS, storage, config/run, migrasi dummy→Supabase, event "verifikasi dimulai", anti-duplikasi pendaftaran). |
| 2. Audit frontend partial | ✅ `[x]` | Selesai: 30+ file diinventarisasi (lihat §3). UI lengkap, **0 backend**, redirect guard di-comment. |

### 🔴 CRITICAL ISSUES (blocker — wajib diberesi sebelum lanjut)

- **C1 — Tidak ada canonical data model / schema Supabase.** Tidak ada satu file DDL pun. `supabaseclient.js` mereferensi 10 tabel (`profiles`, `sponsors`, `beasiswa`, `pendaftaran`, `dokumen_pendaftaran`, `hasil_seleksi`, `penerima_beasiswa`, `penyaluran_dana`, `laporan_kendala`, `notifikasi`) yang **tidak pernah didefinisikan**. Tanpa ini, klaim "dummy bisa di-map ke Supabase nanti" tidak terverifikasi.
- **C2 — Keputusan data-source belum diselesaikan & saling bertentangan.** Requirement minta Supabase Auth; plan minta dummy JS; kode punya 3 jalur tak-jalan. Harus diputuskan eksplisit sebelum phase 2, kalau tidak utang teknis ini akan menjalar ke semua phase.
- **C3 — Plan tidak sinkron dengan prototype 1.2.** Bila plan dieksekusi *as-written*, ia akan (a) me-refactor `login.js` yang sudah jadi router 4-role → **risiko regresi**, dan (b) membangun `SPONSOR/sponsor.js` yang **duplikat** dengan `manajemenSponsorBeasiswa.js`. Plan harus di-rebaseline dulu.
- **C4 — Workflow inti mahasiswa tidak terhubung.** `daftarBeasiswa.js` submit = delay palsu 1.5 detik; **tidak membuat record `pendaftaran`, tidak men-set status apa pun**, dan tidak nyambung ke `pendaftaranSaya`. APPL-02 secara fungsional belum ada.

### 🟠 MAJOR ISSUES (penting, tidak memblok)

- **M1 — `.env` ter-commit ke git + tidak ada `.gitignore`.** Saat ini isinya placeholder (`your...`, bukan JWT `eyJ...`) jadi **belum ada kebocoran nyata**, tapi begitu key asli diisi, key (termasuk `SUPABASE_SERVICE_ROLE_KEY`) akan ikut ter-commit. Tambahkan `.gitignore` + `git rm --cached BACKEND/.env` + sediakan `.env.example`.
- **M2 — Profile readiness gate (D-06/D-07) tidak ada di kode.** `profilMahasiswa.js` tidak punya logika kunci; tidak ada cek kelengkapan profil/dokumen sebelum mendaftar. Ini fitur inti Phase 1 yang belum tersentuh.
- **M3 — Duplikasi masif & pelanggaran DRY.** Dummy data, `getSession()`, dan enum status diulang di 10+ file. Inilah risiko "page-local divergence" yang diprediksi RESEARCH — dan plan (yang benar idenya: bikin `FRONTEND/shared/*`) belum dieksekusi.
- **M4 — Role guard di-comment di semua dashboard internal** (STAFFADMIN, KABAG, WABAG). Untuk prototype OK, tapi harus jadi item eksplisit "aktifkan sebelum data nyata".
- **M5 — Inkonsistensi vocabulary status.** Tiga representasi beredar: `"Menunggu verifikasi"` (plan, title-case + spasi), `"menunggu_verifikasi"` (supabaseclient + halaman prototype, snake_case), dan label tampilan `"Menunggu Verifikasi"`. Harus dikanonikalisasi.
- **M6 — Ambiguitas peran approval.** Brief: *Kabag memberi ACC final penerima*. Tapi REQUIREMENTS SELE-02/FR-011 menugaskan "update status → penerima" ke **Staff**, dan `penetapanPenerima.js` adalah halaman **role `staff`**. Siapa yang sebenarnya meng-klik approve? Perlu diputuskan (mis. Kabag memutuskan, Staff merekam — atau Kabag merekam langsung).

### 🟡 MINOR ISSUES (nice to fix)

- **N1 — WABAG dashboard tidak memuat Chart.js** padahal FIN-01 minta "dashboard with charts". Saat ini cuma kartu statistik + tabel. (`profilPerusahaanBeasiswa` punya `chart.min.js`, tapi WABAG tidak.)
- **N2 — Query param di-set tapi tidak dibaca.** `daftarBeasiswa.html?id=` dan `profilPerusahaanBeasiswa.html?sponsor=` tidak pernah di-parse → deep-link tidak berfungsi.
- **N3 — `profilPerusahaanBeasiswa` hanya punya data 3 dari 8 sponsor** yang ditampilkan di `kumpulanPerusahaanBeasiswa` → klik sebagian sponsor akan kosong.
- **N4 — File mati:** `SPONSOR/sponsor.{html,js,css}` (0 byte, tak direferensikan), `profilPerusahaanBeasiswa/chart.js` (0 byte). Pertimbangkan dihapus.
- **N5 — "Event yang mengakhiri editability" (D-10) tidak didefinisikan.** Discussion log sendiri menulis *"Planning should define what event ends the editable window"* — tapi plan tidak pernah mendefinisikannya.
- **N6 — Tidak ada cara menjalankan app yang terdokumentasi** (tidak ada `package.json`, dev server, atau `index.html` root). `supabaseclient.js` pakai `import.meta.env` (butuh Vite) sementara halaman pakai `<script>` klasik — dua model loading yang tak kompatibel.

---

## 2. AUDIT PLANNING PHASE 1

### 2A. Kelengkapan Role Coverage

Penting: Phase 1 **secara sengaja** hanya mencakup mahasiswa + admin master-data (SPON-01/SCHL-01). Verifikasi, penilaian, penetapan, pencairan didorong ke Phase 2–4. Jadi evaluasi coverage harus dilihat **lintas roadmap**, bukan hanya Phase 1.

| Role | Kebutuhan (dari prompt audit) | Ter-cover di roadmap? | Catatan |
|---|---|:---:|---|
| **Mahasiswa** | daftar, upload dokumen, tracking status, notifikasi | ✅ Lengkap | APPL-02 (P1), DOCS-01 (P1), STAT-01/02 (P2), NOTF-01 (P2). Phase 1 = inti. |
| **Staff** | verifikasi dokumen, input penilaian, kelola data pendaftar | ✅ Lengkap | VERI-01 (P2), SELE-01 (P3), SPON-01/SCHL-01 (P1). "Kelola data pendaftar" hanya via verifikasi—tidak ada CRUD master pendaftar eksplisit (acceptable). |
| **Kabag Kemahasiswaan** | approval/rejection, monitoring, laporan | ⚠️ Ambigu | Monitoring MGMT-01 (P2), review MGMT-02 (P3), laporan kendala MGMT-03 (P3), penerima final PAY-02 (P4). **Tapi "approval/rejection" (ACC penerima) di REQUIREMENTS justru ditugaskan ke Staff (SELE-02), bukan Kabag.** → lihat M6. |
| **Wabag Keuangan** | pencairan dana, laporan keuangan, histori pembayaran | ⚠️ Sebagian | Dashboard FIN-01 (P4), laporan alokasi FIN-02 (P4), verifikasi bukti FIN-03 (P4). **Pencairan (PAY-01) sebenarnya dilakukan Staff**, Wabag hanya audit/verifikasi/laporan. Penamaan di prompt ("Wabag: pencairan dana") perlu diluruskan: Staff merekam, Wabag mengaudit. |

**Tanda merah coverage:**
- **Plan Phase 1 memakai model 2-role ("mahasiswa" vs "admin")** padahal app punya **4 role** (mahasiswa/staff/kabag/wabag) + mode `kabag_wabag`. Istilah "admin" di 01-03-PLAN terlalu kasar dan tidak memetakan ke realitas `login.js`.
- **Redirect admin di plan salah sasaran.** Plan menyuruh login mengarahkan admin ke "minimal internal sponsor/program surface" (`SPONSOR/`). Realitanya `login.js` mengarahkan `staff → STAFFADMIN/dashboardStaffAdmin.html`. Plan akan meregresi routing yang sudah benar.

### 2B. Supabase Schema Review

| Aspek | Direncanakan? | Temuan |
|---|:---:|---|
| **RLS per role** | ❌ Tidak | Tidak disebut sama sekali di Phase 1. Karena D-12 pakai dummy JS, RLS sepenuhnya ditunda tanpa rencana. `supabaseclient.js` menyiratkan trigger ("Profile auto-created via trigger") tetapi DDL/trigger-nya **tidak ada**. |
| **Relasi tabel logis** | ⚠️ Implisit | Model relasional *tersirat* dari `supabaseclient.js` (10 tabel, FK `mahasiswa_id`, `beasiswa_id`, `sponsor_id`, `pendaftaran_id`) dan masuk akal. **Tapi tidak pernah diformalkan** sebagai schema, dan **tidak direkonsiliasi** dengan dump MySQL lama yang berbeda nama & lebih sederhana. |
| **Supabase Auth vs custom** | ⚠️ Bertentangan | Requirement = Supabase Auth. Plan = dummy JS (password plaintext di client). `login.js` = dummy + REST fallback. `supabaseclient.js` = SDK `signUp/signInWithPassword`. Tidak ada keputusan tunggal. Catatan: D-04 (no self-register) **bertabrakan** dengan `registerMahasiswa()`/`signUp` yang masih ada di `supabaseclient.js`. |
| **Storage bucket** | ❌ Tidak | `supabaseclient.js` menyebut bucket `dokumen-pendaftar` & `bukti-transfer`, tapi tidak ada rencana pembuatan bucket, policy akses per-owner, atau batas tipe/ukuran file. Plan Phase 1 hanya menyimpan "dummy storage/status fields". |

**Kesimpulan 2B:** Ini area **terlemah**. Untuk MVP-skeleton berbasis dummy, menunda Supabase bisa dibenarkan — *tetapi* schema target (DDL + RLS + bucket) seharusnya tetap ditulis sebagai artefak di Phase 1 supaya klaim "mudah dimigrasikan" punya bukti. Saat ini tidak ada.

### 2C. Kualitas Acceptance Criteria

**Yang baik:** tiap PLAN punya blok `must_haves` (truths/artifacts/key_links), `<acceptance_criteria>`, dan `<verification>` — struktur rapi dan dapat ditelusuri.

**Kelemahan (perlu diperjelas):**

1. **AC bersifat existence, bukan behavior.** Contoh 01-01 Task 1: *"dummyData.js exists and contains normalized collections"* — terverifikasi keberadaannya, bukan kebenarannya.
2. **`<verify>` = grep keyword, bukan uji perilaku.** `rg -n "Menunggu verifikasi"` hanya memastikan string ada di file, **bukan** bahwa submit benar-benar men-set status itu. (Ironisnya, prototype memakai `menunggu_verifikasi` snake_case → grep title-case bisa gagal walau perilakunya "benar".)
3. **AC subjektif/tak terukur:** "keep the UX intentionally compact", "prioritize operational clarity over embellishment" (01-03).
4. **Edge case tipis.** Tidak ada AC untuk: pendaftaran ganda ke beasiswa sama, beasiswa kuota habis / lewat deadline, validasi tipe & ukuran file, dan **definisi event "verifikasi dimulai"** yang mengunci edit (D-10).
5. **Smoke check manual** ("log in once as mahasiswa…") wajar untuk prototype, tapi bukan kriteria otomatis/objektif.

**Task dengan AC paling lemah:** 01-01 Task 1 (existence-only), 01-03 Task 1 (subjektif "compact"). **Paling kuat:** 01-02 Task 2 (block submission + alasan eksplisit + editability cut-off) — walau cut-off-nya belum didefinisikan.

### 2D. Dependency & Sequencing

- **Urutan logis ✅.** Wave 1 = 01-01 (shared foundation: session, dummyData, applicationRules). Wave 2 paralel = 01-02 (mahasiswa) + 01-03 (admin), keduanya `depends_on: ["01-01"]`. Auth/foundation memang didahulukan. **Tidak ada circular dependency.**
- **Ukuran task wajar ✅.** Tiap plan 2 task; muat dalam 1 context window. Yang terberat 01-02 (refactor `daftarBeasiswa.js` 926 baris) — masih OK.
- **Masalah sebenarnya bukan di graph, tapi di basis ⚠️.** Dependency dirancang seolah `FRONTEND/shared/*` belum ada (benar) **dan** `login.js` masih mahasiswa-only (salah). Jadi sequencing-nya sehat, tapi premisnya usang → eksekusi literal berisiko regresi (C3).

### 2E. Gap Analysis (keputusan/fitur yang TIDAK ada di plan padahal seharusnya ada)

1. **Schema Supabase + migration files** (DDL untuk 10 tabel) — tidak ada. *(C1)*
2. **Desain RLS policy per role** — tidak ada. *(C1/2B)*
3. **Rencana storage bucket + policy per-owner + validasi file** — tidak ada. *(2B)*
4. **Strategi migrasi dummy → Supabase** (kapan & bagaimana). D-12 bilang "nanti", tapi tanpa trigger → risiko dummy jadi permanen.
5. **Strategi konfigurasi & cara menjalankan app.** `import.meta.env` (Vite) vs `<script>` klasik vs konstanta inline placeholder. Tidak ada `package.json`/dev server/entry. *(N6)*
6. **Reset password berbasis NIM (D-05)** — `login.js` hanya modal palsu; tidak ada rencana nyata.
7. **Definisi event "verifikasi dimulai" untuk D-10** — tidak didefinisikan. *(N5)*
8. **Pencegahan pendaftaran ganda, enforcement kuota & deadline beasiswa** — tidak dibahas.
9. **Wiring workflow end-to-end** (submit → buat `pendaftaran` → tampil di `pendaftaranSaya` → status). Saat ini terputus. *(C4)*
10. **Rekonsiliasi prototype yang sudah ada** (dashboard, pendaftaranSaya, dll.) dengan modul `shared/` baru. Plan tidak menyebut halaman-halaman ini.
11. **Keamanan dasar:** `.gitignore`, penghapusan password plaintext dummy sebelum prod, mengaktifkan role guard. *(M1/M4)*
12. **Kanonikalisasi vocabulary status** lintas modul. *(M5)*

---

## 3. AUDIT PARTIAL FRONTEND (prototype 1.2)

### 3.1 Struktur folder & konvensi
- Pola: **multi-page HTML/CSS/JS berbasis role** (bukan framework). Konsisten & wajar untuk brownfield, *sesuai* arah SKELETON.
- **Konvensi shared belum matang:** Ada `KABAGWABAG/SHARED/shared.js` (util role/format/sidebar) — bukti pola "shared" *parsial* untuk kelompok kabag/wabag. Tapi **`FRONTEND/shared/` (yang diminta plan) tidak ada**, sehingga mahasiswa & staff masih duplikasi inline.
- **Konvensi Supabase belum benar:** setiap halaman mendeklarasikan ulang `const SUPABASE_URL='https://YOUR_PROJECT.supabase.co'` + `SUPABASE_ANON_KEY='YOUR_ANON_KEY'` (placeholder, tak pernah dipanggil). `BACKEND/supabaseclient.js` **tidak di-import** oleh halaman mana pun → *dead code* secara praktis. Tidak ada satu `<script src="...supabase">` pun di HTML.

### 3.2 Status Supabase client
- `BACKEND/supabaseclient.js`: **lengkap & berkualitas** (auth, profile, beasiswa, pendaftaran, dokumen, status, laporan, notifikasi+realtime, fungsi staff). **Tapi:** pakai `import.meta.env` (butuh bundler yang tidak ada), URL/key placeholder, dan **tidak terhubung** ke frontend. Status: **siap jadi acuan kontrak, belum operasional**.
- `BACKEND/server.js`: **kosong (0 byte)**.

### 3.3 Inventaris file (status & sumber data)

**Legenda data source:** (a) dummy JS inline · (b) placeholder Supabase REST (non-fungsional) · (c) import supabaseclient.js · (d) hybrid.

#### Mahasiswa (11 halaman) — semua **complete-UI**, sumber **(a)**, **0 persistence**
| Halaman | Status | Catatan kunci |
|---|---|---|
| beranda | complete-UI | Landing publik, galeri beasiswa, form cek status (dummy). |
| dashboard | complete-UI | Hub stats + notifikasi + preview; guard `bk_user` (redirect di-comment DEV). |
| **daftarBeasiswa** | complete-UI tapi **submit BROKEN** | Search/filter **berfungsi** ✅. Submit = delay 1.5s, **tidak buat `pendaftaran`, tidak set status** ❌ *(C4)*. |
| **profilMahasiswa** | complete-UI, **gate MISSING** | Edit profil OK; **tidak ada readiness gate** profil+dokumen ❌ *(M2)*. `editableFields` tidak termasuk dokumen. |
| pendaftaranSaya | complete-UI | Timeline status dari dummy (enum `menunggu_verifikasi` dll). Tidak nyambung ke submit daftarBeasiswa. |
| penerimaBeasiswa | complete-UI | Daftar pencairan + bukti (dummy). |
| historyBeasiswa | complete-UI | Tab/filter/search riwayat (dummy). |
| notifikasi | complete-UI | List + mark read/delete (dummy, bukan realtime). |
| laporanKendala | complete-UI | Form + list kendala (dummy); dropdown beasiswa hardcoded. |
| kumpulanPerusahaanBeasiswa | complete-UI | Grid 8 sponsor + filter; link `?sponsor=` tak dibaca *(N2)*. |
| profilPerusahaanBeasiswa | complete-UI | Profil sponsor + chart; **hanya 3/8 sponsor punya data** *(N3)*. |

#### Staff/Admin
| Halaman | Status | Phase | Catatan |
|---|---|:---:|---|
| **SPONSOR/sponsor.{html,js,css}** | **kosong (0 byte), tak direferensikan** | P1 | Target plan 01-03 → **redundant**, lihat di bawah. |
| dashboardStaffAdmin | complete-UI (hub) | P1 | Stats + nav; tanpa CRUD. Guard `role==='staff'` (cek di-comment, logout aktif). |
| **manajemenSponsorBeasiswa** | **complete + CRUD penuh** (1109 baris) | P1 | **Create/Read/Update/Delete sponsor & beasiswa** atas dummy (cascade delete beasiswa saat sponsor dihapus). **Memenuhi SPON-01/SCHL-01 secara UI.** |
| verifikasiPendaftar | substantial (884) | P2 | Verifikasi berkas → status lolos/ditolak (dummy). |
| inputHasilSeleksi | substantial (543) | P3 | Input nilai tes & wawancara (dummy). |
| penetapanPenerima | substantial (643) | P3 | Approve/reject final (dummy) — **halaman role `staff`** (lihat M6). |
| pencairanDana | substantial (634) | P4 | Rekam transfer + upload bukti + status (dummy). |
| pusatLaporanKendala | substantial (576) | P2 | Tanggapi & tutup tiket (dummy). |

#### Kabag/Wabag
| Halaman | Status | Phase | Catatan |
|---|---|:---:|---|
| KABAG/dashboardKabag | complete-UI | P2 | Stats, top nilai, ringkasan laporan, pipeline (dummy). Guard di-comment. |
| WABAG/dashboardWabag | complete-UI | P4 | Stats finansial + ringkasan sponsor + tabel penerima (dummy). **Tanpa Chart.js** *(N1)*. |
| SHARED/monitoringPendaftar | complete-UI | P3 | Filter/sort/search + modal read-only. |
| SHARED/penerima | complete-UI | P4 | Tabel penerima + status (dummy). |
| SHARED/laporanKendala | complete-UI | P3 | Monitoring read-only. |
| SHARED/shared.js | util | — | `getSession`, `ROLE_CFG`, `initUserInfo`, format Rupiah/tanggal, sidebar. Pola shared parsial. |

### 3.4 Inkonsistensi kode vs PLAN.md (paling penting)

1. **`SPONSOR/sponsor.js` (target 01-03) REDUNDANT.** CRUD sponsor+beasiswa sudah ada & jalan di `manajemenSponsorBeasiswa.js`. Plan harus dialihkan ke *memverifikasi/hardening* modul yang ada, bukan membangun halaman kosong. *(C3)*
2. **`login.js` (target 01-01/01-02) sudah lebih maju dari plan.** Sudah 4-role + campus-provisioned (registrasi dihapus, sesuai D-04). Plan yang menyuruh "refactor login agar tidak lagi memegang dummy account" berisiko meregresi router yang sudah benar. *(C3)*
3. **`FRONTEND/shared/*` (target 01-01) belum dibuat** → duplikasi inline tetap ada. Ide plan benar, eksekusi belum jalan. *(M3)*
4. **Status awal pendaftaran tidak ter-set** di `daftarBeasiswa` (plan: `Menunggu verifikasi`). *(C4/M5)*
5. **Readiness gate (D-06/07) absen** di `profilMahasiswa`/`daftarBeasiswa`. *(M2)*

### 3.5 Komponen Mahasiswa: selesai vs belum
- **Selesai (UI):** login, dashboard, browse+search/filter beasiswa, profil, pendaftaranSaya, notifikasi, history, penerima, laporanKendala, profil sponsor.
- **Belum / broken (fungsional):** **submit pendaftaran** (tidak persist/tidak set status), **readiness gate**, **upload dokumen nyata** (hanya `<input type=file>` tanpa storage), keterhubungan submit→pendaftaranSaya, notifikasi realtime.

### 3.6 Komponen Staff: selesai vs belum
- **Selesai (UI):** dashboard hub, **CRUD sponsor & beasiswa** (manajemenSponsorBeasiswa), verifikasi, input seleksi, penetapan, pencairan, pusat laporan kendala — **semua Phase 1–4 ada sebagai prototype**.
- **Belum (fungsional):** semua di atas berjalan **atas dummy**; tidak ada persistence, tidak ada role guard aktif, tidak ada koneksi Supabase. `SPONSOR/sponsor.*` kosong & tak terpakai.

---

## 4. CORRECTED PLAN (usulan — **belum** diterapkan ke file asli)

> Catatan: file PLAN asli **tidak diubah**. Berikut versi koreksi untuk dikonfirmasi. Inti koreksi: **rebaseline ke prototype 1.2**, **selesaikan keputusan data-source**, **alihkan task redundant**, dan **tambah artefak schema**.

### 4.0 Keputusan yang harus dikunci dulu (sebelum re-plan)
- **KD-1 Data source Phase 1:** pilih salah satu secara eksplisit — **(A)** tetap dummy JS tapi *konsolidasikan* ke `FRONTEND/shared/*` (cepat, tapi AUTH-01/DOCS-01 belum benar-benar terpenuhi); atau **(B)** mulai Supabase nyata untuk auth+core sekarang (memenuhi requirement, lebih lambat). *Rekomendasi auditor: lihat §5.*
- **KD-2 Model role:** ganti istilah "admin" → enumerasi `{mahasiswa, staff, kabag, wabag}` agar sesuai `login.js`.
- **KD-3 Approval owner (M6):** putuskan Kabag-decides/Staff-records vs Kabag-records.
- **KD-4 Vocabulary status kanonik (M5):** tetapkan satu set, sarankan **snake_case** (`menunggu_verifikasi`, `lolos_berkas`, `wawancara`, `lolos_final`, `ditolak_berkas`, dst.) + satu map label tampilan. Selaraskan plan (yang menulis "Menunggu verifikasi") dengan kode.

### 4.1 Koreksi `01-01-PLAN` (Shared Foundation) — *revisi, bukan ganti*
- **Truths:** tambah *"login.js SUDAH router 4-role; foundation HARUS mengkonsumsi `login.js` apa adanya — dilarang menulis ulang routing yang ada."*
- **Task 1 (shared modules):** tetap buat `FRONTEND/shared/{session,dummyData,applicationRules}.js`, **tapi**: (i) `session.js` meng-*generalisasi* `getSession()`/`saveSession()` yang sudah dipakai semua halaman (`bk_user`), bukan bikin kontrak baru; (ii) `dummyData.js` mengkonsolidasikan array yang sekarang terduplikasi di 10+ file; (iii) `applicationRules.js` mengkanonikalkan enum status (KD-4) + helper readiness.
- **Task 2 (login):** **diturunkan** dari "refactor" jadi *"ekstrak DUMMY_ACCOUNTS ke `shared/dummyData.js` dan import balik; verifikasi 4 redirect role tetap utuh"*. AC baru: *"login mahasiswa→dashboard, staff→dashboardStaffAdmin, kabag→dashboardKabag, wabag→dashboardWabag tetap berfungsi (regression check)"*.

### 4.2 Koreksi `01-02-PLAN` (Mahasiswa slice) — *perkuat, ini pekerjaan riil Phase 1*
- **Task 1 (readiness gate):** WAJIB implement gate yang sekarang absen: profil wajib (nama, nim, prodi, ipk, alamat, wa) + dokumen inti terunggah → simpan ke `shared/dummyData`. AC baru: *"tombol Daftar disabled + alasan eksplisit bila profil/dokumen belum lengkap; gate memakai `applicationRules.isReadyToApply()`"*.
- **Task 2 (submit workflow — perbaiki C4):** ganti delay palsu dengan *membuat record `pendaftaran` di `shared/dummyData` berstatus `menunggu_verifikasi` (KD-4), lalu tampil di `pendaftaranSaya`*. AC baru (behavioral): *"setelah submit, ada 1 record baru di state bersama; `pendaftaranSaya` menampilkannya; submit ditolak bila sudah pernah daftar beasiswa sama (anti-duplikasi); edit diizinkan hanya selama status==`menunggu_verifikasi`"*. **Definisikan D-10:** editability berakhir saat status keluar dari `menunggu_verifikasi`.
- Ganti `<verify>` grep title-case → grep snake_case sesuai KD-4.

### 4.3 Koreksi `01-03-PLAN` (Admin slice) — *alihkan dari redundant ke verifikasi*
- **Hapus** task "bangun `SPONSOR/sponsor.js`". **Ganti** dengan: *"verifikasi & hardening `STAFFADMIN/sponsorDanBeasiswa/manajemenSponsorBeasiswa.js` agar (i) membaca/menulis ke `shared/dummyData` (bukan array lokal), (ii) role guard `staff` AKTIF (uncomment + redirect), (iii) perubahan sponsor/beasiswa tercermin di `daftarBeasiswa` mahasiswa via state bersama."*
- AC baru: *"create/edit/delete sponsor & beasiswa lewat shared state; beasiswa baru muncul di list mahasiswa; akses non-staff ditolak"*.
- Tandai `SPONSOR/sponsor.*` untuk dihapus (file mati).

### 4.4 Task baru yang harus ditambah ke Phase 1 (mengisi gap §2E)
- **01-04 (BARU) — Foundation hygiene & schema contract:**
  1. Tambah `.gitignore` (`BACKEND/.env`, `node_modules`, dll.) + `git rm --cached BACKEND/.env` + buat `BACKEND/.env.example`. *(M1)*
  2. Tulis **`DATABASE/supabase_schema.sql`**: DDL kanonik 10 tabel + enum status (KD-4) + FK, **selaras** dengan `supabaseclient.js`; sertakan **draft RLS policy per role** & **definisi 2 storage bucket** + policy per-owner — walau Phase 1 tetap jalan dummy. *(C1/2B)* Ini membuat klaim "mudah migrasi" terbukti.
  3. `README`/`RUN.md`: cara menjalankan prototype + rencana wiring Supabase. *(N6)*
  4. Aktifkan/parametrisasi role guard sebagai flag (DEV vs PROD). *(M4)*

---

## 5. REKOMENDASI SCOPE PHASE 2

**Konteks pengubah keputusan:** UI untuk Phase 2–4 **sudah ada** sebagai prototype. Maka *bottleneck* sebenarnya bukan UI, melainkan **fondasi backend**. Bila Phase 2 lanjut menambah UI dummy lagi, proyek menumpuk utang dan Phase 4 (laporan keuangan auditable) akan mustahil dipercaya (persis warning PITFALLS.md tentang "reporting integrity").

**Rekomendasi auditor (berurutan preferensi):**

### ⭐ Opsi A (DIREKOMENDASIKAN) — Sisipkan "Phase 2 = Backend Foundation + Verification Vertical Slice"
Jadikan Phase 2 **bukan** sekadar fitur verifikasi, melainkan **momen mengubah dummy → Supabase nyata** pada satu irisan vertikal:
1. **Implement schema Supabase nyata** (dari artefak 01-04): tabel + enum + FK + **RLS per role** + **storage bucket** + seed campus-provisioned accounts.
2. **Wiring auth nyata** (AUTH-01): `login.js` 4-role pakai Supabase Auth (NIM→email), hapus password dummy plaintext, sambungkan `supabaseclient.js` (atau adaptor REST) — pilih SATU jalur (KD-1).
3. **Vertical slice verifikasi (VERI-01) + status tracking (STAT-01/02) + notifikasi (NOTF-01) + complaints (COMP-01/02)** dijalankan di atas data nyata, **memakai UI prototype yang sudah ada** sebagai front-end (verifikasiPendaftar, pendaftaranSaya, notifikasi, laporanKendala, pusatLaporanKendala).
4. **Aktifkan role guard** untuk semua dashboard internal.

> Ini menyelesaikan C1/C2 + memenuhi requirement Phase 2 asli (STAT/NOTF/COMP/VERI/MGMT-01) sekaligus, dengan effort tambahan terkendali karena UI sudah jadi.

### Opsi B (jika tetap ingin dummy dulu) — Phase 2 sesuai roadmap, tapi atas `shared/` state
Jalankan Phase 2 (verifikasi/status/notif/complaint/MGMT-01) **tetap dummy** namun **wajib lewat `FRONTEND/shared/` state** hasil koreksi Phase 1, supaya status mahasiswa↔staff konsisten realtime-simulasi. **Risiko:** menunda C1/C2; Supabase makin lama makin sulit disisipkan. Pilih ini hanya bila target dekat adalah demo, bukan produksi.

### Yang **tidak** disarankan untuk Phase 2
- Menambah halaman/fitur UI baru (semua sudah ada). Fokus = *mengaktifkan*, bukan *menambah*.
- Menyentuh Phase 3/4 (scoring, pencairan, laporan keuangan) sebelum fondasi data + status model + RLS solid.

**Prasyarat masuk Phase 2 (exit criteria Phase 1 yang dikoreksi):**
- [ ] KD-1..KD-4 diputuskan & terdokumentasi.
- [ ] `FRONTEND/shared/*` ada & dipakai (duplikasi hilang).
- [ ] Submit pendaftaran membuat record berstatus kanonik & tampil di pendaftaranSaya (C4 beres).
- [ ] Readiness gate aktif (M2 beres).
- [ ] `manajemenSponsorBeasiswa` jadi sumber master-data tunggal; `SPONSOR/sponsor.*` dihapus.
- [ ] `DATABASE/supabase_schema.sql` (DDL+RLS+bucket draft) + `.gitignore` + `.env.example` ada (C1/M1 beres).

---

## 6. LAMPIRAN — Ringkasan angka
- Frontend JS: ≈**14.765 baris** di **28 file** `.js`.
- File kosong/mati: `BACKEND/server.js`, `SPONSOR/sponsor.{html,js,css}`, `profilPerusahaanBeasiswa/chart.js`.
- Tabel direferensi kode tanpa DDL: **10**.
- Role di app: **4** (+1 mode gabungan) vs **2** ("admin") di plan.
- Plan Phase 1: **3 PLAN / 6 task**, **0 dieksekusi**.

*Disusun pada 2026-06-21. PLAN asli tidak diubah — menunggu konfirmasi.*
