# Roadmap: Sistem Informasi Manajemen Beasiswa

**Created:** 2026-06-17
**Project Mode:** mvp
**Total Phases:** 4
**Total v1 Requirements:** 23

## Coverage Summary

All v1 requirements are mapped to exactly one phase.

### Phase 1: Intake Foundation and Program Setup
**Goal:** Deliver the minimum end-to-end foundation so mahasiswa can authenticate, maintain required profile data, discover scholarships, submit applications, and staff can manage sponsor and scholarship master data.
**Mode:** mvp
**Requirements:** AUTH-01, PROF-01, DOCS-01, APPL-01, APPL-02, SPON-01, SCHL-01
**UI hint:** yes
**Success Criteria**:
1. Mahasiswa can sign in, complete profile data, upload required documents, and submit at least one scholarship application from the web interface.
2. Staff can create and maintain sponsor records and active scholarship programs without direct database edits.
3. Submitted applications persist with enough structure to support downstream verification and status tracking.
4. Role-aware navigation separates student and administrative entry points clearly.

### Phase 2: Verification, Transparency, and Support
**Goal:** Add the operational workflow for document verification, live applicant monitoring, student-facing status visibility, realtime notifications, and complaint handling.
**Mode:** mvp
**Requirements:** STAT-01, STAT-02, NOTF-01, COMP-01, VERI-01, COMP-02, MGMT-01
**UI hint:** yes
**Success Criteria**:
1. Staff can review applicant submissions and move them to Verified or Rejected with status updates visible to students.
2. Mahasiswa can see current application and disbursement status without contacting staff manually.
3. Realtime notifications are delivered for major status changes and payout updates.
4. Complaint submission and resolution tracking are visible to both students and staff.
5. Kabag can view current applicant counts and active pipeline statistics from a dedicated dashboard.

### Phase 3: Evaluation and Plenary Decisions
**Goal:** Support the academic and leadership decision process by capturing scores, exposing applicant details, and recording final recipient outcomes.
**Mode:** mvp
**Requirements:** SELE-01, SELE-02, MGMT-02, MGMT-03
**UI hint:** yes
**Success Criteria**:
1. Staff can record test and interview outcomes for verified applicants in a structured way.
2. Kabag can review complete applicant context, including GPA, certificates, and scores, before plenary decisions.
3. Final recipient decisions can be recorded and reflected in recipient-facing and management-facing views.
4. Complaint trends remain visible to leadership alongside evaluation context.

### Phase 4: Disbursement, Audit, and Executive Reporting
**Goal:** Complete the scholarship lifecycle with payout recording, transfer-proof verification, recipient rollups, and finance-grade reporting.
**Mode:** mvp
**Requirements:** PAY-01, PAY-02, FIN-01, FIN-02, FIN-03
**UI hint:** yes
**Success Criteria**:
1. Staff can upload transfer proof and mark recipient disbursements as paid.
2. Kabag can review final recipients grouped by scholarship and sponsor.
3. Wakil Bagian Keuangan can inspect transfer proof and verify payout records for audit purposes.
4. Finance dashboards show total disbursed funds and sponsor-based allocation summaries derived from live system data.

## Phase Table

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Intake Foundation and Program Setup | Enable authentication, student intake, application submission, and sponsor/program master data | 7 | 4 |
| 2 | Verification, Transparency, and Support | Make verification and status tracking transparent for students and staff | 7 | 5 |
| 3 | Evaluation and Plenary Decisions | Capture scoring and final recipient decisions with management review | 4 | 4 |
| 4 | Disbursement, Audit, and Executive Reporting | Finalize payout operations and finance reporting | 5 | 4 |

---
*Last updated: 2026-06-17 after initial roadmap creation*
