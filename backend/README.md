# E-Learning Backend API

Backend API cho website E-Learning Secret Coder được xây dựng bằng Express.js và MongoDB.

## 🚀 Tính năng

- ✅ Authentication & Authorization (JWT)
- ✅ Quản lý khóa học (CRUD)
- ✅ Quản lý bài học (CRUD)
- ✅ Đăng ký khóa học (Enrollment)
- ✅ Theo dõi tiến độ học tập
- ✅ User profile management
- ✅ RESTful API

## 📋 Yêu cầu

- Node.js (v14 trở lên)
- MongoDB (local hoặc MongoDB Atlas)
- npm hoặc yarn

## 🔧 Cài đặt

1. **Clone và di chuyển vào thư mục backend:**
```bash
cd backend
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Tạo file .env:**
```bash
cp .env.example .env
```

4. **Cấu hình .env:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/e-learning
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
```

5. **Khởi động MongoDB:**
```bash
# Nếu dùng MongoDB local
mongod
```

6. **Chạy server:**
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Courses
- `GET /api/courses` - Lấy danh sách khóa học
- `GET /api/courses/:id` - Lấy chi tiết khóa học
- `POST /api/courses` - Tạo khóa học mới (Instructor/Admin)
- `PUT /api/courses/:id` - Cập nhật khóa học (Instructor/Admin)
- `DELETE /api/courses/:id` - Xóa khóa học (Instructor/Admin)

### Lessons
- `GET /api/lessons/course/:courseId` - Lấy danh sách bài học của khóa học
- `GET /api/lessons/:id` - Lấy chi tiết bài học
- `POST /api/lessons` - Tạo bài học mới (Instructor/Admin)
- `PUT /api/lessons/:id` - Cập nhật bài học (Instructor/Admin)
- `DELETE /api/lessons/:id` - Xóa bài học (Instructor/Admin)

### Users
- `GET /api/users/profile` - Lấy profile user
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/enrolled-courses` - Lấy danh sách khóa học đã đăng ký

### Enrollments
- `POST /api/enrollments/:courseId` - Đăng ký khóa học
- `POST /api/enrollments/:courseId/complete-lesson/:lessonId` - Đánh dấu bài học đã hoàn thành
- `GET /api/enrollments/:courseId/progress` - Lấy tiến độ học tập

## 🔐 Authentication

Sử dụng JWT Bearer token trong header:
```
Authorization: Bearer <your_token>
```

## 📝 Ví dụ sử dụng

### Đăng ký
```bash
POST /api/auth/register
{
  "username": "student1",
  "email": "student@example.com",
  "password": "password123"
}
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@e-learning.com",
  "password": "ZdQX8Ns$ik7wRY2$"

}
```

### Đăng nhập
```bash
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "password123"
}
```

### Lấy danh sách khóa học
```bash
GET /api/courses?category=Python&level=Beginner&page=1&limit=12
```

### Đăng ký khóa học
```bash
POST /api/enrollments/:courseId
Headers: Authorization: Bearer <token>
```

## 🗂️ Cấu trúc thư mục

```
backend/
├── models/          # MongoDB models
│   ├── User.js
│   ├── Course.js
│   └── Lesson.js
├── routes/          # API routes
│   ├── auth.js
│   ├── courses.js
│   ├── lessons.js
│   ├── users.js
│   └── enrollments.js
├── middleware/      # Custom middleware
│   └── auth.js
├── uploads/         # Uploaded files
├── server.js        # Entry point
├── package.json
└── .env
```

## 🔗 Kết nối với Frontend

Để kết nối frontend HTML với backend API, bạn cần:

1. **Cập nhật CORS trong server.js** (đã có sẵn)
2. **Sử dụng fetch hoặc axios trong JavaScript:**
```javascript
// Ví dụ: Đăng nhập
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  // Lưu token vào localStorage
  localStorage.setItem('token', data.token);
});
```

## 📦 Dependencies chính

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables
- **express-validator** - Input validation

## 🐛 Troubleshooting

1. **MongoDB connection error:**
   - Kiểm tra MongoDB đã chạy chưa
   - Kiểm tra MONGODB_URI trong .env

2. **Port already in use:**
   - Đổi PORT trong .env
   - Hoặc kill process đang dùng port đó

3. **JWT errors:**
   - Kiểm tra JWT_SECRET trong .env
   - Đảm bảo token được gửi đúng format trong header

## 📄 License

Free to use

