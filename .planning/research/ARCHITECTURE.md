# Architecture Research

## Recommended Domain Modules

- **Identity and Roles**: auth, profile bootstrap, role lookup, session handling.
- **Scholarship Catalog**: sponsor records, scholarship programs, active periods, quotas, requirements.
- **Application Workflow**: student application submission, document attachments, verification states, rejection reasons.
- **Selection and Approval**: score capture, interview results, plenary outcome, recipient assignment.
- **Disbursement and Audit**: payout record, transfer proof upload, finance verification, sponsor allocation reporting.
- **Communication and Support**: notifications and issue reporting.

## Data Design Priorities

- Normalize core entities: users/profiles, scholarships, sponsors, applications, documents, scores, recipients, payouts, complaints, notifications.
- Preserve immutable audit events or timestamps for each state transition where practical.
- Separate student-owned uploads from staff/finance uploads to simplify storage policy enforcement.

## Interface Structure

- Public/landing pages for scholarship discovery.
- Student workspace for profile, applications, status, notifications, and issue reports.
- Staff workspace for sponsor/program management, document verification, complaint handling, scoring, and payout uploads.
- Leadership dashboards for applicant analytics, decision review, and finance oversight.

## Delivery Implication

The safest roadmap is vertical by operational milestone: intake first, then verification/status, then evaluation/approval, then disbursement/reporting. That matches both the brief and the existing page inventory in the repo.
