-- ============================================================
-- Brew & Co — Drop and Recreate Database
-- Run this manually in MySQL CLI:  mysql -u root -p < brewco_db.sql
-- ============================================================

-- 1️⃣  DROP THE EXISTING DATABASE (ALL DATA WILL BE LOST)
DROP DATABASE IF EXISTS brewco;

-- 2️⃣  CREATE FRESH DATABASE
CREATE DATABASE brewco
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 3️⃣  SWITCH TO IT
USE brewco;

-- ============================================================
-- TABLE DEFINITIONS (in dependency order)
-- ============================================================

-- Users (all roles: CUSTOMER, CAFE_OWNER, WAITER, CHEF, ADMIN)
CREATE TABLE users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),
    phone_number    VARCHAR(20),
    gender          VARCHAR(10),
    date_of_birth   DATE,
    role            VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
    profile_image_url VARCHAR(500),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Addresses (polymorphic — each user can have multiple)
CREATE TABLE addresses (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id   BIGINT NOT NULL,
    street    VARCHAR(255) NOT NULL,
    city      VARCHAR(100) NOT NULL,
    state     VARCHAR(100),
    zip_code  VARCHAR(20),
    country   VARCHAR(100) DEFAULT 'India',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Government Proofs (uploaded by staff during registration)
CREATE TABLE government_proofs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    proof_type      VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    document_url    VARCHAR(500),
    verified        BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Work Experience (for staff: chefs, waiters)
CREATE TABLE work_experiences (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    company_name  VARCHAR(200),
    role          VARCHAR(100),
    years         INT,
    description   TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Email Verification OTPs
CREATE TABLE email_verifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    otp         VARCHAR(6) NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at  DATETIME NOT NULL,
    is_used     BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Refresh Tokens (one per user, for JWT rotation)
CREATE TABLE refresh_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL UNIQUE,
    token      VARCHAR(500) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cafes
CREATE TABLE cafes (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id          BIGINT NOT NULL,
    name              VARCHAR(200) NOT NULL,
    description       TEXT,
    address           VARCHAR(500) NOT NULL,
    city              VARCHAR(100) NOT NULL,
    state             VARCHAR(100),
    zip_code          VARCHAR(20),
    contact_number    VARCHAR(20),
    email             VARCHAR(255),
    opening_time      TIME,
    closing_time      TIME,
    is_verified       BOOLEAN DEFAULT FALSE,
    is_active         BOOLEAN DEFAULT TRUE,
    avg_rating        DECIMAL(3,2) DEFAULT 0.00,
    total_reviews     INT DEFAULT 0,
    profile_image_url VARCHAR(500),
    gst_number        VARCHAR(50),
    fssai_license     VARCHAR(50),
    food_license_number VARCHAR(50),
    created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cafe Documents (licenses, images uploaded by owner)
CREATE TABLE cafe_documents (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    cafe_id         BIGINT NOT NULL,
    document_type   VARCHAR(50) NOT NULL,
    document_url    VARCHAR(500) NOT NULL,
    uploaded_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cafe Tables
CREATE TABLE cafe_tables (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    cafe_id      BIGINT NOT NULL,
    table_number INT NOT NULL,
    capacity     INT NOT NULL DEFAULT 4,
    table_type   VARCHAR(30) DEFAULT 'STANDARD',
    status       VARCHAR(20) DEFAULT 'AVAILABLE',
    is_active    BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Staff Assignments (waiters/chefs assigned to cafes)
CREATE TABLE staff_assignments (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    cafe_id      BIGINT NOT NULL,
    staff_id     BIGINT NOT NULL,
    role         VARCHAR(20) NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    assigned_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Menu Categories
CREATE TABLE menu_categories (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    cafe_id       BIGINT NOT NULL,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    display_order INT DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Menu Items
CREATE TABLE menu_items (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id   BIGINT NOT NULL,
    cafe_id       BIGINT NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    price         DECIMAL(10,2) NOT NULL,
    image_url     VARCHAR(500),
    type          VARCHAR(20) DEFAULT 'VEG',
    is_available  BOOLEAN DEFAULT TRUE,
    is_addon      BOOLEAN DEFAULT FALSE,
    avg_rating    DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Bookings (table reservations)
CREATE TABLE bookings (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_ref      VARCHAR(50) UNIQUE,
    cafe_id          BIGINT NOT NULL,
    customer_id      BIGINT NOT NULL,
    table_id         BIGINT,
    booking_date     DATE NOT NULL,
    start_time       TIME NOT NULL,
    end_time         TIME,
    number_of_guests INT NOT NULL DEFAULT 2,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    special_requests TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES cafe_tables(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Orders (note: table name `orders` — SQL reserved keyword, quoted in native queries)
CREATE TABLE `orders` (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_ref           VARCHAR(50) UNIQUE,
    customer_id         BIGINT NOT NULL,
    cafe_id             BIGINT NOT NULL,
    table_id            BIGINT,
    assigned_waiter_id  BIGINT,
    assigned_chef_id    BIGINT,
    order_type          VARCHAR(20) NOT NULL DEFAULT 'DINE_IN',
    status              VARCHAR(30) NOT NULL DEFAULT 'PLACED',
    subtotal            DECIMAL(10,2) DEFAULT 0.00,
    tax_amount          DECIMAL(10,2) DEFAULT 0.00,
    discount_amount     DECIMAL(10,2) DEFAULT 0.00,
    grand_total         DECIMAL(10,2) DEFAULT 0.00,
    payment_status      VARCHAR(20) DEFAULT 'PENDING',
    special_instructions TEXT,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES cafe_tables(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_waiter_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_chef_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Order Items
CREATE TABLE order_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id     BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity     INT NOT NULL DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,
    notes        TEXT,
    FOREIGN KEY (order_id) REFERENCES `orders`(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Order Status History (audit trail)
CREATE TABLE order_status_history (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id   BIGINT NOT NULL,
    status     VARCHAR(30) NOT NULL,
    changed_by BIGINT,
    notes      TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES `orders`(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Payments
CREATE TABLE payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    payment_method  VARCHAR(30) NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING',
    transaction_id  VARCHAR(200),
    gateway_response TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES `orders`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Audit Logs
CREATE TABLE audit_logs (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT,
    action     VARCHAR(100) NOT NULL,
    entity     VARCHAR(100),
    entity_id  BIGINT,
    details    TEXT,
    ip_address VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- ✅ Database created — tables are ready for Hibernate ddl-auto=update
-- ============================================================
SELECT 'brewco database created successfully with all 18 tables!' AS status;
