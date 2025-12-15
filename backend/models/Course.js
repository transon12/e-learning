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
        allowNull: true,
        field: 'short_description'
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
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
    },
    language: {
        type: DataTypes.STRING(50),
        defaultValue: 'english'
    },
    durationHours: {
        type: DataTypes.DECIMAL(6, 2),
        defaultValue: 0.00,
        field: 'duration_hours',
        comment: 'in hours'
    },
    totalLessons: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_lessons'
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
        defaultValue: 0,
        field: 'enrolled_count'
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
    timestamps: true,
    getterMethods: {
        duration() {
            return this.durationHours;
        }
    },
    setterMethods: {
        duration(value) {
            this.setDataValue('durationHours', value);
        }
    }
});

// Normalize level before save (convert to lowercase for database)
Course.beforeCreate((course) => {
    if (!course.slug && course.title) {
        course.slug = course.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    // Normalize level to lowercase for database
    if (course.level) {
        course.level = course.level.toLowerCase();
    }
});

Course.beforeUpdate((course) => {
    if (course.changed('title') && !course.slug) {
        course.slug = course.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    // Normalize level to lowercase for database
    if (course.changed('level') && course.level) {
        course.level = course.level.toLowerCase();
    }
});

// Format level for API response (capitalize first letter)
Course.prototype.toJSON = function() {
    const values = { ...this.get() };
    // Capitalize level for frontend compatibility
    if (values.level) {
        values.level = values.level.charAt(0).toUpperCase() + values.level.slice(1);
    }
    // Add duration field from getter for frontend compatibility
    if (this.durationHours !== undefined) {
        values.duration = this.duration;
    }
    return values;
};

// Associations
Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });
User.hasMany(Course, { foreignKey: 'instructor_id', as: 'courses' });

module.exports = Course;
