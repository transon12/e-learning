const express = require('express');
const { Op } = require('sequelize');
const { User, Course, Lesson, Enrollment } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalCourses = await Course.count();
        const totalLessons = await Lesson.count();
        const totalEnrollments = await Enrollment.count();

        // Recent users (last 5)
        const recentUsers = await User.findAll({
            attributes: ['id', 'username', 'email', 'createdAt', 'isActive'],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        // Popular courses (top 5 by enrollment)
        const popularCourses = await Course.findAll({
            attributes: ['id', 'title', 'enrolledCount', 'thumbnail'],
            order: [['enrolledCount', 'DESC']],
            limit: 5
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalLessons,
                totalEnrollments,
                recentUsers,
                popularCourses
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

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = '' } = req.query;
        
        const where = {};
        if (search) {
            where[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        if (role) {
            where.role = role;
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            include: [{
                model: Enrollment,
                as: 'enrollments',
                include: [{
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'thumbnail']
                }]
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
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

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user active status
// @access  Private (Admin only)
router.put('/users/:id/status', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({ isActive: !user.isActive });

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
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

module.exports = router;

