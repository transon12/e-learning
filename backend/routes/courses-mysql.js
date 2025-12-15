const express = require('express');
const { Op } = require('sequelize');
const { Course, User, Lesson, CourseSection } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { formatCoursesUrls, formatNestedCourseUrls, formatCourseUrls } = require('../utils/fileHelper');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, level, search, page = 1, limit = 12, instructor_id } = req.query;
        
        // Build where clause
        const where = {};
        
        // Only filter by status and isActive if not admin (for admin, show all courses)
        if (!req.user || req.user.role !== 'admin') {
            where.status = 'published';
            where.isActive = true;
        }
        
        if (category) {
            where.category = category;
        }
        
        if (level) {
            // Normalize level to lowercase for database query
            where.level = level.toLowerCase();
        }
        
        if (instructor_id) {
            where.instructor_id = parseInt(instructor_id);
        }
        
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: courses } = await Course.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'instructor',
                attributes: ['id', 'username', 'profile_first_name', 'profile_last_name']
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        // Format courses for frontend (capitalize level and format URLs)
        const formattedCourses = formatCoursesUrls(courses).map(course => {
            if (course.level) {
                course.level = course.level.charAt(0).toUpperCase() + course.level.slice(1);
            }
            return course;
        });

        res.json({
            success: true,
            count: formattedCourses.length,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            data: formattedCourses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/courses/:id
// @desc    Get single course by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const where = {
            status: 'published',
            isActive: true
        };

        // Check if id is numeric or slug
        if (isNaN(req.params.id)) {
            where.slug = req.params.id;
        } else {
            where.id = req.params.id;
        }

        const course = await Course.findOne({
            where,
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'username', 'profile_first_name', 'profile_last_name', 'profile_avatar']
                },
                {
                    model: CourseSection,
                    as: 'sections',
                    include: [{
                        model: Lesson,
                        as: 'lessons',
                        attributes: ['id', 'title', 'slug', 'durationMinutes', 'order_index', 'isPreview', 'isLocked']
                    }],
                    order: [['order_index', 'ASC']]
                }
            ]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Format course for frontend (capitalize level and format URLs)
        const courseData = formatNestedCourseUrls(course);
        if (courseData.level) {
            courseData.level = courseData.level.charAt(0).toUpperCase() + courseData.level.slice(1);
        }

        res.json({
            success: true,
            data: courseData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Instructor/Admin)
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        req.body.instructor_id = req.user.id;
        // Normalize level if provided (frontend sends 'Beginner', DB needs 'beginner')
        if (req.body.level) {
            req.body.level = req.body.level.toLowerCase();
        }
        const course = await Course.create(req.body);

        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Instructor/Admin)
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is the instructor or admin
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this course'
            });
        }

        // Normalize level if provided
        if (req.body.level) {
            req.body.level = req.body.level.toLowerCase();
        }
        await course.update(req.body);

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Instructor/Admin)
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user is the instructor or admin
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this course'
            });
        }

        await course.destroy();

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;

