// ============================================================
//  BREW & CO — BrewCoJDBC.java
//  Purpose : Database connection + Customer login & register
//  DB      : MySQL
// ============================================================

import java.sql.*;

public class jdbc {

    // ── DATABASE CONFIG ─────────────────────────────────────
    private static final String DB_URL  = "jdbc:mysql://localhost:3306/brewco_db";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "your_password_here";

    // ── GET CONNECTION ───────────────────────────────────────
    public static Connection getConnection() throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
    }

    // ── CREATE TABLES (run once) ─────────────────────────────
    public static void createTables() throws Exception {
        String sql = """
            CREATE TABLE IF NOT EXISTS users (
                user_id       INT AUTO_INCREMENT PRIMARY KEY,
                first_name    VARCHAR(50)  NOT NULL,
                last_name     VARCHAR(50)  NOT NULL,
                email         VARCHAR(100) NOT NULL UNIQUE,
                phone         VARCHAR(20),
                password_hash VARCHAR(255) NOT NULL,
                role          ENUM('customer','owner') NOT NULL DEFAULT 'customer',
                cafe_name     VARCHAR(100),
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """;
        try (Connection conn = getConnection();
             Statement st = conn.createStatement()) {
            st.execute(sql);
            System.out.println("✅ users table ready.");
        }
    }

    // ── REGISTER ────────────────────────────────────────────
    /**
     * Registers a new user.
     * @return generated user_id on success, -1 on failure
     */
    public static int register(String firstName, String lastName,
                                String email, String phone,
                                String passwordHash, String role,
                                String cafeName) {
        // Check if email already exists
        if (emailExists(email)) {
            System.out.println("❌ Register failed: Email already registered.");
            return -1;
        }

        String sql = """
            INSERT INTO users
              (first_name, last_name, email, phone, password_hash, role, cafe_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, firstName);
            ps.setString(2, lastName);
            ps.setString(3, email);
            ps.setString(4, phone);
            ps.setString(5, passwordHash);
            ps.setString(6, role);
            ps.setString(7, cafeName); // null for customers

            int rows = ps.executeUpdate();
            if (rows > 0) {
                ResultSet keys = ps.getGeneratedKeys();
                if (keys.next()) {
                    int id = keys.getInt(1);
                    System.out.println("✅ Registered. user_id=" + id
                        + " | " + email + " | role=" + role);
                    return id;
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Register error: " + e.getMessage());
        }
        return -1;
    }

    // ── LOGIN ────────────────────────────────────────────────
    /**
     * Authenticates a user.
     * @return String array [user_id, first_name, last_name, email, role, cafe_name]
     *         or null if credentials are wrong
     */
    public static String[] login(String email, String passwordHash) {
        String sql = """
            SELECT user_id, first_name, last_name, email, role, cafe_name
            FROM users
            WHERE email = ? AND password_hash = ?
            """;

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, email);
            ps.setString(2, passwordHash);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String[] user = {
                    String.valueOf(rs.getInt("user_id")),
                    rs.getString("first_name"),
                    rs.getString("last_name"),
                    rs.getString("email"),
                    rs.getString("role"),
                    rs.getString("cafe_name") // null for customers
                };
                System.out.println("✅ Login successful: " + user[1] + " " + user[2]
                    + " | role=" + user[4]);
                return user;
            } else {
                System.out.println("❌ Login failed: invalid email or password.");
            }
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
        }
        return null;
    }

    // ── HELPER: email exists ─────────────────────────────────
    private static boolean emailExists(String email) {
        String sql = "SELECT 1 FROM users WHERE email = ?";
        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            return ps.executeQuery().next();
        } catch (Exception e) {
            return false;
        }
    }

    // ── MAIN (test) ──────────────────────────────────────────
    public static void main(String[] args) throws Exception {
        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║  BREW & CO  —  JDBC Connection Test  ║");
        System.out.println("╚══════════════════════════════════════╝\n");

        // 1. Test connection
        try (Connection conn = getConnection()) {
            System.out.println("✅ Connected to: " + conn.getMetaData().getURL());
        }

        // 2. Create table
        createTables();

        // 3. Register a customer
        System.out.println("\n── Registering customer...");
        int custId = register("Priya", "Nair",
                              "priya@demo.com", "+91 9876543210",
                              "hashed_pw_here", "customer", null);

        // 4. Register a cafe owner
        System.out.println("\n── Registering cafe owner...");
        int ownerId = register("Ravi", "Menon",
                               "ravi@brewco.com", "+91 9123456780",
                               "hashed_pw_here", "owner", "Brew & Co — Banjara Hills");

        // 5. Test login
        System.out.println("\n── Testing login (customer)...");
        String[] user = login("priya@demo.com", "hashed_pw_here");
        if (user != null)
            System.out.println("   Welcome, " + user[1] + " | Role: " + user[4]);

        // 6. Test wrong password
        System.out.println("\n── Testing wrong password...");
        login("priya@demo.com", "wrong_hash");

        // 7. Test duplicate email
        System.out.println("\n── Testing duplicate email...");
        register("Test","User","priya@demo.com","0000","pw","customer",null);

        System.out.println("\n✅ All tests done.");
    }
}