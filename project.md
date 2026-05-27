# Test Case Dashboard — Project Checklist

## Phase 1 — Project Setup & Architecture ✅

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Prisma, SQLite, Zod, React Hook Form, TanStack Table, Recharts, bcrypt, NextAuth.js

### Setup Tasks

- [x] Setup project architecture
- [x] Configure Prisma + SQLite
- [x] Configure Tailwind
- [x] Configure shadcn/ui
- [x] Configure TypeScript aliases (`@/*` → `./src/*`)
- [x] Setup folder structure (`app/`, `components/`, `lib/`, `hooks/`, `services/`, `types/`, `validations/`, `prisma/`)
- [x] Setup environment variables (`.env` + Zod validation)
- [x] Setup reusable layouts (Root layout + Workspace layout)
- [x] Setup sidebar navigation
- [x] Setup dark/light theme support (next-themes + ThemeToggle)
- [x] Setup Prisma client singleton
- [x] Setup utility/helper structure (`cn()`, `constants`, `env`)

### Generate

- [x] Project structure
- [x] Package installation
- [x] Tailwind setup
- [x] shadcn/ui setup
- [x] Prisma setup
- [x] SQLite setup
- [x] Base layout
- [x] Sidebar layout
- [x] Shared utility files
- [x] Recommended environment variables
- [x] Theme provider setup

### Architecture Rules

- [x] Clean architecture
- [x] Strong typing everywhere
- [x] Reusable components
- [x] Avoid giant files
- [x] Split components properly
- [x] Server components by default
- [x] Client components only when necessary

---

## Phase 2 — Authentication & Authorization ✅

**Tech Stack:** NextAuth.js v4, bcrypt, jose, Prisma, Zod, React Hook Form

**Roles:** ADMIN, QA, VIEWER

> **Note:** Next.js 16 renamed `middleware.ts` → `proxy.ts`. Use `proxy.ts` for route protection.

### A. Database

- [x] User model in schema.prisma (id, name, email, password, role, createdAt, updatedAt)
- [x] Run migration (`npx prisma migrate dev --name add_user_model`)
- [x] Seed script (`src/prisma/seed.ts`) — 3 users: admin, qa, viewer
- [x] Add prisma seed config to `prisma.config.ts`

### B. Auth Configuration

- [x] Install `jose` + `server-only`
- [x] Password utilities (`src/lib/auth/password.ts`) — hashPassword, verifyPassword
- [x] NextAuth config (`src/lib/auth/config.ts`) — CredentialsProvider, JWT callbacks with role
- [x] API route (`src/app/api/auth/[...nextauth]/route.ts`) — GET/POST handlers
- [x] Type augmentation (`src/types/next-auth.d.ts`) — Session/JWT with role + id

### C. Session & Route Protection

- [x] Session helper (`src/lib/auth/session.ts`) — getSession(), getCurrentUser()
- [x] Proxy (`src/proxy.ts`) — protect app routes, allow /login + /api/auth + static

### D. Permission & Role Helpers

- [x] Permission helpers (`src/lib/auth/permissions.ts`) — canCreate, canEdit, canDelete, canManageUsers
- [x] Role guards (`src/lib/auth/guards.ts`) — requireAuth(), requireRole()

### E. Client Session Provider

- [x] Session provider (`src/components/providers/session-provider.tsx`)
- [x] Update root layout — wrap with SessionProvider

### F. Login Page

- [x] Auth validation schema (`src/validations/auth.ts`) — loginSchema
- [x] Auth layout (`src/app/(auth)/layout.tsx`) — centered, no sidebar
- [x] Login page (`src/app/(auth)/login/page.tsx`) — redirect if already authed
- [x] Login form (`src/components/auth/login-form.tsx`) — React Hook Form + signIn()

### G. Logout & Protected Wrapper

- [x] Logout button in app-shell header
- [x] Protected component (`src/components/auth/protected.tsx`) — server-side guard

### H. Environment

- [x] Update `.env` — proper NEXTAUTH_SECRET
- [x] Update `src/validations/env.ts` — make nextAuthSecret required

### Security Rules

