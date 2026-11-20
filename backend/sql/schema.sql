CREATE DATABASE IF NOT EXISTS monastery_event_db;
USE monastery_event_db;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Monks & Participants)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    monastery VARCHAR(120) DEFAULT '',
    role ENUM('monk', 'participant') DEFAULT 'participant',
    photo LONGTEXT,
    join_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(80) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time VARCHAR(60) DEFAULT '09:00 AM - 05:00 PM',
    location VARCHAR(150) NOT NULL,
    organizer VARCHAR(100) DEFAULT 'Admin',
    capacity INT DEFAULT 100,
    registered INT DEFAULT 0,
    status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
    icon VARCHAR(20) DEFAULT '🪷',
    image LONGTEXT,
    color VARCHAR(30) DEFAULT 'gold',
    requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Event Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(20) PRIMARY KEY,
    event_id VARCHAR(20) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(120) NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    event_date DATE,
    event_location VARCHAR(150),
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    role VARCHAR(100) DEFAULT 'General Volunteer',
    status ENUM('active', 'on-leave', 'inactive') DEFAULT 'active',
    assigned_events JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Volunteer Calls Table
CREATE TABLE IF NOT EXISTS volunteer_calls (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    role VARCHAR(100) DEFAULT 'General Volunteer',
    description TEXT,
    needed INT DEFAULT 1,
    event_id VARCHAR(20) DEFAULT '',
    event_name VARCHAR(150) DEFAULT '',
    deadline VARCHAR(20) DEFAULT '',
    status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Volunteer Applications Table
CREATE TABLE IF NOT EXISTS volunteer_applications (
    id VARCHAR(20) PRIMARY KEY,
    call_id VARCHAR(20) NOT NULL,
    call_title VARCHAR(150) NOT NULL,
    user_id VARCHAR(20) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    message TEXT,
    availability VARCHAR(120) DEFAULT '',
    status ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending',
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (call_id) REFERENCES volunteer_calls(id) ON DELETE CASCADE
);

-- 8. Volunteer Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assignee VARCHAR(100) DEFAULT '',
    volunteer_id VARCHAR(20) DEFAULT '',
    is_open BOOLEAN DEFAULT FALSE,
    event_id VARCHAR(20) DEFAULT '',
    event_name VARCHAR(150) DEFAULT '',
    status ENUM('todo', 'in-progress', 'done') DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date VARCHAR(20) DEFAULT '',
    claimed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Donations Table (Supports both Money & In-Kind Product Donations)
CREATE TABLE IF NOT EXISTS donations (
    id VARCHAR(20) PRIMARY KEY,
    type ENUM('money', 'product') DEFAULT 'money',
    user_id VARCHAR(20) DEFAULT '',
    donor VARCHAR(120) NOT NULL,
    email VARCHAR(120) DEFAULT '',
    amount DECIMAL(12, 2) DEFAULT 0,
    method VARCHAR(60) DEFAULT 'QR Scan',
    txn_id VARCHAR(100) DEFAULT '',
    product_name VARCHAR(150) DEFAULT '',
    category VARCHAR(80) DEFAULT '',
    quantity INT DEFAULT 0,
    unit VARCHAR(30) DEFAULT '',
    est_value DECIMAL(12, 2) DEFAULT 0,
    pickup_address TEXT,
    description TEXT,
    event_id VARCHAR(20) DEFAULT '',
    event_name VARCHAR(150) DEFAULT 'General Donation',
    status ENUM('pending', 'received', 'declined') DEFAULT 'pending',
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info',
    icon VARCHAR(20) DEFAULT '🔔',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. System Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    org_name VARCHAR(150) DEFAULT 'Monastery of Bhutan',
    email VARCHAR(120) DEFAULT 'admin@monastery.bt',
    phone VARCHAR(40) DEFAULT '+975 2 123456',
    location VARCHAR(150) DEFAULT 'Thimphu, Bhutan',
    website VARCHAR(150) DEFAULT 'https://monastery.bt',
    email_notifications BOOLEAN DEFAULT TRUE,
    new_registrations BOOLEAN DEFAULT TRUE,
    donation_alerts BOOLEAN DEFAULT TRUE,
    task_reminders BOOLEAN DEFAULT FALSE,
    system_updates BOOLEAN DEFAULT TRUE,
    two_factor BOOLEAN DEFAULT FALSE
);

INSERT IGNORE INTO settings (id) VALUES (1);
