// Script to create/update admin user with secure password
// Usage: node scripts/create-admin.js [email] [username]

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const { sequelize } = require('../config/database');
require('dotenv').config();

// Generate secure random password
function generateSecurePassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    // Ensure at least one character from each set
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function createAdmin() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Get parameters from command line or use defaults
        const email = process.argv[2] || 'admin@e-learning.com';
        const username = process.argv[3] || 'admin';
        
        // Generate secure password
        const password = generateSecurePassword(16);
        
        console.log('🔐 Generating secure password for admin...\n');
        
        // Check if admin user already exists (by username or email)
        const { Op } = require('sequelize');
        const existingAdmin = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: username }
                ]
            }
        });

        if (existingAdmin) {
            // Update existing admin
            console.log(`📝 Updating existing admin user: ${existingAdmin.email || existingAdmin.username}`);
            existingAdmin.password = password;
            existingAdmin.role = 'admin';
            existingAdmin.username = username;
            existingAdmin.email = email;
            existingAdmin.isActive = true;
            await existingAdmin.save();
            console.log('✅ Admin user updated successfully!\n');
        } else {
            // Create new admin
            console.log(`➕ Creating new admin user: ${email}`);
            await User.create({
                username: username,
                email: email,
                password: password,
                role: 'admin',
                isActive: true
            });
            console.log('✅ Admin user created successfully!\n');
        }

        // Display credentials
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔑 ADMIN CREDENTIALS');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Email:    ${email}`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n⚠️  IMPORTANT: Save this password securely!');
        console.log('   It will not be shown again.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Run the script
createAdmin();