- [x] Never trust frontend permissions
- [x] Validate permissions in backend APIs
- [x] Hide unauthorized UI actions
- [x] Do not expose password fields
- [x] Use secure session handling (HttpOnly cookies)
- [x] Use reusable permission helpers

---

## Phase 3 — Database Schema & Prisma Models

**Tech Stack:** Prisma, SQLite

### Models

- [x] Project model
- [x] TestSuite model (hierarchical)
- [x] TestCase model
- [x] TestStep model
- [x] TestRun model
- [x] TestExecution model
- [x] Defect model
- [x] Tag / TestCaseTag model

### Enums/Statuses

- [x] TestCaseStatus (DRAFT, READY, DEPRECATED)
- [x] TestRunStatus (PLANNED, IN_PROGRESS, COMPLETED, CANCELED)
- [x] ExecutionStatus (NOT_RUN, PASSED, FAILED, BLOCKED, SKIPPED)

### Generate

- [x] Complete schema.prisma
- [x] Migration commands
- [x] Prisma client setup
- [x] Seed script
- [x] Example seed data (Admin user, QA user, Viewer user, Example modules, Example test cases)
- [x] Database helper utilities

### Rules

- [x] Use cuid() for IDs
- [x] Use Prisma best practices
- [x] SQLite-compatible schema
- [x] Indexes where appropriate
- [x] Prevent invalid relations

---

## Phase 4 — Backend APIs ✅

**Tech Stack:** Next.js API Routes, TypeScript, Prisma, SQLite, Zod

### Module APIs

- [x] `GET /api/modules` — List modules
- [x] `POST /api/modules` — Create module
- [x] `PATCH /api/modules/:id` — Update module
- [x] `DELETE /api/modules/:id` — Delete module

### Test Case APIs

- [x] `GET /api/test-cases` — List test cases
- [x] `POST /api/test-cases` — Create test case
- [x] `PATCH /api/test-cases/:id` — Update test case
- [x] `DELETE /api/test-cases/:id` — Delete test case

### User APIs

- [x] `GET /api/users` — List users
- [x] `PATCH /api/users/:id/role` — Update user role

### Dashboard APIs

- [x] `GET /api/dashboard/summary` — Dashboard summary (total, pass, failed, pass rate, failed rate, module summary)

### Shared Infrastructure

- [x] Validation schemas (Zod)
- [x] Permission middleware/helpers
- [x] Shared API response helpers
- [x] Error handling utilities
- [x] Dashboard aggregation queries

### Business Rules

- [x] QA cannot delete
- [x] VIEWER is read-only
- [x] ADMIN has full access

---

## Phase 5 — Dashboard UI ✅

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Table, Recharts

### Dashboard Features

- [x] Dashboard page (`/`)
- [x] Total Test Cases card
- [x] Passed Count card
- [x] Failed Count card
- [x] Overall Pass Rate card
- [x] Failed Rate card
- [x] Pass/Failed Pie Chart
- [x] Pass Rate By Module Bar Chart
- [x] Module Summary Table

### Module Table Columns

- [x] Module Name
- [x] Total
- [x] Passed
- [x] Failed
- [x] Pass Rate
- [x] Updated At

### Filters

- [ ] Project filter
- [x] Module filter
- [x] Status filter
- [ ] Date Range filter
- [x] Search keyword (with debounce)

### UI States

- [x] Loading states
- [x] Empty states
- [x] Error states
- [x] Skeleton loading
- [x] Pagination
- [x] Sorting

### UI Rules

- [x] PASS = green
- [x] FAILED = red
- [x] Hide unauthorized actions
- [x] Responsive design

---

## Phase 6 — Module CRUD UI ✅

**Tech Stack:** Next.js, TypeScript, Tailwind, shadcn/ui, React Hook Form, Zod

### Pages

- [x] `/modules` — Module list page
- [ ] `/modules/[id]` — Module detail page

### Features

- [x] Module table (list)
- [x] Create module (modal form)
- [x] Edit module (modal form)
- [x] Delete module (confirmation modal)
- [x] Search modules
- [x] Pagination
- [x] Sorting

### Generate

- [x] Module table component
- [x] Create form
- [x] Edit form
- [x] Delete confirmation modal
- [x] Validation schemas
- [x] API integration hooks
- [x] Reusable form components

