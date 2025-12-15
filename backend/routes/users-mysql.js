const express = require('express');
const { User, Enrollment, Course } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Enrollment,
                as: 'enrollments',
                include: [{
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'thumbnail', 'slug']
                }]
            }]
        });

        // Format user for frontend
        const userData = user.toJSON();

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        // Don't allow changing password, role, email, or username through this route
        const allowedFields = [
            'profile_first_name',
            'profile_last_name',
            'profile_phone',
            'profile_bio',
            'profile_avatar',
            'profile_cover_image'
        ];

        const updateData = {};
        
        // Only include allowed fields
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Handle camelCase fields from frontend
        if (req.body.profile_first_name !== undefined) {
            updateData.profile_first_name = req.body.profile_first_name;
        }
        if (req.body.profile_last_name !== undefined) {
            updateData.profile_last_name = req.body.profile_last_name;
        }
        if (req.body.profile_phone !== undefined) {
            updateData.profile_phone = req.body.profile_phone;
        }
        if (req.body.profile_bio !== undefined) {
            updateData.profile_bio = req.body.profile_bio;
        }

        // Update user
        await User.update(updateData, {
            where: { id: req.user.id }
        });

        // Get updated user with enrollments
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Enrollment,
                as: 'enrollments',
                include: [{
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'thumbnail', 'slug']
                }]
            }]
        });

        // Format user for frontend
        const userData = user.toJSON();

        res.json({
            success: true,
            message: 'Cập nhật hồ sơ thành công',
            data: userData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/users/enrolled-courses
// @desc    Get user's enrolled courses
// @access  Private
router.get('/enrolled-courses', protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: Enrollment,
                as: 'enrollments',
                include: [{
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'thumbnail', 'slug', 'description', 'durationHours', 'totalLessons'],
                    include: [{
                        model: User,
                        as: 'instructor',
                        attributes: ['id', 'username', 'profileFirstName', 'profileLastName']
                    }]
                }]
            }]
        });

        // Format enrollments and courses for frontend
        const formattedEnrollments = (user.enrollments || []).map(enrollment => {
            const enrollmentData = enrollment.toJSON();
            if (enrollmentData.course) {
                const courseData = enrollmentData.course.toJSON();
                // Format course level if present
                if (courseData.level) {
                    courseData.level = courseData.level.charAt(0).toUpperCase() + courseData.level.slice(1);
                }
                enrollmentData.course = courseData;
            }
            return enrollmentData;
        });

        res.json({
            success: true,
            data: formattedEnrollments
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

