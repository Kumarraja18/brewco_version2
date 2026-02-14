# Brew & Co - Coffee Ordering Platform

A full-stack coffee ordering platform with Spring Boot backend and React frontend.

## 🚀 Quick Start

### Option 1: Run Everything at Once (Recommended)

```bash
./start.sh
```

This will:
1. Set up the MySQL database (requires sudo password)
2. Start the Spring Boot backend on `http://localhost:8080`
3. Start the React frontend on `http://localhost:5173`

### Option 2: Run Components Separately

#### 1. Setup Database (One-time)

```bash
./setup-db.sh
```

Or manually:
```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS brewco_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 2. Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080`

#### 3. Start Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 📋 Prerequisites

- ✅ Java 21 (installed)
- ✅ Maven 3.9.9 (installed)
- ✅ Node.js & npm (installed)
- ✅ MySQL 8.0+ (running)

## 🗄️ Database Configuration

The application uses MySQL. Configure credentials via environment variables:

1. Copy the environment template: `cp .env.example .env`
2. Fill in your credentials in `.env`

Configuration file: `backend/src/main/resources/application.properties` (reads from env vars)

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user/{id}` - Get user profile
- `PUT /api/auth/user/{id}` - Update user profile

## 🛠️ Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.3.0
- Lombok
- Maven

### Frontend
- React 18.2.0
- Vite 5.0.0
- React Router DOM 6.14.1
- React Icons 5.5.0

## 📁 Project Structure

```
KumarSpringBoot/
├── backend/          # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── frontend/         # React application
│   ├── src/
│   ├── package.json
│   └── README.md
├── start.sh          # Startup script for both servers
└── setup-db.sh       # Database setup script
```

## 🔒 Security Notes

**⚠️ Important:** The current implementation uses plain text passwords. For production:
1. Implement BCrypt password hashing
2. Add JWT authentication tokens
3. Configure CORS properly
4. Add request validation
5. Implement rate limiting

## 🐛 Troubleshooting

### Backend won't start
- Check if MySQL is running: `systemctl status mysql`
- Verify database exists: `sudo mysql -e "SHOW DATABASES;"`
- Check if port 8080 is available: `lsof -i :8080`

### Frontend won't start
- Run `npm install` in the frontend directory
- Check if port 5173 is available: `lsof -i :5173`

### Database connection errors
- Verify MySQL credentials in `backend/src/main/resources/application.properties`
- Ensure MySQL is running and accessible

## 📝 Development

### Backend Development
```bash
cd backend
mvn clean install      # Build project
mvn spring-boot:run    # Run application
mvn test              # Run tests
```

### Frontend Development
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
```

## 🎯 Next Steps

1. ✅ Database setup
2. ✅ Backend running
3. ✅ Frontend running
4. 🔲 Implement authentication
5. 🔲 Add menu management
6. 🔲 Add order processing
7. 🔲 Add payment integration

---

**Built with ❤️ for coffee lovers**
