# Cadenza — Music Lesson Booking Frontend

Beautiful, modern frontend for the Music Lesson Booking API.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **React Router v7** — routing
- **TanStack Query v5** — server state
- **Axios** — HTTP client
- **Zod** — runtime validation
- **React Hook Form** — forms
- **Tailwind CSS** — styling
- **Zustand** — auth state

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   Copy `.env.example` to `.env.local` and set your backend URL:

   ```bash
   VITE_API_URL=http://localhost:8000
   ```

3. **Start dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

## Available Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — check code quality
- `npm run type-check` — TypeScript validation

## Project Structure

```
src/
├── app/              # Bootstrap, providers, router
├── features/         # Feature modules (auth, bookings, etc.)
├── shared/           # Shared code (API, UI, utils)
└── test/             # Test utilities
```

## Backend Requirements

The frontend expects the backend API at `/api/v1` with:

- Bearer token authentication
- Student/teacher/admin role-based access
- Public teacher discovery endpoints
- Wallet and booking APIs

See the main project README for backend setup.

## Deployment

Build for production:

```bash
npm run build
```

The `dist/` folder contains static files that can be served by any static host (nginx, Vercel, Netlify, S3+CloudFront, etc.).

Ensure `VITE_API_URL` points to your production API.

## Features

### Public
- Landing page
- Instruments catalog
- Teacher directory with search/filter
- Teacher profiles with available slots

### Students
- Register and login
- Browse and book lessons
- Manage bookings (view, cancel)
- Wallet management (deposit, transactions)
- Leave reviews for completed lessons

### Teachers
- Create and manage teaching profile
- Set instruments and skill levels
- Create and manage time slots
- Confirm, complete, and cancel bookings
- View ratings and reviews

### Admins
- Manage instruments catalog
- Create, edit, delete instruments
- Toggle active/inactive status

## Design

Warm, artistic design inspired by music education:

- Deep navy and charcoal backgrounds
- Gold accents (#e3ab33)
- Cream surfaces (#F7F4EF)
- Editorial serif headings (Fraunces)
- Clean sans-serif body (Inter)
- Smooth spacing and polished states
- Fully responsive

## API Integration

All API calls flow through:

- `shared/api/client.ts` — axios instance with auth interceptors
- `shared/api/errors.ts` — normalized error handling
- Feature-specific API modules with Zod validation
- TanStack Query for caching and invalidation

Token stored in `localStorage` (Bearer-token SPA pattern).

## License

Part of the Music Lesson Booking platform.
