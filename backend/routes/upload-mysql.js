const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadFields } = require('../middleware/upload');
const { uploadToS3Middleware, deleteFile } = require('../middleware/s3Upload');
const { getFileUrl } = require('../services/s3Service');
const { Lesson, Course } = require('../models');

const router = express.Router();

// Helper to update course thumbnail
async function updateCourseThumbnail(courseId, fileData) {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error('Course not found');

    // Xóa file cũ nếu có
    if (course.thumbnail) {
        await deleteFile(course.thumbnail);
    }

    // Use S3 URL if available, otherwise use local path
    const thumbnailUrl = fileData.s3Url || getFileUrl(fileData.path);
    
    await course.update({
        thumbnail: thumbnailUrl
    });
    return course;
}

// Helper function to update lesson file
async function updateLessonFile(lessonId, fileType, fileData) {
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
        throw new Error('Lesson not found');
    }

    // Delete old file if exists
    const oldFileField = `file_${fileType}_path`;
    if (lesson[oldFileField]) {
        await deleteFile(lesson[oldFileField]);
    }

    // Use S3 URL if available, otherwise use local path
    const fileUrl = fileData.s3Url || getFileUrl(fileData.path);
    const filePath = fileData.s3Url ? fileData.s3Key : fileData.path.replace(path.join(__dirname, '..'), '');

    // Update lesson with new file info
    const updateData = {
        [`file_${fileType}_filename`]: fileData.filename || fileData.originalname,
        [`file_${fileType}_path`]: filePath,
        [`file_${fileType}_size`]: fileData.size,
        [`file_${fileType}_mimetype`]: fileData.mimetype
    };

    // If video, also update videoUrl
    if (fileType === 'video') {
        updateData.videoUrl = fileUrl;
        updateData.videoType = fileData.s3Url ? 's3' : 'local';
    }

    await lesson.update(updateData);
    return lesson;
}

// @route   POST /api/upload/lesson/:lessonId/video
router.post('/lesson/:lessonId/video', protect, authorize('instructor', 'admin'), uploadSingle('video'), uploadToS3Middleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const lesson = await Lesson.findByPk(req.params.lessonId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!lesson) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        const course = await Course.findByPk(lesson.course_id);
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload file cho bài học này'
            });
        }

        await updateLessonFile(req.params.lessonId, 'video', req.file);

        res.json({
            success: true,
            message: 'Upload video thành công',
            data: {
                file: {
                    filename: req.file.filename || req.file.originalname,
                    path: req.file.s3Url || req.file.path.replace(path.join(__dirname, '..'), ''),
                    url: req.file.s3Url || getFileUrl(req.file.path),
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            }
        });
    } catch (error) {
        if (req.file && req.file.path && !req.file.s3Url) {
            // Only delete local file if not uploaded to S3
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload video'
        });
    }
});

// @route   POST /api/upload/lesson/:lessonId/audio
router.post('/lesson/:lessonId/audio', protect, authorize('instructor', 'admin'), uploadSingle('audio'), uploadToS3Middleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const lesson = await Lesson.findByPk(req.params.lessonId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!lesson) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        const course = await Course.findByPk(lesson.course_id);
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload file cho bài học này'
            });
        }

        await updateLessonFile(req.params.lessonId, 'audio', req.file);

        res.json({
            success: true,
            message: 'Upload audio thành công'
        });
    } catch (error) {
        if (req.file && req.file.path && !req.file.s3Url) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload audio'
        });
    }
});

// @route   POST /api/upload/lesson/:lessonId/pdf
router.post('/lesson/:lessonId/pdf', protect, authorize('instructor', 'admin'), uploadSingle('pdf'), uploadToS3Middleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const lesson = await Lesson.findByPk(req.params.lessonId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!lesson) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        const course = await Course.findByPk(lesson.course_id);
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload file cho bài học này'
            });
        }

        await updateLessonFile(req.params.lessonId, 'pdf', req.file);

        res.json({
            success: true,
            message: 'Upload PDF thành công'
        });
    } catch (error) {
        if (req.file && req.file.path && !req.file.s3Url) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload PDF'
        });
    }
});

// @route   POST /api/upload/lesson/:lessonId/multiple
router.post('/lesson/:lessonId/multiple', protect, authorize('instructor', 'admin'), uploadFields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), uploadToS3Middleware, async (req, res) => {
    try {
        const lesson = await Lesson.findByPk(req.params.lessonId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!lesson) {
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

        const course = await Course.findByPk(lesson.course_id);
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
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

        if (req.files.video && req.files.video[0]) {
            await updateLessonFile(req.params.lessonId, 'video', req.files.video[0]);
            uploadedFiles.video = true;
        }

        if (req.files.audio && req.files.audio[0]) {
            await updateLessonFile(req.params.lessonId, 'audio', req.files.audio[0]);
            uploadedFiles.audio = true;
        }

        if (req.files.pdf && req.files.pdf[0]) {
            await updateLessonFile(req.params.lessonId, 'pdf', req.files.pdf[0]);
            uploadedFiles.pdf = true;
        }

        res.json({
            success: true,
            message: 'Upload files thành công',
            data: uploadedFiles
        });
    } catch (error) {
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (file.path && !file.s3Url && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
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
router.delete('/lesson/:lessonId/file/:fileType', protect, authorize('instructor', 'admin'), async (req, res) => {
    try {
        const { lessonId, fileType } = req.params;
        
        if (!['video', 'audio', 'pdf'].includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: 'Loại file không hợp lệ'
            });
        }

        const lesson = await Lesson.findByPk(lessonId);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Bài học không tồn tại'
            });
        }

        const course = await Course.findByPk(lesson.course_id);
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa file này'
            });
        }

        // Delete file from S3 or local server
        const filePathField = `file_${fileType}_path`;
        if (lesson[filePathField]) {
            await deleteFile(lesson[filePathField]);
        }

        // Clear file info from database
        await lesson.update({
            [`file_${fileType}_filename`]: null,
            [`file_${fileType}_path`]: null,
            [`file_${fileType}_size`]: null,
            [`file_${fileType}_mimetype`]: null,
            ...(fileType === 'video' && lesson.videoType === 'local' ? { videoUrl: null } : {})
        });

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

// @route POST /api/upload/course/:courseId/avatar
router.post('/course/:courseId/avatar', protect, authorize('instructor', 'admin'), uploadSingle('avatar'), uploadToS3Middleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file được upload'
            });
        }

        const course = await Course.findByPk(req.params.courseId);
        if (!course) {
            // Chỉ xóa file local nếu chưa upload lên S3
            if (req.file && req.file.path && !req.file.s3Url && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Khóa học không tồn tại'
            });
        }

        // Instructor hoặc admin
        if (course.instructor_id !== req.user.id && req.user.role !== 'admin') {
            // Chỉ xóa file local nếu chưa upload lên S3
            if (req.file && req.file.path && !req.file.s3Url && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(403).json({
                success: false,
                message: 'Không có quyền upload ảnh cho khóa học này'
            });
        }

        await updateCourseThumbnail(req.params.courseId, req.file);

        const thumbnailUrl = req.file.s3Url || getFileUrl(req.file.path);

        res.json({
            success: true,
            message: 'Upload ảnh đại diện thành công',
            data: {
                thumbnail: thumbnailUrl
            }
        });
    } catch (error) {
        if (req.file && req.file.path && !req.file.s3Url && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi upload ảnh đại diện'
        });
    }
});

module.exports = router;

