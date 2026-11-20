# Monastery Event Management System (Full-Stack)

Complete frontend + backend package for the Monastery Event Management System.

## Folder Structure

```text
Monastery_Event_FullStack/
├── admin/                  # Admin Portal HTML/CSS/JS
├── monk/                   # Monk & Participant Portal HTML/CSS/JS
├── shared/
│   └── api-client.js       # Reusable Frontend Fetch Wrapper for REST API
├── backend/
│   ├── config/
│   │   ├── db.js           # MySQL connection pool
│   │   └── helpers.js      # ID generator & notification helpers
│   ├── middleware/
│   │   └── auth.js         # JWT verification & Admin role guard
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── volunteerRoutes.js
│   │   ├── donationRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── userRoutes.js
│   │   └── dashboardRoutes.js
│   ├── sql/
│   │   ├── schema.sql      # Complete MySQL database tables
│   │   └── seed.js         # Initial seed data & hashed passwords
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   └── server.js           # Express API + Static Frontend server
└── index.html              # Landing page
```

## Quick Start Guide

### 1. Set Up the MySQL Database
1. Open MySQL Workbench, phpMyAdmin, or your MySQL terminal.
2. Run the SQL script located at `backend/sql/schema.sql` to create `monastery_event_db` and all 11 tables.

### 2. Configure Environment Variables
1. Open `backend/.env` and update `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET` to match your local MySQL credentials.

### 3. Install Dependencies & Seed Data
```bash
cd backend
npm install
npm run seed
```

### 4. Start the Server
```bash
npm run dev
```
The server starts at `http://localhost:5000` and serves both the REST API (`/api/...`) and your frontend (`http://localhost:5000/index.html`).

## Default Seed Account
- **Admin:** `admin@monastery.bt` / `admin123`

*(Monks and participants create their own accounts via the registration page `monk/monk-register.html` or `POST /api/auth/register`.)*
