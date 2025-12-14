# Hướng dẫn Setup Supabase cho E-Learning Backend

## 🚀 Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Đăng ký/Đăng nhập tài khoản
3. Click "New Project"
4. Điền thông tin:
   - **Name**: e-learning (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh (lưu lại!)
   - **Region**: Chọn region gần bạn nhất
5. Click "Create new project"
6. Đợi project được tạo (khoảng 2-3 phút)

## 🔑 Bước 2: Lấy Connection String

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Chọn **Database** trong menu bên trái
3. Scroll xuống phần **Connection string**
4. Chọn tab **URI** hoặc **Connection pooling**
5. Copy connection string (sẽ có dạng):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## 📋 Bước 3: Chạy Schema

### Cách 1: Sử dụng Supabase SQL Editor (Khuyến nghị)

1. Vào **SQL Editor** trong Supabase Dashboard
2. Click **New query**
3. Copy toàn bộ nội dung file `backend/database/schema-postgresql.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Kiểm tra kết quả - nếu thành công sẽ thấy "Success. No rows returned"

### Cách 2: Sử dụng psql command line

```bash
# Cài đặt psql nếu chưa có
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Chạy schema
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" -f backend/database/schema-postgresql.sql
```

### Cách 3: Sử dụng Supabase CLI

```bash
# Cài đặt Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Chạy migration
supabase db push
```

## ⚙️ Bước 4: Cấu hình Environment Variables

Tạo file `.env` trong thư mục `backend/`:

### Cách 1: Sử dụng Connection String (Khuyến nghị cho Supabase)

```env
# Database Configuration
DB_DIALECT=postgres
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Hoặc sử dụng Connection Pooling (tốt hơn cho production)
# DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Cách 2: Sử dụng Individual Parameters

```env
# Database Configuration
DB_DIALECT=postgres
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_supabase_password
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Lưu ý quan trọng:**
- Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo khi tạo project
- Thay `xxxxx` bằng project reference ID của bạn
- **KHÔNG commit file `.env` lên Git!** (đã có trong .gitignore)

## 📦 Bước 5: Cài đặt Dependencies

```bash
cd backend
npm install
```

Đảm bảo các packages sau đã được cài:
- `pg` - PostgreSQL driver
- `pg-hstore` - PostgreSQL hstore support
- `sequelize` - ORM

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

## 🌱 Bước 7: Seed Data (Tùy chọn)

Nếu muốn thêm dữ liệu mẫu:

1. Vào **SQL Editor** trong Supabase
2. Copy nội dung file `backend/database/seed-postgresql.sql`
3. Paste và chạy

Hoặc sử dụng psql:
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" -f backend/database/seed-postgresql.sql
```

## 🔒 Bước 8: Cấu hình Row Level Security (RLS) - Tùy chọn

Supabase có Row Level Security mặc định. Nếu bạn muốn tắt (cho development):

1. Vào **SQL Editor**
2. Chạy:
```sql
-- Tắt RLS cho tất cả tables (chỉ cho development!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
-- ... và các tables khác
```

**Lưu ý:** Tắt RLS chỉ nên dùng cho development. Production nên bật RLS và cấu hình policies phù hợp.

## 🔗 Connection Pooling (Khuyến nghị cho Production)

Supabase cung cấp Connection Pooling để tối ưu hiệu suất:

1. Vào **Project Settings** → **Database**
2. Scroll xuống **Connection string**
3. Chọn tab **Connection pooling**
4. Copy connection string (port 6543)
5. Sử dụng connection string này trong `.env`

**Lưu ý:** Connection pooling sử dụng port **6543** thay vì 5432.

## 📊 Supabase Dashboard Features

Supabase cung cấp nhiều tính năng hữu ích:

1. **Table Editor**: Xem và chỉnh sửa data trực tiếp
2. **SQL Editor**: Chạy SQL queries
3. **Database**: Xem schema, indexes, relationships
4. **API**: Auto-generated REST API (không cần dùng nếu đã có backend)
5. **Storage**: Lưu trữ files (có thể dùng cho uploads)

## 🐛 Troubleshooting

### Lỗi "Connection refused"

- Kiểm tra `DB_HOST` và `DB_PORT` đúng chưa
- Kiểm tra Supabase project đã active chưa
- Kiểm tra firewall/network

### Lỗi "password authentication failed"

- Kiểm tra password trong `.env` đúng chưa
- Reset password trong Supabase Dashboard nếu cần

### Lỗi SSL

- Đảm bảo `dialectOptions.ssl` đã được cấu hình (đã tự động trong code)
- Nếu vẫn lỗi, thử thêm vào `.env`:
  ```env
  DB_SSL=true
  ```

### Lỗi "relation does not exist"

- Đảm bảo đã chạy schema SQL
- Kiểm tra database name đúng chưa (Supabase mặc định là `postgres`)

### Connection timeout

- Kiểm tra network connection
- Thử sử dụng Connection Pooling (port 6543)
- Tăng timeout trong pool config nếu cần

## ✅ Checklist

Sau khi setup, đảm bảo:

- [ ] Supabase project đã được tạo
- [ ] Connection string đã được copy vào `.env`
- [ ] Schema đã được chạy thành công
- [ ] Dependencies đã được cài đặt (`npm install`)
- [ ] Server chạy thành công và kết nối được database
- [ ] API endpoints hoạt động bình thường
- [ ] Seed data đã được import (nếu cần)

## 🔗 Tài liệu tham khảo

- Supabase Docs: https://supabase.com/docs
- Supabase PostgreSQL Guide: https://supabase.com/docs/guides/database
- Sequelize PostgreSQL: https://sequelize.org/docs/v6/getting-started/

---

**Chúc bạn setup thành công với Supabase! 🎉**

