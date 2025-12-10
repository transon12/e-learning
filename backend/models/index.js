const User = require('./User');
const Course = require('./Course');
const Lesson = require('./Lesson');
const { Enrollment, CompletedLesson } = require('./Enrollment');
const { sequelize } = require('../config/database');

// Course Sections Model
const { DataTypes } = require('sequelize');

const CourseSection = sequelize.define('CourseSection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'course_sections',
    timestamps: true
});

// Section Lessons Junction
const SectionLesson = sequelize.define('SectionLesson', {
    section_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'course_sections',
            key: 'id'
        }
    },
    lesson_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'lessons',
            key: 'id'
        }
    },
    order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'section_lessons',
    timestamps: false
});

// Associations
CourseSection.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(CourseSection, { foreignKey: 'course_id', as: 'sections' });

CourseSection.belongsToMany(Lesson, { 
    through: SectionLesson, 
    foreignKey: 'section_id',
    otherKey: 'lesson_id',
    as: 'lessons'
});
Lesson.belongsToMany(CourseSection, { 
    through: SectionLesson, 
    foreignKey: 'lesson_id',
    otherKey: 'section_id',
    as: 'sections'
});

// User-Enrollment-Course associations
User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Enrollment.hasMany(CompletedLesson, { foreignKey: 'enrollment_id', as: 'completedLessons' });

CompletedLesson.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });
CompletedLesson.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });

module.exports = {
    sequelize,
    User,
    Course,
    Lesson,
    CourseSection,
    SectionLesson,
    Enrollment,
    CompletedLesson
};

