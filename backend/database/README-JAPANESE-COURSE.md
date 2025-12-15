# Hướng dẫn Insert Khóa học Tiếng Nhật

File này chứa script SQL để insert một khóa học Tiếng Nhật đầy đủ cho người mới bắt đầu vào database.

## Nội dung khóa học

Khóa học bao gồm:
- **25 bài học** được chia thành **5 sections**
- **Tổng thời lượng**: ~20 giờ
- **Trình độ**: Beginner (Người mới bắt đầu)
- **Ngôn ngữ**: Tiếng Việt

### Cấu trúc khóa học:

1. **Giới thiệu và Bảng chữ cái** (5 bài học)
   - Giới thiệu khóa học và văn hóa Nhật Bản
   - Bảng chữ cái Hiragana - Phần 1
   - Bảng chữ cái Hiragana - Phần 2
   - Bảng chữ cái Katakana - Giới thiệu
   - Luyện tập đọc và viết

2. **Từ vựng cơ bản** (6 bài học)
   - Số đếm và Thời gian
   - Màu sắc và Hình dạng
   - Gia đình và Người thân
   - Đồ vật hàng ngày
   - Thực phẩm và Đồ uống
   - Cơ thể và Sức khỏe

3. **Ngữ pháp cơ bản** (6 bài học)
   - Câu chào hỏi cơ bản
   - Đại từ nhân xưng và Danh từ
   - Động từ です và Tính từ
   - Động từ cơ bản - Thì hiện tại
   - Trợ từ を, に, で, へ
   - Câu hỏi và Câu phủ định

4. **Hội thoại hàng ngày** (5 bài học)
   - Mua sắm
   - Đặt món ăn
   - Hỏi đường
   - Gọi điện thoại
   - Gặp gỡ và Giới thiệu

5. **Luyện tập và Ôn tập** (3 bài học)
   - Luyện tập Tổng hợp - Phần 1
   - Luyện tập Tổng hợp - Phần 2
   - Kiểm tra và Ôn tập cuối khóa

## Cách sử dụng

### Bước 1: Kiểm tra Instructor ID

Trước khi chạy script, bạn cần có một instructor trong database. Script mặc định sử dụng `instructor_id = 1`.

Để tìm instructor ID:
```sql
SELECT id, username, email, role FROM users WHERE role = 'instructor' LIMIT 1;
```

Hoặc tạo instructor mới:
```sql
INSERT INTO users (username, email, password, role, profile_first_name, profile_last_name, is_active)
VALUES ('japanese_instructor', 'instructor@example.com', '$2a$12$hashedpassword', 'instructor', 'Japanese', 'Instructor', true)
ON CONFLICT (email) DO NOTHING;
```

**Lưu ý**: Bạn cần hash password bằng bcrypt trước khi insert.

### Bước 2: Cập nhật Instructor ID trong script

Mở file `insert-japanese-course.sql` và thay đổi dòng:
```sql
1, -- Replace with actual instructor_id
```

Thành ID instructor thực tế của bạn.

### Bước 3: Chạy script

**Với PostgreSQL:**
```bash
psql -U your_username -d your_database -f backend/database/insert-japanese-course.sql
```

**Hoặc trong psql console:**
```sql
\c your_database;
\i backend/database/insert-japanese-course.sql
```

**Với Supabase:**
- Copy nội dung file SQL
- Paste vào SQL Editor trong Supabase Dashboard
- Chạy query

### Bước 4: Kiểm tra kết quả

```sql
-- Kiểm tra course đã được tạo
SELECT id, title, total_lessons, duration_hours FROM courses WHERE slug = 'tieng-nhat-cho-nguoi-moi-bat-dau';

-- Kiểm tra sections
SELECT cs.id, cs.title, cs.order_index, COUNT(l.id) as lesson_count
FROM course_sections cs
LEFT JOIN lessons l ON l.section_id = cs.id
WHERE cs.course_id = (SELECT id FROM courses WHERE slug = 'tieng-nhat-cho-nguoi-moi-bat-dau')
GROUP BY cs.id, cs.title, cs.order_index
ORDER BY cs.order_index;

-- Kiểm tra lessons
SELECT l.id, l.title, l.order_index, l.duration_minutes, cs.title as section_title
FROM lessons l
JOIN course_sections cs ON cs.id = l.section_id
WHERE l.course_id = (SELECT id FROM courses WHERE slug = 'tieng-nhat-cho-nguoi-moi-bat-dau')
ORDER BY cs.order_index, l.order_index;
```

## Lưu ý

1. Script sử dụng `ON CONFLICT` để tránh insert trùng lặp. Nếu course đã tồn tại, nó sẽ được cập nhật.

2. Tất cả lessons đều có `status = 'published'` và bài học đầu tiên có `is_preview = true`.

3. Script tự động tính lại `total_lessons` và `duration_hours` sau khi insert.

4. Lessons được liên kết với sections qua cả `section_id` trong bảng `lessons` và bảng `section_lessons` junction.

5. Nếu bạn muốn thay đổi nội dung, chỉnh sửa các giá trị trong file SQL trước khi chạy.

## Troubleshooting

**Lỗi: Foreign key constraint**
- Đảm bảo instructor_id tồn tại trong bảng `users` với `role = 'instructor'`

**Lỗi: Unique constraint violation**
- Course với slug `tieng-nhat-cho-nguoi-moi-bat-dau` đã tồn tại. Script sẽ cập nhật thay vì tạo mới.

**Lessons không hiển thị trong sections**
- Kiểm tra xem `section_lessons` đã được insert chưa
- Đảm bảo `section_id` trong `lessons` khớp với `id` trong `course_sections`

