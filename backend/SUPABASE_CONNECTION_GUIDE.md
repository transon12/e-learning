# Hướng dẫn Kết nối Express với Supabase

## 📋 Tổng quan

Backend này sử dụng **Sequelize ORM** để kết nối với Supabase PostgreSQL database. Supabase là một PostgreSQL cloud service, nên chúng ta kết nối qua PostgreSQL protocol.

## 🚀 Cách 1: Sử dụng Connection String (Khuyến nghị)

### Bước 1: Lấy Connection String từ Supabase

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** (biểu tượng bánh răng) → **Database**
4. Scroll xuống phần **Connection string**
5. Chọn tab **URI** hoặc **Connection pooling**
6. Copy connection string

**Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**Hoặc Connection Pooling (tốt hơn cho production):**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Bước 2: Tạo file `.env`

Tạo file `.env` trong thư mục `backend/`:

```env
# Database Configuration - Supabase
DB_DIALECT=postgres
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Lưu ý:**
- Thay `[YOUR-PASSWORD]` bằng password bạn đã tạo khi tạo Supabase project
- Thay `xxxxx` bằng project reference ID của bạn
- **KHÔNG commit file `.env` lên Git!**

### Bước 3: Cài đặt Dependencies

```bash
cd backend
npm install
```

Đảm bảo các packages sau đã được cài:
- `pg` - PostgreSQL driver
- `pg-hstore` - PostgreSQL hstore support cho Sequelize
- `sequelize` - ORM
- `dotenv` - Để đọc file .env

### Bước 4: Chạy Schema

#### Cách A: Sử dụng Supabase SQL Editor (Dễ nhất)

1. Vào **SQL Editor** trong Supabase Dashboard
2. Click **New query**
3. Copy toàn bộ nội dung file `backend/database/schema-postgresql.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter / Cmd+Enter)
6. Kiểm tra kết quả - nếu thành công sẽ thấy "Success. No rows returned"

#### Cách B: Sử dụng psql command line

```bash
# Cài đặt psql nếu chưa có
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql-client
# Windows: Download từ https://www.postgresql.org/download/

# Chạy schema
psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" -f backend/database/schema-postgresql.sql
```

### Bước 5: Test Connection

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

## 🔧 Cách 2: Sử dụng Individual Parameters

Nếu bạn muốn dùng individual parameters thay vì connection string:

### File `.env`:

```env
# Database Configuration - Supabase
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

**Lấy thông tin:**
- `DB_HOST`: Tìm trong Supabase Dashboard → Settings → Database → Connection string
- `DB_PORT`: 5432 (hoặc 6543 nếu dùng Connection Pooling)
- `DB_NAME`: Thường là `postgres` (Supabase default)
- `DB_USER`: Thường là `postgres`
- `DB_PASSWORD`: Password bạn đã tạo khi tạo project

## 🔍 Kiểm tra Connection trong Code

Backend đã được cấu hình tự động trong `config/database.js`:

```javascript
// Tự động phát hiện DATABASE_URL hoặc individual parameters
// Tự động cấu hình SSL cho Supabase
// Tự động set underscored: true cho PostgreSQL
```

## 📊 Cấu trúc Connection

```
Express App
    ↓
Sequelize ORM
    ↓
pg (PostgreSQL driver)
    ↓
SSL Connection
    ↓
Supabase PostgreSQL Database
```

## 🔒 SSL Configuration

Supabase yêu cầu SSL connection. Code đã tự động cấu hình:

```javascript
dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false // Supabase uses self-signed certificates
    }
}
```

## 🧪 Test Connection Manually

Bạn có thể test connection bằng cách tạo file test:

```javascript
// test-connection.js
require('dotenv').config();
const { testConnection } = require('./config/database');

testConnection().then(success => {
    if (success) {
        console.log('✅ Connection successful!');
        process.exit(0);
    } else {
        console.log('❌ Connection failed!');
        process.exit(1);
    }
});
```

Chạy:
```bash
node test-connection.js
```

## 🐛 Troubleshooting

### Lỗi "Connection refused"

**Nguyên nhân:**
- Sai host hoặc port
- Supabase project chưa active
- Firewall/Network issue

**Giải pháp:**
1. Kiểm tra `DB_HOST` và `DB_PORT` trong `.env`
2. Kiểm tra Supabase project status trong Dashboard
3. Thử ping host: `ping db.xxxxx.supabase.co`

### Lỗi "password authentication failed"

**Nguyên nhân:**
- Sai password
- Password có ký tự đặc biệt cần encode

**Giải pháp:**
1. Reset password trong Supabase Dashboard
2. Nếu password có ký tự đặc biệt, URL encode nó trong connection string
3. Hoặc sử dụng individual parameters

### Lỗi SSL

**Nguyên nhân:**
- SSL chưa được cấu hình

**Giải pháp:**
- Code đã tự động cấu hình SSL cho Supabase
- Nếu vẫn lỗi, kiểm tra `dialectOptions.ssl` trong `config/database.js`

### Lỗi "relation does not exist"

**Nguyên nhân:**
- Schema chưa được chạy
- Sai database name

**Giải pháp:**
1. Chạy lại schema SQL trong Supabase SQL Editor
2. Kiểm tra database name (Supabase default là `postgres`)

### Connection timeout

**Nguyên nhân:**
- Network issue
- Pool size quá nhỏ

**Giải pháp:**
1. Thử sử dụng Connection Pooling (port 6543)
2. Tăng timeout trong pool config:
```javascript
pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 20000
}
```

## 🔗 Connection Pooling (Khuyến nghị cho Production)

Supabase cung cấp Connection Pooling để tối ưu hiệu suất:

1. Vào **Settings** → **Database**
2. Scroll xuống **Connection string**
3. Chọn tab **Connection pooling**
4. Copy connection string (port 6543)
5. Sử dụng trong `.env`:

```env
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Lợi ích:**
- Tối ưu connection management
- Tốt hơn cho production
- Giảm connection overhead

## 📝 Ví dụ Connection String

### Development (Direct Connection)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Production (Connection Pooling)
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## ✅ Checklist Setup

- [ ] Supabase project đã được tạo
- [ ] Connection string đã được copy
- [ ] File `.env` đã được tạo với đúng thông tin
- [ ] Dependencies đã được cài (`npm install`)
- [ ] Schema đã được chạy trong Supabase SQL Editor
- [ ] Test connection thành công (`npm start`)
- [ ] API endpoints hoạt động bình thường

## 🎯 Quick Start

1. **Tạo Supabase project** tại https://supabase.com
2. **Copy connection string** từ Settings → Database
3. **Tạo file `.env`** trong `backend/`:
   ```env
   DB_DIALECT=postgres
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET=your_secret
   PORT=5000
   ```
4. **Chạy schema** trong Supabase SQL Editor
5. **Test connection**:
   ```bash
   cd backend
   npm install
   npm start
   ```

## 📝 Ví dụ Code

Xem file `examples/supabase-connection-example.js` để xem ví dụ đầy đủ về cách:
- Kết nối với Supabase trong Express app
- Test database connection
- Query data từ database (User, Course)
- Handle errors và graceful shutdown

**Chạy ví dụ:**
```bash
cd backend
node examples/supabase-connection-example.js
```

## 🔗 Tài liệu tham khảo

- Supabase Docs: https://supabase.com/docs
- Sequelize PostgreSQL: https://sequelize.org/docs/v6/getting-started/
- Supabase Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres

---

**Chúc bạn kết nối thành công! 🎉**

