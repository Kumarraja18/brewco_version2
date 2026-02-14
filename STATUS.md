# ✅ Brew & Co Project - Successfully Running!

## 🎉 Status: RUNNING

Both backend and frontend servers are now up and running!

---

## 🌐 Access URLs

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:8080

---

## 🔐 Admin Credentials

Configured via environment variables in `.env` file.

---

## 📊 What Was Done

### 1. ✅ Environment Setup
- Installed Maven 3.9.9
- Verified Java 21 (compatible with Java 17 requirement)
- Verified Node.js and npm
- Confirmed MySQL 8.0 is running

### 2. ✅ Database Configuration
- Created `brewco_db` database
- Created MySQL user `brewco` with credentials stored in `.env`
- Granted all privileges on `brewco_db` to `brewco` user
- Updated `application.properties` to use new database user

### 3. ✅ Backend Setup
- Built the Spring Boot project successfully
- Started backend server on port 8080
- Hibernate automatically created database tables:
  - `users` - User accounts
  - `addresses` - User addresses
  - `govt_proof` - Government ID proofs
  - `work_experience` - Work experience records
- Created default admin user

### 4. ✅ Frontend Setup
- Installed npm dependencies
- Started Vite development server on port 5173

---

## 🛠️ Running Commands

### Backend Terminal (Currently Running)
```bash
cd /home/raviteja/Projects/KumarSpringBoot/backend
mvn spring-boot:run
```

### Frontend Terminal (Currently Running)
```bash
cd /home/raviteja/Projects/KumarSpringBoot/frontend
npm run dev
```

---

## 🔄 How to Restart

### Stop Servers
Press `Ctrl+C` in each terminal to stop the servers

### Restart Everything
```bash
cd /home/raviteja/Projects/KumarSpringBoot
./start.sh
```

Or manually:

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📝 API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login  
- `GET /api/auth/user/{id}` - Get user profile
- `PUT /api/auth/user/{id}` - Update user profile

---

## 🗄️ Database Details

- **Database Name**: brewco_db
- **Host**: localhost:3306
- **Credentials**: Configured via `.env` file

### Tables Created
1. **users** - Main user table with authentication
2. **addresses** - User address information
3. **govt_proof** - Government ID verification
4. **work_experience** - Employment history

---

## 🎯 Next Steps

1. Open http://localhost:5173 in your browser to see the frontend
2. Test the API endpoints using http://localhost:8080/api/auth/...
3. Login with the default admin credentials
4. Start developing your features!

---

## 📚 Useful Scripts Created

- **start.sh** - Starts both backend and frontend
- **setup-db.sh** - Sets up the database (already done)
- **README.md** - Complete project documentation

---

## 🐛 Troubleshooting

### If backend fails to connect to database:
```bash
sudo mysql -e "SHOW DATABASES;"
sudo mysql -e "SELECT user, host FROM mysql.user WHERE user='brewco';"
```

### If port is already in use:
```bash
# Check what's using port 8080
lsof -i :8080

# Check what's using port 5173
lsof -i :5173
```

### To restart MySQL:
```bash
sudo systemctl restart mysql
```

---

**🎊 Your project is ready to use! Happy coding! 🎊**
