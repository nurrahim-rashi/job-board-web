# Polaris Web

Polaris Web is the React frontend for a role-based job platform. Visitors can browse jobs, companies, stories, pricing, and public profiles. Signed-in job seekers can manage applications, interviews, tests, saved jobs, skill assessments, certificates, CV generation, and their public profile. Company administrators manage job postings, applicants, interviews, pre-selection tests, analytics, and company profiles.

## Stack

- React 19 and TypeScript
- Vite 7
- React Router DOM
- TanStack Query
- Zustand with persisted authentication state
- Axios and React Hot Toast
- Plain CSS in `src/index.css`

## Requirements

- Node.js 20 or newer
- npm
- A running Polaris API (the local default is `http://localhost:8000`)

## Local Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Vite serves the application at `http://localhost:5173` by default.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Polaris API base URL, normally `http://localhost:8000`. |
| `VITE_GOOGLE_CLIENT_ID` | For Google Sign-In | OAuth 2.0 Web Client ID from Google Cloud. It must match `GOOGLE_CLIENT_ID` in the API. |

Restart Vite after changing an environment variable.

### Google Sign-In

Create an OAuth client with application type **Web application** and add these Authorized JavaScript origins for local development:

```text
http://localhost
http://localhost:5173
```

No redirect URI is required because Polaris uses the Google Identity Services JavaScript callback. Google accounts are currently registered as job seekers. Company administrators register with the company registration form.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |

## Main Routes

### Public

| Route | Description |
| --- | --- |
| `/` | Landing page when signed out; personalized home when signed in. |
| `/jobs` and `/jobs/:slug` | Search jobs and view job details. |
| `/companies` and `/companies/:companyId` | Browse companies and public company profiles. |
| `/profile/:userId` | Public applicant or company-admin profile. |
| `/stories` | Company quality, reviews, and platform outcomes. |
| `/pricing` | Free, Polaris Plus, and Polaris Pro plans. |
| `/verify-certificate/:certificateCode` | Verify an assessment certificate. |
| `/about` | About Polaris. |

### Job seeker

- `/dashboard` and `/dashboard/applications`
- `/dashboard/interviews`, `/dashboard/tests`, and `/dashboard/closed-jobs`
- `/dashboard/saved-jobs`
- `/dashboard/assessments` and assessment result routes
- `/profile`, `/profile/view`, and `/profile/cv-generator`
- `/jobs/:slug/pre-selection-test`

### Company administrator

- `/admin`
- `/admin/jobs/new`, `/admin/jobs/:slug`, and `/admin/jobs/:slug/edit`
- `/admin/jobs/:slug/test`
- `/admin/applicants`, `/admin/interviews`, `/admin/tests`, and `/admin/analytics`
- `/company/profile/edit`

### Developer

- `/dashboard/developer/analytics`
- `/dashboard/developer/assessments`
- `/dashboard/developer/subscriptions`

Protected routes remember the original URL and continue that flow after authentication.

## Current Product Areas

- Email/password and Google authentication, verification, password reset, and role guards
- Worldwide country/state/city search plus device-location sorting
- Job search, pagination, sharing, saving, and application tracking
- Application CV upload and immutable education snapshots
- Public applicant and company profiles with quality scores and badges
- Job posting, applicant, interview, and pre-selection-test administration
- Skill assessments, earned badges, results, and verifiable PDF certificates
- Polaris Plus/Pro subscription purchase flows
- Company reviews and data-backed Stories content
- Responsive skeleton, modal, toast, empty, and loading states

## Project Structure

```text
src/
├── components/   Feature and shared UI components
├── constants/    Shared option sets and labels
├── hooks/        React and API hooks
├── lib/          Axios, formatting, status, location, and UI helpers
├── pages/        Route-level pages
├── routes/       Route declarations and access guards
├── services/     API service modules
├── stores/       Persisted Zustand state
├── types/        Shared frontend contracts
└── index.css     Global visual system and responsive styles
```

## Authentication and API Behavior

The Axios client in `src/lib/axios.ts` attaches the persisted JWT as a Bearer token. API errors are normalized into user-facing errors, returned names are normalized for display, and mutation buttons receive a loading state. Authentication is stored under the `polaris-auth` local-storage key.

The frontend does not call third-party location providers directly. It uses the API's `/regions` endpoints so provider CORS, caching, fallback, and rate limiting remain server-side.

## Production Notes

- Configure the host to serve `index.html` for unknown client-side routes.
- Set `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` at build time.
- Add the production frontend origin to Google OAuth Authorized JavaScript origins.
- Preserve the `Cross-Origin-Opener-Policy: same-origin-allow-popups` header when Google popups are used.
