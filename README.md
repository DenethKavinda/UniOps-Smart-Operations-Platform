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

Install these before setup:

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
CREATE DATABASE uni_ops;
```

Update backend DB settings in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/uni_ops
spring.datasource.username=YOUR_MYSQL_USER
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Important:

- Keep `server.port=8081` for backend unless you intentionally change it.
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

## 6. Quick Health Check

- Open frontend: `http://localhost:3000`
- Ensure backend is reachable: `http://localhost:8081/api/...` endpoints from app actions
- Login and verify dashboard data loads

## Common Issues And Fixes

### 1) Maven says no POM or spring-boot goal not found

Cause: command was run from wrong folder.

Fix:

```powershell
cd backend
mvn spring-boot:run
```

### 2) Port 8081 already in use

Cause: another process (or old backend instance) is using 8081.

Fix options:

- Stop the old process and run again on 8081.
- Or run on another port:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.arguments=--server.port=8082"
```

If you use 8082, also update frontend API base URL.

### 3) Frontend cannot connect to backend

Check:

- Backend is running successfully
- Backend and frontend ports match configuration
- CORS is enabled in backend config

### 4) MySQL authentication or connection error

Check credentials and DB name in `application.properties`, and confirm MySQL service is running.

## Notes

- Notification features use backend APIs and server-sent events.
- Admin and user notification flows are implemented in frontend pages.

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
