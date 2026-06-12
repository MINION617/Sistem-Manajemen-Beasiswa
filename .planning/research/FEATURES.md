# Feature Landscape: SIM-Beasiswa

**Scope:** 4 Roles, 4 Phases, 19 Requirements

## Core Feature Matrix

| Feature Group | Requirement IDs | Priority | Target User |
|---------------|-----------------|----------|-------------|
| **Auth & Profile** | FR-001, FR-002 | Must Have | Mahasiswa |
| **Intake System** | FR-003, FR-007 | Must Have | Mahasiswa, Staff |
| **Verification** | FR-008, FR-013 | Must Have | Staff, Kabag |
| **Complaint Center** | FR-006, FR-009, FR-015 | Should Have | Mahasiswa, Staff, Kabag |
| **Selection Engine** | FR-010, FR-011, FR-014 | Must Have | Staff, Kabag |
| **Disbursement** | FR-004, FR-005, FR-012 | Must Have | Mahasiswa, Staff |
| **Audit & Finance** | FR-016, FR-017, FR-018, FR-019 | Must Have | Kabag, Keuangan |

## Phase-Specific Feature Rollout

### Phase 1: Foundation (Initial Setup)
- **NIM Login:** Integration with Supabase Auth.
- **Master Data:** CRUD for Sponsors and Scholarships (MySQL).
- **Student Profile:** GPA input and document management.
- **E-Pendaftaran:** Form submission with 2MB PDF limit.

### Phase 2: Workflow (Administrative)
- **Verification Dashboard:** Staff interface to view and validate PDFs.
- **Status Tracking:** Real-time updates (Pending/Verified/Rejected) for students.
- **Monitoring:** Kabag's view of applicant statistics.
- **Complaints:** Ticketing system for technical/non-technical issues.

### Phase 3: Selection (Review & Approval)
- **Scoring Engine:** Input for test/interview results.
- **Ranking View:** Automatic calculation of final scores for pimpinan.
- **Final Approval:** Kabag's interface to set "Penerima Beasiswa" status.

### Phase 4: Disbursement (Financial)
- **Proof of Transfer:** Uploading payment evidence.
- **Audit Dashboard:** Financial auditor view for the Vice Rector.
- **Export Reports:** Automated PDF/Excel generation for sponsors.

## Differentiators & Success Factors

- **Transparency:** Real-time notification for every status change.
- **Integrity:** 0% duplicate data enforced by MySQL constraints on NIM and Scholarship ID.
- **User Experience:** Responsive design for students on mobile and optimized dashboards for staff on desktop.

## Out of Scope (Reminder)
- Automated payment gateway (Manual transfer only).
- Online exam engine (Manual score input only).
- Native mobile apps (Web-only).
