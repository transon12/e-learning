# Quick Start Guide - MySQL Setup

## ⚡ Setup nhanh trong 5 phút

### 1. Cài đặt MySQL
```bash
# Windows: Tải và cài MySQL từ https://dev.mysql.com/downloads/
# Mac: brew install mysql && brew services start mysql
# Linux: sudo apt-get install mysql-server
```

### 2. Tạo Database
```bash
# Đăng nhập MySQL
mysql -u root -p

# Chạy script
source backend/database/schema.sql
source backend/database/seed.sql
```

### 3. Cấu hình .env
Tạo file `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=e_learning
DB_PORT=3306
JWT_SECRET=your_secret_key
```

### 4. Cài đặt và chạy
```bash
cd backend
npm install
npm run dev
```

✅ Done! Backend đã sẵn sàng với MySQL!

## 🔑 Đăng nhập Admin
- Email: `admin@secretcoder.com`
- Password: `admin123`

