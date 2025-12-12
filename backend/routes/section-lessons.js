const express = require('express');
const { SectionLesson, CourseSection, Lesson, Course } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/section-lessons
// @desc    Thêm lesson vào section
// @access  Private (Instructor/Admin)
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { section_id, lesson_id, order_index = 0 } = req.body;

        // Validate input
        if (!section_id || !lesson_id) {
            return res.status(400).json({
                success: false,
                message: 'section_id và lesson_id là bắt buộc'
            });
        }

        // Kiểm tra section và lesson tồn tại
        const section = await CourseSection.findByPk(section_id, {
            include: [{ model: Course, as: 'course' }]
        });
        const lesson = await Lesson.findByPk(lesson_id);

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section không tồn tại'
            });
        }

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson không tồn tại'
            });
        }

        // Kiểm tra quyền: chỉ instructor của course hoặc admin
        if (section.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền thêm lesson vào section này'
            });
        }

        // Kiểm tra lesson thuộc cùng course với section
        if (lesson.course_id !== section.course_id) {
            return res.status(400).json({
                success: false,
                message: 'Lesson không thuộc cùng course với section'
            });
        }

        // Thêm hoặc cập nhật vào section_lessons
        const [sectionLesson, created] = await SectionLesson.findOrCreate({
            where: {
                section_id: section_id,
                lesson_id: lesson_id
            },
            defaults: {
                order_index: order_index
            }
        });

        if (!created) {
            // Nếu đã tồn tại, cập nhật order_index
            await sectionLesson.update({ order_index: order_index });
        }

        res.status(created ? 201 : 200).json({
            success: true,
            message: created ? 'Đã thêm lesson vào section' : 'Đã cập nhật order_index',
            data: sectionLesson
        });
    } catch (error) {
        console.error('Error adding section-lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   PUT /api/section-lessons/:sectionId/:lessonId
// @desc    Cập nhật order_index của lesson trong section
// @access  Private (Instructor/Admin)
router.put('/:sectionId/:lessonId', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;
        const { order_index } = req.body;

        const sectionLesson = await SectionLesson.findOne({
            where: {
                section_id: sectionId,
                lesson_id: lessonId
            }
        });

        if (!sectionLesson) {
            return res.status(404).json({
                success: false,
                message: 'Liên kết section-lesson không tồn tại'
            });
        }

        // Lấy section để kiểm tra quyền
        const section = await CourseSection.findByPk(sectionId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (section.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền cập nhật'
            });
        }

        if (order_index !== undefined) {
            await sectionLesson.update({ order_index });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật',
            data: sectionLesson
        });
    } catch (error) {
        console.error('Error updating section-lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   DELETE /api/section-lessons/:sectionId/:lessonId
// @desc    Xóa lesson khỏi section
// @access  Private (Instructor/Admin)
router.delete('/:sectionId/:lessonId', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;

        const sectionLesson = await SectionLesson.findOne({
            where: {
                section_id: sectionId,
                lesson_id: lessonId
            }
        });

        if (!sectionLesson) {
            return res.status(404).json({
                success: false,
                message: 'Liên kết section-lesson không tồn tại'
            });
        }

        // Lấy section để kiểm tra quyền
        const section = await CourseSection.findByPk(sectionId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (section.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa'
            });
        }

        await sectionLesson.destroy();

        res.json({
            success: true,
            message: 'Đã xóa lesson khỏi section'
        });
    } catch (error) {
        console.error('Error deleting section-lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   GET /api/section-lessons/section/:sectionId
// @desc    Lấy tất cả lessons trong một section
// @access  Public
router.get('/section/:sectionId', async (req, res) => {
    try {
        const { sectionId } = req.params;

        const section = await CourseSection.findByPk(sectionId, {
            include: [{
                model: Lesson,
                as: 'lessons',
                through: {
                    attributes: ['order_index']
                }
            }]
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section không tồn tại'
            });
        }

        res.json({
            success: true,
            data: section.lessons || []
        });
    } catch (error) {
        console.error('Error getting section lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

// @route   POST /api/section-lessons/batch
// @desc    Thêm nhiều lessons vào section cùng lúc
// @access  Private (Instructor/Admin)
router.post('/batch', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { section_id, lesson_ids } = req.body;

        if (!section_id || !Array.isArray(lesson_ids) || lesson_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'section_id và lesson_ids (array) là bắt buộc'
            });
        }

        const section = await CourseSection.findByPk(section_id, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section không tồn tại'
            });
        }

        // Kiểm tra quyền
        if (section.course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền'
            });
        }

        // Thêm từng lesson vào section
        const results = [];
        for (let i = 0; i < lesson_ids.length; i++) {
            const lesson_id = lesson_ids[i];
            const lesson = await Lesson.findByPk(lesson_id);

            if (!lesson) {
                results.push({ lesson_id, success: false, message: 'Lesson không tồn tại' });
                continue;
            }

            if (lesson.course_id !== section.course_id) {
                results.push({ lesson_id, success: false, message: 'Lesson không thuộc cùng course' });
                continue;
            }

            try {
                const [sectionLesson] = await SectionLesson.findOrCreate({
                    where: { section_id, lesson_id },
                    defaults: { order_index: i + 1 }
                });
                results.push({ lesson_id, success: true, data: sectionLesson });
            } catch (error) {
                results.push({ lesson_id, success: false, message: error.message });
            }
        }

        res.json({
            success: true,
            message: `Đã xử lý ${results.length} lessons`,
            data: results
        });
    } catch (error) {
        console.error('Error batch adding section-lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

module.exports = router;

