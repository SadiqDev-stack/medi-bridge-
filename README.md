
# MediBridge MVP

A centralized patient record system that lets approved hospitals share medical records using a unique MediBridge Health ID.

## Features

- Hospital registration and admin approval
- Hospital login with JWT
- Patient registration with auto-generated Health ID (MB-YYYY-XXXXXX)
- Patient search by Health ID
- Cross-hospital record access
- Medical encounters (date, reason, diagnosis, treatment, notes)
- Full patient record history
- Admin dashboard with stats
- Audit logs of all record access and modification
- Feedback / bug reports
- Responsive UI

## Tech Stack

- Frontend: HTML, Tailwind CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT

## Project Structure

```
medibridge/
├── backend/
│   ├── middlewares/    auth, error
│   ├── models/         Hospital, Patient, Record, AuditLog, Feedback
│   ├── routes/         auth, hospital, patient, record, audit, feedback, stats
│   ├── utils/          db, generateId, audit
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── index.html
├── .gitignore
├── README.md
└── vercel.json
```

## Setup

### 1. Install

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medibridge
JWT_SECRET=change_this_to_a_long_random_string
ADMIN_EMAIL=admin@medibridge.com
ADMIN_PASSWORD=admin123
```

### 3. Run

```bash
npm run dev
```

- Server: http://localhost:5000
- API:    http://localhost:5000/api
- Health: http://localhost:5000/api/health

## Core Workflow

1. Hospital registers
2. Admin approves
3. Hospital logs in
4. Hospital registers a patient - Health ID is generated
5. Another approved hospital searches by Health ID
6. Retrieves existing records and adds a new encounter

## API Overview

| Method | Endpoint                            | Auth     | Purpose             |
|--------|-------------------------------------|----------|---------------------|
| POST   | /api/auth/register-hospital         | public   | Hospital signup     |
| POST   | /api/auth/login                     | public   | Hospital login      |
| POST   | /api/auth/admin-login               | public   | Admin login         |
| GET    | /api/hospitals/pending              | admin    | Pending hospitals   |
| PATCH  | /api/hospitals/:id/approve          | admin    | Approve             |
| PATCH  | /api/hospitals/:id/reject           | admin    | Reject              |
| POST   | /api/patients                       | hospital | Register patient    |
| GET    | /api/patients/search?healthId=...   | hospital | Search patient      |
| POST   | /api/records                        | hospital | Add encounter       |
| GET    | /api/records/patient/:id            | hospital | Record history      |
| GET    | /api/audit                          | admin    | Audit logs          |
| POST   | /api/feedback                       | hospital | Submit feedback     |
| GET    | /api/stats                          | admin    | Dashboard stats     |

## Out of Scope (MVP)

- Billing
- AI features
- Complex team management
- Mandatory patient approval for record access
EOF

cat > .gitignore <<'EOF'
# dependencies
node_modules/
*/node_modules/

# env files
.env
.env.local
.env.*.local
backend/.env

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# build / cache
dist/
build/
.cache/
.vercel/

# editor / OS
.vscode/
.idea/
.DS_Store
Thumbs.db
desktop.ini

