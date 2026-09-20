# Polaris Web

Polaris Web is the React frontend for a role-based job platform. Visitors can browse jobs, companies, stories, pricing, and public profiles. Signed-in job seekers can manage applications, interviews, tests, saved jobs, skill assessments, certificates, CV generation, and their public profile. Company administrators manage job postings, applicants, interviews, pre-selection tests, analytics, and company profiles.

## Production

- Frontend: [https://www.polarisjobs.my.id](https://www.polarisjobs.my.id)
- Canonical domain: `www.polarisjobs.my.id`
- API: [https://job-board-backend-sage.vercel.app](https://job-board-backend-sage.vercel.app)
- Hosting: Vercel

The apex domain `https://polarisjobs.my.id` redirects to the canonical `www` domain. The SPA rewrite in `vercel.json` sends direct visits such as `/jobs` and `/companies/1` to `index.html`, allowing React Router to render the route.

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

For production, also add:

```text
https://polarisjobs.my.id
https://www.polarisjobs.my.id
```

No redirect URI is required because Polaris uses the Google Identity Services JavaScript callback. Google accounts are currently registered as job seekers. Company administrators register with the company registration form.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run the Vitest unit suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |

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
- Salary conversion on job detail, with searchable currency picker and live rates
- Application CV upload and immutable education snapshots
- Public applicant and company profiles with quality scores and badges
- Job posting, applicant, interview, and pre-selection-test administration
- Skill assessments, earned badges, results, and verifiable PDF certificates
- Polaris Plus/Pro subscription purchase flows
- Company reviews and data-backed Stories content
- Responsive skeleton, modal, toast, empty, and loading states

## Testing

Vitest covers the pure helpers in `src/lib`, where logic can be asserted without rendering. `src/lib/share.test.ts` pins the social-sharing contract: the four supported platforms, which of them can carry the custom message in the URL, and the encoding that keeps `&` and `#` from truncating a share.

There is no component or end-to-end suite yet, so anything that only exists inside a React component is unverified.

## Shared UI Conventions

- **Dropdowns.** Every menu surface (`country-combobox-menu`, `education-combobox-menu`, `homepage-job-suggestions`, `homepage-location-suggestions`) draws from one set of `--menu-*` custom properties defined on `:root` in `index.css`. Change the tokens, not the individual menus.
- **Password fields.** Use `PasswordField` rather than `<input type="password">`. It carries the show/hide control every password box is expected to have.
- **Toggles.** A switch is a `<button role="switch">` and never shows a request spinner; `request-button-feedback.ts` skips that role, since swapping a knob for a "Loading…" label reads as a broken control.
- **Grid items.** `.reveal` wrappers set `min-width: 0`. Grid and flex items default to `min-width: auto`, which refuses to shrink below their content and pushes pages wider than the viewport.
- **Brand mark.** `public/favicon.svg` is a north-star compass rose: vertical rays longer than horizontal, drawn over a ring it breaks through. The wordmark in the header still uses the `✦` text glyph.

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

The frontend does not call third-party location or exchange-rate providers directly. It uses the API's `/regions` and `/exchange-rates` endpoints so provider CORS, caching, fallback, and rate limiting remain server-side.

If a location or currency lookup returns nothing in local development, check the API before the component: `http://localhost:5173` is only on the API's CORS allow-list when the API is not running with `NODE_ENV=production`.

### Salary converter

`SalaryConverter` on the job-detail page fetches `/exchange-rates?base=<job currency>` once per job and converts locally, so switching currency is instant. It reuses `CurrencySelect` for type-to-search over every currency `Intl` reports, and remembers the last target under the `polaris-salary-currency` local-storage key. Converted amounts are rendered with the currency code rather than a narrow symbol, because SGD, USD and AUD all render as `$`. It renders only when the posting states a salary.

## Production Deployment

Create the Vercel project with **Root Directory** set to `web` and configure these Production environment variables:

```env
VITE_API_URL=https://job-board-backend-sage.vercel.app
VITE_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id.apps.googleusercontent.com
```

`VITE_*` values are embedded at build time. Redeploy the frontend after changing either value.

Vercel uses:

```bash
npm install
npm run build
```

The output directory is `dist`. The committed `vercel.json` provides the SPA fallback, so refreshing a nested route must return the application instead of Vercel's 404 page.

Production checklist:

1. Both `polarisjobs.my.id` and `www.polarisjobs.my.id` are attached to the frontend Vercel project.
2. The apex domain redirects to `www`.
3. `VITE_API_URL` points to the production API and contains no trailing slash.
4. The Google OAuth Web Client includes both production origins.
5. The backend CORS `FRONTEND_URL` is `https://www.polarisjobs.my.id`.
6. Build and inspect `/`, `/jobs`, `/companies`, `/stories`, `/pricing`, and a direct nested-route refresh.

Preserve the `Cross-Origin-Opener-Policy: same-origin-allow-popups` header when Google popups are used.
