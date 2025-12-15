# Hướng dẫn Deploy lên Vercel

## Cấu trúc Project

Project này được cấu hình để deploy lên Vercel với:
- **Frontend**: Vue.js app (build với Vite)
- **Backend**: Express.js API (chạy như serverless functions)

## Các bước Deploy

### 1. Chuẩn bị môi trường

Đảm bảo bạn đã cài đặt:
- Node.js (version 18.x trở lên)
- Vercel CLI: `npm i -g vercel`

### 2. Cài đặt Dependencies

```bash
# Cài đặt dependencies cho frontend
npm install

# Cài đặt dependencies cho backend
cd backend
npm install
cd ..
```

### 3. Cấu hình Environment Variables

Trong Vercel Dashboard, thêm các biến môi trường sau:

**Database Configuration:**
```
DB_DIALECT=postgres (hoặc mysql)
DB_HOST=your-database-host
DB_PORT=5432 (hoặc 3306 cho MySQL)
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DATABASE_URL=your-connection-string (nếu dùng Supabase)
```

**JWT Secret:**
```
JWT_SECRET=your-jwt-secret-key
```

**AWS S3 (nếu dùng):**
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET_NAME=your-bucket-name
```

**Email Configuration (nếu dùng):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

**Frontend API URL:**
```
VITE_API_BASE_URL=https://your-vercel-app.vercel.app/api
```

### 4. Deploy với Vercel CLI

```bash
# Login vào Vercel
vercel login

# Deploy lần đầu (sẽ hỏi các câu hỏi cấu hình)
vercel

# Deploy production
vercel --prod
```

### 5. Deploy qua GitHub (Recommended)

1. Push code lên GitHub repository
2. Vào [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import repository từ GitHub
5. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install && cd backend && npm install`
6. Thêm tất cả Environment Variables
7. Click "Deploy"

## Cấu trúc Files

- `vercel.json`: Cấu hình Vercel
- `api/index.js`: Serverless function handler cho Express backend
- `.vercelignore`: Files/folders bị loại trừ khi deploy

## Lưu ý quan trọng

### 1. File Uploads
Vercel serverless functions có giới hạn về file system. Để upload files, bạn nên:
- Sử dụng AWS S3 hoặc Vercel Blob Storage
- Không lưu files trực tiếp vào serverless function

### 2. Database Connection
- Đảm bảo database của bạn cho phép kết nối từ Vercel IPs
- Với Supabase: đã được cấu hình SSL tự động
- Với MySQL/PostgreSQL tự host: cần whitelist Vercel IPs

### 3. Cold Start
Serverless functions có thể có cold start delay lần đầu. Để giảm thiểu:
- Sử dụng Vercel Pro plan (có better cold start performance)
- Hoặc sử dụng Vercel Edge Functions cho một số routes

### 4. Build Time
Nếu build fail, kiểm tra:
- Tất cả dependencies đã được cài đặt
- Environment variables đã được set đúng
- Database connection string đúng format

## Troubleshooting

### Build fails với "Cannot find module"
- Đảm bảo cả frontend và backend dependencies đã được cài đặt
- Kiểm tra `package.json` có đầy đủ dependencies

### API routes không hoạt động
- Kiểm tra `vercel.json` routes configuration
- Kiểm tra `api/index.js` export đúng format
- Xem logs trong Vercel Dashboard

### Database connection errors
- Kiểm tra environment variables
- Đảm bảo database cho phép external connections
- Kiểm tra firewall rules

## Support

Nếu gặp vấn đề, kiểm tra:
1. Vercel Build Logs trong Dashboard
2. Function Logs trong Vercel Dashboard
3. Network tab trong browser DevTools

