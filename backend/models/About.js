const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const About = sequelize.define('About', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'About Us'
    },
    subtitle: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    mission: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    vision: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    values: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array or comma-separated values'
    },
    teamDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'team_description'
    },
    imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'image_url'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'about',
    timestamps: true,
    underscored: true
});

module.exports = About;

