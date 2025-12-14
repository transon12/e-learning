const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50]
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [6, 255]
        }
    },
    role: {
        type: DataTypes.ENUM('student', 'instructor', 'admin'),
        defaultValue: 'student'
    },
    profileFirstName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'profile_first_name'
    },
    profileLastName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'profile_last_name'
    },
    profile_avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    profile_bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profile_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
        }
    }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
