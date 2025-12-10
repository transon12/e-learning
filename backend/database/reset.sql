-- Reset Database Script
-- WARNING: This will delete all data!

USE e_learning;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS completed_lessons;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS section_lessons;
DROP TABLE IF EXISTS lesson_resources;
DROP TABLE IF EXISTS course_learnings;
DROP TABLE IF EXISTS course_requirements;
DROP TABLE IF EXISTS course_skills;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS course_sections;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Now run schema.sql again to recreate tables

