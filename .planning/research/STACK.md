# Technology Stack: SIM-Beasiswa

**Project:** Sistem Informasi Manajemen Beasiswa
**Last Updated:** 2024-06-12
**Focus:** Hybrid Stack (Custom Backend + BaaS Auth/Storage)

## Core Stack

### Backend
| Technology | Role | Why |
|------------|------|-----|
| **Node.js** | Runtime Environment | High performance for I/O bound tasks and unified language (JavaScript) with frontend. |
| **Express.js** | Web Framework | Lightweight, flexible, and has a vast ecosystem for building REST APIs. |
| **MySQL** | Primary Database | Reliable relational database for managing structured data like pendaftar, skor, and transaksi. |

### Frontend
| Technology | Role | Why |
|------------|------|-----|
| **React.js** | UI Library | Component-based architecture for building interactive and responsive dashboards. |
| **Tailwind CSS** | Styling | Rapid UI development with utility-first classes for a modern aesthetic. |
| **Axios** | HTTP Client | For making API requests from the frontend to the Node.js backend. |

### BaaS & Infrastructure
| Technology | Role | Why |
|------------|------|-----|
| **Supabase Auth** | Authentication | Secure NIM/Password login with built-in JWT handling and role management. |
| **Supabase Storage** | Object Storage | Scalable and secure storage for student document PDFs (Max 2MB). |
| **Docker** | Containerization | Ensures environment consistency across development and production. |
| **Nginx** | Reverse Proxy | Handles request routing, SSL termination, and static file serving. |

## Supporting Tools

- **Sequelize / Knex.js:** ORM/Query Builder for MySQL management in Node.js.
- **Zod:** Schema validation for both frontend and backend to ensure data integrity.
- **Multer:** Middleware for handling `multipart/form-data` (file uploads) in Express.js.
- **JWT (Json Web Token):** For secure communication between Node.js and Supabase Auth.

## Integration Strategy

1. **Authentication Flow:** Frontend authenticates with Supabase Auth -> Receives JWT -> Sends JWT to Node.js Backend -> Backend validates JWT via Supabase public key or secret.
2. **Data Storage:** Primary business data stays in MySQL. Document metadata (paths) is stored in MySQL, while the files reside in Supabase Storage.
3. **Deployment:** Multi-container setup using `docker-compose` (Frontend, Backend, MySQL, Nginx).

## Sources
- Node.js & Express Documentation.
- Supabase Auth integration guides for external backends.
- Docker Best Practices for Node.js Applications.
