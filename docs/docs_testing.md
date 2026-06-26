# Testing Guide

This project includes feature tests for the main MVP flows of the Music Lesson Booking API.

Tests cover authentication, authorization, instruments, teacher profiles, bookings, wallet deposits, reviews, and rating recalculation.

---

## Running Tests

Run all tests:

```bash
php artisan test
```

Run tests with verbose output:

```bash
php artisan test --verbose
```

Run a specific test file:

```bash
php artisan test tests/Feature/Booking/BookingTest.php
```

Run a specific test method:

```bash
php artisan test --filter="student can create booking"
```

---

## Tested Areas

### Authentication

Covers:

- User registration
- User login
- Authenticated user profile
- User logout
- Token-based API authentication

---

### Admin Instruments

Covers:

- Admin can create instruments
- Admin can update instruments
- Admin can delete instruments
- Non-admin users cannot manage instruments
- Public users can list instruments

---

### Teacher Profile

Covers:

- Teacher can view profile
- Teacher can update profile
- Teacher can sync instruments
- Student users cannot access teacher-only routes
- Role-based access control for teacher endpoints

---

### Teacher Time Slots

Covers:

- Teacher can create time slots
- Teacher can list own time slots
- Teacher can update own time slots
- Teacher can delete own time slots
- Time slot capacity and availability behavior

---

### Bookings

Covers:

- Student can create a booking
- Student can list own bookings
- Booking conflicts are rejected
- Teacher can list related bookings
- Teacher can confirm pending bookings
- Other teachers cannot confirm unrelated bookings
- Role-based access control for booking endpoints

---

### Wallet

Covers:

- Wallet exists for users
- Authenticated user can view wallet
- Deposit flow works
- Wallet balance is updated correctly

---

### Reviews

Covers:

- Student can review a completed booking
- Student cannot review a non-completed booking
- Student cannot review the same booking twice
- Review rating must be valid
- Teacher rating average is recalculated
- Teacher rating count is recalculated

---

## Testing Database

Recommended `.env.testing` configuration using SQLite in-memory database:

```env
APP_ENV=testing
CACHE_STORE=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync

DB_CONNECTION=sqlite
DB_DATABASE=:memory:
```

Alternatively, use a dedicated MySQL testing database:

```env
APP_ENV=testing
CACHE_STORE=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=music_booking_testing
DB_USERNAME=root
DB_PASSWORD=
```

---

## Useful Test Commands

Clear cached configuration:

```bash
php artisan config:clear
```

Clear cached routes:

```bash
php artisan route:clear
```

Clear cached application data:

```bash
php artisan optimize:clear
```

Run fresh migrations for the testing environment:

```bash
php artisan migrate:fresh --env=testing
```

Run tests after clearing caches:

```bash
php artisan optimize:clear
php artisan test
```

---

## Test Data

The project uses model factories to generate test data.

Common factories include:

- `UserFactory`
- `InstrumentFactory`
- `TeacherProfileFactory`
- `StudentProfileFactory`
- `TeacherTimeSlotFactory`
- `WalletFactory`
- `BookingFactory`
- `ReviewFactory`

Factories help keep tests isolated, repeatable, and easy to maintain.

---

## Best Practices

When adding new features, add or update feature tests for the related API flow.

Recommended testing approach:

1. Test successful behavior.
2. Test validation errors.
3. Test authorization rules.
4. Test ownership rules.
5. Test important database changes.

Example:

```bash
php artisan test tests/Feature/Review/ReviewTest.php
```

---

## Common Issues

### Cached Configuration

If tests use the wrong database or environment values, clear the config cache:

```bash
php artisan config:clear
```

---

### Cached Routes

If route changes are not reflected during tests, clear route cache:

```bash
php artisan route:clear
```

---

### Missing Tables

If tests fail with database table errors, refresh migrations:

```bash
php artisan migrate:fresh --env=testing
```

---

### Factory Errors

If a test fails with an error like:

```text
Call to undefined method App\\Models\\SomeModel::factory()
```

Make sure the related model uses the `HasFactory` trait:

```php
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;

class SomeModel extends Model
{
    use HasFactory;
}
```

Also make sure the related factory exists in:

```text
database/factories
```

---

## Current Status

All MVP feature tests are expected to pass with:

```bash
php artisan test
```
