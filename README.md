# SkillBridge – Attendance Management System

Live App: https://skillbridge.darshans.site

---

## Overview

SkillBridge is a role-based attendance system built as a full-stack prototype using Next.js (App Router). It supports five roles with strict server-side access control and real data flow.

Roles:

- Student
- Trainer
- Institution
- Programme Manager
- Monitoring Officer

Authentication is handled via Clerk, but **all authorization is enforced in backend APIs**, not just the frontend.

Assignment reference:

---

## Test Accounts

- Institution
  [institution@email.com](mailto:institution@email.com) / Institution@12

- Monitoring Officer
  [monitoringofficer@gmail.com](mailto:monitoringofficer@gmail.com) / MonitoringOfficer@12

- Programme Manager
  [programmemanager@email.com](mailto:programmemanager@email.com) / ProgrammeManager@12

- Student
  [student@email.com](mailto:student@email.com) / StudenT@12

- Trainer
  [trainer@email.com](mailto:trainer@email.com) / TraineR@12

---

## Tech Stack

- Frontend + Backend: Next.js (App Router)
- Language: TypeScript
- Styling: TailwindCSS
- Database: PostgreSQL (Drizzle ORM)
- Auth: Clerk
- Deployment: Vercel

Reasoning:

- Single repo full-stack (faster iteration)
- Drizzle ensures type-safe queries and schema alignment
- Clerk simplifies auth while backend enforces roles

---

## Project Structure

```
/app
  /(dashboard)
    /student
    /trainer
    /institution
    /programme_manager
    /monitoring_officer

  /api
    attendance/
    batches/
    sessions/
    institutions/
    trainer/
    student/
    programme/
    user/

/db
  schema.ts
  utils.ts

/components
/lib
/types
/proxy.ts (middleware)
```

---

## Database Schema (Actual Implementation)

Defined in:

### user

- id (Clerk ID)
- name
- email
- role (enum)
- institutionId (nullable)
- createdAt

### batch

- id
- name
- institutionId (FK → user)
- createdAt

### batch_trainers

- id (uuid)
- batchId
- trainerId
- unique(batchId, trainerId)

### batch_students

- id (uuid)
- batchId
- studentId
- unique(batchId, studentId)

### session

- id
- batchId
- trainerId
- title
- date
- startTime
- endTime
- createdAt

### attendance

- id
- sessionId
- studentId
- status (present | late | absent)
- markedAt
- unique(sessionId, studentId)

### batch_invite

- id
- batchId
- createdBy
- isActive

Key decisions:

- Uses **string IDs (Clerk IDs)** instead of separate user table IDs
- Attendance is **derived absent** if no record exists
- Invite system supports **single active invite per batch**
- Strong use of **unique constraints to prevent duplicates**

---

## API Design (Actual Routes)

### User / Auth

- POST `/api/user` → create user with role
- GET `/api/user` → fetch current user

---

### Batches (Institution + Trainer flows)

- GET `/api/batches` → institution batches

- POST `/api/batches` → create batch

- GET `/api/batches/:id/trainers`

- POST `/api/batches/:id/trainers` → assign trainers

- GET `/api/batches/:id/invite`

- POST `/api/batches/:id/invite` → create/regenerate invite

- POST `/api/batches/:id/join` → student joins batch

- GET `/api/batches/:id/attendance-summary`
  → batch-level aggregation (completed sessions only)

---

### Sessions

- POST `/api/sessions` → create session
  - validates:
    - trainer assignment
    - no overlapping sessions

- GET `/api/sessions/:id/attendance`
  → trainer view (derives absent)

---

### Attendance

- POST `/api/attendance/mark`

Important logic:

- student must belong to batch
- cannot mark twice
- time-based rules:
  - before start → rejected
  - within 15 min → present
  - after → late
  - after end → closed

---

### Student APIs

- GET `/api/student/batches`
  - returns:
    - batches
    - sessions
    - attendance flag per session

---

### Trainer APIs

- GET `/api/trainer/batches`
- GET `/api/trainer/sessions`
- GET `/api/trainer/batches/:id/students`

---

### Institution APIs

- GET `/api/institution/trainers`
- POST `/api/institution/trainers`

---

### Programme Manager APIs

- GET `/api/institutions`
- GET `/api/institutions/:id/summary`

---

### Monitoring Officer API

- GET `/api/programme/summary`

---

## Dashboard Behavior (Aligned with Code)

### Student

- Fetches `/api/student/batches`
- Shows:
  - next/live session only
  - live attendance window

- Attendance logic:
  - live → mark
  - late window (15 min)
  - closed → blocked

- UI logic computed client-side using timestamps

---

### Trainer

Tabs:

1. Batches
   - view assigned batches
   - generate invite link
   - view students
   - create sessions

2. Sessions
   - list sessions
   - open attendance dialog (only after start)

---

### Institution

- Create batches
- Assign trainers to institution
- Assign trainers to batches
- Fetch per-batch:
  - trainers
  - attendance summary

---

### Programme Manager

- Fetch all institutions
- For each:
  - `/api/institutions/:id/summary`

- Displays:
  - total batches
  - total sessions
  - attendance %

---

### Monitoring Officer

- Fetch `/api/programme/summary`
- Shows:
  - overall stats
  - per-institution breakdown

- Sorting supported:
  - lowest present %
  - highest absent %

Read-only enforced server-side

---

## Middleware / Access Control

Implemented in `proxy.ts`

- Blocks unauthenticated access
- Forces onboarding if role not set
- Redirects user based on role
- Prevents cross-role route access

Important:

- UI restriction + backend validation (defense in depth)

---

## What is Fully Working

- Authentication + onboarding flow
- Role-based routing (frontend + middleware)
- Server-side authorization in all APIs
- Batch creation and trainer assignment
- Invite-based student onboarding
- Session creation with overlap validation
- Attendance marking with time logic
- Attendance aggregation:
  - batch
  - institution
  - programme

- All 5 dashboards functional with real data

---

## Running Locally

1. Install dependencies
   pnpm install
   → installs all packages

2. Setup `.env` using `.env.example`

3. Push schema
   pnpm drizzle-kit push
   → sync DB schema

4. Start dev server
   pnpm dev
   → runs Next.js app
