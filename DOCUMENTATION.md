# TaskZen - Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Database (Neon PostgreSQL)](#database-neon-postgresql)
4. [Authentication & Authorization](#authentication--authorization)
5. [Image Storage (Cloudinary)](#image-storage-cloudinary)
6. [Email Services](#email-services)
7. [API Routes Reference](#api-routes-reference)
8. [Database Schema](#database-schema)
9. [Features Breakdown](#features-breakdown)
10. [Security Audit](#security-audit)
11. [Environment Variables](#environment-variables)
12. [Deployment](#deployment)

---

## Project Overview

**TaskZen** is a full-stack productivity and habit-tracking web application. Users can create recurring tasks, track completions with photo evidence, maintain streaks, earn XP/levels, write daily reflections, run focus sessions, and view detailed analytics — all within a gamified experience.

**Live URL:** Deployed on Vercel
**Repository:** Private GitHub repo

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.6 | Full-stack React framework with API routes |
| **Language** | TypeScript | 5 | Type safety across the entire codebase |
| **UI Library** | React | 19.2.3 | Component-based UI |
| **Database** | PostgreSQL | - | Relational data storage |
| **DB Hosting** | Neon | - | Serverless PostgreSQL |
| **ORM** | Prisma | 5.22.0 | Database queries and schema management |
| **Auth** | NextAuth v5 | 5.0.0-beta.30 | Authentication (credentials + Google OAuth) |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS |
| **Components** | Base UI + shadcn | - | Accessible UI primitives |
| **Icons** | Lucide React | 0.577.0 | SVG icon library |
| **Forms** | React Hook Form | 7.71.2 | Form state management |
| **Validation** | Zod | 4.3.6 | Schema validation (client + server) |
| **Data Fetching** | TanStack React Query | 5.90.21 | Server state management and caching |
| **Charts** | Recharts | 3.8.0 | Data visualization |
| **Animations** | Framer Motion | 12.36.0 | UI animations |
| **Image Upload** | Cloudinary | 2.9.0 | Cloud image storage and transformation |
| **Email (Primary)** | Nodemailer + Gmail SMTP | 7.0.13 | OTP verification emails |
| **Email (Alt)** | Resend | 6.9.3 | Backup email service |
| **Notifications** | Sonner | 2.0.7 | Toast notifications |
| **Theming** | next-themes | 0.4.6 | Dark/light mode |
| **Dates** | date-fns | 4.1.0 | Date manipulation |
| **Date Picker** | react-day-picker | 9.14.0 | Calendar date selection |
| **Hosting** | Vercel | - | Deployment and hosting |

---

## Database (Neon PostgreSQL)

### What is Neon?
Neon is a serverless PostgreSQL provider. It offers auto-scaling, branching, and a generous free tier — ideal for serverless Next.js apps deployed on Vercel.

### Connection
- **DATABASE_URL** — Pooled connection string (used by Prisma Client at runtime)
- **DIRECT_URL** — Direct connection string (used by Prisma Migrate for schema changes)

### What data is stored in Neon?

| Model | Data Stored |
|-------|-------------|
| **User** | Name, email, hashed password, profile image URL, XP, level, streak, reminder preferences, wake/sleep times |
| **Account** | Google OAuth tokens (access_token, refresh_token, id_token) |
| **Otp** | Email verification codes (6-digit, 10-minute expiry) |
| **Task** | Title, description, category, color, recurrence config, scheduled time, start/end dates, active status |
| **TaskCompletion** | Which task was completed on which date, timestamp |
| **MonthlyArchive** | Aggregated monthly stats — completion rate, streak, category breakdown |
| **TaskPhoto** | Cloudinary image URL + publicId linked to a task + date |
| **DailyReflection** | Journal entry text + mood rating (1-5) per day |
| **FocusSession** | Pomodoro/focus session duration, linked to optional task |
| **ScheduleBlock** | Daily routine blocks (work, school, custom) with time ranges |

### Data Safety
- Passwords are **never stored in plain text** — always hashed with bcryptjs (12 salt rounds)
- OAuth tokens stored via Prisma Adapter (standard NextAuth pattern)
- All database queries go through Prisma ORM — **SQL injection is not possible**
- User data is scoped by `userId` in every query — users cannot access each other's data
- Cascade deletes ensure no orphaned data when a user or task is deleted

---

## Authentication & Authorization

### Methods
1. **Credentials** — Email + password login
2. **Google OAuth** — Sign in with Google (requires pre-existing account)

### Flow

```
Signup:
  Email → Send OTP → Verify OTP → Set password → Account created

Login (Credentials):
  Email + Password → bcrypt verify → JWT issued → Session active

Login (Google):
  Google OAuth → Check existing account → JWT issued → Session active
```

### Session Strategy
- **JWT-based sessions** (no database sessions)
- Token contains user ID and verification timestamp
- User existence re-verified every **5 minutes** (prevents deleted users from staying logged in)
- Graceful handling if database is temporarily unavailable

### Route Protection
- `middleware.ts` protects all `/dashboard/*`, `/tasks/*`, `/monthly/*`, `/settings` routes
- Every API route checks `session.user.id` before processing
- Unauthenticated requests receive `401 Unauthorized`

---

## Image Storage (Cloudinary)

### What is Cloudinary?
Cloudinary is a cloud-based image and video management service. TaskZen uses it for task completion photo evidence.

### How it works
1. User uploads a photo for a task completion
2. Server validates: **JPEG, PNG, WebP, or GIF** only, **max 5MB**
3. Image is uploaded to Cloudinary with automatic transformations:
   - Resized to max **800x800px**
   - Auto quality optimization
   - Auto format conversion
4. Cloudinary returns a URL and publicId
5. URL and publicId are saved in the `TaskPhoto` table in Neon
6. When a photo is deleted, the Cloudinary image is also deleted via publicId

### Storage Path
Images are organized as: `taskzen/{userId}/{filename}`

### Configuration
- Uses `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- All credentials stored in environment variables (not in code)

---

## Email Services

### Primary: Gmail SMTP (via Nodemailer)
- Used for sending **OTP verification emails** during signup
- Sends HTML-formatted emails from "TaskZen"
- OTP codes expire after **10 minutes**

### Secondary: Resend
- Configured as an alternative email service
- API key stored in environment variables

---

## API Routes Reference

### Authentication
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/send-otp` | Send 6-digit OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/change-password` | Change password (requires current password) |
| * | `/api/auth/[...nextauth]` | NextAuth handlers (login, logout, session) |

### Tasks
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/tasks` | List all tasks (paginated, cursor-based) |
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks/[taskId]` | Get single task |
| PUT | `/api/tasks/[taskId]` | Update task |
| DELETE | `/api/tasks/[taskId]` | Delete task |
| PATCH | `/api/tasks/[taskId]/toggle` | Toggle task active/inactive |
| GET | `/api/tasks/progress` | Get all active tasks with completion counts |

### Completions
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/completions` | Get completions for a date range |
| POST | `/api/completions` | Mark task as completed for a date |
| GET | `/api/completions/archive` | Get monthly archive data |
| POST | `/api/completions/archive` | Generate monthly archive |

### Photos
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/photos` | Get photos for a task/date |
| POST | `/api/photos` | Upload photo (multipart form) |
| DELETE | `/api/photos` | Delete photo (removes from Cloudinary too) |
| GET | `/api/photos/stats` | Photo consistency statistics |

### Stats & Analytics
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/stats` | Monthly stats (rate, streak, XP, categories) |

### Reflections
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/reflections` | Get reflection for a date |
| POST | `/api/reflections` | Create/update daily reflection |
| DELETE | `/api/reflections` | Delete reflection |

### Focus Sessions
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/focus-sessions` | Get sessions for a date range |
| POST | `/api/focus-sessions` | Log a focus session |

### User Settings
| Method | Route | Purpose |
|--------|-------|---------|
| GET/PUT | `/api/user/preferences` | Morning/evening reminder times |
| GET/POST/DELETE | `/api/user/schedule` | Daily schedule blocks |
| GET/PUT | `/api/user/routine` | Wake up/sleep times |
| GET | `/api/user/gamification` | XP, level, streak, badges |

### Export
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/export` | Download all data as CSV (streaming) |

---

## Database Schema

### Entity Relationship Overview

```
User
 ├── Account (Google OAuth tokens)
 ├── Task
 │    ├── TaskCompletion (date-based)
 │    ├── TaskPhoto (Cloudinary images)
 │    └── FocusSession
 ├── MonthlyArchive
 ├── DailyReflection
 └── ScheduleBlock
```

### Recurrence Types
| Type | Schedule |
|------|----------|
| DAILY | Every day |
| WEEKLY | Every Monday |
| MONTHLY | 1st of each month |
| CUSTOM_WEEKLY | User-selected weekdays (Sun-Sat) |
| CUSTOM_MONTHLY | User-selected dates (1st-31st) |
| FLEXIBLE_WEEKLY | N times per week (e.g., 3x/week) |

---

## Features Breakdown

### Task Management
- Create, edit, delete, pause/resume tasks
- 8 categories: General, Gym, Study, Work, Health, Personal, Hobby, Finance
- 6 recurrence patterns
- Start date and end date tracking
- Scheduled time support

### Completion Tracking
- Mark tasks complete per day
- Photo evidence upload (Cloudinary)
- Completion history

### Progress Dialog
- Auto-shows on dashboard (twice daily: once before 8 PM, once after 8 PM)
- Shows all active tasks with progress bars
- Color-coded urgency: green (>3 days), yellow (<=3 days), red (overdue)
- Days remaining countdown

### Gamification
- **XP System:** 10 XP per completion, 2x bonus at 7+ day streaks
- **15 Levels** with exponential XP requirements
- **8 Badges:** First Step, Week Warrior, Fortnight Focus, Month Master, Centurion, Rising Star, Veteran, XP Hoarder
- **4 Motivation Tiers:** Champion, Rising Star, Building Momentum, Getting Started
- **Daily Quotes:** 120+ motivational quotes rotated by tier

### Analytics Dashboard
- Completion rate pie chart (futuristic design, theme-aware)
- Category breakdown bar chart
- Streak counter
- XP and level progress
- Badge showcase
- Recent activity feed
- Motivation card with tier-based quotes

### Daily Reflections
- Journal entry with mood rating (1-5)
- One entry per day

### Focus Sessions
- Pomodoro-style timer
- Duration tracking linked to tasks

### Schedule Blocks
- Daily routine planner
- Block types: Work, School, College, Custom
- Time range and day selection

### Data Export
- CSV download of all tasks and completions
- Streaming response for large datasets

### Settings
- Morning/evening reminder preferences
- Wake up/sleep time
- Password change
- Theme toggle (dark/light)

---

## Security Audit

### Secure (No Issues Found)

| Area | Status | Details |
|------|--------|---------|
| **Secrets in Git** | SAFE | `.env*` is in `.gitignore`, `.env` is NOT tracked |
| **Password Storage** | SAFE | bcryptjs with 12 salt rounds — never stored in plain text |
| **SQL Injection** | SAFE | All queries go through Prisma ORM — parameterized by default |
| **XSS Protection** | SAFE | React auto-escapes JSX output — no `dangerouslySetInnerHTML` usage |
| **Input Validation** | SAFE | Zod schemas validate all API inputs on both client and server |
| **Data Isolation** | SAFE | Every query filters by `userId` — users cannot access others' data |
| **Session Verification** | SAFE | JWT tokens re-verify user existence every 5 minutes |
| **OAuth Tokens** | SAFE | Stored via standard Prisma Adapter (encrypted at rest by Neon) |
| **Image Upload** | SAFE | File type and size validated server-side (JPEG/PNG/WebP/GIF, max 5MB) |
| **Cascade Deletes** | SAFE | Deleting a user/task cascades to all related records |
| **Auth Routes** | SAFE | All protected routes check `session.user.id` before processing |
| **Middleware** | SAFE | `middleware.ts` blocks unauthenticated access to dashboard routes |
| **X-Powered-By** | SAFE | Disabled in `next.config.ts` (`poweredByHeader: false`) |
| **Password Change** | SAFE | Requires current password verification before allowing change |

### Recommendations (Optional Improvements)

| Area | Priority | Recommendation |
|------|----------|----------------|
| **Rate Limiting** | High | Add rate limiting on OTP and login endpoints to prevent brute force |
| **Password Policy** | Medium | Currently only requires 6 characters — consider requiring 8+ with complexity |
| **Security Headers** | Medium | Add CSP, HSTS, X-Frame-Options headers via `next.config.ts` or middleware |
| **Error Messages** | Low | "Email already registered" on signup reveals user existence — consider generic messages |
| **2FA** | Low | Currently only OTP for signup — optional 2FA for login would add security |
| **Audit Logging** | Low | Log authentication events (failed logins, password changes) for monitoring |

---

## Environment Variables

All secrets are stored in `.env` (gitignored) and set as environment variables on Vercel.

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | Neon | Pooled PostgreSQL connection string |
| `DIRECT_URL` | Neon | Direct PostgreSQL connection (migrations) |
| `AUTH_SECRET` | NextAuth | JWT signing secret |
| `AUTH_URL` | NextAuth | Application URL |
| `AUTH_GOOGLE_ID` | Google | OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google | OAuth client secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | Cloud name identifier |
| `CLOUDINARY_API_KEY` | Cloudinary | API key |
| `CLOUDINARY_API_SECRET` | Cloudinary | API secret |
| `GMAIL_USER` | Gmail | SMTP sender email |
| `GMAIL_APP_PASSWORD` | Gmail | SMTP app password |
| `RESEND_API_KEY` | Resend | Email API key |

---

## Deployment

### Platform: Vercel
- Auto-deploys on push to `main` branch
- Environment variables configured in Vercel dashboard
- Serverless functions for all API routes
- Edge middleware for route protection

### Build Configuration
- **Framework:** Next.js (auto-detected)
- **Node.js:** Compatible with Vercel's runtime
- **Prisma:** Client generated during build (`postinstall` or build step)
- **Image Domains:** `lh3.googleusercontent.com` (Google), `res.cloudinary.com` (Cloudinary)

### Database
- **Neon** PostgreSQL — serverless, auto-scales with Vercel
- Schema managed via `prisma db push` or `prisma migrate`

---

*Last updated: March 20, 2026*
