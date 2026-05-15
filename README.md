# Customer Complaint & Resolution Tracking System (CCRTS)

**Batch:** AFDE_May26_Keerthana_CCRTS  
**Developer:** Keerthana J

---

## Project Overview

A centralized web-based application for managing, monitoring, and resolving customer complaints end-to-end. Supports role-based workflows for Admins, Supervisors, Support Agents, and Customers with SLA tracking, escalation management, and analytics dashboards.

## Features Implemented

- **User Authentication** — JWT-based secure login/register with role-based access control
- **Complaint Registration** — Auto-generated complaint IDs, category selection, priority levels
- **Complaint Workflow** — Full lifecycle: Open → Assigned → In Progress → Resolved → Closed
- **SLA Management** — Priority-based SLA deadlines (Critical: 4h, High: 24h, Medium: 48h, Low: 72h)
- **Escalation Handling** — Flag and monitor escalated complaints with supervisor dashboard
- **File Attachments** — Upload supporting documents to complaints
- **Feedback System** — 5-star rating system for resolved complaints
- **Analytics Dashboard** — Charts for category breakdown, priority distribution, agent performance
- **Role-based Views** — Custom navigation and permissions per user role
- **Search & Filters** — Filter by status, priority, category, and free-text search

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, Recharts, React Router v7, Lucide Icons |
| Backend | FastAPI (Python 3.13), SQLAlchemy ORM |
| Database | SQLite |
| Auth | JWT (python-jose), SHA-256 password hashing |
| Styling | Custom CSS with gradient design system |

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Initialize and seed the database
cd backend
python seed.py

# Start the API server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API docs available at: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

### Database Setup

The SQLite database is auto-created at `database/ccrts.db` when the backend starts.  
Schema reference: `database/schema.sql`

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, get JWT token | Public |
| GET | `/api/auth/me` | Get current user profile | Bearer |
| GET | `/api/complaints/` | List complaints (filtered by role) | Bearer |
| POST | `/api/complaints/` | Create new complaint | Bearer |
| GET | `/api/complaints/{id}` | Get complaint detail | Bearer |
| PATCH | `/api/complaints/{id}` | Update status/assign/resolve | Bearer |
| DELETE | `/api/complaints/{id}` | Delete complaint | Admin |
| POST | `/api/complaints/{id}/upload` | Upload attachment | Bearer |
| GET | `/api/categories/` | List complaint categories | Public |
| GET | `/api/users/` | List all users | Admin/Supervisor |
| GET | `/api/users/agents` | List support agents | Bearer |
| PATCH | `/api/users/{id}` | Update user | Admin |
| POST | `/api/feedback/` | Submit complaint feedback | Customer |
| GET | `/api/dashboard/stats` | Dashboard statistics | Bearer |
| GET | `/api/dashboard/category-breakdown` | Category chart data | Bearer |
| GET | `/api/dashboard/priority-breakdown` | Priority chart data | Bearer |
| GET | `/api/dashboard/agent-performance` | Agent metrics | Admin/Supervisor |
| GET | `/api/roles/` | List roles | Public |

---

## Default Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ccrts.com | admin123 |
| Supervisor | supervisor@ccrts.com | super123 |
| Support Agent | alice@ccrts.com | agent123 |
| Customer | customer@example.com | cust123 |

---

## Project Structure

```
AFDE_May26_Keerthana_CCRTS/
├── frontend/               # React + Vite application
│   └── src/
│       ├── api/            # Axios instance & interceptors
│       ├── components/     # Reusable components (Sidebar, Layout, Badges)
│       ├── context/        # AuthContext (JWT management)
│       └── pages/          # Route pages
├── backend/                # FastAPI application
│   ├── routers/            # Auth, Complaints, Users, Dashboard, etc.
│   ├── main.py             # App entry point + CORS
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic request/response schemas
│   ├── auth.py             # JWT + password utilities
│   ├── database.py         # DB session & engine
│   └── seed.py             # Initial data seeder
├── database/
│   ├── schema.sql          # SQL schema reference
│   └── ccrts.db            # SQLite database (auto-created)
├── screenshots/            # Application screenshots
├── docs/                   # Additional documentation
├── requirements.txt        # Python dependencies
└── .gitignore
```

---

## SLA Rules

| Priority | Resolution Time |
|----------|----------------|
| Critical | 4 Hours |
| High | 24 Hours |
| Medium | 48 Hours |
| Low | 72 Hours |

---

## User Roles & Permissions

| Feature | Customer | Support Agent | Supervisor | Admin |
|---------|----------|---------------|------------|-------|
| Submit Complaint | ✅ | ✅ | ✅ | ✅ |
| View Own Complaints | ✅ | — | — | — |
| View Assigned Queue | — | ✅ | — | — |
| View All Complaints | — | — | ✅ | ✅ |
| Assign Agent | — | — | ✅ | ✅ |
| Update Status | — | ✅ | ✅ | ✅ |
| Escalate Complaint | — | — | ✅ | ✅ |
| Submit Feedback | ✅ | — | — | — |
| View Reports | — | — | ✅ | ✅ |
| Manage Users | — | — | — | ✅ |
| Delete Complaints | — | — | — | ✅ |
