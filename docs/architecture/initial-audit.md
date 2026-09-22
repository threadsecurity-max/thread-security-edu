# Phase 0: Initial Repository Audit & System Baseline

**Project Name:** Thread Security Education — LMS (TSE LMS)  
**Short Name:** TSE LMS  
**Audit Timestamp:** 2026-08-20  
**Workspace Path:** `e:\threads-edu`

---

## 1. Executive Summary

A comprehensive initial audit was conducted on the project workspace `e:\threads-edu` to establish the baseline state prior to system scaffolding and development.

- **Current Repository State:** Empty repository directory.
- **Existing Assets:** None (clean state, no legacy technical debt or conflicting dependencies).
- **Target System:** Production-grade SSR-first Cybersecurity LMS with Public, Student, and Admin panels, real database connectivity (PostgreSQL + Prisma), RBAC, verified achievement workflows, and practical lab integrations.

---

## 2. Workspace Audit Checklist

| Item | Status | Notes |
| :--- | :--- | :--- |
| `package.json` | ❌ Not Present | To be initialized in Phase 1 |
| Next.js Configuration | ❌ Not Present | Next.js App Router (TypeScript) targeted |
| Styling / Tailwind | ❌ Not Present | Tailwind CSS + `tokens.css` design system targeted |
| Prisma Schema / Database | ❌ Not Present | Schema definition & PostgreSQL migrations targeted in Phase 1 & 2 |
| Environment Configuration | ❌ Not Present | `.env.example` & `.env` required |
| Auth Scaffolding | ❌ Not Present | Auth.js / Server-side session authentication targeted |
| Testing Suites | ❌ Not Present | Vitest & Playwright targeted |

---

## 3. Technology Stack Alignment

- **Framework:** Next.js 15+ App Router (SSR-first architecture, Server Components by default)
- **Language:** TypeScript (strict type checking enabled)
- **Styling:** Tailwind CSS + Vanilla CSS tokens (`/src/styles/tokens.css`) + Controlled Glassmorphism
- **Typography:** Josefin Sans (via Next.js Google Font optimization / `next/font`)
- **Database & ORM:** PostgreSQL + Prisma ORM (soft deletes for academic auditability, strict constraints, transactions)
- **Validation:** Zod schemas for runtime payload and environment validation
- **Authentication & RBAC:** Auth.js (Server-side sessions) with 6-tier RBAC (`STUDENT`, `MENTOR`, `CONTENT_MANAGER`, `ACADEMIC_ADMIN`, `SECURITY_ADMIN`, `SUPER_ADMIN`)
- **State Management:** URL search params for filtering, React state for local component state, Zustand strictly for global UI state
- **Security:** OWASP Top 10 hardening, CSP headers, rate-limiting, audit logging, signed storage URLs

---

## 4. Architectural Risk & Mitigation Strategy

1. **Hydration & Client Boundary Creep:**
   - *Risk:* Overusing `"use client"` leading to heavy bundle sizes and losing SSR performance.
   - *Mitigation:* Strict Server Component hierarchy. Server Services and Repositories isolate Prisma access. Client components are limited strictly to interactive leaves (e.g. video player controls, interactive lab terminals, animated accordions).

2. **Client-Side Authorization & Anti-Spoofing:**
   - *Risk:* Relying on UI conditional renders to guard routes or endpoints, or trusting client-submitted scores/progress.
   - *Mitigation:* Mandatory server-side authorization checks on all Server Actions and Route Handlers. Score/progress calculation executed entirely within database-driven transactions on the server.

3. **Academic Integrity & Certificate Verification:**
   - *Risk:* Unauthorized certificate issuance or forgeable certificate parameters.
   - *Mitigation:* Unique immutable TS-ID (`TSE-YYYY-XXXXXX`), cryptographic verification hash, server-validated eligibility checks prior to issuance, public verification route `/verify-certificate/[id]`.

---

## 5. Next Steps (Phase 1 Strategy)

1. Initialize Next.js 15+ App Router workspace with TypeScript, ESLint, and Tailwind CSS.
2. Setup Josefin Sans typography and Design Token System (`tokens.css`, Tailwind theme extensions).
3. Establish directory structure according to the specified 49-layer architecture (`/src/features/`, `/src/server/`, `/src/components/`, `/src/lib/`, `/src/types/`, `/docs/`).
4. Configure Prisma with initial database schema covering Core Entities (Users, Roles, Courses, Modules, Lessons, Labs, Assessments, Certificates, Audit Logs).
5. Implement baseline health endpoint `/api/health` and verify project build (`npm run build`, `npm run typecheck`).
