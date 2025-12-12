const express = require('express');
const { CourseSection, Course, Lesson } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses/:courseId/sections
// @desc    Lấy tất cả sections của một course
// @access  Public
router.get('/courses/:courseId/sections', async (req, res) => {
    try {
        const { courseId } = req.params;

        const sections = await CourseSection.findAll({
            where: { course_id: courseId },
            include: [{
                model: Lesson,
                as: 'lessons',
                through: {
                    attributes: ['order_index']
                }
            }],
            order: [['order_index', 'ASC']]
        });

        res.json({
            success: true,
            data: sections
        });
    } catch (error) {
        console.error('Error getting sections:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   POST /api/courses/:courseId/sections
// @desc    Tạo section mới
// @access  Private (Instructor/Admin)
router.post('/courses/:courseId/sections', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, order_index = 0 } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Tên section là bắt buộc'
            });
        }

        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền tạo section cho course này'
            });
        }

        const section = await CourseSection.create({
            course_id: courseId,
            title: title.trim(),
            order_index: order_index
        });

        res.status(201).json({
            success: true,
            message: 'Đã tạo section thành công',
            data: section
        });
    } catch (error) {
        console.error('Error creating section:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   PUT /api/courses/:courseId/sections/:sectionId
// @desc    Cập nhật section
// @access  Private (Instructor/Admin)
router.put('/courses/:courseId/sections/:sectionId', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;
        const { title, order_index } = req.body;

        const section = await CourseSection.findByPk(sectionId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section không tồn tại'
            });
        }

        if (section.course_id !== parseInt(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Section không thuộc course này'
            });
        }

        // Kiểm tra quyền
        if (section.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật section này'
            });
        }

        if (title !== undefined) {
            section.title = title.trim();
        }
        if (order_index !== undefined) {
            section.order_index = order_index;
        }

        await section.save();

        res.json({
            success: true,
            message: 'Đã cập nhật section',
            data: section
        });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   DELETE /api/courses/:courseId/sections/:sectionId
// @desc    Xóa section
// @access  Private (Instructor/Admin)
router.delete('/courses/:courseId/sections/:sectionId', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;

        const section = await CourseSection.findByPk(sectionId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section không tồn tại'
            });
        }

        if (section.course_id !== parseInt(courseId)) {
            return res.status(400).json({
                success: false,
                message: 'Section không thuộc course này'
            });
        }

        // Kiểm tra quyền
        if (section.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa section này'
            });
        }

        await section.destroy();

        res.json({
            success: true,
            message: 'Đã xóa section thành công'
        });
    } catch (error) {
        console.error('Error deleting section:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

module.exports = router;

