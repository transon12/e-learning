const express = require('express');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { ContactMessage, ContactInfo, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/contact/info
// @desc    Get contact information
// @access  Public
router.get('/info', async (req, res) => {
    try {
        const contactInfo = await ContactInfo.findAll({
            where: { isActive: true },
            order: [['display_order', 'ASC']]
        });

        res.json({
            success: true,
            data: contactInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/contact/message
// @desc    Submit contact message
// @access  Public
router.post('/message', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, phone, subject, message } = req.body;
        const userId = req.user?.id || null; // Optional: if user is logged in

        const contactMessage = await ContactMessage.create({
            name,
            email,
            phone,
            subject,
            message,
            userId,
            status: 'new'
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: {
                id: contactMessage.id,
                name: contactMessage.name,
                email: contactMessage.email,
                subject: contactMessage.subject
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

// @route   GET /api/contact/messages
// @desc    Get all contact messages (Admin only)
// @access  Private/Admin
router.get('/messages', protect, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { subject: { [Op.like]: `%${search}%` } },
                { message: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: messages } = await ContactMessage.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'profile_first_name', 'profile_last_name'],
                    required: false
                },
                {
                    model: User,
                    as: 'repliedByUser',
                    attributes: ['id', 'username', 'email'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            count: messages.length,
            total: count,
            data: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/contact/messages/:id
// @desc    Get single contact message (Admin only)
// @access  Private/Admin
router.get('/messages/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const message = await ContactMessage.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'profile_first_name', 'profile_last_name'],
                    required: false
                },
                {
                    model: User,
                    as: 'repliedByUser',
                    attributes: ['id', 'username', 'email'],
                    required: false
                }
            ]
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Mark as read if status is 'new'
        if (message.status === 'new') {
            await message.update({ status: 'read' });
        }

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/contact/messages/:id/reply
// @desc    Reply to contact message (Admin only)
// @access  Private/Admin
router.put('/messages/:id/reply', protect, authorize('admin'), [
    body('replyMessage').trim().notEmpty().withMessage('Reply message is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const message = await ContactMessage.findByPk(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.update({
            status: 'replied',
            repliedAt: new Date(),
            repliedBy: req.user.id,
            replyMessage: req.body.replyMessage
        });

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/contact/messages/:id/status
// @desc    Update message status (Admin only)
// @access  Private/Admin
router.put('/messages/:id/status', protect, authorize('admin'), [
    body('status').isIn(['new', 'read', 'replied', 'archived']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const message = await ContactMessage.findByPk(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.update({ status: req.body.status });

        res.json({
            success: true,
            data: message
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

