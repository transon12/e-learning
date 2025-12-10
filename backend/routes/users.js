const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('enrolledCourses.course', 'title thumbnail slug')
            .select('-password');

        res.json({
            success: true,
            data: user
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

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 
                ...otherFields,
                ...(profile && { profile })
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        res.json({
            success: true,
            data: user
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
        const user = await User.findById(req.user.id)
            .populate({
                path: 'enrolledCourses.course',
                select: 'title thumbnail slug description instructor duration totalLessons',
                populate: {
                    path: 'instructor',
                    select: 'username profile'
                }
            })
            .select('enrolledCourses');

        res.json({
            success: true,
            data: user.enrolledCourses
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

