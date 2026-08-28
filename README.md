# Polaris Web

Polaris Web is the frontend for Polaris, a job board that helps job seekers discover relevant work and helps companies manage their hiring journey. The product combines an editorial landing page, location-aware job discovery, authenticated dashboards, profile management, and company-facing workflows.

## Technology

- React 19 and TypeScript
- Vite for development and production builds
- React Router DOM for client-side routing
- Plain CSS in `src/index.css` with no Tailwind dependency

## Getting Started

```bash
cp .env.example .env
npm install
npm run dev
```

The development server runs on `http://localhost:5173` by default.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL for the Polaris API, for example `http://localhost:8000`. |

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Product Areas

- **Landing page** — communicates Polaris services and shows the five newest published jobs.
- **Job discovery** — requests device coordinates when permitted, finds jobs within a 50 km radius, and falls back to newest jobs or a manually selected city.
- **Authentication** — registration, sign-in, email verification, password reset, protected routes, and logout.
- **Profile** — personal/company profile editing, password changes, verification prompts, and image avatar upload.
- **Dashboard** — applicant, company-admin, and developer workspace panels.
- **Public pages** — jobs, companies, stories, job detail, and about pages.

## Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public / authenticated | Landing page for visitors, homepage for signed-in users. |
| `/jobs` | Public | Browse jobs. |
| `/jobs/:slug` | Public | Job detail and application entry point. |
| `/companies` | Public | Browse companies. |
| `/stories` | Public | Polaris stories. |
| `/about` | Public | About Polaris. |
| `/profile` | Authenticated | User or company profile settings. |
| `/dashboard` | Authenticated | Role-based workspace dashboard. |

## Project Structure

```text
src/
├── components/       Reusable UI grouped by page or feature
├── hooks/            Shared React hooks
├── lib/              API and authentication client helpers
├── pages/            Route-level page composition
├── routes/           React Router route declarations
└── index.css         Global visual system and responsive styles
```

## Backend Integration

The frontend communicates with Polaris API through `src/lib/auth.ts`. Authentication is stored locally as an access token and a safe user profile snapshot. The backend contract and automatically generated database ERD are documented in [`../api/README.md`](../api/README.md).