### Rules

- [x] Only ADMIN can delete
- [x] QA can create/edit
- [x] VIEWER is read-only
- [x] Toast notifications
- [ ] Optimistic UI updates
- [x] Error handling
- [x] Loading states

---

## Phase 7 — Test Case CRUD UI ✅

**Tech Stack:** Next.js, TypeScript, Tailwind, shadcn/ui, React Hook Form, Zod

### Pages

- [x] `/test-cases` — Test case list page

### Features

- [x] Test case table (list)
- [x] Create test case (modal form)
- [x] Edit test case (modal form)
- [x] Delete test case (confirmation modal)
- [x] Filter by status
- [x] Filter by module
- [x] Search
- [x] Pagination
- [x] Sorting

### Fields

- [x] title
- [x] description
- [x] status
- [x] module
- [ ] executedBy
- [ ] executedAt

### Generate

- [x] Test case table component
- [x] Create form
- [x] Edit form
- [x] Delete confirmation modal
- [x] Validation schemas
- [x] API integration hooks
- [x] Reusable form components

### Rules

- [x] QA cannot delete
- [x] VIEWER is read-only
- [x] Toast notifications
- [ ] Optimistic updates
- [x] Error states
- [x] Loading states

---

## Phase 8 — User Management ✅

**Tech Stack:** Next.js, TypeScript, Prisma, SQLite, Tailwind, shadcn/ui

### Pages

- [x] `/users` — User management page

### Features

- [x] User table (list)
- [x] Update user role (modal)
- [x] Search users
- [x] Pagination

### Generate

- [x] User table component
- [x] Role update modal
- [x] Validation schemas
- [x] API integration hooks
- [x] Permission guards

### Rules

- [x] Only ADMIN can access
- [x] Only ADMIN can change roles
- [x] Confirmation modal
- [x] Toast notifications
- [x] Error handling
- [x] Loading states

---

## Phase 9 — UI/UX Improvements & Enhancements

### Theme & Visual

- [x] Gradient theme (blue hue, aurora orbs, shimmer on cards, sidebar glow)
- [x] Modal positioning fix (gradient theme)
- [x] Pass Rate chart label color matches bar color per theme
- [x] Table header styling — `bg-muted` + `font-semibold` + `border-b-2` for all tables
- [x] Project & Module Overview — column "Project Name" renamed correctly
- [x] Pass Rate column centered

### Test Cases Import

- [x] Upsert logic (update if key exists, create if not)
- [x] Per-row try/catch error handling
- [x] Track newly created keys to prevent intra-file duplicates
- [x] Fix filter — accept rows with Key OR Module OR Title (not only Key)
- [x] Skip section headers (rows with only Key/Module but no data from Column C onward)
- [x] Fix nextNum — use max key number across all project cases
- [x] Add `raw: false` for proper text parsing
- [x] Toast shows created/updated/skipped counts

### Test Runs Enhancements

- [x] Status sync — execution status updates linked TestCase status
- [x] Edit Name dialog
- [x] Blocked notes textarea
- [x] Filter cleanup (removed "Aborted" status, "All Projects" → "All")

### Users Page

- [x] Title + Add User button on same row (flex justify-between)
- [x] Role filter (All / Admin / QA / Dev / Viewer) with label
- [x] Result count display
- [x] Search + Role filter aligned with `items-end`
- [x] Create user form with required field indicators (*)
- [x] Change password modal with required field indicators (*)

### Required Field Indicators (*)

- [x] Projects — Create Project (Name), Add Module (Name)
- [x] Modules — Module Form Modal (Name)
- [x] Test Cases — Test Case Form Modal (Title)
- [x] Test Runs — Create (Name, Test Cases), Edit Name (Name)
- [x] Test Run Execute — Report Defect (Title), Edit Name (Name)
- [x] Defects — Create/Edit (Title)
- [x] Users — Create (Name, Email, Password)
- [x] Change Password — (New Password, Confirm Password)

### Other

- [x] ADMIN badge color changed from purple to indigo
- [x] Result count on all list pages (Test Cases, Test Runs, Defects, Modules, Users)
