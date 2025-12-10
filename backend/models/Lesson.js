const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Course = require('./Course');

const Lesson = sequelize.define('Lesson', {
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
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'course_sections',
            key: 'id'
        }
    },
    order_index: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    videoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    videoType: {
        type: DataTypes.ENUM('youtube', 'vimeo', 'local', 'external'),
        defaultValue: 'youtube'
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'in minutes'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPreview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'draft'
    },
    // Uploaded files
    file_video_filename: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    file_video_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    file_video_size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    file_video_mimetype: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    file_audio_filename: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    file_audio_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    file_audio_size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    file_audio_mimetype: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    file_pdf_filename: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    file_pdf_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    file_pdf_size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    file_pdf_mimetype: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'lessons',
    timestamps: true
});

// Generate slug
Lesson.beforeCreate((lesson) => {
    if (!lesson.slug && lesson.title) {
        lesson.slug = lesson.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

Lesson.beforeUpdate((lesson) => {
    if (lesson.changed('title') && !lesson.slug) {
        lesson.slug = lesson.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

// Instance method to increment view
Lesson.prototype.incrementView = async function() {
    this.viewCount += 1;
    return this.save();
};

// Associations
Lesson.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(Lesson, { foreignKey: 'course_id', as: 'lessons' });

module.exports = Lesson;
