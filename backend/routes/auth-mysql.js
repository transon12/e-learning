const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
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

        const { username, email, password, role } = req.body;

        // Check if user exists
        const { Op } = require('sequelize');
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

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'student'
        });

        // Generate token
        const token = generateToken(user.id);

        // Format user for frontend
        const userData = user.toJSON();
        delete userData.password; // Ensure password is not included

        res.status(201).json({
            success: true,
            token,
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                profileFirstName: userData.profileFirstName,
                profileLastName: userData.profileLastName,
                profileAvatar: userData.profile_avatar
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Format user for frontend
        const userData = user.toJSON();
        delete userData.password; // Ensure password is not included

        res.json({
            success: true,
            token,
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                profileFirstName: userData.profileFirstName,
                profileLastName: userData.profileLastName,
                profileAvatar: userData.profile_avatar
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const { Enrollment, Course } = require('../models');
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
        if (userData.enrollments) {
            userData.enrollments = userData.enrollments.map(enrollment => {
                const enrollmentData = enrollment.toJSON();
                if (enrollmentData.course) {
                    enrollmentData.course = enrollmentData.course.toJSON();
                }
                return enrollmentData;
            });
        }

        res.json({
            success: true,
            user: userData
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

