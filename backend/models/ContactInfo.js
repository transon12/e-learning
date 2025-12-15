const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactInfo = sequelize.define('ContactInfo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'address, phone, email, social'
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    value: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'FontAwesome icon class'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'contact_info',
    timestamps: true,
    underscored: true
});

module.exports = ContactInfo;

