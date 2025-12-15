const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

// AWS S3 Configuration
const s3Config = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
};

// Create S3 client
const s3Client = new S3Client(s3Config);

// S3 Bucket configuration
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';
const S3_BUCKET_URL = process.env.AWS_S3_BUCKET_URL || `https://${S3_BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com`;

// Check if S3 is configured
const isS3Configured = () => {
    return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET_NAME &&
        process.env.AWS_REGION
    );
};

module.exports = {
    s3Client,
    S3_BUCKET_NAME,
    S3_BUCKET_URL,
    isS3Configured
};

