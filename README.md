# UniOps-Smart-Operations-Platform

## Run backend (Spring Boot)

### Prerequisites
- Java (JDK 17+ recommended)
- MySQL running on `localhost:3306`
- Maven (`mvn`) available

### Database setup
The backend expects a MySQL database named `uni_ops`.

Create it:
```sql
CREATE DATABASE IF NOT EXISTS uni_ops;
```

If you see an error like:
`Access denied for user 'root'@'localhost' (using password: YES)`
then the MySQL credentials in the backend config do not match your local MySQL.

You have two options:

1) Use your existing MySQL user/password
- Set environment variables before running:
	- `DB_URL` (default `jdbc:mysql://localhost:3306/uni_ops`)
	- `DB_USERNAME` (default `root`)
	- `DB_PASSWORD` (default `root`)

Windows (cmd):
```bat
set DB_USERNAME=root
set DB_PASSWORD=YOUR_REAL_PASSWORD
```

Windows (PowerShell):
```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "YOUR_REAL_PASSWORD"
```

2) Create a dedicated app user (recommended)
Run these in MySQL (as an admin/root user):
```sql
CREATE USER IF NOT EXISTS 'uniops'@'localhost' IDENTIFIED BY 'uniops';
GRANT ALL PRIVILEGES ON uni_ops.* TO 'uniops'@'localhost';
FLUSH PRIVILEGES;
```

Then run with:
```bat
set DB_USERNAME=uniops
set DB_PASSWORD=uniops
```

### Start the backend
From the repository root:
```bat
cd backend
mvn spring-boot:run
```

By default it runs on:
- `http://localhost:8081`

## Run frontend (React)

### Prerequisites
- Node.js (18+ recommended)
- npm (comes with Node)

### Start the frontend
From the repository root:
```bat
cd frontend
npm install
npm start
```

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
