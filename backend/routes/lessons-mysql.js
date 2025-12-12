const express = require('express');
const { Op } = require('sequelize');
const { Lesson, Course, CourseSection } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/lessons/course/:courseId
// @desc    Get all lessons for a course
// @access  Public
router.get('/course/:courseId', async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.courseId, {
            include: [{
                model: CourseSection,
                as: 'sections',
                include: [{
                    model: Lesson,
                    as: 'lessons',
                    attributes: ['id', 'title', 'slug', 'duration', 'order_index', 'isPreview', 'isLocked', 'viewCount'],
                    order: [['order_index', 'ASC']]
                }],
                order: [['order_index', 'ASC']]
            }]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: course.sections
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/lessons
// @desc    Get all lessons (with optional filters)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { course, limit = 100, offset = 0 } = req.query;
        const where = {};

        if (course) {
            where.course_id = course;
        }

        const lessons = await Lesson.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['order_index', 'ASC'], ['createdAt', 'DESC']],
            attributes: ['id', 'title', 'slug', 'description', 'duration', 'order_index', 'status', 'course_id', 'section_id']
        });

        res.json({
            success: true,
            data: lessons,
            total: await Lesson.count({ where })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/lessons/:id
// @desc    Get single lesson by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const where = {
            status: 'published'
        };

        if (isNaN(req.params.id)) {
            where.slug = req.params.id;
        } else {
            where.id = req.params.id;
        }

        const { User } = require('../models');
        const lesson = await Lesson.findOne({
            where,
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'title', 'slug', 'instructor_id'],
                include: [{
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'username']
                }]
            }]
        });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Increment view count
        await lesson.incrementView();

        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/lessons
// @desc    Create new lesson
// @access  Private (Instructor/Admin)
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { course: courseId, section_id, order_index } = req.body;

        // Verify course exists and user is instructor
        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add lessons to this course'
            });
        }

        const lesson = await Lesson.create({
            ...req.body,
            course_id: courseId,
            section_id: section_id || null,
            order_index: order_index || 0
        });

        // Thêm vào bảng section_lessons nếu có section_id
        if (section_id) {
            const { SectionLesson } = require('../models');
            try {
                await SectionLesson.findOrCreate({
                    where: {
                        section_id: section_id,
                        lesson_id: lesson.id
                    },
                    defaults: {
                        order_index: order_index || 0
                    }
                });
            } catch (error) {
                console.error('Error adding to section_lessons:', error);
                // Không throw error, vì lesson đã được tạo thành công
            }
        }

        // Update course total lessons
        const lessonCount = await Lesson.count({ where: { course_id: courseId } });
        await course.update({ totalLessons: lessonCount });

        res.status(201).json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/lessons/:id
// @desc    Update lesson
// @access  Private (Instructor/Admin)
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const lesson = await Lesson.findByPk(req.params.id, {
            include: [{
                model: Course,
                as: 'course'
            }]
        });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Check authorization
        if (lesson.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this lesson'
            });
        }

        await lesson.update(req.body);

        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/lessons/:id
// @desc    Delete lesson
// @access  Private (Instructor/Admin)
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const lesson = await Lesson.findByPk(req.params.id, {
            include: [{
                model: Course,
                as: 'course'
            }]
        });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Check authorization
        if (lesson.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this lesson'
            });
        }

        const courseId = lesson.course_id;
        await lesson.destroy();

        // Update course total lessons
        const course = await Course.findByPk(courseId);
        if (course) {
            const lessonCount = await Lesson.count({ where: { course_id: courseId } });
            await course.update({ totalLessons: lessonCount });
        }

        res.json({
            success: true,
            message: 'Lesson deleted successfully'
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

