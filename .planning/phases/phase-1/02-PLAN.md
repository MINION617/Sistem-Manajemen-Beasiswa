# Phase 1 Detailed Execution Plan: Foundation & Initial Setup

This document serves as the master execution plan for Phase 1 of the SIM-Beasiswa project. It details the task breakdown, technical implementation specifications, verification strategy, and the dependency map across execution waves.

Detailed executable sub-plans are located at:
- `01-01-PLAN.md` (Infrastructure & Database)
- `01-02-PLAN.md` (Authentication & Identity)
- `01-03-PLAN.md` (Administrative CRUD)
- `01-04-PLAN.md` (Student Portal)

---

## 1. Task Breakdown & Execution Waves

The phase is decomposed into 4 parallel-optimized waves to ensure clean dependency resolution and clear boundaries.

### Wave 1: Infrastructure & Core Database Schema
*   **Plan:** `01-01-PLAN.md`
*   **Tasks:**
    1.  **Docker Infrastructure Setup:** Create multi-container environment (Frontend, Backend, MySQL, Nginx reverse proxy).
    2.  **Sequelize Initialization & Core Migrations:** Setup migrations for `users`, `sponsors`, and `scholarships` tables.

### Wave 2: Authentication & Identity Management
*   **Plan:** `01-02-PLAN.md`
*   **Dependencies:** Wave 1
*   **Tasks:**
    1.  **Backend Auth Middleware:** Integrate Supabase Admin SDK (`getUser`) for secure JWT verification (per D-02).
    2.  **Frontend Auth Logic:** Build central Axios client with interceptors for token injection (per D-03).
    3.  **Login & Routing:** Create Tailwind-based login screen and role-based guarded routes.

### Wave 3: Core Administrative CRUD Modules
*   **Plan:** `01-03-PLAN.md`
*   **Dependencies:** Wave 2
*   **Tasks:**
    1.  **Sponsor Management:** Implement secure endpoints and UI for creating, reading, updating, and deleting sponsors (FR-007).
    2.  **Scholarship Configuration:** Create CRUD modules for linking scholarship programs to active sponsors.

### Wave 4: Student Portal & Registration Flow
*   **Plan:** `01-04-PLAN.md`
*   **Dependencies:** Wave 3
*   **Tasks:**
    1.  **Student Profile & Document Upload:** Build profile data forms and integrate Supabase Storage for PDF files (Max 2MB constraint).
    2.  **Scholarship Pendaftaran Form:** Develop interactive catalog and application submission workflow (FR-002, FR-003).

---

## 2. Technical Implementation Details

### Docker Compose Configuration
The application runs inside a unified network `sim-beasiswa-net`:
- **Nginx:** Listens on port 80/443. Routes `/api/*` to the Node.js backend container and all other traffic to the React frontend static server.
- **Backend:** Node.js Alpine base image running Express.js. Communicates internally with MySQL via the host `mysql-db`.
- **Frontend:** React application built via Vite, served via an optimized Nginx instance within its own container.
- **MySQL:** Version 8.0 with persistent volume mounts to prevent data loss across restarts.

### MySQL Schema Design (via Sequelize Migrations)
The data layer leverages strict relational constraints to enforce 0% data duplication:
- **`users`:** `id` (UUID), `email` (Unique), `role` (Enum), `supabase_id` (UUID, Unique Index).
- **`sponsors`:** `id` (UUID), `name` (Unique), `description`, `contact_info`.
- **`scholarships`:** `id` (UUID), `sponsor_id` (FK -> sponsors), `name`, `amount`, `deadline`, `status` (Enum: OPEN/CLOSED).
- **`applications`:** `id` (UUID), `user_id` (FK -> users), `scholarship_id` (FK -> scholarships), `status` (Enum), Unique Index on `[user_id, scholarship_id]` to enforce single application per program.
- **`documents`:** `id` (UUID), `user_id` (FK -> users), `file_url`, `type` (Enum: KTM/Transkrip).

### Authentication Middleware (Supabase Admin SDK)
- Tokens are extracted from the incoming request's `Authorization: Bearer <token>` header.
- The backend utilizes the Supabase Admin SDK to hit the local auth verifier or direct API (`supabase.auth.getUser(token)`).
- Upon verification, the backend queries MySQL using the `supabase_id` to attach the internal user record and associated application role to `req.user`.

### Central Axios Client with Interceptors
- Located at `frontend/src/api/client.js`.
- Automatically injects the active Supabase JWT into all outgoing HTTP headers.
- Gracefully handles expired sessions by intercepting `401 Unauthorized` responses and triggering a clean state reset and redirection to `/login`.

---

## 3. Verification Strategy

Every task follows an automation-first verification matrix before being marked done:

| Component | Verification Method | Automated Command | Success Criteria |
| :--- | :--- | :--- | :--- |
| **Infrastructure** | Container Healthcheck | `docker compose ps --format json` | All 4 services show status `running`. |
| **Database** | Migration Execution | `npx sequelize-cli db:migrate` | Returns exit code 0; tables exist in MySQL. |
| **Authentication** | Guard Verification | `curl -I http://localhost/api/auth/me` | Unauthenticated hits return `401`. Valid JWT returns user object. |
| **CRUD Modules** | Role Authorization | Integration tests via Jest/Supertest | Staff role succeeds; Student role returns `403 Forbidden`. |
| **Document Upload** | Constraints Check | Frontend boundary validation | Files >2MB or non-PDF types are rejected immediately. |

---

## 4. Dependency Map

```
Wave 1: [Infrastructure Setup] ──> [Sequelize Core Migrations]
                                           │
                                           ▼
Wave 2:                       [Supabase JWT Middleware]
                                           │
                      ┌────────────────────┴────────────────────┐
                      ▼                                         ▼
Wave 3:      [Sponsor CRUD Module]                   [Scholarship CRUD Module]
                      │                                         │
                      └────────────────────┬────────────────────┘
                                           ▼
Wave 4:                       [Student Profile & PDF Upload]
                                           │
                                           ▼
                              [Interactive Application Form]
```

This map guarantees that no UI elements are built without backend data channels, and no data channels are exposed without valid authentication layers.
