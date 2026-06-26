# Music Lesson Booking API

A Laravel RESTful API for a music lesson booking platform where students can book private music lessons with teachers.

This project is an MVP backend system built with Laravel. It includes authentication, role-based access control, teacher profiles, instruments, time slots, bookings, wallet deposits, reviews, ratings, factories, and feature tests for the core application flows.

---

## Features

- User authentication with Laravel Sanctum
- Role-based access control
    - Admin
    - Teacher
    - Student
- Public instrument listing
- Admin instrument management
- Teacher profile management
- Teacher instrument synchronization
- Teacher time slot management
- Student booking flow
- Teacher booking confirmation
- Wallet and deposit system
- Review and rating system
- Automatic teacher rating recalculation
- Database factories for test data generation
- Feature tests for main MVP flows

---

## Tech Stack

- PHP 8.x
- Laravel 11 / 12
- Laravel Sanctum
- MySQL
- Eloquent ORM
- PHPUnit / Laravel Feature Tests
- RESTful API architecture

---

## Main Modules

### Authentication

Users can register, login, logout, and retrieve their authenticated profile using Laravel Sanctum tokens.

### Roles

The application supports three main roles:

- `admin`
- `teacher`
- `student`

Each role has access to specific API endpoints based on its permissions.

### Instruments

Instruments represent the musical instruments available in the platform.

- Public users can list instruments.
- Admin users can create, update, and delete instruments.

### Teacher Profiles

Teachers can manage their teaching profile, including personal teaching information and the instruments they teach.

### Teacher Time Slots

Teachers can create available lesson time slots.  
Each time slot can track capacity, booked count, and availability status.

### Bookings

Students can book available teacher time slots.  
Teachers can confirm pending bookings assigned to them.

### Wallet

Users have wallets that can store balance.  
The wallet module supports deposit-related flows and is designed to support payment features.

### Reviews and Ratings

Students can review completed bookings.  
Each booking can only receive one review.  
Teacher average rating and rating count are recalculated automatically after reviews are submitted.

---

## Project Structure

```text
app/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Models/
└── Services/

database/
├── factories/
├── migrations/
└── seeders/

routes/
└── api_V1.php

tests/
├── Feature/
└── Unit/

docs/
├── api.md
└── testing.md
Installation
Clone the repository:

bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
Install dependencies:

bash
composer install
Copy the environment file:

bash
cp .env.example .env
Generate the application key:

bash
php artisan key:generate
Configure your database in .env:

env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=music_booking
DB_USERNAME=root
DB_PASSWORD=
Run migrations:

bash
php artisan migrate
Optionally run seeders if available:

bash
php artisan db:seed
Start the local development server:

bash
php artisan serve
The API will be available at:

text
http://127.0.0.1:8000/api/v1
Authentication
This project uses Laravel Sanctum for API authentication.

Protected endpoints require a Bearer token:

http
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/json
Content-Type: application/json
Users receive an API token after successful registration or login.

API Overview
Base URL:

text
/api/v1
Public Endpoints
http
POST /auth/register
POST /auth/login
GET  /instruments
Authenticated Endpoints
http
GET  /me
PATCH /me
POST /auth/logout
GET  /wallet
POST /wallet/deposit
POST /reviews
Admin Endpoints
http
POST   /admin/instruments
GET    /admin/instruments/{instrument}
PATCH  /admin/instruments/{instrument}
DELETE /admin/instruments/{instrument}
Teacher Endpoints
http
GET    /teacher/profile
PATCH  /teacher/profile
POST   /teacher/profile/instruments

GET    /teacher/slots
POST   /teacher/slots
GET    /teacher/slots/{slot}
PATCH  /teacher/slots/{slot}
DELETE /teacher/slots/{slot}

GET    /teacher/bookings
POST   /teacher/bookings/{booking}/confirm
Student Endpoints
http
GET  /student/bookings
POST /student/bookings
Full API documentation is available in:

text
docs/api.md
Testing
Run all tests:

bash
php artisan test
Run a specific test file:

bash
php artisan test tests/Feature/Booking/BookingTest.php
Run tests with detailed output:

bash
php artisan test --verbose
Testing documentation is available in:

text
docs/testing.md
Tested Areas
The project includes feature tests for the main MVP flows:

Authentication
Admin instrument management
Public instrument listing
Teacher profile management
Teacher instrument synchronization
Teacher time slot management
Student booking flow
Teacher booking confirmation
Wallet and deposit flow
Review creation
Teacher rating recalculation
Role-based access control
Example User Flow
A student registers and receives an API token.
A teacher registers and creates a teacher profile.
An admin creates available instruments.
The teacher syncs instruments to their profile.
The teacher creates available time slots.
The student books one of the teacher’s available slots.
The teacher confirms the booking.
The student reviews the completed lesson.
The teacher rating is recalculated automatically.
Environment Example
env
APP_NAME="Music Lesson Booking API"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=music_booking
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database

SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
Project Status
MVP completed.

Implemented modules:

Authentication
Authorization
Instruments
Teacher Profiles
Teacher Time Slots
Bookings
Wallet
Reviews
Ratings
Factories
Feature Tests
API Documentation
Roadmap
Possible future improvements:

Payment gateway integration
Advanced booking cancellation policies
Teacher availability calendar
Admin dashboard
Notification system
Email verification
Password reset flow
API rate limiting
Swagger / OpenAPI documentation
Docker development environment
Author
Developed by navid.khazaie
```
