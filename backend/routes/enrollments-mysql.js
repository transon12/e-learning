const express = require('express');
const { Enrollment, CompletedLesson, Course, Lesson, CourseSection, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/enrollments/:courseId
// @desc    Enroll in a course
// @access  Private
router.post('/:courseId', protect, async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            where: {
                user_id: req.user.id,
                course_id: req.params.courseId
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }

        // Create enrollment with pending status
        const enrollment = await Enrollment.create({
            user_id: req.user.id,
            course_id: req.params.courseId,
            progress: 0,
            status: 'pending'
        });

        // Do not increase enrolledCount until approved

        res.status(201).json({
            success: true,
            message: 'Enrollment request submitted. Waiting for admin approval.',
            data: {
                course: course.id,
                status: 'pending',
                enrolledAt: enrollment.enrolledAt || enrollment.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/enrollments/:courseId/complete-lesson/:lessonId
// @desc    Mark lesson as completed
// @access  Private
router.post('/:courseId/complete-lesson/:lessonId', protect, async (req, res) => {
    try {
        // Admin có thể mark complete mà không cần enrollment
        if (req.user.role === 'admin') {
            return res.json({
                success: true,
                message: 'Lesson marked as completed (Admin)',
                data: {
                    progress: 100,
                    status: 'approved'
                }
            });
        }

        const enrollment = await Enrollment.findOne({
            where: {
                user_id: req.user.id,
                course_id: req.params.courseId
            }
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Must be approved to complete lessons
        if (enrollment.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: `Enrollment is ${enrollment.status}. Please wait for admin approval.`
            });
        }

        // Check if lesson already completed
        const existingCompletion = await CompletedLesson.findOne({
            where: {
                enrollment_id: enrollment.id,
                lesson_id: req.params.lessonId
            }
        });

        if (existingCompletion) {
            return res.json({
                success: true,
                message: 'Lesson already marked as completed',
                data: enrollment
            });
        }

        // Add to completed lessons
        await CompletedLesson.create({
            enrollment_id: enrollment.id,
            lesson_id: req.params.lessonId
        });

        // Calculate progress
        const course = await Course.findByPk(req.params.courseId, {
            include: [{
                model: CourseSection,
                as: 'sections',
                include: [{
                    model: Lesson,
                    as: 'lessons'
                }]
            }]
        });

        let totalLessons = 0;
        course.sections.forEach(section => {
            totalLessons += section.lessons.length;
        });

        const completedCount = await CompletedLesson.count({
            where: { enrollment_id: enrollment.id }
        });

        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        await enrollment.update({ progress });

        res.json({
            success: true,
            message: 'Lesson marked as completed',
            data: {
                ...enrollment.toJSON(),
                progress
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/enrollments/:courseId/progress
// @desc    Get course progress
// @access  Private
router.get('/:courseId/progress', protect, async (req, res) => {
    try {
        // Admin có thể xem progress mà không cần enrollment
        if (req.user.role === 'admin') {
            return res.json({
                success: true,
                data: {
                    progress: 100,
                    status: 'approved',
                    completedLessons: [],
                    enrolledAt: new Date()
                }
            });
        }

        const enrollment = await Enrollment.findOne({
            where: {
                user_id: req.user.id,
                course_id: req.params.courseId
            },
            include: [{
                model: CompletedLesson,
                as: 'completedLessons',
                attributes: ['lesson_id']
            }]
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        const completedLessonIds = enrollment.completedLessons.map(cl => cl.lesson_id);

        res.json({
            success: true,
            data: {
                progress: enrollment.progress,
                status: enrollment.status,
                completedLessons: completedLessonIds,
                enrolledAt: enrollment.enrolledAt || enrollment.createdAt
            }
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

// @route   GET /api/enrollments
// @desc    Get enrollment requests (Admin)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, course_id, user_id } = req.query;
        const where = {};
        if (status) where.status = status;
        if (course_id) where.course_id = course_id;
        if (user_id) where.user_id = user_id;

        const enrollments = await Enrollment.findAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'email', 'profile_first_name', 'profile_last_name'] },
                { model: Course, as: 'course', attributes: ['id', 'title', 'category'] }
            ],
            order: [['enrolledAt', 'DESC']]
        });

        res.json({ success: true, data: enrollments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/enrollments/:enrollmentId/approve
// @desc    Approve enrollment request
// @access  Private/Admin
router.put('/:enrollmentId/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const enrollment = await Enrollment.findByPk(req.params.enrollmentId, { include: [{ model: Course, as: 'course' }] });
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }
        if (enrollment.status === 'approved') {
            return res.status(400).json({ success: false, message: 'Enrollment already approved' });
        }

        const wasPending = enrollment.status === 'pending';
        await enrollment.update({ status: 'approved' });
        if (wasPending && enrollment.course) {
            await enrollment.course.increment('enrolledCount');
        }

        res.json({ success: true, message: 'Enrollment approved successfully', data: enrollment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/enrollments/:enrollmentId/reject
// @desc    Reject enrollment request
// @access  Private/Admin
router.put('/:enrollmentId/reject', protect, authorize('admin'), async (req, res) => {
    try {
        const enrollment = await Enrollment.findByPk(req.params.enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }
        if (enrollment.status === 'rejected') {
            return res.status(400).json({ success: false, message: 'Enrollment already rejected' });
        }

        if (enrollment.status === 'approved') {
            const course = await Course.findByPk(enrollment.course_id);
            if (course && course.enrolledCount > 0) {
                await course.decrement('enrolledCount');
            }
        }

        await enrollment.update({ status: 'rejected' });
        res.json({ success: true, message: 'Enrollment rejected', data: enrollment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

