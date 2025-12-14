-- E-Learning Database Schema (idempotent, snake_case)

-- ===== ENUM types (recreate safely) =====
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');

DROP TYPE IF EXISTS course_level CASCADE;
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');

DROP TYPE IF EXISTS course_status CASCADE;
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');

DROP TYPE IF EXISTS enrollment_status CASCADE;
CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected');

DROP TYPE IF EXISTS lesson_video_type CASCADE;
CREATE TYPE lesson_video_type AS ENUM ('youtube', 'vimeo', 'local', 'external');

DROP TYPE IF EXISTS lesson_status CASCADE;
CREATE TYPE lesson_status AS ENUM ('draft', 'published');

DROP TYPE IF EXISTS resource_type CASCADE;
CREATE TYPE resource_type AS ENUM ('pdf', 'code', 'link', 'file');

-- ===== Utility function: update updated_at =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ===== users =====
CREATE TABLE IF NOT EXISTS users (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username           VARCHAR(50) NOT NULL UNIQUE,
  email              VARCHAR(100) NOT NULL UNIQUE,
  password           VARCHAR(255) NOT NULL,
  role               user_role NOT NULL DEFAULT 'student',
  profile_first_name VARCHAR(50),
  profile_last_name  VARCHAR(50),
  profile_avatar     VARCHAR(255),
  profile_bio        TEXT,
  profile_phone      VARCHAR(20),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- trigger for users
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===== courses =====
CREATE TABLE IF NOT EXISTS courses (
  id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE,
  description      TEXT,
  short_description VARCHAR(200),
  instructor_id    INTEGER,
  category         VARCHAR(50) NOT NULL,
  thumbnail        VARCHAR(255) NOT NULL DEFAULT 'img/course-default.jpg',
  price            NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_free          BOOLEAN NOT NULL DEFAULT TRUE,
  level            course_level NOT NULL DEFAULT 'beginner',
  language         VARCHAR(50) NOT NULL DEFAULT 'english',
  duration_hours   NUMERIC(6,2) NOT NULL DEFAULT 0.00, -- hours
  total_lessons    INTEGER NOT NULL DEFAULT 0,
  ratings_average  NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (ratings_average >= 0),
  ratings_count    INTEGER NOT NULL DEFAULT 0 CHECK (ratings_count >= 0),
  enrolled_count   INTEGER NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
  status           course_status NOT NULL DEFAULT 'draft',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- trigger for courses
DROP TRIGGER IF EXISTS trg_courses_updated_at ON courses;
CREATE TRIGGER trg_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===== course_sections =====
CREATE TABLE IF NOT EXISTS course_sections (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id   INTEGER NOT NULL,
  title       VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_sections_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course_sections_course ON course_sections(course_id);

DROP TRIGGER IF EXISTS trg_course_sections_updated_at ON course_sections;
CREATE TRIGGER trg_course_sections_updated_at
BEFORE UPDATE ON course_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===== lessons =====
CREATE TABLE IF NOT EXISTS lessons (
  id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title              VARCHAR(255) NOT NULL,
  slug               VARCHAR(255) UNIQUE,
  description        TEXT,
  course_id          INTEGER NOT NULL,
  section_id         INTEGER,
  order_index        INTEGER NOT NULL DEFAULT 0,
  video_url          VARCHAR(500),
  video_type         lesson_video_type NOT NULL DEFAULT 'youtube',
  duration_minutes   INTEGER NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  content            TEXT,
  is_preview         BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked          BOOLEAN NOT NULL DEFAULT FALSE,
  view_count         INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  status             lesson_status NOT NULL DEFAULT 'draft',
  file_video_filename VARCHAR(255),
  file_video_path     VARCHAR(500),
  file_video_size     BIGINT CHECK (file_video_size IS NULL OR file_video_size >= 0),
  file_video_mimetype VARCHAR(100),
  file_audio_filename VARCHAR(255),
  file_audio_path     VARCHAR(500),
  file_audio_size     BIGINT CHECK (file_audio_size IS NULL OR file_audio_size >= 0),
  file_audio_mimetype VARCHAR(100),
  file_pdf_filename   VARCHAR(255),
  file_pdf_path       VARCHAR(500),
  file_pdf_size       BIGINT CHECK (file_pdf_size IS NULL OR file_pdf_size >= 0),
  file_pdf_mimetype   VARCHAR(100),
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_lessons_section FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons;
CREATE TRIGGER trg_lessons_updated_at
BEFORE UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===== section_lessons junction (if you need explicit many-to-many) =====
CREATE TABLE IF NOT EXISTS section_lessons (
  section_id  INTEGER NOT NULL,
  lesson_id   INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, lesson_id),
  CONSTRAINT fk_section_lessons_section FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_section_lessons_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- ===== enrollments =====
CREATE TABLE IF NOT EXISTS enrollments (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  course_id   INTEGER NOT NULL,
  progress    NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
  status      enrollment_status NOT NULL DEFAULT 'pending',
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON enrollments;
CREATE TRIGGER trg_enrollments_updated_at
BEFORE UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===== completed_lessons =====
CREATE TABLE IF NOT EXISTS completed_lessons (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  enrollment_id INTEGER NOT NULL,
  lesson_id     INTEGER NOT NULL,
  completed_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_completed_lessons_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  CONSTRAINT fk_completed_lessons_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  CONSTRAINT uq_completed_lessons UNIQUE (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_completed_lessons_enrollment ON completed_lessons(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_completed_lessons_lesson ON completed_lessons(lesson_id);

-- ===== course_skills =====
CREATE TABLE IF NOT EXISTS course_skills (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id INTEGER NOT NULL,
  skill     VARCHAR(100) NOT NULL,
  CONSTRAINT fk_course_skills_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course_skills_course ON course_skills(course_id);

-- ===== course_requirements =====
CREATE TABLE IF NOT EXISTS course_requirements (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id INTEGER NOT NULL,
  requirement TEXT NOT NULL,
  CONSTRAINT fk_course_requirements_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course_requirements_course ON course_requirements(course_id);

-- ===== course_learnings (what you'll learn) =====
CREATE TABLE IF NOT EXISTS course_learnings (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id INTEGER NOT NULL,
  learning  TEXT NOT NULL,
  CONSTRAINT fk_course_learnings_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_course_learnings_course ON course_learnings(course_id);

-- ===== lesson_resources =====
CREATE TABLE IF NOT EXISTS lesson_resources (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  lesson_id INTEGER NOT NULL,
  title     VARCHAR(255) NOT NULL,
  type      resource_type NOT NULL,
  url       VARCHAR(500) NOT NULL,
  CONSTRAINT fk_lesson_resources_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson ON lesson_resources(lesson_id);

-- ===== Sample data (safer instructions) =====
-- NOTE: Do NOT store plaintext passwords. Use a proper bcrypt hash.
-- If you want to generate a bcrypt hash in Postgres (requires pgcrypto), you can:
--   SELECT crypt('your_password', gen_salt('bf'));
-- Then copy the resulting hash into the password column.
-- Example INSERTs below assume you already have hashed passwords.

INSERT INTO users (username, email, password, role, profile_first_name, profile_last_name)
VALUES
  ('admin', 'admin@secretcoder.com', '$2b$12$example_hash_here_replace_with_real', 'admin', NULL, NULL)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, email, password, role, profile_first_name, profile_last_name)
VALUES
  ('instructor1', 'instructor@secretcoder.com', '$2b$12$example_hash_here_replace_with_real', 'instructor', 'John', 'Doe')
ON CONFLICT (username) DO NOTHING;
