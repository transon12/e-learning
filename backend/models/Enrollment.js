const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    progress: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
        comment: 'percentage 0-100'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    tableName: 'enrollments',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'course_id']
        }
    ]
});

const CompletedLesson = sequelize.define('CompletedLesson', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    enrollment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'enrollments',
            key: 'id'
        }
    },
    lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id'
        }
    }
}, {
    tableName: 'completed_lessons',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['enrollment_id', 'lesson_id']
        }
    ]
});

// Associations will be set in models/index.js to avoid circular dependencies

module.exports = { Enrollment, CompletedLesson };

