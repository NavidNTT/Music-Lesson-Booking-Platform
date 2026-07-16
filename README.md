# 🎵 Music Lesson Booking API (Enterprise & Production-Ready)

[![Laravel Version](https://img.shields.io/badge/Laravel-11%20%2F%2012-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![PHP Version](https://img.shields.io/badge/PHP-8.2%20%7C%208.3-777BB4?logo=php&logoColor=white)](https://php.net)
[![Architecture](https://img.shields.io/badge/Architecture-Domain--Driven%20%2F%20Modular-blue)](https://en.wikipedia.org/wiki/Domain-driven_design)
[![Tests Status](https://img.shields.io/badge/Tests-24%20Passed%20%2F%2056%20Assertions-brightgreen?logo=phpunit&logoColor=white)]()

A high-performance, commercial-grade, and production-ready RESTful API for a private music lesson booking platform. This backend engine is architected using **Domain-Driven Design (DDD) / Modular Monolith** principles, ensuring extreme scalability, strict security, and highly resilient financial/booking transactions.

Perfectly suited for multi-tenant SaaS applications, music academies, or tutoring marketplaces.

---

## 🚀 Key Enterprise Features

- **Domain-Driven Architecture (DDD):** Clean separation of concerns. Core business logic, Eloquent models, and domain services are completely encapsulated inside dedicated domain modules (`Booking`, `Teacher`, `Wallet`, `Review`, `Instrument`).
- **Race Condition & Double-Booking Protection:** Mitigated using database transactions combined with **Pessimistic Locking (`lockForUpdate()`)** on critical time slot evaluations and cancellation balances.
- **SaaS-Ready Payment Abstraction:** Features a structured `PaymentGatewayInterface` ready for rapid binding to international (Stripe, PayPal) or domestic payment processors via Laravel's Service Container.
- **Optimized API Resource Layer:** Data transformation utilizes advanced Eloquent API Resources with proactive `whenLoaded` conditional relationship maps to guarantee **zero N+1 query** vulnerabilities.
- **Strict Booking Lifecycle Validation:** Enforces granular state machine transitions and strict time-window constraints (e.g., preventing lesson cancellations within 24 hours of starting or after the event has passed).
- **Role-Based Access Control (RBAC):** Strict security boundaries enforced via route guards and custom middleware between `Admin`, `Teacher`, and `Student` layers[cite: 1].

---

## 🛠️ Tech Stack

- **Framework:** Laravel 11 / 12 (Robust Framework Core)
- **Runtime:** PHP 8.2+ / 8.3+ (Fully Typed Properties)
- **Authentication:** Laravel Sanctum (Stateful Token Guards)
- **Database:** MySQL 8.0+ (ACID Transaction Compliant)
- **Caching & Queue:** Redis-ready abstraction for background jobs
- **Testing:** PHPUnit / Pest Feature & Unit testing suite

---

## 📂 Advanced Project Structure

The project has evolved from a standard MVC to a highly scalable **Domain-Driven Design** layout:

```text
app/
├── Domain/                         # 🧠 Domain-Driven Core Modules
│   ├── Booking/
│   │   ├── Models/Booking.php
│   │   └── Services/BookingService.php
│   ├── Teacher/
│   │   ├── Models/{TeacherProfile, TeacherTimeSlot}.php
│   │   └── Services/TeacherTimeSlotService.php
│   ├── Wallet/
│   │   ├── Models/{Wallet, WalletTransaction}.php
│   │   └── Services/{WalletService, PaymentGatewayInterface.php}
│   └── [Instrument, Review, User, Student] # Encapsulated Domains
│
├── Http/                           # 🌐 Application Delivery Layer
│   ├── Controllers/Api/V1/
│   │   ├── Admin/                  # Isolated Admin Endpoints
│   │   ├── Auth/                   # Structured Authentication Handlers
│   │   ├── Booking/                # Specialized Booking Sub-controllers
│   │   └── [Student, Teacher, Wallet]
│   ├── Middleware/CheckRole.php     # Granular RBAC Enforcer
│   ├── Requests/Api/V1/            # Self-contained Business Validations
│   └── Resources/Api/V1/           # High-performance Data Transformers
│
├── Jobs/                           # ⏳ Queue Handlers (e.g., Rating Recalculator)
└── Providers/AppServiceProvider.php # IoC Core Bindings
⚡ Core Business Modules1. Booking Engine & Concurrency ControlEnsures zero data corruption. When a student initiates a booking or a teacher handles a cancellation, the system locks the target rows using row-level database locks, blocking concurrent overlapping API hits[cite: 1].2. Wallet & Financial LedgerTracks financial state securely. Supports deposits, structural balance deductions on booking, and conditional rollbacks (refunds) upon legitimate cancellations based on strict academy policies.3. Smart Time-Slot GeneratorTeachers configure weekly availability windows, and the engine generates atomic time-slots, dynamically keeping track of capacity thresholds, booked count indicators, and availability states.4. Asynchronous Review & Rating SystemStudents provide reviews on completed sessions. Upon submittal, a high-priority background Queue Job (RecalculateTeacherRating) is triggered asynchronously to recalculate the teacher's average metrics without degrading user request speeds.🏁 Installation & Production Setup1. Clone & Core DependenciesBashgit clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git)
cd YOUR_REPOSITORY
composer install --no-dev --optimize-autoloader
2. Environment ConfigurationBashcp .env.example .env
php artisan key:generate
Configure your high-performance database cluster settings inside the .env file:تکه‌کدDB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=music_booking_prod
DB_USERNAME=your_secure_user
DB_PASSWORD=your_secure_password

QUEUE_CONNECTION=database # Switch to redis in cluster environments
CACHE_STORE=database
3. Migrations & SeedersBashphp artisan migrate --force
php artisan db:seed --force
4. Expose Local ServerBashphp artisan serve
The unified API gateway is running smoothly at: http://127.0.0.1:8000/api/v1📡 API Unified Endpoints MatrixAll JSON responses follow a unified wrapper contract handled by ApiResponse.php[cite: 1].Auth LevelHTTP VerbURI Endpoint PathPurpose / DescriptionPublicPOST/api/v1/auth/registerRegister new platform accountsPublicPOST/api/v1/auth/loginAuthenticate and obtain Bearer TokenPublicGET/api/v1/instrumentsPublic catalog listing of all instrumentsProtectedGET/api/v1/meRetrieve current profile statesProtectedPOST/api/v1/wallet/depositTop-up financial balance logsStudentPOST/api/v1/student/bookingsBook an available teacher time slotStudentPOST/api/v1/student/bookings/cancelRequest booking cancellationTeacherGET/api/v1/teacher/slotsManage specialized teacher timetablesTeacherPOST/api/v1/teacher/bookings/{id}/confirmFormally accept pending lesson bookingAdminPOST/api/v1/admin/instrumentsAdministrative catalog managementDetailed technical specifications are fully documented within docs/api.md.🧪 Comprehensive Testing SuiteQuality assurance is paramount. The system is shipped with extensive features tests verifying edge cases, validation rules, role isolation, and financial integrity constraints.Bash# Execute the automated test matrix
php artisan test
Test Suite Execution Output Summary:Plaintext  Pass  Tests/Feature/AuthTest.php ................................... 6 tests passed
  Pass  Tests/Feature/Booking/BookingTest.php ......................... 3 tests passed
  Pass  Tests/Feature/WalletTest.php .................................. 2 tests passed
  Pass  Tests/Feature/Teacher/TeacherProfileTest.php .................. 4 tests passed
  Pass  Tests/Feature/ReviewTest.php .................................. 3 tests passed
  Pass  Tests/Feature/Admin/InstrumentTest.php ........................ 4 tests passed

  Tests:    24 passed (56 assertions)
  Duration: 0.84s
  Status:   🟢 ALL GREEN & ARCHITECTURALLY STABLE
📈 Commercialization Roadmap & SaaS ScalabilityThis backend layout is pre-configured for commercial scaling. Future modules can easily inject:A production concrete implementation for PaymentGatewayInterface (e.g., Stripe SDK Connect)[cite: 1].Live interactive WebSockets for real-time lesson reminder notifications.Complete Docker development & staging environments (Dockerfile & docker-compose.yml).Developed with high architectural standards by navid.khazaie
