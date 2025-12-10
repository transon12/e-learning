const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    shortDescription: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    instructor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    thumbnail: {
        type: DataTypes.STRING(255),
        defaultValue: 'img/course-default.jpg'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    isFree: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    level: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
        defaultValue: 'Beginner'
    },
    language: {
        type: DataTypes.STRING(50),
        defaultValue: 'English'
    },
    duration: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: 'in hours'
    },
    totalLessons: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ratings_average: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00
    },
    ratings_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    enrolledCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'courses',
    timestamps: true
});

// Generate slug before saving
Course.beforeCreate((course) => {
    if (!course.slug && course.title) {
        course.slug = course.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

Course.beforeUpdate((course) => {
    if (course.changed('title') && !course.slug) {
        course.slug = course.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

// Associations
Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });
User.hasMany(Course, { foreignKey: 'instructor_id', as: 'courses' });

module.exports = Course;
