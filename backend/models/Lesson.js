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
        allowNull: true,
        field: 'video_url'
    },
    videoType: {
        type: DataTypes.ENUM('youtube', 'vimeo', 'local', 'external'),
        defaultValue: 'youtube',
        field: 'video_type'
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'duration_minutes',
        comment: 'in minutes'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isPreview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_preview'
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_locked'
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'view_count'
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'draft'
    },
    // Uploaded files - keep snake_case for frontend compatibility
    file_video_filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'file_video_filename'
    },
    file_video_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'file_video_path'
    },
    file_video_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'file_video_size'
    },
    file_video_mimetype: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'file_video_mimetype'
    },
    file_audio_filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'file_audio_filename'
    },
    file_audio_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'file_audio_path'
    },
    file_audio_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'file_audio_size'
    },
    file_audio_mimetype: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'file_audio_mimetype'
    },
    file_pdf_filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'file_pdf_filename'
    },
    file_pdf_path: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'file_pdf_path'
    },
    file_pdf_size: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'file_pdf_size'
    },
    file_pdf_mimetype: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'file_pdf_mimetype'
    }
}, {
    tableName: 'lessons',
    timestamps: true,
    getterMethods: {
        duration() {
            return this.durationMinutes;
        }
    },
    setterMethods: {
        duration(value) {
            this.setDataValue('durationMinutes', value);
        }
    }
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
    this.viewCount = (this.viewCount || 0) + 1;
    return this.save();
};

// Override toJSON to keep file fields in snake_case for frontend compatibility
Lesson.prototype.toJSON = function() {
    const values = { ...this.get() };
    // Sequelize with underscored: true will convert camelCase to snake_case
    // But we need to ensure file fields stay in snake_case for frontend
    // The field mapping already handles this, but we ensure it in toJSON
    const fileFields = [
        'file_video_filename', 'file_video_path', 'file_video_size', 'file_video_mimetype',
        'file_audio_filename', 'file_audio_path', 'file_audio_size', 'file_audio_mimetype',
        'file_pdf_filename', 'file_pdf_path', 'file_pdf_size', 'file_pdf_mimetype'
    ];
    
    // Ensure file fields are in snake_case (they should already be due to field mapping)
    fileFields.forEach(field => {
        if (values[field] !== undefined) {
            // Field is already in snake_case due to field mapping
        }
    });
    
    return values;
};

// Associations
Lesson.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(Lesson, { foreignKey: 'course_id', as: 'lessons' });

module.exports = Lesson;
