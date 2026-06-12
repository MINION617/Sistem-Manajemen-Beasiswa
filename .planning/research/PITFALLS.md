# Domain Pitfalls: SIM-Beasiswa

**Focus:** Hybrid Architecture, Security, and Compliance

## Critical Risks

### 1. Auth Sync Discrepancy
- **Risk:** Supabase Auth is out of sync with MySQL user data (e.g., role changed in Supabase but not in MySQL).
- **Mitigation:** Use Supabase JWT as the "Source of Truth" for roles. Pass role claims in the JWT and verify them on every API request in the Node.js backend.

### 2. PDF Security (Unauthorized Access)
- **Risk:** Students accessing other students' documents in Supabase Storage.
- **Mitigation:** Implement strict **Supabase Storage Policies (RLS)** using the `owner` field matched to the `auth.uid()`. Staff/Keuangan roles should have broad read access via role-based policies.

### 3. Data Integrity (MySQL Constraints)
- **Risk:** Duplicate applications for the same scholarship by one student.
- **Mitigation:** Use a composite unique key in MySQL on `(student_id, scholarship_id)`.

## Technical Pitfalls

### 1. Docker Connectivity
- **Risk:** Node.js container cannot communicate with the MySQL container or Supabase API due to networking issues.
- **Mitigation:** Use a custom Docker network in `docker-compose.yml` and use service names as hostnames. Ensure environment variables for Supabase keys are correctly injected.

### 2. PDF Performance
- **Risk:** Rendering large PDF lists in the Admin Dashboard causes browser lag.
- **Mitigation:** Implement **Lazy Loading** for the PDF previewer and use **Server-Side Pagination** for the application list.

### 3. Memory Leaks in Node.js
- **Risk:** Handling 2MB file buffers for many simultaneous uploads could crash the server.
- **Mitigation:** Stream file uploads directly to Supabase Storage instead of loading them into Node.js memory, or use `multer` with disk storage/limits.

## Compliance & Legal (UU PDP)

- **Personal Data Protection:** Ensure GPA, Phone Numbers, and Financial documents are encrypted or at least isolated.
- **Audit Trail:** Maintain a "Log" table in MySQL to track who changed a status and when, for accountability during audits.

## Phase-Specific Warnings

- **Phase 1:** Ensure the MySQL schema is extensible; changing the schema in later phases while data is present can be complex.
- **Phase 4:** Exporting PDF/Excel for many sponsors can be CPU-intensive; consider using a background job if volume grows significantly.
