# Fix lỗi "Please install pg package manually" trên Vercel

## Vấn đề

Khi deploy lên Vercel, serverless function báo lỗi `Please install pg package manually` vì package `pg` không được cài đặt trong môi trường runtime.

## Nguyên nhân

Vercel serverless functions trong thư mục `api/` cần có dependencies được cài đặt trong chính thư mục đó. Mặc dù `api/package.json` đã có `pg`, nhưng Vercel có thể không tự động install dependencies từ thư mục `api/`.

## Giải pháp

### 1. Đảm bảo `api/package.json` có đầy đủ dependencies

File `api/package.json` đã có `pg` và `pg-hstore`. Đảm bảo nó có tất cả dependencies cần thiết từ `backend/package.json`.

### 2. Cập nhật `vercel.json`

Đã thêm `installCommand` vào `vercel.json`:
```json
{
  "installCommand": "npm install && cd api && npm install"
}
```

### 3. Cập nhật `vercel-build` script

Đã cập nhật script trong `package.json`:
```json
{
  "vercel-build": "npm install && cd api && npm install && cd .. && cd backend && npm install && cd .. && vite build"
}
```

### 4. Kiểm tra trong Vercel Dashboard

Trong Vercel Dashboard, đảm bảo:
- **Install Command**: `npm install && cd api && npm install`
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`

### 5. Nếu vẫn lỗi - Thử giải pháp thay thế

Nếu vẫn gặp lỗi, có thể cần:

#### Option A: Copy node_modules từ api vào function
Tạo script để copy dependencies:
```bash
# Trong vercel-build script
npm install && cd api && npm install && cd .. && vite build
```

#### Option B: Sử dụng Vercel's function configuration
Tạo file `api/vercel.json` hoặc cấu hình trong root `vercel.json`:
```json
{
  "functions": {
    "api/index.js": {
      "includeFiles": "api/node_modules/**"
    }
  }
}
```

#### Option C: Bundle dependencies
Sử dụng bundler như `esbuild` hoặc `webpack` để bundle tất cả dependencies vào function.

## Kiểm tra sau khi deploy

1. Vào Vercel Dashboard → Project → Functions
2. Click vào function `api/index.js`
3. Xem logs để kiểm tra xem `pg` đã được load chưa
4. Test API endpoint để xem có còn lỗi không

## Troubleshooting

### Nếu vẫn lỗi sau khi deploy:

1. **Kiểm tra Build Logs**: Xem trong Vercel Dashboard có thấy `npm install` chạy trong thư mục `api/` không
2. **Kiểm tra Function Logs**: Xem runtime logs để xác định chính xác lỗi
3. **Kiểm tra node_modules**: Đảm bảo `api/node_modules/pg` tồn tại sau khi build
4. **Thử re-deploy**: Đôi khi cần clear cache và deploy lại

### Alternative: Sử dụng Supabase SDK thay vì Sequelize

Nếu vẫn gặp vấn đề, có thể chuyển sang sử dụng `@supabase/supabase-js` SDK thay vì Sequelize với `pg` driver. SDK này đã được cài đặt và không cần native dependencies.

