# Hướng dẫn Migration từ Sequelize sang Supabase SDK

## 📋 Tổng quan

Hướng dẫn này sẽ giúp bạn chuyển từ **Sequelize ORM** sang **Supabase JavaScript SDK** (`@supabase/supabase-js`).

## 🔄 Sự khác biệt chính

### Sequelize (Hiện tại)
- Direct database connection qua PostgreSQL driver
- ORM với models và relationships
- SQL queries được generate tự động
- Hooks và validations trong models

### Supabase SDK (Mới)
- REST API client (không cần direct database connection)
- Query builder style (giống Prisma)
- Tự động handle authentication
- Realtime subscriptions
- Row Level Security (RLS) support

## 🚀 Bước 1: Cài đặt và Cấu hình

### 1.1. Cài đặt package
```bash
npm install @supabase/supabase-js
```

### 1.2. Lấy Supabase Credentials

1. Vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (cho server-side) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon key** (cho client-side) → `SUPABASE_ANON_KEY`

### 1.3. Cập nhật file `.env`

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (vẫn giữ để backup hoặc migration)
DB_DIALECT=postgres
DATABASE_URL=postgresql://...
```

**Lưu ý:**
- `SERVICE_ROLE_KEY`: Dùng cho server-side, **bypass RLS** (Row Level Security)
- `ANON_KEY`: Dùng cho client-side, **respects RLS**
- **KHÔNG expose SERVICE_ROLE_KEY** ra client-side!

## 📝 Bước 2: Tạo Supabase Client

File `config/supabase.js` đã được tạo sẵn:

```javascript
const { supabase, testSupabaseConnection } = require('./config/supabase');
```

## 🔄 Bước 3: Migration Examples

### 3.1. Query Users

#### Sequelize (Cũ)
```javascript
const { User } = require('../models');
const { Op } = require('sequelize');

// Get all users
const users = await User.findAll({
    where: { isActive: true },
    limit: 10
});

// Find user by email
const user = await User.findOne({
    where: { email: 'user@example.com' }
});

// Search users
const users = await User.findAll({
    where: {
        [Op.or]: [
            { email: { [Op.like]: '%@gmail.com' } },
            { username: { [Op.like]: '%john%' } }
        ]
    }
});
```

#### Supabase SDK (Mới)
```javascript
const { supabase } = require('../config/supabase');

// Get all users
const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_active', true)
    .limit(10);

// Find user by email
const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'user@example.com')
    .single();

// Search users
const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .or('email.ilike.%@gmail.com,username.ilike.%john%');
```

### 3.2. Create User

#### Sequelize (Cũ)
```javascript
const user = await User.create({
    username: 'john_doe',
    email: 'john@example.com',
    password: hashedPassword,
    role: 'student'
});
```

#### Supabase SDK (Mới)
```javascript
const { data: user, error } = await supabase
    .from('users')
    .insert({
        username: 'john_doe',
        email: 'john@example.com',
        password: hashedPassword, // Vẫn cần hash trước
        role: 'student'
    })
    .select()
    .single();
```

### 3.3. Update User

#### Sequelize (Cũ)
```javascript
const user = await User.findByPk(userId);
await user.update({
    profileFirstName: 'John',
    profileLastName: 'Doe'
});
```

#### Supabase SDK (Mới)
```javascript
const { data: user, error } = await supabase
    .from('users')
    .update({
        profile_first_name: 'John',
        profile_last_name: 'Doe'
    })
    .eq('id', userId)
    .select()
    .single();
```

### 3.4. Delete User

#### Sequelize (Cũ)
```javascript
await User.destroy({
    where: { id: userId }
});
```

#### Supabase SDK (Mới)
```javascript
const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
```

### 3.5. Relationships (Joins)

#### Sequelize (Cũ)
```javascript
const course = await Course.findOne({
    where: { id: courseId },
    include: [{
        model: User,
        as: 'instructor',
        attributes: ['id', 'username', 'profile_first_name', 'profile_last_name']
    }]
});
```

#### Supabase SDK (Mới)
```javascript
const { data: course, error } = await supabase
    .from('courses')
    .select(`
        *,
        instructor:users!courses_instructor_id_fkey (
            id,
            username,
            profile_first_name,
            profile_last_name
        )
    `)
    .eq('id', courseId)
    .single();
```

### 3.6. Pagination

#### Sequelize (Cũ)
```javascript
const { count, rows: courses } = await Course.findAndCountAll({
    where: { status: 'published' },
    limit: 10,
    offset: (page - 1) * 10
});
```

#### Supabase SDK (Mới)
```javascript
const page = 1;
const limit = 10;
const from = (page - 1) * limit;
const to = from + limit - 1;

const { data: courses, error, count } = await supabase
    .from('courses')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .range(from, to);
```

### 3.7. Authentication với Supabase Auth

Supabase có built-in authentication, bạn có thể dùng thay vì tự implement:

```javascript
// Register user
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password123'
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Logout
await supabase.auth.signOut();
```

## 🔐 Bước 4: Row Level Security (RLS)

Supabase có RLS để bảo mật data ở database level:

1. Vào Supabase Dashboard → **Authentication** → **Policies**
2. Tạo policies cho từng table
3. Ví dụ: Users chỉ có thể xem/edit data của chính họ

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

## 📦 Bước 5: Migration Strategy

### Option 1: Hybrid Approach (Khuyến nghị)
- Giữ Sequelize cho một số operations phức tạp
- Dùng Supabase SDK cho operations đơn giản
- Migration từng route một

### Option 2: Full Migration
- Thay thế toàn bộ Sequelize bằng Supabase SDK
- Cần refactor tất cả routes
- Mất nhiều thời gian nhưng code sạch hơn

## 🎯 Ví dụ: Migration Route Auth

### File mới: `routes/auth-supabase.js`

```javascript
const express = require('express');
const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${email},username.eq.${username}`)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert({
                username,
                email,
                password: hashedPassword,
                role: role || 'student'
            })
            .select()
            .single();

        if (error) throw error;

        // Generate JWT
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
```

## ⚠️ Lưu ý quan trọng

1. **Field Names**: Supabase dùng snake_case, Sequelize có thể dùng camelCase
2. **Error Handling**: Supabase trả về `{ data, error }` thay vì throw exception
3. **Relationships**: Cần định nghĩa foreign keys trong Supabase
4. **Hooks**: Không có hooks như Sequelize, cần dùng database triggers hoặc handle trong code
5. **Transactions**: Supabase không support transactions qua REST API, cần dùng PostgreSQL functions

## 🔗 Tài liệu tham khảo

- Supabase JS SDK: https://supabase.com/docs/reference/javascript/introduction
- Supabase Query Builder: https://supabase.com/docs/reference/javascript/select
- Supabase Auth: https://supabase.com/docs/guides/auth
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

---

**Bạn muốn migrate toàn bộ hay từng phần? Tôi có thể giúp migrate từng route một! 🚀**

