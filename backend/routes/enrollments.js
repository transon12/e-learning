const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/enrollments/:courseId
// @desc    Enroll in a course
// @access  Private
router.post('/:courseId', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const user = await User.findById(req.user.id);

        // Check if already enrolled
        const alreadyEnrolled = user.enrolledCourses.some(
            enrollment => enrollment.course.toString() === course._id.toString()
        );

        if (alreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }

        // Add enrollment
        user.enrolledCourses.push({
            course: course._id,
            enrolledAt: new Date(),
            progress: 0,
            completedLessons: []
        });

        // Update course enrolled count
        course.enrolledCount += 1;

        await user.save();
        await course.save();

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course',
            data: {
                course: course._id,
                enrolledAt: new Date()
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
        const user = await User.findById(req.user.id);
        const course = await Course.findById(req.params.courseId)
            .populate('sections.lessons');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Find enrollment
        const enrollment = user.enrolledCourses.find(
            e => e.course.toString() === req.params.courseId
        );

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        // Check if lesson already completed
        if (enrollment.completedLessons.includes(req.params.lessonId)) {
            return res.json({
                success: true,
                message: 'Lesson already marked as completed',
                data: enrollment
            });
        }

        // Add to completed lessons
        enrollment.completedLessons.push(req.params.lessonId);

        // Calculate progress
        let totalLessons = 0;
        course.sections.forEach(section => {
            totalLessons += section.lessons.length;
        });

        enrollment.progress = Math.round(
            (enrollment.completedLessons.length / totalLessons) * 100
        );

        await user.save();

        res.json({
            success: true,
            message: 'Lesson marked as completed',
            data: enrollment
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
        const user = await User.findById(req.user.id);
        const course = await Course.findById(req.params.courseId)
            .populate('sections.lessons');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const enrollment = user.enrolledCourses.find(
            e => e.course.toString() === req.params.courseId
        );

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Not enrolled in this course'
            });
        }

        res.json({
            success: true,
            data: {
                progress: enrollment.progress,
                completedLessons: enrollment.completedLessons,
                enrolledAt: enrollment.enrolledAt
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

