const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, Course, Lesson, Enrollment, CompletedLesson } = require('../models');
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

        // Format data for frontend
        const formattedRecentUsers = recentUsers.map(user => user.toJSON());
        const formattedPopularCourses = popularCourses.map(course => {
            const courseData = course.toJSON();
            return courseData;
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalLessons,
                totalEnrollments,
                recentUsers: formattedRecentUsers,
                popularCourses: formattedPopularCourses
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

        const includeOptions = [{
                model: Enrollment,
                as: 'enrollments',
                include: [{
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'thumbnail']
                }]
        }];

        // If filtering by instructor role, include courses they teach
        if (role === 'instructor') {
            includeOptions.push({
                model: Course,
                as: 'courses',
                attributes: ['id', 'title', 'enrolled_count'],
                required: false
            });
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            include: includeOptions,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        // Format users for frontend
        const formattedUsers = users.map(user => {
            const userData = user.toJSON();
            // After toJSON(), nested objects are already plain objects
            if (userData.enrollments) {
                userData.enrollments = userData.enrollments.map(enrollment => {
                    // enrollment is already a plain object after user.toJSON()
                    // course is also already a plain object
                    return enrollment || {};
                });
            }
            // Handle courses for instructors
            if (userData.courses) {
                userData.courses = userData.courses.map(course => {
                    // course is already a plain object after user.toJSON()
                    return course || {};
                });
            }
            return userData;
        });

        res.json({
            success: true,
            data: formattedUsers,
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

// @route   POST /api/admin/users
// @desc    Create new user (Admin only)
// @access  Private (Admin only)
router.post('/users', [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, email, password, role, profile_first_name, profile_last_name, profile_phone, profile_bio } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
            profile_first_name,
            profile_last_name,
            profile_phone,
            profile_bio,
            is_active: true
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toJSON();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userWithoutPassword
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

        const newStatus = !user.isActive;
        await user.update({ isActive: newStatus });

        // Reload user to get updated data
        await user.reload();

        const userData = user.toJSON();
        // Ensure is_active is included for frontend compatibility
        userData.is_active = userData.isActive;

        res.json({
            success: true,
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
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

// @route   POST /api/admin/users/:userId/enrollments
// @desc    Assign courses to a student (Admin only)
// @access  Private (Admin only)
router.post('/users/:userId/enrollments', async (req, res) => {
    try {
        const { courseIds } = req.body; // Array of course IDs
        
        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one course ID'
            });
        }

        const user = await User.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'student') {
            return res.status(400).json({
                success: false,
                message: 'Can only assign courses to students'
            });
        }

        const results = [];
        const errors = [];

        for (const courseId of courseIds) {
            try {
                const course = await Course.findByPk(courseId);
                if (!course) {
                    errors.push({ courseId, message: 'Course not found' });
                    continue;
                }

                // Check if already enrolled
                const existingEnrollment = await Enrollment.findOne({
                    where: {
                        user_id: user.id,
                        course_id: courseId
                    }
                });

                if (existingEnrollment) {
                    // If already enrolled but not approved, approve it
                    if (existingEnrollment.status !== 'approved') {
                        await existingEnrollment.update({ status: 'approved' });
                        await course.increment('enrolledCount');
                        results.push({
                            courseId,
                            courseTitle: course.title,
                            action: 'approved',
                            enrollment: existingEnrollment
                        });
                    } else {
                        errors.push({ courseId, message: 'Already enrolled and approved' });
                    }
                } else {
                    // Create new enrollment with approved status
                    const enrollment = await Enrollment.create({
                        user_id: user.id,
                        course_id: courseId,
                        progress: 0,
                        status: 'approved'
                    });
                    await course.increment('enrolledCount');
                    results.push({
                        courseId,
                        courseTitle: course.title,
                        action: 'created',
                        enrollment
                    });
                }
            } catch (error) {
                console.error(`Error enrolling in course ${courseId}:`, error);
                errors.push({ courseId, message: error.message });
            }
        }

        res.json({
            success: true,
            message: `Assigned ${results.length} course(s) successfully`,
            data: {
                successful: results,
                errors: errors.length > 0 ? errors : undefined
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

// @route   DELETE /api/admin/users/:userId/enrollments/:enrollmentId
// @desc    Remove course assignment from a student (Admin only)
// @access  Private (Admin only)
router.delete('/users/:userId/enrollments/:enrollmentId', async (req, res) => {
    try {
        const enrollment = await Enrollment.findByPk(req.params.enrollmentId, {
            include: [{ model: Course, as: 'course' }]
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
        }

        if (enrollment.user_id !== parseInt(req.params.userId)) {
            return res.status(403).json({
                success: false,
                message: 'Enrollment does not belong to this user'
            });
        }

        // Decrement course enrolled count if was approved
        if (enrollment.status === 'approved' && enrollment.course) {
            // Reload course to get current enrolledCount
            await enrollment.course.reload();
            const currentCount = enrollment.course.enrolledCount || enrollment.course.enrolled_count || 0;
            // Only decrement if count is greater than 0
            if (currentCount > 0) {
                await enrollment.course.decrement('enrolledCount');
            } else {
                // Set to 0 if somehow it's already 0 or negative
                await enrollment.course.update({ enrolledCount: 0 });
            }
        }

        // Delete completed lessons
        await CompletedLesson.destroy({
            where: { enrollment_id: enrollment.id }
        });

        // Delete enrollment
        await enrollment.destroy();

        res.json({
            success: true,
            message: 'Course assignment removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/users/:userId/enrollments
// @desc    Get all enrollments for a student (Admin only)
// @access  Private (Admin only)
router.get('/users/:userId/enrollments', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const enrollments = await Enrollment.findAll({
            where: { user_id: user.id },
            include: [{
                model: Course,
                as: 'course',
                attributes: ['id', 'title', 'category', 'thumbnail', 'level']
            }],
            order: [['enrolledAt', 'DESC']]
        });

        res.json({
            success: true,
            data: enrollments
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

