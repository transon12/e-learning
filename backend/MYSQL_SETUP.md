# Hướng dẫn Setup MySQL cho E-Learning Backend

## 🚀 Bước 1: Cài đặt MySQL

### Windows:
1. Tải MySQL từ: https://dev.mysql.com/downloads/installer/
2. Hoặc sử dụng XAMPP (đã có MySQL): https://www.apachefriends.org/

### Mac:
```bash
brew install mysql
brew services start mysql
```

### Linux:
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

## 📦 Bước 2: Cài đặt Dependencies

```bash
cd backend
npm install
```

Dependencies mới:
- `mysql2` - MySQL driver
- `sequelize` - ORM cho MySQL

## 🗄️ Bước 3: Tạo Database

### Cách 1: Sử dụng MySQL Command Line

```bash
# Đăng nhập MySQL
mysql -u root -p

# Chạy script tạo database
source backend/database/schema.sql

# (Tùy chọn) Chạy script seed data
source backend/database/seed.sql
```

### Cách 2: Sử dụng MySQL Workbench

1. Mở MySQL Workbench
2. Kết nối với MySQL server
3. File → Open SQL Script → Chọn `backend/database/schema.sql`
4. Chạy script (⚡ icon)
5. (Tùy chọn) Chạy `seed.sql` để có dữ liệu mẫu

### Cách 3: Sử dụng phpMyAdmin (nếu dùng XAMPP)

1. Mở http://localhost/phpmyadmin
2. Tạo database mới: `e_learning`
3. Chọn database `e_learning`
4. Import → Chọn file `schema.sql`
5. (Tùy chọn) Import `seed.sql`

## ⚙️ Bước 4: Cấu hình .env

Tạo file `.env` trong thư mục `backend`:

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=e_learning
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Lưu ý:** Thay `your_mysql_password` bằng password MySQL của bạn!

## 🧪 Bước 5: Test Connection

```bash
cd backend
npm run dev
```

Bạn sẽ thấy:
```
✅ MySQL Connection has been established successfully.
🚀 Server is running on port 5000
```

## 📊 Database Structure

Sau khi chạy `schema.sql`, bạn sẽ có:

- ✅ `users` - Bảng người dùng
- ✅ `courses` - Bảng khóa học
- ✅ `course_sections` - Bảng sections
- ✅ `lessons` - Bảng bài học
- ✅ `enrollments` - Bảng đăng ký
- ✅ `completed_lessons` - Bảng bài học đã hoàn thành

## 🔐 Tài khoản mặc định

Sau khi chạy `seed.sql`:

**Admin:**
- Email: `admin@secretcoder.com`
- Password: `admin123`

**Instructor:**
- Email: `instructor@secretcoder.com`
- Password: `admin123`

⚠️ **Đổi password ngay sau khi setup!**

## 🔄 Migration từ MongoDB

Nếu bạn đã dùng MongoDB trước đó:

1. **Backup dữ liệu MongoDB** (nếu có)
2. **Xóa các file MongoDB models** (nếu muốn)
3. **Sử dụng MySQL routes** (đã được cấu hình sẵn)

## 🛠️ Troubleshooting

### Lỗi: "Access denied for user"
- Kiểm tra username/password trong `.env`
- Đảm bảo MySQL user có quyền truy cập database

### Lỗi: "Unknown database 'e_learning'"
- Chạy lại `schema.sql` để tạo database

### Lỗi: "Table already exists"
- Chạy `reset.sql` để xóa tables cũ
- Sau đó chạy lại `schema.sql`

### Lỗi kết nối
```bash
# Kiểm tra MySQL đang chạy
# Windows
net start mysql

# Mac/Linux
sudo systemctl status mysql
```

## 📝 Files đã thay đổi

### Models (Sequelize):
- `backend/models/User.js` - User model với Sequelize
- `backend/models/Course.js` - Course model
- `backend/models/Lesson.js` - Lesson model
- `backend/models/Enrollment.js` - Enrollment models
- `backend/models/index.js` - Model exports và associations

### Routes (MySQL):
- `backend/routes/auth-mysql.js`
- `backend/routes/courses-mysql.js`
- `backend/routes/lessons-mysql.js`
- `backend/routes/users-mysql.js`
- `backend/routes/enrollments-mysql.js`
- `backend/routes/admin-mysql.js`
- `backend/routes/upload-mysql.js`

### Config:
- `backend/config/database.js` - Sequelize configuration

### Database:
- `backend/database/schema.sql` - SQL schema
- `backend/database/seed.sql` - Sample data
- `backend/database/reset.sql` - Reset script

## ✅ Checklist

- [ ] MySQL đã được cài đặt và chạy
- [ ] Database `e_learning` đã được tạo
- [ ] Tables đã được tạo từ `schema.sql`
- [ ] File `.env` đã được cấu hình đúng
- [ ] Dependencies đã được cài đặt (`npm install`)
- [ ] Backend server chạy thành công
- [ ] Kết nối database thành công

## 🎉 Hoàn thành!

Bây giờ bạn có thể:
1. Chạy backend: `npm run dev`
2. Test API endpoints
3. Sử dụng admin panel
4. Upload files cho bài học

