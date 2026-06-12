# Phase 1: Foundation & Initial Setup - Pattern Map

**Mapped:** 2024-06-12
**Files analyzed:** 12 (planned)
**Analogs found:** 0 / 12 (Greenfield Project)

## File Classification

As this is the initial phase, no existing code exists. The following files are classified by their intended roles and data flows based on the Architecture and Stack research.

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `backend/src/index.js` | config | request-response | N/A | No Analog |
| `backend/src/config/db.js` | config | request-response | N/A | No Analog |
| `backend/src/config/supabase.js` | config | request-response | N/A | No Analog |
| `backend/src/middleware/auth.js` | middleware | request-response | N/A | No Analog |
| `backend/src/controllers/auth.js` | controller | request-response | N/A | No Analog |
| `backend/src/models/User.js` | model | CRUD | N/A | No Analog |
| `backend/src/models/Sponsor.js` | model | CRUD | N/A | No Analog |
| `backend/src/models/Scholarship.js` | model | CRUD | N/A | No Analog |
| `frontend/src/api/client.js` | utility | request-response | N/A | No Analog |
| `docker-compose.yml` | config | infrastructure | N/A | No Analog |
| `nginx/nginx.conf` | config | infrastructure | N/A | No Analog |

## Pattern Assignments (Reference from Research)

### Backend: Express setup (`backend/src/index.js`)
**Pattern:** Standard Express.js app setup with JSON parsing, CORS, and centralized error handling.
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
// app.use('/api/auth', authRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### Authentication Middleware (`backend/src/middleware/auth.js`)
**Source:** `RESEARCH.md` (Supabase Auth Integration)
**Pattern:** Verify Supabase JWT from Authorization header.
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
};
```

### Data Access (`backend/src/models/*.js`)
**Pattern:** Use an ORM (Sequelize) to define MySQL schemas and relations.
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sponsor = sequelize.define('Sponsor', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true }
});
```

## Shared Patterns

### Authentication
**Source:** `ARCHITECTURE.md`
**Apply to:** All protected API routes.
- Frontend authenticates with Supabase -> Receives JWT.
- JWT sent in `Authorization: Bearer <token>` header.
- Backend verifies JWT before executing MySQL queries.

### Validation
**Source:** `STACK.md`
**Apply to:** All POST/PUT request bodies.
- Use **Zod** for schema validation in controllers or as middleware.

### Infrastructure
**Source:** `ARCHITECTURE.md`
**Apply to:** `docker-compose.yml`
- Services: `frontend`, `backend`, `db` (MySQL), `proxy` (Nginx).
- Use Docker networks for inter-container communication.

## No Analog Found

All files in Phase 1 currently have no analogs because this is the project initialization. The patterns provided above are based on the **Research Stack** and **Architecture** documents.

| File | Reason |
|------|--------|
| All files | Greenfield project initialization. |

## Metadata

**Analog search scope:** Project Root
**Files scanned:** 0 source files (Planning files only)
**Pattern extraction date:** 2024-06-12
