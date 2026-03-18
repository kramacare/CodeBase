# Clinic Authentication Backend

FastAPI backend with PostgreSQL for clinic and patient authentication.

## Setup

1. Copy `.env.example` to `.env` and update database URL
2. Install dependencies: `pip install -r requirements.txt`
3. Run server: `uvicorn app.main:app --reload`

## API Endpoints

### Clinic Authentication
- `POST /auth/clinic/signup` - Register new clinic
- `POST /auth/clinic/login` - Clinic login

### Patient Authentication  
- `POST /auth/patient/signup` - Register new patient
- `POST /auth/patient/login` - Patient login

## API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## Frontend Integration

### Example Signup Request
```javascript
fetch("http://localhost:8000/auth/patient/signup", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com", 
        password: "password123",
        phone: "1234567890"
    })
})
```

### Example Login Request
```javascript
fetch("http://localhost:8000/auth/patient/login", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "john@example.com",
        password: "password123"
    })
})
```
