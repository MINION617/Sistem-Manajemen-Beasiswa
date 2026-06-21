# Requirements: Sistem Informasi Manajemen Beasiswa

**Defined:** 2026-06-17
**Core Value:** Setiap pihak harus bisa melihat status dan keputusan beasiswa secara akurat, transparan, dan dapat ditindaklanjuti tanpa proses manual yang tercerai-berai.

## v1 Requirements

### Authentication and Student Profile

- [ ] **AUTH-01**: Mahasiswa can log in using institutional credentials backed by Supabase Auth.
- [ ] **PROF-01**: Mahasiswa can manage personal profile data and academic information including GPA.
- [ ] **DOCS-01**: Mahasiswa can upload required scholarship documents as part of their profile or application flow.

### Scholarship Discovery and Application

- [ ] **APPL-01**: Mahasiswa can view available scholarship programs with active sponsor and program details.
- [ ] **APPL-02**: Mahasiswa can submit a scholarship application through an interactive online form.

### Status, Notifications, and Complaints

- [ ] **STAT-01**: Mahasiswa can track scholarship selection status for each submitted application.
- [ ] **STAT-02**: Mahasiswa can monitor fund disbursement status after becoming a recipient.
- [ ] **NOTF-01**: Mahasiswa receive realtime notifications for application status changes and fund transfer updates.
- [ ] **COMP-01**: Mahasiswa can submit technical or non-technical issue reports related to the scholarship process.

### Sponsor and Scholarship Administration

- [ ] **SPON-01**: Staff can create, read, update, and delete sponsor records.
- [ ] **SCHL-01**: Staff can create, read, update, and delete active scholarship program details.

### Verification and Support Operations

- [ ] **VERI-01**: Staff can review applicant documents and update each application to Verified or Rejected.
- [ ] **COMP-02**: Staff can read, process, and update the resolution status of student complaints.
- [ ] **MGMT-01**: Kabag Kemahasiswaan can view realtime applicant lists and summary statistics for active scholarship cycles.

### Selection and Decision Making

- [ ] **SELE-01**: Staff can input test scores and interview results for verified applicants.
- [ ] **SELE-02**: Staff can update applicant status to scholarship recipient based on plenary decisions.
- [ ] **MGMT-02**: Kabag Kemahasiswaan can review detailed applicant data including scores, GPA, and certificates for decision meetings.
- [ ] **MGMT-03**: Kabag Kemahasiswaan can view a summary dashboard of student complaints and their resolution status.

### Disbursement and Financial Oversight

- [ ] **PAY-01**: Staff can upload proof of transfer and update disbursement status to Paid.
- [ ] **PAY-02**: Kabag Kemahasiswaan can view the final list of scholarship recipients, their scholarship assignments, and sponsors.
- [ ] **FIN-01**: Wakil Bagian Keuangan can view a financial dashboard with charts showing total disbursed funds.
- [ ] **FIN-02**: Wakil Bagian Keuangan can generate and view sponsor-based fund allocation reports.
- [ ] **FIN-03**: Wakil Bagian Keuangan can monitor and verify transfer proof uploaded by staff.

## v2 Requirements

(None defined yet)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment gateway or automatic bank API integration | Fund disbursement remains a manual finance operation in this scope. |
| Online testing engine | The system only stores final test or interview scores from external selection activities. |
| Native Android/iOS mobile apps | v1 is explicitly a responsive web application. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| PROF-01 | Phase 1 | Pending |
| DOCS-01 | Phase 1 | Pending |
| APPL-01 | Phase 1 | Pending |
| APPL-02 | Phase 1 | Pending |
| SPON-01 | Phase 1 | Pending |
| SCHL-01 | Phase 1 | Pending |
| STAT-01 | Phase 2 | Pending |
| STAT-02 | Phase 2 | Pending |
| NOTF-01 | Phase 2 | Pending |
| COMP-01 | Phase 2 | Pending |
| VERI-01 | Phase 2 | Pending |
| COMP-02 | Phase 2 | Pending |
| MGMT-01 | Phase 2 | Pending |
| SELE-01 | Phase 3 | Pending |
| SELE-02 | Phase 3 | Pending |
| MGMT-02 | Phase 3 | Pending |
| MGMT-03 | Phase 3 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| FIN-01 | Phase 4 | Pending |
| FIN-02 | Phase 4 | Pending |
| FIN-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 - complete

---
*Requirements defined: 2026-06-17*
*Last updated: 2026-06-17 after initial definition and roadmap mapping*
