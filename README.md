# Music Lesson Booking API (Laravel)

## Features

- Roles: Admin / Teacher / Student
- Auth: Laravel Sanctum
- Teacher search, availability slots, bookings
- Wallet + Ledger (mock payment)
- Reviews + rating aggregation
- Queue-based reminders (mock notification)

## Tech Stack

Laravel 11/12, MySQL/PostgreSQL, Redis (queue), Docker, OpenAPI/Swagger, PHPUnit

## Architecture

- Service Layer (BookingService, WalletService)
- Policies for authorization
- FormRequest validation
- API Resources
- DB transactions + row locking for concurrency

## Setup (Docker)

1. cp .env.example .env
2. docker compose up -d
3. docker compose exec app php artisan key:generate
4. docker compose exec app php artisan migrate --seed
5. open http://localhost:8000

## API Docs

- Swagger UI: /api/docs
- Postman collection: /docs/postman.json

## Testing

docker compose exec app php artisan test

## Seeded Accounts

- Admin: admin@example.com / password
- Teacher: teacher1@example.com / password
- Student: student1@example.com / password
