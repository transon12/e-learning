const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'new',
        allowNull: false,
        comment: 'new, read, replied, archived'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    repliedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'replied_at'
    },
    repliedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'replied_by',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    replyMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'reply_message'
    }
}, {
    tableName: 'contact_messages',
    timestamps: true,
    underscored: true
});

module.exports = ContactMessage;

