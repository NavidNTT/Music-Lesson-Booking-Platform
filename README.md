# 🎵 Cadenza — Music Lesson Booking Platform

A full-stack marketplace for private music lessons. Students discover teachers, book time slots, and pay from a built-in wallet; teachers manage their profiles, availability, and bookings; admins curate the instrument catalog.

**Backend:** Laravel 13 REST API (Sanctum token auth) · **Frontend:** React 18 + TypeScript SPA (Vite)

![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/tests-65_passing-brightgreen)

---

## ✨ Features

### 👨‍🎓 Students
- Browse a public teacher directory with instrument filters, name search, and ratings
- View teacher profiles, instruments, skill levels, and upcoming available slots
- Book lessons — payment is charged from the wallet only after the teacher confirms
- Manage bookings (pending → confirmed → completed lifecycle, 24-hour cancellation policy with automatic refunds)
- Top up a wallet and review the full transaction history (deposits, payments, refunds)
- Rate and review completed lessons

### 👩‍🏫 Teachers
- Create and manage a teaching profile (bio, price per session, active status)
- Select instruments and skill levels taught (beginner / intermediate / advanced)
- Publish availability time slots with capacity, overlap protection, and enable/disable toggles
- Confirm, complete, or cancel student bookings (cancelling a confirmed booking auto-refunds the student)
- Automatic average-rating recalculation from student reviews

### 🛡️ Admins
- Full CRUD over the instrument catalog with active/inactive states

### 🔐 Platform
- Token-based authentication (Laravel Sanctum) with role-based access control (`admin` / `teacher` / `student`)
- Booking state machine with guarded transitions — no illegal status jumps
- All money and booking mutations run inside DB transactions with pessimistic row locks
- Rate limiting on auth endpoints; admin self-registration is blocked
- Consistent JSON API envelope with typed, Zod-validated consumption on the frontend

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.3, Laravel 13, Sanctum 4 |
| Database | MySQL 8 (SQLite in-memory for tests) |
| Frontend | React 18, TypeScript 5, Vite 6 |
| Routing / State | React Router, TanStack Query 5, Zustand |
| Forms / Validation | React Hook Form + Zod (runtime API contract validation) |
| Styling | Tailwind CSS, custom accessible component library |
| Testing | PHPUnit 12 (50 tests) · Vitest (15 tests) |
| Tooling | Larastan, Laravel Pint, ESLint, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.3+, Composer
- Node.js 18+, npm
- MySQL 8 (or use Docker)

### 1. Backend

```bash
git clone https://github.com/YOUR_USERNAME/music-lesson-booking-api.git
cd music-lesson-booking-api

composer install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=music_api
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
```

Migrate and seed demo data:

```bash
php artisan migrate --seed
php artisan serve        # → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8000
npm run dev              # → http://localhost:5173
```

### 3. Docker (optional)

```bash
docker-compose up -d     # nginx + php-fpm + MySQL + Redis on :8000
```

---

## 🔑 Demo Accounts

The seeder creates a fully populated demo environment (idempotent — safe to re-run, disabled in production). All passwords are `password`.

| Role | Email | Comes with |
|---|---|---|
| Admin | `admin@demo.test` | Instrument catalog access |
| Teacher | `teacher@demo.test` | Profile, instruments, slots, bookings, a 5★ review |
| Teacher | `teacher2@demo.test` | Profile and open slots (empty-state demo) |
| Student | `student@demo.test` | Funded wallet, bookings in every state |
| Student | `student2@demo.test` | Funded wallet, no bookings yet |

```bash
php artisan db:seed      # or: php artisan migrate:fresh --seed
```

---

## 📡 API Overview

Base URL: `/api/v1` · Auth: `Authorization: Bearer <token>`

