-- PostgreSQL Database Schema for AAA Robotics Attendance
-- Database Name: robotics_attendance

-- 1. Create Students Table
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  branch VARCHAR(50) DEFAULT 'Funmall',
  class VARCHAR(50) NOT NULL,
  session VARCHAR(50) DEFAULT 'Session 1',
  department VARCHAR(50) DEFAULT 'Saturday',
  email VARCHAR(150),
  photo TEXT,
  descriptor JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance_logs (
  id VARCHAR(80) PRIMARY KEY,
  student_id VARCHAR(30) REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(150) NOT NULL,
  class VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date DATE NOT NULL,
  status VARCHAR(30) NOT NULL,
  confidence FLOAT DEFAULT 1.0,
  mode VARCHAR(80) DEFAULT 'ID Check-in'
);

-- 3. Create Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Deleted Students (Trash Bin) Table
CREATE TABLE IF NOT EXISTS deleted_students (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  branch VARCHAR(50) DEFAULT 'Funmall',
  class VARCHAR(50) NOT NULL,
  department VARCHAR(50) DEFAULT 'Saturday',
  photo TEXT,
  deleted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Administrators Directory Table
CREATE TABLE IF NOT EXISTS admins (
  username VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(100) DEFAULT 'Administrator',
  email VARCHAR(150),
  phone VARCHAR(50),
  bio TEXT,
  photo TEXT,
  password VARCHAR(100) DEFAULT 'admin123',
  pin VARCHAR(10) DEFAULT '1234',
  is_admin BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_logs_date ON attendance_logs(date);
CREATE INDEX IF NOT EXISTS idx_logs_student ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch);
