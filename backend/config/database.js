const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine database dialect from environment or default to PostgreSQL
const DB_DIALECT = process.env.DB_DIALECT || 'postgres';

// Pre-load pg module for PostgreSQL dialect to ensure it's available when Sequelize initializes
// This is especially important for Vercel serverless functions
if (DB_DIALECT === 'postgres') {
    try {
        require('pg');
    } catch (error) {
        console.warn('Warning: pg package not found. Please install it: npm install pg pg-hstore');
    }
}

// Database configuration based on dialect
const getDatabaseConfig = () => {
    const baseConfig = {
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        }
    };

    if (DB_DIALECT === 'postgres') {
        const dialectOptions = {
            // PostgreSQL specific options
        };

        // Supabase SSL configuration
        if (process.env.DB_HOST && process.env.DB_HOST.includes('supabase.co')) {
            dialectOptions.ssl = {
                require: true,
                rejectUnauthorized: false // Supabase uses self-signed certificates
            };
        }

        return {
            ...baseConfig,
            dialect: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            define: {
                ...baseConfig.define,
                underscored: true, // PostgreSQL uses snake_case
                underscoredAll: true
            },
            dialectOptions
        };
    } else {
        // MySQL configuration
        return {
            ...baseConfig,
            dialect: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            define: {
                ...baseConfig.define,
                underscored: false // MySQL uses camelCase
            }
        };
    }
};

// Support Supabase connection string (DATABASE_URL)
let sequelize;
if (process.env.DATABASE_URL && DB_DIALECT === 'postgres') {
    // Parse Supabase connection string
    // Format: postgresql://user:password@host:port/database?sslmode=require
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            underscoredAll: true,
            freezeTableName: true
        },
        dialectOptions: {
            ssl: process.env.DATABASE_URL.includes('supabase.co') ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    });
} else {
    // Use individual connection parameters
    sequelize = new Sequelize(
        process.env.DB_NAME || 'e_learning',
        process.env.DB_USER || (DB_DIALECT === 'postgres' ? 'postgres' : 'root'),
        process.env.DB_PASSWORD || '',
        getDatabaseConfig()
    );
}

// Test connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        const dbName = DB_DIALECT === 'postgres' ? 'PostgreSQL' : 'MySQL';
        console.log(`✅ ${dbName} Connection has been established successfully.`);
        return true;
    } catch (error) {
        const dbName = DB_DIALECT === 'postgres' ? 'PostgreSQL' : 'MySQL';
        console.error(`❌ Unable to connect to ${dbName} database:`, error);
        return false;
    }
}

module.exports = { sequelize, testConnection };