<details>
<summary><strong>Public</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register (student or teacher only) |
| POST | `/auth/login` | Login, returns Bearer token |
| GET | `/instruments` | List instruments |
| GET | `/teachers` | Teacher directory (`?instrument=`, `?search=`, paginated) |
| GET | `/teachers/{id}` | Teacher profile detail |
| GET | `/teachers/{id}/slots` | Upcoming available slots |
| POST | `/forgot-password` · `/reset-password` | Password reset flow |

</details>

<details>
<summary><strong>Authenticated</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET / PATCH | `/me` | Current user / update profile |
| POST | `/auth/logout` | Revoke current token |
| GET | `/wallet` | Wallet + transactions |
| POST | `/wallet/deposit` | Top up (demo mode — no gateway yet) |
| POST | `/reviews` | Review a completed booking |

</details>

<details>
<summary><strong>Teacher</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET / PATCH | `/teacher/profile` | View / create-or-update profile |
| POST | `/teacher/profile/instruments` | Sync instruments + levels |
| GET / POST | `/teacher/slots` | List / create slots |
| GET / PATCH / DELETE | `/teacher/slots/{id}` | Manage a slot |
| GET | `/teacher/bookings` | List bookings |
| POST | `/teacher/bookings/{id}/confirm` | Confirm (charges student wallet) |
| POST | `/teacher/bookings/{id}/complete` | Mark completed |
| POST | `/teacher/bookings/{id}/cancel` | Cancel (auto-refund if confirmed) |

</details>

<details>
<summary><strong>Student</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/student/bookings` | List / create bookings |
| POST | `/student/bookings/{id}/cancel` | Cancel (≥ 24h before lesson) |

</details>

<details>
<summary><strong>Admin</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/admin/instruments` | List / create |
| GET / PATCH / DELETE | `/admin/instruments/{id}` | Manage an instrument |

</details>

---

## 🧪 Testing

```bash
# Backend — 50 tests, 141 assertions (auth, authorization, bookings,
# wallet, reviews, slots, public discovery)
php artisan test

# Static analysis & code style
vendor/bin/phpstan analyse
vendor/bin/pint

# Frontend — 15 tests (API error normalization, pagination contract)
cd frontend
npm run typecheck
npm test
npm run build
```

---

## 📁 Project Structure

```
├── app/
│   ├── Domain/               # Bounded contexts: Booking, Teacher, Student,
│   │                         #   Wallet, Review, Instrument, User
│   │                         #   (models + services with transactional logic)
│   ├── Enums/                # UserRole, BookingStatus (state machine)
│   └── Http/                 # Controllers, FormRequests, Resources, Middleware
├── database/
│   ├── migrations/  factories/  seeders/   # incl. idempotent DemoSeeder
├── routes/api_v1.php         # Versioned API routes
├── tests/Feature/            # 50 feature tests
└── frontend/
    └── src/
        ├── app/              # Providers, router, layouts, guards
        ├── features/         # auth, teachers, bookings, slots, wallet,
        │                     #   reviews, admin — each: api + zod schemas
        │                     #   + query hooks + pages
        └── shared/           # API client, error normalizer, UI kit, utils
```

**Key architecture decisions**
- **Domain-modular monolith** — each context owns its models and services; controllers stay thin
- **Booking state machine** — `pending → confirmed → completed`, with cancellation from pending/confirmed only
- **Money safety** — wallet charge on *confirmation* (not booking), refund on cancellation, all under `lockForUpdate` transactions
- **Contract-safe frontend** — every API response is validated with Zod at runtime; one normalized error model handles both Laravel error shapes

---

## 🗺️ Roadmap

- [ ] Real payment gateway integration (wallet deposits are currently demo-mode)
- [ ] Refresh tokens / longer session strategy
- [ ] Signed email verification wired into the frontend
- [ ] Notifications (booking confirmations, reminders)
- [ ] OpenAPI spec + generated typed client
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] i18n (Persian/RTL support)

---

## 📄 License

MIT

## 👤 Author

Developed by **Navid Khazaie**
