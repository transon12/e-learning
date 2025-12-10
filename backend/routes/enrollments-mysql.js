const express = require('express');
const { Enrollment, CompletedLesson, Course, Lesson, CourseSection } = require('../models');
const { protect } = require('../middleware/auth');

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

        // Create enrollment
        const enrollment = await Enrollment.create({
            user_id: req.user.id,
            course_id: req.params.courseId,
            progress: 0
        });

        // Update course enrolled count
        await course.increment('enrolledCount');

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: {
                course: course.id,
                enrolledAt: enrollment.createdAt
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
                completedLessons: completedLessonIds,
                enrolledAt: enrollment.createdAt
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

