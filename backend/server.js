const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { testConnection } = require('./config/database');

// Load environment variables
dotenv.config();

// Import routes (MySQL versions)
const authRoutes = require('./routes/auth-mysql');
const courseRoutes = require('./routes/courses-mysql');
const lessonRoutes = require('./routes/lessons-mysql');
const sectionRoutes = require('./routes/sections');
const sectionLessonRoutes = require('./routes/section-lessons');
const userRoutes = require('./routes/users-mysql');
const enrollmentRoutes = require('./routes/enrollments-mysql');
const uploadRoutes = require('./routes/upload-mysql');
const adminRoutes = require('./routes/admin-mysql');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
testConnection();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 E-Learning API: http://localhost:${PORT}/api`);
});

