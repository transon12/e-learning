/**
 * Ví dụ kết nối Express với Supabase
 * 
 * File này minh họa cách kết nối Express app với Supabase PostgreSQL database
 * sử dụng Sequelize ORM.
 */

require('dotenv').config();
const express = require('express');
const { sequelize, testConnection } = require('../config/database');
const { User, Course } = require('../models');

const app = express();
app.use(express.json());

// Test connection khi server start
async function startServer() {
    try {
        // Test database connection
        const connected = await testConnection();
        
        if (!connected) {
            console.error('❌ Failed to connect to database. Exiting...');
            process.exit(1);
        }

        // Sync models (optional - chỉ dùng cho development)
        // Trong production, dùng migrations thay vì sync
        if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
            console.log('🔄 Syncing database models...');
            await sequelize.sync({ alter: true });
            console.log('✅ Database models synced');
        }

        // Start server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📚 API: http://localhost:${PORT}/api`);
            console.log(`🔗 Database: Supabase PostgreSQL`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

// Example route - Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        // Test query
        const userCount = await User.count();
        const courseCount = await Course.count();
        
        res.json({
            success: true,
            message: 'Database connection successful',
            data: {
                users: userCount,
                courses: courseCount,
                database: 'Supabase PostgreSQL'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database query failed',
            error: error.message
        });
    }
});

// Example route - Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            limit: 10
        });
        
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Example route - Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.findAll({
            limit: 10
        });
        
        res.json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
});

// Start server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connection...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connection...');
    await sequelize.close();
    process.exit(0);
});

