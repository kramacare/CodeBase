# QueueSmart Backend API

A production-ready Django REST API for healthcare queue management system.

## 🚀 Features

- **Custom User Model**: Extended AbstractUser with PATIENT/CLINIC roles
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Queue Management**: Real-time queue tracking and patient flow
- **Appointment System**: Complete appointment booking and management
- **Clinic Management**: Doctor profiles, schedules, and clinic information
- **Review System**: Patient reviews with replies and moderation
- **Medical Reports**: Secure file upload and sharing system
- **Location Services**: Geo-based clinic discovery
- **Role-based Access**: Granular permissions for patients and clinics

## 🛠️ Tech Stack

- **Backend**: Django 4.2.9 + Django REST Framework 3.14.0
- **Database**: PostgreSQL with psycopg2-binary
- **Authentication**: djangorestframework-simplejwt
- **Environment**: python-decouple for secure configuration
- **CORS**: django-cors-headers for frontend integration
- **File Handling**: Pillow for medical report uploads
- **Production**: Gunicorn + WhiteNoise
- **Monitoring**: Health checks and system metrics

## 📁 Project Structure

```
backend/
├── manage.py                 # Django management script
├── requirements.txt           # Python dependencies
├── .env.example            # Environment variables template
├── setup.py               # Initial setup script
├── config/                 # Django configuration
│   ├── __init__.py
│   ├── settings.py          # Main settings with all configs
│   ├── urls.py            # Root URL configuration
│   ├── asgi.py            # ASGI config for deployment
│   └── wsgi.py            # WSGI config for deployment
└── apps/                   # Django applications
    ├── accounts/            # User authentication & profiles
    ├── clinics/             # Clinic & doctor management
    ├── queue/              # Queue management system
    ├── appointments/        # Appointment booking
    ├── reviews/             # Review & rating system
    ├── reports/             # Medical reports & file sharing
    └── core/               # Utilities & health checks
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Set database URL, JWT secrets, etc.
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run setup script (optional)
python setup.py
```

### 4. Start Development Server

```bash
# Start development server
python manage.py runserver

# Server will be available at http://127.0.0.1:8000
```

## 📡 API Endpoints

### Authentication
```
POST /api/v1/auth/patient/signup/    # Patient registration
POST /api/v1/auth/clinic/signup/     # Clinic registration
POST /api/v1/auth/login/            # User login
GET  /api/v1/auth/profile/           # User profile
```

### Clinics
```
GET  /api/v1/clinics/               # List all clinics
GET  /api/v1/clinics/nearby/        # Find nearby clinics
GET  /api/v1/clinics/<id>/          # Clinic details
GET  /api/v1/clinics/<id>/doctors/  # Clinic doctors
```

### Queue Management
```
POST /api/v1/queue/join/            # Join queue
GET  /api/v1/queue/<clinic_id>/     # Clinic queue
POST /api/v1/queue/next/            # Call next patient
POST /api/v1/queue/skip/            # Skip patient
PUT  /api/v1/queue/update/          # Update token status
```

### Appointments
```
GET  /api/v1/appointments/           # User appointments
POST /api/v1/appointments/create/    # Book appointment
GET  /api/v1/appointments/<id>/    # Appointment details
PUT  /api/v1/appointments/<id>/    # Update appointment
```

### Reviews
```
GET  /api/v1/reviews/               # User reviews
POST /api/v1/reviews/create/       # Write review
GET  /api/v1/reviews/clinic/<id>/ # Clinic reviews
POST /api/v1/reviews/reply/        # Reply to review
```

### Reports
```
GET  /api/v1/reports/               # Medical reports
POST /api/v1/reports/upload/        # Upload report
GET  /api/v1/reports/<id>/        # Report details
POST /api/v1/reports/share/         # Share report
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

### Login Response
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "PATIENT",
        "is_verified": true
    },
    "tokens": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

### Using Tokens
Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## 🗄️ Database Models

### User System
- **User**: Custom user model with role-based access
- **PatientProfile**: Extended patient information
- **ClinicProfile**: Clinic business details

### Healthcare Entities
- **Doctor**: Medical practitioners with specializations
- **Appointment**: Patient appointments with status tracking
- **Queue**: Real-time queue management
- **MedicalReport**: Secure medical document storage

### Social Features
- **Review**: Patient ratings and feedback
- **ReportShare**: Secure medical report sharing

## 🌍 Environment Variables

Key environment variables in `.env`:

```bash
# Django Configuration
DEBUG=True
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=krama
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🚀 Production Deployment

### Using Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Start production server
gunicorn config.wsgi:application --bind 0.0.0.0:8000

# With workers
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Environment Setup

```bash
# Production environment variables
export DEBUG=False
export SECRET_KEY='your-production-secret-key'
export DB_NAME='krama_prod'
export DB_HOST='your-production-db-host'
export CORS_ALLOWED_ORIGINS='https://yourdomain.com'
```

## 🔧 Development

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.accounts
python manage.py test apps.clinics
```

### Database Management

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development)
python manage.py flush
```

### Superuser Management

```bash
# Create superuser
python manage.py createsuperuser

# Change password
python manage.py changepassword <username>
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8000/health/
```

Response:
```json
{
    "status": "healthy",
    "timestamp": "2024-03-14T10:00:00Z",
    "version": "1.0.0",
    "system": {
        "cpu_usage": "15.2%",
        "memory_usage": "45.8%",
        "disk_usage": "23.1%"
    }
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Password Validation**: Django's built-in password validators
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **File Security**: Secure file upload with type checking
- **SQL Injection Prevention**: Django ORM protection
- **XSS Protection**: Django's built-in XSS protection

## 📝 API Documentation

### Authentication Flow

1. **Patient Signup**: `POST /api/v1/auth/patient/signup/`
2. **Clinic Signup**: `POST /api/v1/auth/clinic/signup/`
3. **Login**: `POST /api/v1/auth/login/`
4. **Profile**: `GET /api/v1/auth/profile/` (authenticated)

### Queue Management Flow

1. **Join Queue**: `POST /api/v1/queue/join/`
2. **Track Position**: `GET /api/v1/queue/my/`
3. **Call Next**: `POST /api/v1/queue/next/`
4. **Skip Patient**: `POST /api/v1/queue/skip/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**QueueSmart Backend** - Making healthcare more efficient, one API call at a time. 🏥
