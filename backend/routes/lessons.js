const express = require('express');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/lessons/course/:courseId
// @desc    Get all lessons for a course
// @access  Public
router.get('/course/:courseId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId)
            .populate({
                path: 'sections.lessons',
                select: 'title slug duration order isPreview isLocked viewCount'
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

// @route   GET /api/lessons/:id
// @desc    Get single lesson by ID or slug
// @access  Public (but may check enrollment)
router.get('/:id', async (req, res) => {
    try {
        const lesson = await Lesson.findOne({
            $or: [
                { _id: req.params.id },
                { slug: req.params.id }
            ],
            status: 'published'
        })
        .populate('course', 'title slug instructor');

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
        const { course: courseId, section, order } = req.body;

        // Verify course exists and user is instructor
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add lessons to this course'
            });
        }

        const lesson = await Lesson.create(req.body);

        // Add lesson to course section
        if (section && course.sections.id(section)) {
            course.sections.id(section).lessons.push(lesson._id);
            await course.updateTotalLessons();
            await course.save();
        }

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
        const lesson = await Lesson.findById(req.params.id)
            .populate('course');

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Check authorization
        if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this lesson'
            });
        }

        const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: updatedLesson
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
        const lesson = await Lesson.findById(req.params.id)
            .populate('course');

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        // Check authorization
        if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this lesson'
            });
        }

        // Remove from course sections
        const course = await Course.findById(lesson.course._id);
        course.sections.forEach(section => {
            section.lessons = section.lessons.filter(
                lessonId => lessonId.toString() !== lesson._id.toString()
            );
        });
        await course.updateTotalLessons();
        await course.save();

        await lesson.deleteOne();

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

