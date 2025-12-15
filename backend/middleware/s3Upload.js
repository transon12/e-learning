const { isS3Configured } = require('../config/s3');
const { uploadFileToS3, deleteFromS3, getFileUrl } = require('../services/s3Service');
const fs = require('fs');
const path = require('path');

/**
 * Middleware to upload file to S3 after multer saves it locally
 * This middleware should be used after multer middleware
 */
const uploadToS3Middleware = async (req, res, next) => {
    // Skip if S3 is not configured
    if (!isS3Configured()) {
        return next();
    }

    try {
        // Handle single file
        if (req.file) {
            console.log('[S3 Upload] Uploading file to S3:', req.file.originalname);
            const s3Result = await uploadFileToS3(
                req.file.path,
                req.file.mimetype,
                {
                    originalName: req.file.originalname,
                    uploadedBy: req.user?.id?.toString() || 'unknown'
                }
            );

            console.log('[S3 Upload] Upload successful:', s3Result.url);

            // Add S3 info to file object
            req.file.s3Url = s3Result.url;
            req.file.s3Key = s3Result.key;
            req.file.location = s3Result.location;

            // Delete local file after successful S3 upload
            const localPath = req.file.path;
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
                console.log('[S3 Upload] Deleted local file:', localPath);
            }

            // Update file path to S3 URL
            req.file.path = s3Result.url;
        }

        // Handle multiple files
        if (req.files) {
            const uploadPromises = [];

            // Process all files (array or object with arrays)
            const allFiles = Array.isArray(req.files) 
                ? req.files 
                : Object.values(req.files).flat();

            for (const file of allFiles) {
                if (file && file.path) {
                    uploadPromises.push(
                        uploadFileToS3(file.path, file.mimetype, {
                            originalName: file.originalname,
                            uploadedBy: req.user?.id?.toString() || 'unknown'
                        }).then(s3Result => {
                            // Add S3 info to file object
                            file.s3Url = s3Result.url;
                            file.s3Key = s3Result.key;
                            file.location = s3Result.location;

                            // Delete local file after successful S3 upload
                            if (fs.existsSync(file.path)) {
                                fs.unlinkSync(file.path);
                            }

                            // Update file path to S3 URL
                            file.path = s3Result.url;
                        })
                    );
                }
            }

            await Promise.all(uploadPromises);
        }

        next();
    } catch (error) {
        console.error('[S3 Upload] Error uploading to S3:', error);
        console.error('[S3 Upload] Error details:', error.message);
        // Continue with local file if S3 upload fails
        // File will remain local and be served from /uploads
        next();
    }
};

/**
 * Helper function to delete file from S3 or local
 */
const deleteFile = async (filePath) => {
    if (!filePath) return;

    try {
        // Check if it's an S3 URL
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            const { extractS3Key, deleteFromS3 } = require('../services/s3Service');
            const s3Key = extractS3Key(filePath);
            if (s3Key) {
                await deleteFromS3(s3Key);
                return;
            }
        }

        // Otherwise, delete local file
        if (filePath.startsWith('/uploads') || filePath.startsWith('uploads')) {
            const fullPath = path.join(__dirname, '..', filePath.startsWith('/') ? filePath : `/${filePath}`);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

module.exports = {
    uploadToS3Middleware,
    deleteFile
};

