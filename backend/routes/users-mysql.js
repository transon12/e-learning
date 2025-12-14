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
        const { profile, ...otherFields } = req.body;

        // Don't allow changing password, role, or email through this route
        delete otherFields.password;
        delete otherFields.role;
        delete otherFields.email;

        const updateData = { ...otherFields };
        if (profile) {
            Object.keys(profile).forEach(key => {
                // Map camelCase to snake_case field names
                const fieldMap = {
                    'firstName': 'profileFirstName',
                    'lastName': 'profileLastName',
                    'avatar': 'profile_avatar',
                    'bio': 'profile_bio',
                    'phone': 'profile_phone'
                };
                const fieldName = fieldMap[key] || `profile_${key}`;
                updateData[fieldName] = profile[key];
            });
        }

        await User.update(updateData, {
            where: { id: req.user.id }
        });

        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
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
                    attributes: ['id', 'title', 'thumbnail', 'slug', 'description', 'duration', 'totalLessons'],
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

