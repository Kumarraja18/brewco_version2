# ☕ Brew & Co — Full-Stack Café Management Platform

A comprehensive café ordering & management platform built with **Spring Boot 3** (backend) and **React + Vite** (frontend). Features multi-role authentication (Customer, Café Owner, Chef, Waiter, Admin), real-time order tracking, menu management, table booking, and a full admin dashboard.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start (One Command)](#-quick-start-one-command)
- [Manual Setup](#-manual-setup)
- [Project Structure](#-project-structure)
- [Seed Accounts](#-seed-accounts)
- [Architecture Overview](#-architecture-overview)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)

---

## 🛠 Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| **Backend** | Java 17+, Spring Boot 3.2, Spring Security 6, JPA/Hibernate, JWT (HttpOnly Cookies) |
| **Frontend**| React 18, Vite, React Router 6, Axios, React Hot Toast |
| **Database**| MySQL 8.0+                                     |
| **Build**   | Maven 3.8+ (backend), npm/Node 18+ (frontend) |

---

## ✅ Prerequisites

Make sure these are installed **before** you begin:

1. **Java JDK 17 or higher**  
   - Verify: `java -version`
   - Download: https://adoptium.net/

2. **Maven 3.8+**  
   - Verify: `mvn -version`
   - Download: https://maven.apache.org/download.cgi

3. **Node.js 18+ and npm**  
   - Verify: `node -v` and `npm -v`
   - Download: https://nodejs.org/

4. **MySQL 8.0+**  
   - Verify: `mysql --version`
   - Download: https://dev.mysql.com/downloads/mysql/
   - **MySQL must be running** as a service before starting the app.

---

## 🚀 Quick Start (One Command)

### Windows (PowerShell)

```powershell
# 1. Navigate to the project root
cd KumarSpringBoot

# 2. Set your MySQL root password (change 'yourpassword' to your actual MySQL root password)
$env:DB_PASSWORD="yourpassword"

# 3. Run the setup script
.\SETUP_AND_RUN.bat
```

### Manual Quick Start (Any OS)

```bash
# Terminal 1 — Backend
cd backend
# Set env vars (use 'export' on Linux/Mac, '$env:' on Windows PowerShell)
export DB_PASSWORD=yourpassword      # Linux/Mac
# $env:DB_PASSWORD="yourpassword"    # Windows PowerShell
mvn spring-boot:run

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🔧 Manual Setup

### Step 1: Configure MySQL

The app auto-creates the `brewco` database on first run. You just need MySQL running.

**Option A — Empty password (default):**  
If your MySQL root user has no password, no env vars needed.

**Option B — Password-protected MySQL (most common):**

Create a `.env` file in the project root:
```env
DB_NAME=brewco
DB_USERNAME=root
DB_PASSWORD=your_mysql_root_password
```

Or set environment variables directly:
```powershell
# Windows PowerShell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_root_password"
```
```bash
# Linux / Mac
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_root_password
```

### Step 2: Start the Backend

```bash
cd backend
mvn spring-boot:run
```

**What happens on first run:**
1. Hibernate creates all 18 tables automatically (`ddl-auto=update`)
2. `data.sql` seeds 5 user accounts, 2 sample cafés with menus, tables & staff
3. Backend starts on **http://localhost:8080**

Wait until you see:
```
Started BrewCoApplication in X.XX seconds
```

### Step 3: Start the Frontend

```bash
cd frontend
npm install        # Only needed first time
npm run dev
```

Frontend starts on **http://localhost:5173**

### Step 4: Open the App

Navigate to **http://localhost:5173** → Click **Sign In** → Use any seed account below.

---

## 🔑 Seed Accounts

All seed accounts use the same password: **`Brewco@123`**

| Role         | Email               | What they can do                                          |
|-------------|---------------------|-----------------------------------------------------------|
| **Admin**    | `admin@brewco.com`  | Approve/reject users, view all users, platform stats      |
| **Café Owner** | `priya@brewco.com` | Manage cafés, menus, tables, staff, orders, bookings    |
| **Customer** | `rahul@brewco.com`  | Browse cafés, order food, book tables, track orders       |
| **Waiter**   | `amit@brewco.com`   | View assigned orders, send to kitchen, mark delivered     |
| **Chef**     | `deepa@brewco.com`  | View kitchen orders, mark as preparing/ready              |

### Sample Cafés (pre-seeded)

| Café             | City       | Menu Items | Tables |
|------------------|------------|------------|--------|
| The Brew Haven   | Bengaluru  | 14 items   | 5      |
| Roast Republic   | Hyderabad  | 9 items    | 5      |

---

## 📁 Project Structure

```
KumarSpringBoot/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/brewco/
│   │   ├── controller/               # REST controllers (Auth, Admin, CafeOwner, Customer, Chef, Waiter, Cafe)
│   │   ├── entity/                   # JPA entities (User, Cafe, Order, MenuItem, Booking, etc.)
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── service/                  # Business logic services
│   │   ├── security/                 # JWT filter, SecurityConfig, UserDetailsService
│   │   ├── dto/                      # Request/Response DTOs
│   │   └── config/                   # CORS, password migration runner
│   ├── src/main/resources/
│   │   ├── application.properties    # App config (DB, JWT, email, etc.)
│   │   ├── data.sql                  # Seed data (runs on every startup)
│   │   └── brewco_db.sql             # Manual DB schema (alternative to Hibernate auto-create)
│   └── pom.xml                       # Maven dependencies
│
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── api/                      # Axios client + API helper functions
│   │   ├── components/               # Reusable components (Navbar, ProtectedRoute, etc.)
│   │   ├── context/                  # AuthContext (JWT session management)
│   │   ├── pages/                    # All page components
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CafeOwnerDashboard.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── ChefDashboard.jsx
│   │   │   ├── WaiterDashboard.jsx
│   │   │   ├── CafeDetail.jsx        # Café page with menu, ordering, booking
│   │   │   ├── OrderTracking.jsx
│   │   │   └── ...
│   │   ├── styles/                   # CSS files (warm brown/cream theme + glassmorphism)
│   │   ├── App.jsx                   # Router + layout
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── .env                              # Environment variables (DB credentials)
├── SETUP_AND_RUN.bat                 # Windows one-click launcher
└── README.md                         # This file
```

---

## 🏗 Architecture Overview

### Authentication Flow
```
Login → POST /api/auth/login
  → Backend validates credentials (BCrypt)
  → Returns JWT as HttpOnly cookie (access_token, 15 min)
  → Returns refresh_token cookie (7 days)
  → Frontend stores user object in AuthContext

Page Load → GET /api/auth/me
  → JWT cookie auto-sent by browser
  → Backend reads JWT, returns UserDto
  → AuthContext restores session

Token Expired → 401 from any API call
  → Axios interceptor calls POST /api/auth/refresh
  → New access_token cookie issued
  → Original request retried automatically
```

### Order Lifecycle
```
Customer places order → PLACED
  → Café Owner confirms & assigns waiter → CONFIRMED
    → Waiter sends to kitchen → SENT_TO_KITCHEN
      → Chef starts cooking → PREPARING
        → Chef marks done → READY
          → Waiter delivers → DELIVERED
```

### Security
- **JWT stored in HttpOnly cookies** (not localStorage — immune to XSS)
- **Role-based access control** via Spring Security (`ADMIN`, `CAFE_OWNER`, `CUSTOMER`, `CHEF`, `WAITER`)
- **CORS** configured for `http://localhost:5173`
- **BCrypt** password hashing with cost factor 10

---

## 📡 API Endpoints Overview

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT cookies) |
| GET | `/api/auth/me` | Get current user from JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/cafes` | List all verified cafés |
| GET | `/api/cafes/{id}` | Get café details |
| GET | `/api/cafes/{id}/menu/categories` | Get menu categories |
| GET | `/api/cafes/{id}/menu/items` | Get menu items |

### Customer (`/api/customer/*`)
| POST | `/api/customer/orders` | Place an order |
| GET | `/api/customer/orders` | Get my orders |
| POST | `/api/customer/bookings` | Make a booking |

### Café Owner (`/api/cafe-owner/*`)
| GET | `/api/cafe-owner/cafes` | Get my cafés |
| GET | `/api/cafe-owner/cafes/{id}/dashboard` | Dashboard stats |
| PUT | `/api/cafe-owner/cafes/{id}/orders/{oid}/confirm` | Confirm order |
| POST | `/api/cafe-owner/cafes/{id}/staff` | Add chef/waiter |

### Admin (`/api/admin/*`)
| GET | `/api/admin/dashboard` | Platform stats |
| GET | `/api/admin/users/pending` | Pending approvals |
| PUT | `/api/admin/users/{id}/approve` | Approve user |

### Chef (`/api/chef/*`) & Waiter (`/api/waiter/*`)
Full order management endpoints for their respective workflows.

---

## ❗ Troubleshooting

### "Access denied" / MySQL connection error
- Make sure MySQL is running: `mysql -u root -p -e "SELECT 1"`
- Set the correct password: `$env:DB_PASSWORD="yourpassword"` (PowerShell)
- The connection URL uses `createDatabaseIfNotExist=true` so the `brewco` database is auto-created

### Backend starts but login returns 400 "Invalid password"
- The seed data runs via `data.sql` on startup with `ON DUPLICATE KEY UPDATE`
- If you changed the data.sql file, restart the backend
- All seed passwords are: **`Brewco@123`**

### "ERR_CONNECTION_REFUSED" on :8080
- Backend is not running — start it with `mvn spring-boot:run`
- Or port 8080 is in use — check with `netstat -ano | findstr :8080`

### "Access Denied" after login
- Make sure the backend has the `GET /api/auth/me` endpoint (AuthController.java)
- This endpoint recovers the session from the JWT cookie on every page load
- Without it, the frontend loses the user state after navigation

### Frontend shows blank page
- Run `npm install` in the `frontend/` directory first
- Check that Vite is running on port 5173: `npm run dev`

### Hibernate / `order` table issues
- The `Order` entity uses `@Table(name="orders")` (not `order`) because `order` is a SQL reserved keyword
- Native queries wrap the table name in backticks: `` `orders` ``

### Email features not working
- Email is optional. The app works without SMTP configured.
- To enable: set `MAIL_USERNAME` and `MAIL_PASSWORD` env vars (Gmail app password)

---

## 📝 Important Notes for AI Agents

If you're an AI coding assistant helping set up this project, here are key things to know:

1. **Database**: MySQL 8.0+ required. The app auto-creates the `brewco` database. The only env var typically needed is `DB_PASSWORD`.

2. **Two-server setup**: Backend runs on `:8080`, frontend on `:5173`. Both must be running simultaneously.

3. **JWT cookies**: Auth uses HttpOnly cookies, not localStorage. The Axios client has `withCredentials: true` configured. CORS is set for `localhost:5173`.

4. **Seed data**: `backend/src/main/resources/data.sql` runs on every startup. Uses `ON DUPLICATE KEY UPDATE` to keep passwords in sync. All accounts use password `Brewco@123`.

5. **The `orders` table**: Java class is `Order` but `@Table(name="orders")` — `order` is a SQL reserved keyword. Watch for this in native queries.

6. **Role format**: Roles are stored as UPPERCASE strings: `ADMIN`, `CUSTOMER`, `CAFE_OWNER`, `CHEF`, `WAITER`. Frontend comparisons should always be case-insensitive.

7. **Key files to look at first**:
   - `backend/src/main/resources/application.properties` — all config
   - `backend/src/main/java/com/brewco/security/SecurityConfig.java` — route security
   - `frontend/src/context/AuthContext.jsx` — auth state management
   - `frontend/src/api/axiosClient.js` — API client with refresh logic
   - `frontend/src/App.jsx` — all routes

---

*Built with ☕ by Kumar Raja — Infosys SpringBoard Project*
