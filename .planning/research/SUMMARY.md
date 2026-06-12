# Research Summary: SIM-Beasiswa (Revised)

**Date:** 2024-06-12
**Status:** Aligned with Node.js/MySQL/Supabase Hybrid Stack

## Executive Summary

The research for the Sistem Informasi Manajemen Beasiswa (SIM-Beasiswa) has been updated to reflect the shift to a **Hybrid Architecture**. This approach combines the robustness of a custom **Node.js + MySQL** backend for core business logic with the speed and security of **Supabase** for Authentication and Document Storage. This ensures the system can be containerized via **Docker** and deployed on traditional server infrastructures as required.

## Key Technical Findings

1. **Stack Synergy:** Node.js (Express) provides the necessary flexibility to implement complex scoring and audit logic that would be difficult in a pure BaaS environment. MySQL offers a familiar and reliable environment for Indonesian university IT teams.
2. **Security Model:** Identity management is handled by Supabase Auth (OIDC/JWT), which is then verified by the Node.js API. This offloads the risk of password management while maintaining full control over data access in MySQL.
3. **Storage Efficiency:** Using Supabase Storage for PDFs (Max 2MB) offloads heavy I/O from the main Node.js server, ensuring the 5-second render target for verifiers is met.

## Implementation Roadmap Implications

- **Foundation (Phase 1):** Focus on the "Triad of Integration" — connecting the React frontend, Node.js backend, and Supabase Auth. Establishing the MySQL schema early is critical.
- **Selection (Phase 3):** Ranking and Scoring should be implemented as server-side logic in Node.js to prevent any client-side manipulation of results.
- **Audit (Phase 4):** The use of MySQL allows for easy generation of complex financial reports using standard SQL joins, which will simplify the Export (PDF/Excel) feature for the Vice Rector.

## Confidence Assessment

| Category | Confidence | Rationale |
|----------|------------|-----------|
| **Stack** | HIGH | Node.js + MySQL is a "Gold Standard" for enterprise web apps. |
| **Security** | HIGH | Supabase Auth provides industry-standard security. |
| **Performance** | HIGH | Containerization and Nginx will provide stable performance. |
| **Complexity** | MEDIUM | Managing three core services (Node, MySQL, Supabase) requires careful orchestration. |

## Next Steps

1. **Project Scaffolding:** Create the `docker-compose.yml` and initialize the Express.js and React.js boilerplates.
2. **Schema Design:** Draft the MySQL E-R diagram to cover all 19 requirements.
3. **Auth Integration:** Test the JWT verification flow between Frontend -> Supabase -> Backend.
