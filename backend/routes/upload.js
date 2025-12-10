const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadFields } = require('../middleware/upload');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

const router = express.Router();

// @route   POST /api/upload/lesson/:lessonId/video
// @desc    Upload video file for lesson
// @access  Private (Instructor/Admin)
router.post('/lesson/:lessonId/video', protect, authorize('instructor', 'admin'), uploadSingle('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const lesson = await Lesson.findById(req.params.lessonId)
            .populate('course');

        if (!lesson) {
            // Xóa file đã upload nếu lesson không tồn tại
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        // Check authorization
        if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            // Xóa file đã upload
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload file cho bài học này'
            });
        }

        // Xóa file cũ nếu có
        if (lesson.files.video && lesson.files.video.path) {
            const oldPath = path.join(__dirname, '..', lesson.files.video.path);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Lưu thông tin file
        lesson.files.video = {
            filename: req.file.filename,
            path: req.file.path.replace(path.join(__dirname, '..'), ''),
            size: req.file.size,
            mimetype: req.file.mimetype
        };

        // Cập nhật videoUrl nếu chưa có
        if (!lesson.videoUrl) {
            lesson.videoUrl = `/uploads/${req.file.path.split('uploads')[1].replace(/\\/g, '/')}`;
            lesson.videoType = 'local';
        }

        await lesson.save();

        res.json({
            success: true,
            message: 'Upload video thành công',
            data: {
                file: lesson.files.video,
                videoUrl: lesson.videoUrl
            }
        });
    } catch (error) {
        // Xóa file nếu có lỗi
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload video'
        });
    }
});

// @route   POST /api/upload/lesson/:lessonId/audio
// @desc    Upload audio file for lesson
// @access  Private (Instructor/Admin)
router.post('/lesson/:lessonId/audio', protect, authorize('instructor', 'admin'), uploadSingle('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const lesson = await Lesson.findById(req.params.lessonId)
            .populate('course');

        if (!lesson) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload file cho bài học này'
            });
        }

        // Xóa file cũ nếu có
        if (lesson.files.audio && lesson.files.audio.path) {
            const oldPath = path.join(__dirname, '..', lesson.files.audio.path);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        lesson.files.audio = {
            filename: req.file.filename,
            path: req.file.path.replace(path.join(__dirname, '..'), ''),
            size: req.file.size,
            mimetype: req.file.mimetype
        };

        await lesson.save();

        res.json({
            success: true,
            message: 'Upload audio thành công',
            data: {
                file: lesson.files.audio
            }
        });
    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload audio'
        });
    }
});

// @route   POST /api/upload/lesson/:lessonId/pdf
// @desc    Upload PDF file for lesson
// @access  Private (Instructor/Admin)
router.post('/lesson/:lessonId/pdf', protect, authorize('instructor', 'admin'), uploadSingle('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const lesson = await Lesson.findById(req.params.lessonId)
            .populate('course');

        if (!lesson) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload file cho bài học này'
            });
        }

        // Xóa file cũ nếu có
        if (lesson.files.pdf && lesson.files.pdf.path) {
            const oldPath = path.join(__dirname, '..', lesson.files.pdf.path);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        lesson.files.pdf = {
            filename: req.file.filename,
            path: req.file.path.replace(path.join(__dirname, '..'), ''),
            size: req.file.size,
            mimetype: req.file.mimetype
        };

        await lesson.save();

        res.json({
            success: true,
            message: 'Upload PDF thành công',
            data: {
                file: lesson.files.pdf
            }
        });
    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload PDF'
        });
    }
});

// @route   POST /api/upload/lesson/:lessonId/multiple
// @desc    Upload multiple files (video, audio, pdf) at once
// @access  Private (Instructor/Admin)
router.post('/lesson/:lessonId/multiple', protect, authorize('instructor', 'admin'), uploadFields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId)
            .populate('course');

        if (!lesson) {
            // Xóa tất cả files đã upload
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    if (file.path) fs.unlinkSync(file.path);
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            if (req.files) {
                Object.values(req.files).flat().forEach(file => {
                    if (file.path) fs.unlinkSync(file.path);
                });
            }
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload file cho bài học này'
            });
        }

        const uploadedFiles = {};

        // Xử lý video
        if (req.files.video && req.files.video[0]) {
            const file = req.files.video[0];
            if (lesson.files.video && lesson.files.video.path) {
                const oldPath = path.join(__dirname, '..', lesson.files.video.path);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            lesson.files.video = {
                filename: file.filename,
                path: file.path.replace(path.join(__dirname, '..'), ''),
                size: file.size,
                mimetype: file.mimetype
            };
            if (!lesson.videoUrl) {
                lesson.videoUrl = `/uploads/${file.path.split('uploads')[1].replace(/\\/g, '/')}`;
                lesson.videoType = 'local';
            }
            uploadedFiles.video = lesson.files.video;
        }

        // Xử lý audio
        if (req.files.audio && req.files.audio[0]) {
            const file = req.files.audio[0];
            if (lesson.files.audio && lesson.files.audio.path) {
                const oldPath = path.join(__dirname, '..', lesson.files.audio.path);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            lesson.files.audio = {
                filename: file.filename,
                path: file.path.replace(path.join(__dirname, '..'), ''),
                size: file.size,
                mimetype: file.mimetype
            };
            uploadedFiles.audio = lesson.files.audio;
        }

        // Xử lý PDF
        if (req.files.pdf && req.files.pdf[0]) {
            const file = req.files.pdf[0];
            if (lesson.files.pdf && lesson.files.pdf.path) {
                const oldPath = path.join(__dirname, '..', lesson.files.pdf.path);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            lesson.files.pdf = {
                filename: file.filename,
                path: file.path.replace(path.join(__dirname, '..'), ''),
                size: file.size,
                mimetype: file.mimetype
            };
            uploadedFiles.pdf = lesson.files.pdf;
        }

        await lesson.save();

        res.json({
            success: true,
            message: 'Upload files thành công',
            data: uploadedFiles
        });
    } catch (error) {
        // Xóa files nếu có lỗi
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (file.path) fs.unlinkSync(file.path);
            });
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload files'
        });
    }
});

// @route   DELETE /api/upload/lesson/:lessonId/file/:fileType
// @desc    Delete uploaded file (video, audio, or pdf)
// @access  Private (Instructor/Admin)
router.delete('/lesson/:lessonId/file/:fileType', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { lessonId, fileType } = req.params;
        
        if (!['video', 'audio', 'pdf'].includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: 'Loại file không hợp lệ'
            });
        }

        const lesson = await Lesson.findById(lessonId)
            .populate('course');

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        if (lesson.course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa file này'
            });
        }

        // Xóa file từ server
        if (lesson.files[fileType] && lesson.files[fileType].path) {
            const filePath = path.join(__dirname, '..', lesson.files[fileType].path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Xóa thông tin file từ database
        lesson.files[fileType] = undefined;
        
        // Nếu là video và videoUrl trỏ đến local file, xóa luôn
        if (fileType === 'video' && lesson.videoType === 'local') {
            lesson.videoUrl = undefined;
        }

        await lesson.save();

        res.json({
            success: true,
            message: `Đã xóa file ${fileType} thành công`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi xóa file'
        });
    }
});

module.exports = router;

