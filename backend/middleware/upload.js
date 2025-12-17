const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = uploadsDir;
        
        // Phân loại file theo type
        if (file.mimetype.startsWith('video/')) {
            uploadPath = path.join(uploadsDir, 'videos');
        } else if (file.mimetype === 'application/pdf') {
            uploadPath = path.join(uploadsDir, 'pdfs');
        } else if (file.mimetype.startsWith('audio/')) {
            uploadPath = path.join(uploadsDir, 'audios');
        } else if (file.mimetype.startsWith('image/')) {
            uploadPath = path.join(uploadsDir, 'images');
        } else {
            uploadPath = path.join(uploadsDir, 'others');
        }
        
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// File filter - cho phép PDF, MP3/MP4 (audio/video) và ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // PDF
        'application/pdf',
        // Audio formats (MP3, M4A, etc.)
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4',
        'audio/m4a',
        'audio/x-mpeg',
        'audio/x-mp3',
        'audio/x-m4a',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        // Video formats (MP4, etc.)
        'video/mp4',
        'video/mpeg',
        'video/x-m4v',
        'video/quicktime',
        'video/x-msvideo',
        // Image formats
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ];
    
    // Also check file extension as fallback
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.mp3', '.mp4', '.m4a', '.wav', '.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Chỉ cho phép upload file PDF, MP3/MP4, ảnh. File type: ${file.mimetype}, Extension: ${ext}`), false);
    }
};

// Cấu hình upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max
    }
});

// Middleware upload single file
exports.uploadSingle = (fieldName) => {
    return upload.single(fieldName);
};

// Middleware upload multiple files
exports.uploadMultiple = (fieldName, maxCount = 10) => {
    return upload.array(fieldName, maxCount);
};

// Middleware upload fields (nhiều field khác nhau)
exports.uploadFields = (fields) => {
    return upload.fields(fields);
};

