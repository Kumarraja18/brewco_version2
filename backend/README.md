# Brew & Co Backend

Spring Boot REST API backend for Brew & Co Coffee Ordering Platform

## Setup Instructions

### Prerequisites
- Java 17 or higher
- MySQL 8.0+
- Maven 3.8+

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE brewco_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/brewco_db
spring.datasource.username=root
spring.datasource.password=yourpassword
```

### Build and Run

1. Build the project:
```bash
mvn clean build
```

2. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/user/{id}` - Get user profile
- **PUT** `/api/auth/user/{id}` - Update user profile

## Database Schema

User table with fields:
- id (Primary Key)
- firstName, lastName
- email (Unique)
- password
- dateOfBirth, gender
- phoneNumber, streetAddress, plotNumber, city, postalCode
- role (CUSTOMER, ADMIN, CAFE_OWNER, CHEF, WAITER)
- isActive
- createdAt, updatedAt

## Frontend Integration

Update React frontend API calls to point to:
```
http://localhost:8080/api/auth
```

## Security Notes

**Important:** The current implementation uses plain text passwords. For production:
1. Implement BCrypt hashing
2. Add JWT authentication tokens
3. Add CORS configuration
4. Add request validation
5. Implement rate limiting
