/**
 * Authentication Routes using Supabase SDK
 * 
 * Example migration from Sequelize to Supabase SDK
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`)
            .limit(1);

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw checkError;
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const { data: user, error: createError } = await supabase
            .from('users')
            .insert({
                username,
                email,
                password: hashedPassword,
                role: role || 'student',
                is_active: true
            })
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            token: generateToken(user.id),
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
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

        // Find user by email
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();

        if (findError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            token: generateToken(user.id),
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
    try {
        // Get user ID from JWT (you'll need to add auth middleware)
        const userId = req.user?.id; // Assuming you have auth middleware

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, role, profile_first_name, profile_last_name, profile_avatar, profile_bio, profile_phone, is_active, created_at, updated_at')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

module.exports = router;

