# UniOps Smart Operations Platform

UniOps is a campus operations system with:

- Spring Boot backend (Java + MySQL)
- React frontend (CRA + Tailwind)

## Project Structure

```text
UniOps/
	backend/   # Spring Boot API
	frontend/  # React app
```

## Tech Stack

- Backend: Java 17, Spring Boot 3.3.x, Spring Data JPA, MySQL
- Frontend: React 18, Axios, Tailwind CSS

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8+

You can verify versions with:

```powershell
java -version
mvn -version
node -v
npm -v
```

## 1. Clone And Open

```powershell
git clone <your-repo-url>
cd UniOps
```

## 2. Database Setup (MySQL)

Create the database:

```sql
CREATE DATABASE IF NOT EXISTS uni_ops;
```

The backend defaults to these values:

- `DB_URL`: `jdbc:mysql://localhost:3306/uni_ops`
- `DB_USERNAME`: `root`
- `DB_PASSWORD`: `root`

If you see an error like:
`Access denied for user 'root'@'localhost' (using password: YES)`
then your local MySQL credentials don't match the defaults.

Option A) Set environment variables

Windows (PowerShell):

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "YOUR_REAL_PASSWORD"
```

Option B) Create a dedicated app user (recommended)

```sql
CREATE USER IF NOT EXISTS 'uniops'@'localhost' IDENTIFIED BY 'uniops';
GRANT ALL PRIVILEGES ON uni_ops.* TO 'uniops'@'localhost';
FLUSH PRIVILEGES;
```

Then run with:

```powershell
$env:DB_USERNAME = "uniops"
$env:DB_PASSWORD = "uniops"
```

Important:

- Backend defaults to `server.port=8081`.
- Frontend API base URL is configured to call `http://localhost:8081/api` by default.

## 3. Backend Setup And Run

From project root:

```powershell
cd backend
mvn clean install
mvn spring-boot:run
```

Expected:

- Backend starts on `http://localhost:8081`

## 4. Frontend Setup And Run

Open a second terminal, from project root:

```powershell
cd frontend
npm install
npm start
```

Expected:

- Frontend starts on `http://localhost:3000`

## 5. Build Commands

Backend build:

```powershell
cd backend
mvn -DskipTests compile
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Common Issues

### Port 8081 already in use

Run on another port:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8082"
```

## Booking API Endpoints (Module B)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | Create a new booking request |
| GET | /api/bookings | Get all bookings (admin view) |
| GET | /api/bookings/{id} | Get booking by ID |
| GET | /api/bookings/my?email= | Get bookings for a specific user |
| GET | /api/bookings/status?status= | Filter bookings by status |
| GET | /api/bookings/resource?resourceId= | Get bookings for a resource |
| PUT | /api/bookings/{id}/status | Update booking status (approve/reject/cancel) |
| DELETE | /api/admin/bookings/{id} | Delete a booking (admin only) |

## Booking Status Workflow

PENDING -> APPROVED or REJECTED
APPROVED -> CANCELLED
REJECTED and CANCELLED are terminal states

## Conflict Checking

The system prevents double-booking by checking for overlapping
time ranges on the same resource and date before saving a new booking.
By default it runs on:
- `http://localhost:3000`

### Backend API URL
The frontend uses:
- `REACT_APP_API_BASE_URL` (default: `http://localhost:8081/api`)

Windows (cmd):
```bat
set REACT_APP_API_BASE_URL=http://localhost:8081/api
```

Windows (PowerShell):
```powershell
$env:REACT_APP_API_BASE_URL = "http://localhost:8081/api"
```
