-- E-Learning Database Schema for MySQL
-- Database: e_learning

CREATE DATABASE IF NOT EXISTS e_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE e_learning;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    profile_firstName VARCHAR(50),
    profile_lastName VARCHAR(50),
    profile_avatar VARCHAR(255),
    profile_bio TEXT,
    profile_phone VARCHAR(20),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    shortDescription VARCHAR(200),
    instructor_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    thumbnail VARCHAR(255) DEFAULT 'img/course-default.jpg',
    price DECIMAL(10, 2) DEFAULT 0.00,
    isFree BOOLEAN DEFAULT TRUE,
    level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    language VARCHAR(50) DEFAULT 'English',
    duration DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'in hours',
    totalLessons INT DEFAULT 0,
    ratings_average DECIMAL(3, 2) DEFAULT 0.00,
    ratings_count INT DEFAULT 0,
    enrolledCount INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_instructor (instructor_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Sections Table
CREATE TABLE IF NOT EXISTS course_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    course_id INT NOT NULL,
    section_id INT,
    order_index INT DEFAULT 0,
    videoUrl VARCHAR(500),
    videoType ENUM('youtube', 'vimeo', 'local', 'external') DEFAULT 'youtube',
    duration INT DEFAULT 0 COMMENT 'in minutes',
    content TEXT,
    isPreview BOOLEAN DEFAULT FALSE,
    isLocked BOOLEAN DEFAULT FALSE,
    viewCount INT DEFAULT 0,
    status ENUM('draft', 'published') DEFAULT 'draft',
    -- Uploaded files
    file_video_filename VARCHAR(255),
    file_video_path VARCHAR(500),
    file_video_size BIGINT,
    file_video_mimetype VARCHAR(100),
    file_audio_filename VARCHAR(255),
    file_audio_path VARCHAR(500),
    file_audio_size BIGINT,
    file_audio_mimetype VARCHAR(100),
    file_pdf_filename VARCHAR(255),
    file_pdf_path VARCHAR(500),
    file_pdf_size BIGINT,
    file_pdf_mimetype VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE SET NULL,
    INDEX idx_course (course_id),
    INDEX idx_section (section_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Section Lessons Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS section_lessons (
    section_id INT NOT NULL,
    lesson_id INT NOT NULL,
    order_index INT DEFAULT 0,
    PRIMARY KEY (section_id, lesson_id),
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress DECIMAL(5, 2) DEFAULT 0.00 COMMENT 'percentage 0-100',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    enrolledAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Completed Lessons Table
CREATE TABLE IF NOT EXISTS completed_lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    lesson_id INT NOT NULL,
    completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY unique_completion (enrollment_id, lesson_id),
    INDEX idx_enrollment (enrollment_id),
    INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Skills Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS course_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    skill VARCHAR(100) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Requirements Table
CREATE TABLE IF NOT EXISTS course_requirements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    requirement TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course What You Will Learn Table
CREATE TABLE IF NOT EXISTS course_learnings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    learning TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lesson Resources Table
CREATE TABLE IF NOT EXISTS lesson_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('pdf', 'code', 'link', 'file') NOT NULL,
    url VARCHAR(500) NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Admin User (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@secretcoder.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Sample Instructor
INSERT INTO users (username, email, password, role, profile_first_name, profile_last_name) VALUES 
('instructor1', 'instructor@secretcoder.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5', 'instructor', 'John', 'Doe')
ON DUPLICATE KEY UPDATE username=username;

