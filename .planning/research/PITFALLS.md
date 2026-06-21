# Pitfalls Research

## Major Risks

- **Role model drift**: the SQL dump uses `STAFF`, `KABAG`, and `WAREK`, while the brief names Wakil Bagian Keuangan. Role naming and permission boundaries must be unified early.
- **Data-source ambiguity**: the repo mixes a legacy MySQL schema with Supabase-oriented client code. The project needs one canonical schema and migration path.
- **Status explosion**: application, verification, acceptance, payout, and complaint workflows can each invent their own statuses unless normalized.
- **Upload security**: applicant documents and transfer proofs require strict access rules to avoid cross-user leakage.
- **Reporting integrity**: finance/export screens are only trustworthy if payout, sponsor, and recipient records stay reconciled.

## Product Risks

- Students lose trust quickly if status changes are delayed or contradictory across pages.
- Manual plenary outcomes can become opaque if no reason, timestamp, or operator metadata is stored.
- Complaint handling can turn into an unbounded inbox unless categories, statuses, and SLA-like expectations are defined.

## Delivery Risks

- Existing UI pages may create a false sense of completeness even where backend workflow logic is missing.
- Realtime notifications add value, but they also require disciplined event triggering and read/unread behavior.
- Dashboard/report requirements often arrive late; the roadmap should preserve enough data fidelity from earlier phases so phase 4 is not blocked.
