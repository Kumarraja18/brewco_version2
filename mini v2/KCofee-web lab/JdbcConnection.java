/**
 * ============================================================
 * Brew & Co — JDBC Database Connection (Login & Register)
 * ============================================================
 * Single Java file for MySQL JDBC connectivity.
 * Handles: User Registration & Login (Authentication)
 * 
 * Requirements:
 *  - MySQL Connector/J JAR in classpath
 *  - MySQL 8.x running on localhost:3306
 *  - Database: kcofee_db
 * 
 * Compile: javac JdbcConnection.java
 * Run:     java -cp ".;mysql-connector-j-8.x.x.jar" JdbcConnection
 * ============================================================
 */

import java.sql.*;
import java.util.*;

public class JdbcConnection {

    // ========================================================
    // DATABASE CONFIGURATION
    // ========================================================
    private static final String DB_URL      = "jdbc:mysql://localhost:3306/kcofee_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DB_USER     = "root";
    private static final String DB_PASSWORD = "raviteja";

    // ========================================================
    // GET CONNECTION
    // ========================================================
    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR] MySQL JDBC Driver not found. Add mysql-connector-j JAR to classpath.");
            throw new SQLException("Driver not found", e);
        }
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    // ========================================================
    // CREATE USERS TABLE
    // ========================================================
    public static void createUsersTable() {
        String sql = """
            CREATE TABLE IF NOT EXISTS users (
                id            VARCHAR(50) PRIMARY KEY,
                role          ENUM('customer','cafe_owner') NOT NULL,
                first_name    VARCHAR(100) NOT NULL,
                last_name     VARCHAR(100) NOT NULL,
                email         VARCHAR(150) NOT NULL,
                phone         VARCHAR(20),
                password      VARCHAR(255) NOT NULL,
                id_type       VARCHAR(30),
                id_number     VARCHAR(50),
                is_profile_complete BOOLEAN DEFAULT FALSE,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """;

        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute(sql.trim());
            System.out.println("[OK] Users table created / verified successfully.");
        } catch (SQLException e) {
            System.err.println("[ERROR] Failed to create users table: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // REGISTER — Insert New User
    public static boolean registerUser(String id, String role, String firstName, String lastName,
                                        String email, String phone, String password) {
        String sql = "INSERT INTO users (id, role, first_name, last_name, email, phone, password, is_profile_complete) VALUES (?,?,?,?,?,?,?,?)";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, id);
            ps.setString(2, role);
            ps.setString(3, firstName);
            ps.setString(4, lastName);
            ps.setString(5, email);
            ps.setString(6, phone);
            ps.setString(7, password);
            ps.setBoolean(8, role.equals("customer"));
            ps.executeUpdate();
            System.out.println("[OK] User registered: " + email);
            return true;
        } catch (SQLException e) {
            if (e.getMessage().contains("Duplicate")) {
                System.err.println("[ERROR] Registration failed: Email '" + email + "' already exists.");
            } else {
                System.err.println("[ERROR] Registration failed: " + e.getMessage());
            }
            return false;
        }
    }

    // LOGIN — Authenticate User
    public static Map<String, String> loginUser(String email, String password, String role) {
        String sql = "SELECT * FROM users WHERE email = ? AND password = ? AND role = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.setString(2, password);
            ps.setString(3, role);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Map<String, String> user = new HashMap<>();
                user.put("id", rs.getString("id"));
                user.put("role", rs.getString("role"));
                user.put("firstName", rs.getString("first_name"));
                user.put("lastName", rs.getString("last_name"));
                user.put("email", rs.getString("email"));
                user.put("phone", rs.getString("phone"));
                user.put("isProfileComplete", String.valueOf(rs.getBoolean("is_profile_complete")));
                System.out.println("[OK] Login successful: " + email + " (" + role + ")");
                return user;
            } else {
                System.out.println("[FAIL] Login failed: Invalid credentials for " + email);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Login error: " + e.getMessage());
        }
        return null;
    }

  
    public static boolean emailExists(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        try (Connection conn = getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1) > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Email check: " + e.getMessage());
        }
        return false;
    }

    public static List<Map<String, String>> getAllUsers() {
        List<Map<String, String>> list = new ArrayList<>();
        String sql = "SELECT id, role, first_name, last_name, email, phone, created_at FROM users ORDER BY created_at DESC";
        try (Connection conn = getConnection(); Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, String> m = new HashMap<>();
                m.put("id", rs.getString("id"));
                m.put("role", rs.getString("role"));
                m.put("firstName", rs.getString("first_name"));
                m.put("lastName", rs.getString("last_name"));
                m.put("email", rs.getString("email"));
                m.put("phone", rs.getString("phone"));
                m.put("createdAt", rs.getString("created_at"));
                list.add(m);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Get users: " + e.getMessage());
        }
        return list;
    }

    
    public static String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    public static void main(String[] args) {
        System.out.println("============================================");
        System.out.println("  Brew & Co — JDBC (Login & Register)");
        System.out.println("============================================\n");
        // Step 1: Test connection
        System.out.println("[1] Testing database connection...");
        try (Connection conn = getConnection()) {
            System.out.println("[OK] Connected to MySQL: " + conn.getMetaData().getURL());
            System.out.println("     Database: " + conn.getCatalog());
            System.out.println("     MySQL Version: " + conn.getMetaData().getDatabaseProductVersion());
        } catch (SQLException e) {
            System.err.println("[FAIL] Cannot connect: " + e.getMessage());
            System.err.println("\nMake sure:");
            System.err.println("  1. MySQL is running on localhost:3306");
            System.err.println("  2. Database 'kcofee_db' exists (CREATE DATABASE kcofee_db;)");
            System.err.println("  3. User/password is correct (default: root/root)");
            System.err.println("  4. mysql-connector-j JAR is in classpath");
            return;
        }

        // Step 2: Create users table
        System.out.println("\n[2] Creating users table...");
        createUsersTable();

        System.out.println("\n============================================");
        System.out.println("  Database ready! Use web form to register");
        System.out.println("============================================");
    }
}
