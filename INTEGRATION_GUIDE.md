# Hướng dẫn tích hợp Frontend với Backend API

## 📋 Tổng quan

File này hướng dẫn cách tích hợp frontend HTML/CSS/JS với backend Express.js API.

## 🔧 Bước 1: Cài đặt Backend

```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

## 🔗 Bước 2: Thêm API Helper vào Frontend

File `js/api.js` đã được tạo sẵn. Thêm vào các trang HTML:

```html
<!-- Thêm vào cuối <body>, trước </body> -->
<script src="js/api.js"></script>
```

## 📝 Bước 3: Cập nhật các trang HTML

### 3.1. Trang Login (login.html)

Thay thế form submit bằng JavaScript:

```javascript
// Thêm vào cuối login.html
<script>
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const result = await API.login(email, password);
        if (result.success) {
            alert('Đăng nhập thành công!');
            window.location.href = 'index.html';
        }
    } catch (error) {
        alert('Đăng nhập thất bại: ' + error.message);
    }
});
</script>
```

### 3.2. Trang Signup (signup.html)

```javascript
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const result = await API.register({ username, email, password });
        if (result.success) {
            alert('Đăng ký thành công!');
            window.location.href = 'login.html';
        }
    } catch (error) {
        alert('Đăng ký thất bại: ' + error.message);
    }
});
</script>
```

### 3.3. Trang Courses (courses.html)

Load danh sách khóa học từ API:

```javascript
async function loadCourses() {
    try {
        const result = await API.getCourses();
        if (result.success) {
            const coursesContainer = document.querySelector('.courses-container');
            // Render courses từ result.data
            result.data.forEach(course => {
                // Tạo HTML cho mỗi course
            });
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Gọi khi trang load
window.addEventListener('DOMContentLoaded', loadCourses);
```

### 3.4. Trang Course Detail (single.html)

```javascript
async function loadCourseDetail(courseId) {
    try {
        const course = await API.getCourse(courseId);
        const lessons = await API.getCourseLessons(courseId);
        
        // Render course info
        // Render lessons vào syllabus
        
        // Check enrollment status
        if (API.isAuthenticated()) {
            const progress = await API.getCourseProgress(courseId);
            // Hiển thị progress
        }
    } catch (error) {
        console.error('Error loading course:', error);
    }
}

// Enroll button
document.getElementById('enrollBtn').addEventListener('click', async () => {
    if (!API.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const result = await API.enrollCourse(courseId);
        if (result.success) {
            alert('Đăng ký khóa học thành công!');
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
});
```

### 3.5. Trang Lesson (lesson.html)

```javascript
let currentLessonId = null;
let currentCourseId = null;

async function loadLesson(lessonId) {
    try {
        const lesson = await API.getLesson(lessonId);
        currentLessonId = lesson._id;
        currentCourseId = lesson.course._id;
        
        // Render lesson content
        document.querySelector('h3').textContent = lesson.data.title;
        document.querySelector('.lesson-content p').textContent = lesson.data.description;
        
        // Load video
        if (lesson.data.videoUrl) {
            // Render video player
        }
        
        // Load course lessons for sidebar
        const lessons = await API.getCourseLessons(currentCourseId);
        renderLessonsSidebar(lessons.data);
        
        // Check if completed
        if (API.isAuthenticated()) {
            const progress = await API.getCourseProgress(currentCourseId);
            // Mark completed lessons
        }
    } catch (error) {
        console.error('Error loading lesson:', error);
    }
}

// Mark as complete
document.querySelector('.btn-success').addEventListener('click', async () => {
    if (!API.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const result = await API.completeLesson(currentCourseId, currentLessonId);
        if (result.success) {
            // Update UI
            document.querySelector('.btn-success').textContent = 'Completed';
            document.querySelector('.btn-success').classList.remove('btn-success');
            document.querySelector('.btn-success').classList.add('btn-secondary');
        }
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
});

// Get lesson ID from URL
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get('lesson') || 'default-lesson-id';
loadLesson(lessonId);
```

## 🔐 Bước 4: Xử lý Authentication

Thêm vào các trang cần authentication:

```javascript
// Check authentication on page load
if (API.isAuthenticated()) {
    // User is logged in
    API.getCurrentUser().then(result => {
        if (result.success) {
            // Hiển thị thông tin user
            console.log('User:', result.user);
        }
    });
} else {
    // Redirect to login if needed
    // window.location.href = 'login.html';
}
```

## 📦 Bước 5: CORS Configuration

Backend đã được cấu hình CORS. Nếu frontend chạy trên port khác, cập nhật trong `backend/server.js`:

```javascript
app.use(cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true
}));
```

## 🚀 Bước 6: Test Integration

1. **Start Backend:**
```bash
cd backend
npm run dev
```

2. **Mở Frontend:**
- Mở `index.html` trong browser
- Hoặc dùng Live Server trong VS Code

3. **Test Flow:**
   - Đăng ký tài khoản mới
   - Đăng nhập
   - Xem danh sách khóa học
   - Đăng ký khóa học
   - Xem bài học
   - Đánh dấu bài học đã hoàn thành

## 📱 Ví dụ hoàn chỉnh: Login Page

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Head content -->
</head>
<body>
    <!-- Form HTML -->
    <form id="loginForm">
        <input type="email" id="email" required>
        <input type="password" id="password" required>
        <button type="submit">Login</button>
    </form>

    <!-- Scripts -->
    <script src="js/api.js"></script>
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const result = await API.login(email, password);
                if (result.success) {
                    alert('Đăng nhập thành công!');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert('Đăng nhập thất bại: ' + error.message);
            }
        });
    </script>
</body>
</html>
```

## 🐛 Troubleshooting

1. **CORS Error:**
   - Kiểm tra backend đã chạy chưa
   - Kiểm tra CORS config trong server.js

2. **401 Unauthorized:**
   - Kiểm tra token trong localStorage
   - Đăng nhập lại

3. **404 Not Found:**
   - Kiểm tra API_BASE_URL trong js/api.js
   - Kiểm tra endpoint có đúng không

4. **Network Error:**
   - Kiểm tra backend đang chạy
   - Kiểm tra firewall/antivirus

## 📚 Tài liệu tham khảo

- Backend API Documentation: `backend/README.md`
- API Endpoints: Xem trong `backend/routes/`

