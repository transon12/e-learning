const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes (MySQL versions)
const authRoutes = require('../backend/routes/auth-mysql');
const courseRoutes = require('../backend/routes/courses-mysql');
const lessonRoutes = require('../backend/routes/lessons-mysql');
const sectionRoutes = require('../backend/routes/sections');
const sectionLessonRoutes = require('../backend/routes/section-lessons');
const userRoutes = require('../backend/routes/users-mysql');
const enrollmentRoutes = require('../backend/routes/enrollments-mysql');
const uploadRoutes = require('../backend/routes/upload-mysql');
const adminRoutes = require('../backend/routes/admin-mysql');
const aboutRoutes = require('../backend/routes/about');
const contactRoutes = require('../backend/routes/contact');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads) - Note: For Vercel, consider using S3 or Vercel Blob Storage
// Static files should be served from a CDN or storage service in production
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(path.join(__dirname, '../backend/uploads')));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api', sectionRoutes);
app.use('/api/section-lessons', sectionLessonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'E-Learning API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Export for Vercel serverless - Vercel automatically handles Express apps
module.exports = app;

