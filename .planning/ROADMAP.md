# Roadmap — Sistem Informasi Manajemen Beasiswa

## Milestone Overview

| Phase | Name | Focus | Requirements |
| :--- | :--- | :--- | :--- |
| 1 | Foundation & Initial Setup | Data master, portal pendaftaran, profil | FR-001, FR-002, FR-003, FR-007 |
| 2 | Administrative Workflow & Monitoring | Verifikasi berkas, monitoring, pusat aduan | FR-004, FR-005, FR-008, FR-009, FR-013 |
| 3 | Selection, Review & Final Approval | Input nilai, review pimpinan, penetapan | FR-010, FR-011, FR-014, FR-015 |
| 4 | Disbursement, Audit & Financial Reporting | Pencairan dana, audit transfer, laporan | FR-012, FR-016, FR-017, FR-018, FR-019 |

---

## Phase 1 — Foundation & Initial Setup

**Goals:** Membangun fondasi infrastruktur sistem, manajemen data master sponsor, dan memungkinkan mahasiswa melengkapi profil serta mendaftar beasiswa.

**Requirements covered:** FR-001, FR-002, FR-003, FR-007

**Plans:** 4 plans
- [ ] 01-01-PLAN.md — Infrastructure & Database Setup
- [ ] 01-02-PLAN.md — Authentication & Role-Based Access Control
- [ ] 01-03-PLAN.md — Administrative CRUD (Sponsors & Scholarships)
- [ ] 01-04-PLAN.md — Student Portal (Profile & Registration)

**Deliverables:**
* Setup proyek awal dan skema database utama.
* Sistem autentikasi pengguna dan pemisahan role (Staff, Mahasiswa, Keuangan, Kabag).
* Modul CRUD untuk manajemen data sponsor dan program beasiswa aktif.
* Halaman pengelolaan profil mahasiswa, riwayat akademik (IPK), dan dokumen pendukung.
* Form e-pendaftaran beasiswa interaktif.

**Definition of Done:**
- [ ] Staff dapat membuat, mengubah, dan menghapus data sponsor serta program beasiswa.
- [ ] Mahasiswa dapat mengelola data diri dan mengunggah dokumen di halaman Profil.
- [ ] Mahasiswa dapat melihat katalog beasiswa dan mengirimkan formulir pendaftaran.

---

## Phase 2 — Administrative Workflow & Monitoring

**Goals:** Memfasilitasi proses verifikasi berkas oleh staff, pemantauan aktif oleh pimpinan, dan transparansi status bagi mahasiswa.

**Requirements covered:** FR-004, FR-005, FR-008, FR-009, FR-013

**Deliverables:**
* Dashboard admin (*real-time*) untuk memvalidasi dokumen PDF aplikasi.
* Dashboard monitoring statistik pendaftar untuk Kabag Mahasiswa.
* Modul notifikasi (*real-time*) dan pelacakan status di portal mahasiswa.
* Pusat pengaduan kendala untuk mahasiswa dan panel penyelesaian untuk staff.

**Definition of Done:**
- [ ] Staff dapat memvalidasi dokumen mahasiswa dan mengubah status menjadi *Verified* atau *Rejected*.
- [ ] Kabag Mahasiswa dapat melihat daftar dan statistik pendaftar aktif secara *real-time*.
- [ ] Mahasiswa dapat melacak progres aplikasi mereka dan menerima notifikasi perubahan status.
- [ ] Mahasiswa dapat mengirim laporan kendala dan Staff dapat memproses penyelesaiannya.

---

## Phase 3 — Selection, Review & Final Approval

**Goals:** Mendukung proses penilaian tahap lanjut, peninjauan kualifikasi, hingga penetapan penerima beasiswa secara resmi.

**Requirements covered:** FR-010, FR-011, FR-014, FR-015

**Deliverables:**
* Form input skor tes dan nilai wawancara oleh staff.
* Halaman *review* detail kualifikasi kandidat (Nilai, IPK, Prestasi) untuk Kabag Mahasiswa.
* Fitur pembaruan status massal/individu menjadi "Penerima Beasiswa".
* Dashboard rekapitulasi laporan kendala mahasiswa untuk pimpinan.

**Definition of Done:**
- [ ] Staff dapat memasukkan skor tes dan nilai wawancara untuk kandidat yang terverifikasi.
- [ ] Kabag Mahasiswa dapat meninjau kualifikasi lengkap kandidat sebagai bahan pertimbangan rapat pleno.
- [ ] Staff dapat mengubah status kandidat terpilih menjadi "Penerima Beasiswa".
- [ ] Kabag Mahasiswa dapat melihat rekapitulasi status penanganan aduan mahasiswa.

---

## Phase 4 — Disbursement, Audit & Financial Reporting

**Goals:** Menutup siklus operasional beasiswa dengan pencairan dana yang dapat diaudit, serta pelaporan ringkasan finansial untuk pemangku kepentingan.

**Requirements covered:** FR-012, FR-016, FR-017, FR-018, FR-019

**Deliverables:**
* Modul unggah bukti transfer dan pembaruan status pencairan (*Paid/Unpaid*).
* Dashboard audit dan verifikasi bukti transfer untuk Wakil Bagian Keuangan.
* Visualisasi grafik realisasi anggaran dan *generator* laporan alokasi dana.
* Halaman *e-monitoring* untuk melihat daftar final penerima beserta rincian sponsor.

**Definition of Done:**
- [ ] Staff dapat mengunggah bukti transfer dan mengubah status penyaluran menjadi *Paid*.
- [ ] Wakil Bagian Keuangan dapat melakukan audit terhadap bukti transfer yang diunggah staff.
- [ ] Wakil Bagian Keuangan dapat melihat grafik ringkasan keuangan dan mengekspor laporan alokasi dana per sponsor.
- [ ] Kabag Mahasiswa dapat melihat daftar final penerima beasiswa.
