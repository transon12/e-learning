# MySQL Database Setup

## 📋 Hướng dẫn cài đặt Database

### 1. Cài đặt MySQL

**Windows:**
- Tải MySQL từ: https://dev.mysql.com/downloads/mysql/
- Hoặc sử dụng XAMPP/WAMP (đã bao gồm MySQL)

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### 2. Tạo Database

**Cách 1: Sử dụng MySQL Command Line**
```bash
mysql -u root -p
```

Sau đó chạy:
```sql
source backend/database/schema.sql
source backend/database/seed.sql
```

**Cách 2: Sử dụng MySQL Workbench hoặc phpMyAdmin**
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Tạo database mới tên `e_learning`
3. Import file `backend/database/schema.sql`
4. (Tùy chọn) Import file `backend/database/seed.sql` để có dữ liệu mẫu

**Cách 3: Sử dụng Command Line trực tiếp**
```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p e_learning < backend/database/seed.sql
```

### 3. Cấu hình .env

Cập nhật file `.env` trong thư mục `backend`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=e_learning
DB_PORT=3306
```

### 4. Test Connection

Chạy backend và kiểm tra kết nối:
```bash
cd backend
npm install
npm run dev
```

Bạn sẽ thấy thông báo:
```
✅ MySQL Connection has been established successfully.
```

## 📊 Cấu trúc Database

### Tables chính:

1. **users** - Người dùng (học viên, giảng viên, admin)
2. **courses** - Khóa học
3. **course_sections** - Các section trong khóa học
4. **lessons** - Bài học
5. **section_lessons** - Liên kết lesson với section
6. **enrollments** - Đăng ký khóa học
7. **completed_lessons** - Bài học đã hoàn thành
8. **course_skills** - Kỹ năng học được từ khóa học
9. **course_requirements** - Yêu cầu khóa học
10. **course_learnings** - Những gì sẽ học
11. **lesson_resources** - Tài nguyên bài học

## 🔐 Tài khoản mặc định

Sau khi chạy seed.sql, bạn có:

**Admin:**
- Username: `admin`
- Email: `admin@secretcoder.com`
- Password: `admin123`

**Instructor:**
- Username: `instructor1`
- Email: `instructor@secretcoder.com`
- Password: `admin123`

⚠️ **Lưu ý:** Đổi password ngay sau khi setup!

## 🛠️ Troubleshooting

### Lỗi kết nối MySQL:

1. **Kiểm tra MySQL đã chạy:**
```bash
# Windows
net start mysql

# Mac/Linux
sudo systemctl status mysql
```

2. **Kiểm tra user và password trong .env**

3. **Kiểm tra database đã tồn tại:**
```sql
SHOW DATABASES;
USE e_learning;
SHOW TABLES;
```

### Lỗi import SQL:

- Đảm bảo MySQL version >= 5.7
- Kiểm tra encoding: `utf8mb4`
- Xóa database cũ nếu có: `DROP DATABASE IF EXISTS e_learning;`

## 📝 Migration từ MongoDB

Nếu bạn đã có dữ liệu trong MongoDB, cần:
1. Export dữ liệu từ MongoDB
2. Transform sang format MySQL
3. Import vào MySQL

## 🔄 Backup Database

```bash
# Backup
mysqldump -u root -p e_learning > backup.sql

# Restore
mysql -u root -p e_learning < backup.sql
```

