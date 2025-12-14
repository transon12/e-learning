# Hướng dẫn Setup PostgreSQL cho E-Learning Backend

## 🚀 Bước 1: Cài đặt PostgreSQL

### Windows
1. Tải PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Chạy installer và làm theo hướng dẫn
3. Ghi nhớ password cho user `postgres` (mặc định)

### macOS
```bash
# Sử dụng Homebrew
brew install postgresql@15
brew services start postgresql@15

# Hoặc sử dụng Postgres.app: https://postgresapp.com/
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 📦 Bước 2: Cài đặt Dependencies

Backend đã được cấu hình để hỗ trợ cả MySQL và PostgreSQL. Để sử dụng PostgreSQL:

```bash
cd backend
npm install
```

Dependencies cần thiết:
- `pg` - PostgreSQL driver
- `pg-hstore` - PostgreSQL hstore support cho Sequelize
- `sequelize` - ORM (hỗ trợ cả MySQL và PostgreSQL)

## 🗄️ Bước 3: Tạo Database

### Cách 1: Sử dụng PostgreSQL Command Line (psql)

```bash
# Đăng nhập PostgreSQL (mặc định user: postgres)
psql -U postgres

# Hoặc trên macOS/Linux nếu có vấn đề với authentication:
sudo -u postgres psql
```

Trong psql console:
```sql
-- Tạo database
CREATE DATABASE e_learning;

-- Tạo user (tùy chọn, hoặc dùng postgres user)
CREATE USER e_learning_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE e_learning TO e_learning_user;

-- Kết nối vào database
\c e_learning
```

### Cách 2: Sử dụng pgAdmin

1. Mở pgAdmin (GUI tool cho PostgreSQL)
2. Kết nối với PostgreSQL server
3. Right-click vào "Databases" → "Create" → "Database"
4. Đặt tên: `e_learning`
5. Click "Save"

## 📋 Bước 4: Chạy Schema và Seed Data

### Sử dụng psql command line:

```bash
# Chạy schema
psql -U postgres -d e_learning -f backend/database/schema-postgresql.sql

# Chạy seed data (sau khi schema đã chạy)
psql -U postgres -d e_learning -f backend/database/seed-postgresql.sql
```

### Hoặc trong psql console:

```sql
\c e_learning
\i backend/database/schema-postgresql.sql
\i backend/database/seed-postgresql.sql
```

## ⚙️ Bước 5: Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/` (nếu chưa có):

```env
# Database Configuration
DB_DIALECT=postgres
DB_NAME=e_learning
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Lưu ý:** 
- `DB_DIALECT=postgres` để sử dụng PostgreSQL
- Nếu muốn quay lại MySQL, đặt `DB_DIALECT=mysql` (hoặc không set, mặc định là postgres)
- Thay `your_postgres_password` bằng password PostgreSQL của bạn!

## 🧪 Bước 6: Test Connection

```bash
cd backend
npm start
```

Nếu thành công, bạn sẽ thấy:
```
✅ PostgreSQL Connection has been established successfully.
🚀 Server is running on port 5000
📚 E-Learning API: http://localhost:5000/api
```

## 🔄 Chuyển đổi giữa MySQL và PostgreSQL

Backend đã được cấu hình để hỗ trợ cả hai database. Để chuyển đổi:

1. **Để dùng PostgreSQL:** Đặt `DB_DIALECT=postgres` trong `.env`
2. **Để dùng MySQL:** Đặt `DB_DIALECT=mysql` trong `.env`

Các routes và models không cần thay đổi vì đã sử dụng Sequelize ORM (database-agnostic).

## 📊 So sánh MySQL vs PostgreSQL

### Điểm khác biệt chính trong schema:

| MySQL | PostgreSQL |
|-------|------------|
| `AUTO_INCREMENT` | `SERIAL` |
| `ENGINE=InnoDB` | (không cần) |
| `ON DUPLICATE KEY UPDATE` | `ON CONFLICT ... DO UPDATE` |
| `TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Trigger function |
| `ENUM` | `CREATE TYPE ... AS ENUM` |

### Ưu điểm PostgreSQL:
- ✅ Hỗ trợ tốt hơn cho JSON/JSONB
- ✅ Full-text search mạnh mẽ
- ✅ Hỗ trợ nhiều kiểu dữ liệu phức tạp
- ✅ ACID compliance tốt hơn
- ✅ Phù hợp cho ứng dụng lớn

## 🐛 Troubleshooting

### Lỗi kết nối PostgreSQL:

1. **Kiểm tra PostgreSQL đã chạy:**
   ```bash
   # macOS/Linux
   brew services list  # hoặc
   sudo systemctl status postgresql
   
   # Windows
   # Kiểm tra Services trong Windows
   ```

2. **Kiểm tra authentication:**
   - File `pg_hba.conf` có thể cần chỉnh sửa
   - Đảm bảo user có quyền truy cập database

3. **Kiểm tra port:**
   - PostgreSQL mặc định chạy trên port `5432`
   - Đảm bảo không có conflict với service khác

4. **Lỗi "password authentication failed":**
   ```bash
   # Reset password cho postgres user
   sudo -u postgres psql
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Lỗi khi chạy schema:

1. **Lỗi "relation already exists":**
   - Database đã có tables, cần drop và tạo lại:
   ```sql
   DROP DATABASE e_learning;
   CREATE DATABASE e_learning;
   ```

2. **Lỗi "permission denied":**
   - Đảm bảo user có quyền CREATE, DROP, etc.
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE e_learning TO your_user;
   ```

## 📝 Migration từ MySQL sang PostgreSQL

Nếu bạn đã có data trong MySQL và muốn migrate:

1. **Export data từ MySQL:**
   ```bash
   mysqldump -u root -p e_learning > mysql_backup.sql
   ```

2. **Transform data format** (cần chỉnh sửa thủ công một số syntax)

3. **Import vào PostgreSQL:**
   ```bash
   psql -U postgres -d e_learning < transformed_backup.sql
   ```

**Lưu ý:** Migration data cần chỉnh sửa thủ công vì syntax khác nhau. Hoặc sử dụng tool như `pgloader`.

## ✅ Checklist

Sau khi setup, đảm bảo:

- [ ] PostgreSQL đã được cài đặt và chạy
- [ ] Database `e_learning` đã được tạo
- [ ] Schema đã được chạy thành công
- [ ] Seed data đã được import
- [ ] File `.env` đã được cấu hình đúng
- [ ] Dependencies đã được cài đặt (`npm install`)
- [ ] Server chạy thành công và kết nối được database
- [ ] API endpoints hoạt động bình thường

## 🔗 Tài liệu tham khảo

- PostgreSQL Official Docs: https://www.postgresql.org/docs/
- Sequelize PostgreSQL Guide: https://sequelize.org/docs/v6/getting-started/
- pg Driver: https://node-postgres.com/

---

**Chúc bạn setup thành công! 🎉**

