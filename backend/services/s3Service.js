const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { s3Client, S3_BUCKET_NAME, S3_BUCKET_URL } = require('../config/s3');
const path = require('path');

/**
 * Upload file to S3
 * @param {Buffer|Stream} fileBuffer - File buffer or stream
 * @param {string} fileName - File name with path
 * @param {string} contentType - MIME type
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} Upload result with URL
 */
async function uploadToS3(fileBuffer, fileName, contentType, metadata = {}) {
    try {
        // Ensure fileName starts with uploads/
        const key = fileName.startsWith('uploads/') ? fileName : `uploads/${fileName}`;
        
        // Use Upload for large files (multipart upload)
        // Note: ACL is removed because bucket has "Bucket owner enforced" setting
        // To make files public, use bucket policy instead of ACL
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: S3_BUCKET_NAME,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
                Metadata: metadata
                // ACL removed - use bucket policy for public access if needed
            }
        });

        const result = await upload.done();
        
        // Return public URL
        const fileUrl = `${S3_BUCKET_URL}/${key}`;
        
        return {
            success: true,
            url: fileUrl,
            key: key,
            location: result.Location,
            etag: result.ETag
        };
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
}

/**
 * Upload file from local path to S3
 * @param {string} filePath - Local file path
 * @param {string} contentType - MIME type
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} Upload result with URL
 */
async function uploadFileToS3(filePath, contentType, metadata = {}) {
    const fs = require('fs');
    
    try {
        console.log('[S3 Service] Reading file from:', filePath);
        // Read file buffer
        const fileBuffer = fs.readFileSync(filePath);
        console.log('[S3 Service] File size:', fileBuffer.length, 'bytes');
        
        // Get file name from path
        const fileName = path.basename(filePath);
        const dirName = path.dirname(filePath).split(path.sep).pop(); // Get last directory name (videos, images, etc.)
        const s3Key = `uploads/${dirName}/${fileName}`;
        console.log('[S3 Service] S3 Key:', s3Key);
        
        // Upload to S3
        const result = await uploadToS3(fileBuffer, s3Key, contentType, metadata);
        console.log('[S3 Service] Upload result:', result.url);
        
        return result;
    } catch (error) {
        console.error('[S3 Service] Error uploading file to S3:', error);
        console.error('[S3 Service] Error stack:', error.stack);
        throw error;
    }
}

/**
 * Delete file from S3
 * @param {string} fileKey - S3 object key (path)
 * @returns {Promise<boolean>} Success status
 */
async function deleteFromS3(fileKey) {
    try {
        // Remove S3_BUCKET_URL prefix if present
        let key = fileKey;
        if (key.startsWith(S3_BUCKET_URL)) {
            key = key.replace(S3_BUCKET_URL + '/', '');
        }
        
        // Ensure key starts with uploads/
        if (!key.startsWith('uploads/')) {
            key = `uploads/${key}`;
        }
        
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key
        });
        
        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('Error deleting from S3:', error);
        throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
}

/**
 * Get file URL from S3 key or local path
 * @param {string} filePath - File path (can be local path or S3 key)
 * @returns {string} File URL
 */
function getFileUrl(filePath) {
    if (!filePath) return null;
    
    // If already a full URL (S3 or external), return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    
    // If it's an S3 key (starts with uploads/), construct S3 URL
    if (filePath.startsWith('uploads/')) {
        return `${S3_BUCKET_URL}/${filePath}`;
    }
    
    // Otherwise, assume it's a local path and return as relative path
    return filePath.startsWith('/') ? filePath : `/${filePath}`;
}

/**
 * Extract S3 key from URL
 * @param {string} url - Full S3 URL
 * @returns {string} S3 key
 */
function extractS3Key(url) {
    if (!url) return null;
    
    if (url.startsWith(S3_BUCKET_URL)) {
        return url.replace(S3_BUCKET_URL + '/', '');
    }
    
    // If it's already a key
    if (url.startsWith('uploads/')) {
        return url;
    }
    
    return null;
}

module.exports = {
    uploadToS3,
    uploadFileToS3,
    deleteFromS3,
    getFileUrl,
    extractS3Key
};

