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

// File filter - chỉ cho phép PDF, MP3, MP4
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'audio/mpeg',
        'audio/mp3',
        'video/mp4',
        'video/mpeg',
        'audio/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file PDF, MP3, MP4'), false);
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

