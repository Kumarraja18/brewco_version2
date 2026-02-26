/**
 * ============================================================
 * Brew & Co — Node.js Backend Server
 * ============================================================
 * Express server for handling authentication
 * Connects to MySQL database
 * 
 * Run: node server.js
 * ============================================================
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); 

// Database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'raviteja',
  database: 'kcofee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// REGISTER — POST /auth/register
app.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: 'All fields required' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    if (password.length < 8 || password.length > 16) {
      return res.status(400).json({ success: false, error: 'Password must be 8-16 characters' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password needs uppercase letter' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password needs lowercase letter' });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password needs special character' });
    }

    const conn = await pool.getConnection();
    
    // Generate ID
    const id = Math.random().toString(36).substr(2, 12);

    // Insert user
    const sql = 'INSERT INTO users (id, role, first_name, last_name, email, phone, password, is_profile_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    await conn.execute(sql, [id, 'customer', firstName, lastName, email, phone, password, true]);
    
    conn.release();
    
    return res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
});

// ============================================================
// LOGIN — POST /auth/login
// ============================================================
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    if (!email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    const conn = await pool.getConnection();

    // Find user
    const sql = 'SELECT id, first_name, last_name, email, role, phone FROM users WHERE email = ? AND password = ? AND role = ?';
    const [rows] = await conn.execute(sql, [email, password, 'customer']);

    conn.release();

    if (rows && rows.length > 0) {
      const user = rows[0];
      return res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          phone: user.phone
        }
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error: ' + err.message });
  }
});

// ============================================================
// START SERVER
// ============================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
  ============================================================
  Brew & Co — Backend Server Running
  ============================================================
  Server: http://localhost:${PORT}
  
  Endpoints:
  - POST /auth/register  — Register new user
  - POST /auth/login     — Login user
  
  Press Ctrl+C to stop
  ============================================================
  `);
});
