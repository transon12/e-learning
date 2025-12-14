-- Sample Data for E-Learning Database (PostgreSQL)
-- Make sure you're connected to the e_learning database
-- \c e_learning;

-- Sample Courses
INSERT INTO courses (title, slug, description, short_description, instructor_id, category, thumbnail, price, is_free, level, status, total_lessons) VALUES
('HTML Course for Beginners', 'html-course-for-beginners', 
 'Start at the beginning by learning HTML basics — an important foundation for building and editing web pages.',
 'Learn HTML fundamentals and build your first web pages',
 2, 'Web Development', 'img/course-1.jpg', 0, TRUE, 'beginner', 'published', 4),
('Python Programming', 'python-programming',
 'Learn Python programming from scratch with hands-on projects and real-world examples.',
 'Master Python programming language',
 2, 'Python', 'img/course-4.jpg', 299, FALSE, 'beginner', 'published', 6),
('JavaScript Fundamentals', 'javascript-fundamentals',
 'Introduction to JavaScript programming for web development.',
 'Learn JavaScript basics',
 2, 'Web Development', 'img/course-3.jpg', 0, TRUE, 'beginner', 'published', 5)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;

-- Sample Course Sections
INSERT INTO course_sections (course_id, title, order_index) VALUES
(1, 'Elements and Structure', 1),
(1, 'Tables', 2),
(1, 'Forms', 3),
(1, 'Semantic HTML', 4)
ON CONFLICT DO NOTHING;

-- Sample Lessons
INSERT INTO lessons (title, slug, description, course_id, section_id, order_index, video_url, video_type, duration_minutes, status) VALUES
('Introduction to HTML', 'introduction-to-html',
 'Learn the basics of HTML structure and syntax',
 1, 1, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'youtube', 15, 'published'),
('HTML Document Standards', 'html-document-standards',
 'Understanding HTML5 document structure and standards',
 1, 1, 2, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'youtube', 12, 'published'),
('HTML Tables', 'html-tables',
 'Learn how to create and style HTML tables',
 1, 2, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'youtube', 20, 'published'),
('HTML Forms', 'html-forms',
 'Create interactive forms with HTML',
 1, 3, 1, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'youtube', 25, 'published')
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title;

-- Link lessons to sections
INSERT INTO section_lessons (section_id, lesson_id, order_index) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1),
(3, 4, 1)
ON CONFLICT (section_id, lesson_id) DO UPDATE SET order_index = EXCLUDED.order_index;

