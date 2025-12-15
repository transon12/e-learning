const express = require('express');
const { About } = require('../models');

const router = express.Router();

// @route   GET /api/about
// @desc    Get about page content
// @access  Public
router.get('/', async (req, res) => {
    try {
        const about = await About.findOne({
            where: { isActive: true },
            order: [['created_at', 'DESC']]
        });

        if (!about) {
            return res.status(404).json({
                success: false,
                message: 'About content not found'
            });
        }

        res.json({
            success: true,
            data: about
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/about/:id
// @desc    Update about page content
// @access  Private/Admin
router.put('/:id', require('../middleware/auth').protect, require('../middleware/auth').authorize('admin'), async (req, res) => {
    try {
        const about = await About.findByPk(req.params.id);

        if (!about) {
            return res.status(404).json({
                success: false,
                message: 'About content not found'
            });
        }

        const {
            title,
            subtitle,
            description,
            mission,
            vision,
            values,
            teamDescription,
            imageUrl,
            isActive
        } = req.body;

        await about.update({
            title,
            subtitle,
            description,
            mission,
            vision,
            values,
            teamDescription,
            imageUrl,
            isActive
        });

        res.json({
            success: true,
            data: about
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

