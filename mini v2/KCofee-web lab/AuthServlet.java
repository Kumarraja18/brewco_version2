/**
 * ============================================================
 * AUTH SERVLET — Handles Registration & Login
 * ============================================================
 * Handles HTTP requests from the web form and stores/retrieves
 * data from MySQL database via JDBC.
 * 
 * Endpoints:
 *   POST /auth/register   — Register new user
 *   POST /auth/login      — Authenticate user
 * 
 * Deploy as part of WAR file in Apache Tomcat
 * ============================================================
 */

import java.io.*;
import java.sql.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class AuthServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json; charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        String path = request.getPathInfo();
        
        if (path != null && path.equals("/register")) {
            handleRegister(request, response);
        } else if (path != null && path.equals("/login")) {
            handleLogin(request, response);
        } else {
            sendJsonError(response, 400, "Invalid endpoint");
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    // ========================================================
    // REGISTER — Handle registration request
    // ========================================================
    private void handleRegister(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            // Read JSON from request body
            StringBuilder sb = new StringBuilder();
            BufferedReader br = request.getReader();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            
            String json = sb.toString();
            Map<String, String> data = parseJson(json);
            
            String firstName = data.get("firstName");
            String lastName = data.get("lastName");
            String email = data.get("email");
            String phone = data.get("phone");
            String password = data.get("password");
            
            // Validation
            if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(email) || isEmpty(phone)) {
                sendJsonError(response, 400, "All fields required");
                return;
            }
            if (!email.contains("@")) {
                sendJsonError(response, 400, "Invalid email format");
                return;
            }
            if (password.length() < 8 || password.length() > 16) {
                sendJsonError(response, 400, "Password must be 8-16 characters");
                return;
            }
            if (!password.matches(".*[A-Z].*")) {
                sendJsonError(response, 400, "Password needs uppercase letter");
                return;
            }
            if (!password.matches(".*[a-z].*")) {
                sendJsonError(response, 400, "Password needs lowercase letter");
                return;
            }
            if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
                sendJsonError(response, 400, "Password needs special character");
                return;
            }
            
            // Register in database
            if (registerUserInDB(firstName, lastName, email, phone, password)) {
                sendJsonSuccess(response, "Registration successful");
            } else {
                sendJsonError(response, 500, "Registration failed");
            }
        } catch (Exception e) {
            sendJsonError(response, 500, "Server error: " + e.getMessage());
        }
    }

    // ========================================================
    // LOGIN — Handle login request
    // ========================================================
    private void handleLogin(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader br = request.getReader();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            
            String json = sb.toString();
            Map<String, String> data = parseJson(json);
            
            String email = data.get("email");
            String password = data.get("password");
            
            if (isEmpty(email) || isEmpty(password)) {
                sendJsonError(response, 400, "Email and password required");
                return;
            }
            
            // Authenticate in database
            Map<String, String> user = authenticateUserInDB(email, password);
            if (user != null) {
                sendJsonUser(response, user);
            } else {
                sendJsonError(response, 401, "Invalid credentials");
            }
        } catch (Exception e) {
            sendJsonError(response, 500, "Server error: " + e.getMessage());
        }
    }

    // ========================================================
    // DATABASE — Register user
    // ========================================================
    private boolean registerUserInDB(String firstName, String lastName, String email, 
                                      String phone, String password) {
        String sql = "INSERT INTO users (id, role, first_name, last_name, email, phone, password, is_profile_complete) " +
                     "VALUES (?,?,?,?,?,?,?,?)";
        try (Connection conn = JdbcConnection.getConnection(); 
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, generateId());
            ps.setString(2, "customer");
            ps.setString(3, firstName);
            ps.setString(4, lastName);
            ps.setString(5, email);
            ps.setString(6, phone);
            ps.setString(7, password);
            ps.setBoolean(8, true);
            
            ps.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("[ERROR] Registration DB error: " + e.getMessage());
            return false;
        }
    }

    // ========================================================
    // DATABASE — Authenticate user
    // ========================================================
    private Map<String, String> authenticateUserInDB(String email, String password) {
        String sql = "SELECT id, first_name, last_name, email, role, phone FROM users WHERE email = ? AND password = ? AND role = ?";
        try (Connection conn = JdbcConnection.getConnection(); 
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, email);
            ps.setString(2, password);
            ps.setString(3, "customer");
            
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Map<String, String> user = new HashMap<>();
                user.put("id", rs.getString("id"));
                user.put("firstName", rs.getString("first_name"));
                user.put("lastName", rs.getString("last_name"));
                user.put("email", rs.getString("email"));
                user.put("role", rs.getString("role"));
                user.put("phone", rs.getString("phone"));
                return user;
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Login DB error: " + e.getMessage());
        }
        return null;
    }

    // ========================================================
    // HELPERS
    // ========================================================
    private String generateId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private Map<String, String> parseJson(String json) {
        Map<String, String> map = new HashMap<>();
        json = json.replace("{", "").replace("}", "").replace("\"", "");
        String[] pairs = json.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            if (keyValue.length == 2) {
                map.put(keyValue[0].trim(), keyValue[1].trim());
            }
        }
        return map;
    }

    private void sendJsonSuccess(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write("{\"success\":true,\"message\":\"" + message + "\"}");
    }

    private void sendJsonUser(HttpServletResponse response, Map<String, String> user) throws IOException {
        response.setStatus(HttpServletResponse.SC_OK);
        StringBuilder json = new StringBuilder("{\"success\":true,");
        json.append("\"user\":{");
        boolean first = true;
        for (Map.Entry<String, String> entry : user.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
            first = false;
        }
        json.append("}}");
        response.getWriter().write(json.toString());
    }

    private void sendJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.getWriter().write("{\"success\":false,\"error\":\"" + message + "\"}");
    }
}
