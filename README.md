# Runner City Housing Management System — Backend

## Overview

Runner City is a housing management system designed to bring transparency and automation to a residential housing society. The system manages monthly fee collection, expense tracking, payroll for staff (mosque imam, khadem, security guards), and provides financial transparency to all members.

## Tech Stack

- **Runtime:** Node.js with Express.js (v5)
- **ORM:** Prisma
- **Database:** MySQL on AWS RDS (ap-southeast-2, Sydney)
- **Authentication:** JWT + bcryptjs
- **Hosting (planned):** AWS EC2 / App Runner + RDS

## Database

- **Engine:** MySQL 8.0
- **Host:** AWS RDS (`runner-city.cl0ac44aah3j.ap-southeast-2.rds.amazonaws.com`)
- **Instance:** db.t4g.micro
- **Database name:** `runner_city`

## Core Features

### 1. User Registration & Ownership (Finalized Design)

#### Signup Approach: Open Signup + Admin Approval

- Anyone can register, but their account stays `pending` until an admin approves
- No outsider can access any data without admin approval
- This replaces the old approach (which required exact name match with pre-loaded plot data)

#### Multi-Step Signup Form (5 Steps)

Designed for non-tech-savvy users (40-60 year old plot owners). Each step shows only 1-2 fields to avoid overwhelming the user.

| Step | Fields | Logic |
|------|--------|-------|
| 1. Plot Number | Plot number | Backend checks if plot exists and if it already has an owner |
| 2. Relationship (conditional) | Relationship dropdown | Only shown if the plot already has a registered owner. Options: Son, Daughter, Wife, Husband, Brother, Tenant, Caretaker, Other |
| 3. Ownership Type | Full owner / Flat owner (big buttons) | If flat owner → also asks "How many flats?" |
| 4. Personal Info | Name, Phone, Email | Basic identity |
| 5. Password | Password, Confirm password | Account security |

- Progress bar shown at the top
- Frontend collects all data step-by-step, submits as a single `POST /auth/signup` at the end
- After submission: "Your request has been submitted. Admin will approve shortly."

#### Ownership Types (Simplified)

| Type | Description |
|------|-------------|
| `full_owner` | Owns the entire plot and all structures on it |
| `flat_owner` | Owns one or more flats in a multi-unit building (replaces co-owner concept) |
| `tenant` | Renting a flat or plot, not an owner |
| `caretaker` | Authorized by an owner to manage their account |

- Co-owner was merged into flat_owner to keep it simple
- If two people own the same flat, they're both flat_owners for that flat

#### Relationship Types (Predefined Dropdown)

When a plot already has a registered owner, new signups must declare their relationship:

- Son
- Daughter
- Wife
- Husband
- Brother
- Tenant
- Caretaker
- Other (with optional text explanation)

#### Plot Structure

- **Single-unit plot:** One full_owner for the entire plot
- **Multi-unit plot:** Multiple flat_owners, each owning specific flats
- If a user is a flat_owner, the system asks how many flats they own

#### Ownership Transfer

- Admin can transfer ownership (death, sale, departure)
- Full history preserved — no data is ever deleted
- Previous owner's status updated accordingly

#### User Roles

| Role | Access |
|------|--------|
| `admin` | Full system access, approves registrations, manages everything |
| `full_owner` | Full access to their plot, fee payments, view financials |
| `flat_owner` | Access scoped to their flat(s), fee payments, view financials |
| `tenant` | Read access to plot/flat info, can pay fees |
| `caretaker` | Same access as the owner they represent |

#### User Status Lifecycle

`pending` → `approved` → (active use)
`pending` → `rejected`
`approved` → `suspended` (temporary ban)
`approved` → `inactive` (left the society)
`approved` → `deceased` (triggers ownership transfer prompt)

#### Dispute Handling

- If multiple people claim the same plot/flat, admin can flag it as "disputed"
- No ownership granted until resolved
- Resolution notes stored for audit

### 2. Monthly Fee Collection (Priority #1)

- Land owners: ~1500 BDT/month (fixed)
- Flat owners: variable amount
- Track who paid, who didn't, how much collected per month
- Transparent to all members

### 3. Expense Management

- Staff salaries: Mosque imam, khadem, security guard
- Maintenance: Road lights, repairs, etc.
- All expenses require admin approval
- Linked to contribution funds when applicable

### 4. Financial Transparency

- Monthly collection total visible to all members
- Monthly expenditure breakdown
- Current fund balance
- All members can view but not modify

### 5. Payment Automation (Future)

- bKash integration for online payments
- Bank transfer support
- Auto-receipt generation on payment confirmation
- Requires bKash merchant account (application in progress)

## API Routes

```
POST   /auth/signup          - Multi-step signup (single submission)
POST   /auth/login           - Login (JWT token)
GET    /users                - List users
GET    /users/:id            - Get user details
PATCH  /users/:id/approve    - Admin approves user
PATCH  /users/:id/reject     - Admin rejects user
GET    /plots                - List plots
GET    /plots/:plot_no       - Get plot details
GET    /plots/:plot_no/has-owner - Check if plot has registered owner (for signup form)
```

## Project Structure

```
Backend/
├── index.js                 # Express app entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.js              # Seed data
│   └── migrations/          # Migration history
├── src/
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth middleware (JWT verification)
│   ├── routes/              # Route definitions
│   └── services/            # Business logic
├── .env                     # Environment variables
└── package.json
```

## Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database (optional)
node prisma/seed.js

# Start development server
npm run dev
```

## Environment Variables

```
PORT=5000
DATABASE_URL="mysql://admin:PASSWORD@runner-city.cl0ac44aah3j.ap-southeast-2.rds.amazonaws.com:3306/runner_city"
JWT_SECRET="your-secure-random-secret"
```

## Timeline

**Target launch: 15 days**

| Phase | Days | Focus |
|-------|------|-------|
| 1 | 1-5 | Fee collection CRUD, monthly dashboard, user approval flow |
| 2 | 6-10 | Expense recording, payroll payments, transparency reports |
| 3 | 11-13 | bKash integration (or manual payment fallback), security hardening |
| 4 | 14-15 | Deploy to AWS, testing, bug fixes |

## Security Decisions

- No public signup without admin approval
- JWT tokens with 1-day expiry
- Passwords hashed with bcryptjs (10 salt rounds)
- RDS in private subnet (production) with security group restrictions
- HTTPS enforced via ALB in production
- Role-based access control at middleware level
- Relationship declaration adds social verification layer
