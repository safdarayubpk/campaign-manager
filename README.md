# Campaign Manager

A full-stack CRM dashboard prototype built with Next.js 16, demonstrating contacts management, audience segmentation, and campaign workflows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui v4 |
| Database | SQLite via Prisma v7 |
| Validation | Zod |
| Charts | Recharts |

## Features

### Dashboard
- KPI cards (total contacts, active campaigns, avg open rate, new this month)
- Bar charts for contacts by lifecycle stage and campaign performance
- Server component — data fetched directly via Prisma, zero client-side waterfalls

### Contacts
- Data table with server-side search, filtering, sorting, and pagination
- Filter by lifecycle stage, tags, or free-text search
- Sortable column headers (name, email, company, stage, date)
- Full CRUD via modal dialog (add, edit, delete)
- Zod-validated API with input bounds (max page size, column whitelist)

### Segments
- Visual rule builder with AND logic between conditions
- Filter fields: lifecycle stage, tags, company, name, email
- Operators: equals, contains, not equals (field-dependent)
- Live preview of matching contact count (debounced 300ms)
- Saved segments displayed as cards with filter badge summary

### Campaigns
- 3-step wizard: Select Audience → Compose Message → Review & Send
- Save as draft at any step
- Campaign list with status badges (draft/active/completed)
- Send simulation generates realistic open/click stats

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Route group with sidebar layout
│   │   ├── dashboard/page.tsx    # Server component with KPI + charts
│   │   ├── contacts/page.tsx
│   │   ├── segments/page.tsx
│   │   ├── campaigns/page.tsx
│   │   └── campaigns/new/page.tsx
│   └── api/
│       ├── contacts/             # GET (filter/sort/paginate), POST, PUT, DELETE
│       ├── segments/             # GET, POST + /count for live preview
│       └── campaigns/            # GET, POST + /[id]/send for simulation
├── components/
│   ├── layout/                   # Sidebar, Header
│   ├── dashboard/                # KPI cards, charts (lazy-loaded, SSR-safe)
│   ├── contacts/                 # Data table, filters, dialog
│   ├── segments/                 # Rule builder, segment list
│   └── campaigns/                # Multi-step form wizard
└── lib/
    ├── prisma.ts                 # Prisma client singleton with adapter
    ├── types.ts                  # Shared TypeScript interfaces + enums
    └── segment-filters.ts        # Shared filter → Prisma where clause builder
```

## Architecture Decisions

**Server vs Client Components** — The dashboard page is a server component that fetches data directly via Prisma, eliminating a network hop. Interactive pages (contacts, segments, campaigns) are client components that call REST APIs.

**`(app)` Route Group** — All pages share a sidebar layout without affecting URL paths. The route group pattern keeps `/dashboard` clean instead of `/app/dashboard`.

**Prisma v7 with Adapter** — Uses `@prisma/adapter-better-sqlite3` instead of the legacy engine. The `prisma-client` generator outputs to `src/generated/prisma` and is gitignored.

**Shared Filter Logic** — `segment-filters.ts` exports a `buildWhereClause` function used by both the segments API and the count preview endpoint, keeping filter-to-Prisma translation DRY.

**Recharts SSR Safety** — Charts are loaded via `next/dynamic` with `ssr: false` to avoid hydration mismatches from window-dependent sizing.

**Input Validation** — All API routes validate with Zod. The contacts GET route whitelists sortable columns, caps page size at 100, and validates pagination bounds.

## Data Model

```
Contact ─── id, name, email, phone?, company?, lifecycleStage, tags (JSON), timestamps
Segment ─── id, name, description?, filters (JSON), contactCount, timestamps
Campaign ── id, name, type, status, subject?, body?, segmentId? → Segment, stats, timestamps
```

- **Contact.tags** and **Segment.filters** are stored as JSON strings in SQLite
- **Campaign → Segment** is a foreign key relation (optional)
- Seed data: 55 contacts, 4 segments, 5 campaigns

## Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client + push schema to SQLite
npx prisma generate
npx prisma db push

# Seed the database (55 contacts, 4 segments, 5 campaigns)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset and re-seed database |
| `npm run db:studio` | Open Prisma Studio GUI |

## Design System

Custom theme based on a data-dense dashboard style:

- **Primary**: Blue (#2563EB) — buttons, active states, focus rings
- **Background**: Blue-tinted (#F8FAFC) with white cards
- **Typography**: Fira Code (headings) + Fira Sans (body)
- **Charts**: Blue (#2563EB), Green (#10B981), Orange (#F97316)
