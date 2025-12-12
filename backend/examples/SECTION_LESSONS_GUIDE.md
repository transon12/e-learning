# Hướng dẫn sử dụng bảng `section_lessons`

## 📋 Tổng quan

Bảng `section_lessons` là bảng junction table để tạo quan hệ **many-to-many** giữa `course_sections` và `lessons`. Cho phép:
- Một lesson có thể thuộc nhiều section
- Một section có thể chứa nhiều lessons
- Sắp xếp thứ tự lessons trong mỗi section

## 🚀 Các cách thêm dữ liệu

### 1. **SQL trực tiếp**

```sql
INSERT INTO section_lessons (section_id, lesson_id, order_index) 
VALUES (1, 1, 1);

-- Hoặc nhiều records cùng lúc
INSERT INTO section_lessons (section_id, lesson_id, order_index) 
VALUES 
    (1, 1, 1),
    (1, 2, 2),
    (2, 3, 1)
ON DUPLICATE KEY UPDATE order_index = VALUES(order_index);
```

### 2. **Qua API Endpoint**

#### Thêm một lesson vào section:
```bash
POST /api/section-lessons
Headers: Authorization: Bearer <token>
Body:
{
  "section_id": 1,
  "lesson_id": 5,
  "order_index": 1
}
```

#### Thêm nhiều lessons cùng lúc:
```bash
POST /api/section-lessons/batch
Headers: Authorization: Bearer <token>
Body:
{
  "section_id": 1,
  "lesson_ids": [5, 6, 7, 8]
}
```

#### Cập nhật order_index:
```bash
PUT /api/section-lessons/:sectionId/:lessonId
Headers: Authorization: Bearer <token>
Body:
{
  "order_index": 3
}
```

#### Xóa lesson khỏi section:
```bash
DELETE /api/section-lessons/:sectionId/:lessonId
Headers: Authorization: Bearer <token>
```

#### Lấy tất cả lessons trong section:
```bash
GET /api/section-lessons/section/:sectionId
```

### 3. **Dùng Sequelize trong code**

#### Cách 1: Dùng Model trực tiếp
```javascript
const { SectionLesson } = require('../models');

// Thêm mới
await SectionLesson.create({
    section_id: 1,
    lesson_id: 5,
    order_index: 1
});

// Hoặc findOrCreate (nếu đã tồn tại thì cập nhật)
const [sectionLesson, created] = await SectionLesson.findOrCreate({
    where: { section_id: 1, lesson_id: 5 },
    defaults: { order_index: 1 }
});

if (!created) {
    await sectionLesson.update({ order_index: 2 });
}
```

#### Cách 2: Dùng Associations (belongsToMany)
```javascript
const { CourseSection, Lesson } = require('../models');

const section = await CourseSection.findByPk(1);
const lesson = await Lesson.findByPk(5);

// Thêm lesson vào section với order_index
await section.addLesson(lesson, {
    through: { order_index: 1 }
});

// Thêm nhiều lessons
const lessons = await Lesson.findAll({ where: { id: [5, 6, 7] } });
await section.addLessons(lessons, {
    through: { order_index: 0 } // order_index sẽ được set cho tất cả
});
```

### 4. **Tự động khi tạo lesson**

Khi tạo lesson mới qua API `POST /api/lessons`, nếu có `section_id`, hệ thống sẽ tự động thêm vào `section_lessons`:

```bash
POST /api/lessons
Body:
{
  "title": "Bài học mới",
  "course": 1,
  "section_id": 1,
  "order_index": 1
}
```

## 📝 Ví dụ sử dụng

Xem file `backend/examples/add-section-lesson.js` để có ví dụ đầy đủ.

Chạy ví dụ:
```bash
cd backend
node examples/add-section-lesson.js
```

## ⚠️ Lưu ý

1. **Primary Key**: Bảng dùng composite primary key `(section_id, lesson_id)`, nên không thể có 2 records giống nhau.

2. **Foreign Keys**: 
   - `section_id` phải tồn tại trong `course_sections`
   - `lesson_id` phải tồn tại trong `lessons`
   - Khi xóa section hoặc lesson, records trong `section_lessons` sẽ tự động bị xóa (CASCADE)

3. **Quyền truy cập**: 
   - Chỉ **instructor** của course hoặc **admin** mới có quyền thêm/xóa/sửa
   - API endpoints yêu cầu authentication token

4. **Validation**: 
   - Lesson phải thuộc cùng course với section
   - `order_index` mặc định là 0

## 🔍 Query examples

### Lấy tất cả lessons trong section (có sắp xếp):
```javascript
const section = await CourseSection.findByPk(1, {
    include: [{
        model: Lesson,
        as: 'lessons',
        through: {
            attributes: ['order_index']
        }
    }]
});

// Sắp xếp theo order_index
section.lessons.sort((a, b) => 
    a.SectionLesson.order_index - b.SectionLesson.order_index
);
```

### Lấy tất cả sections chứa một lesson:
```javascript
const lesson = await Lesson.findByPk(5, {
    include: [{
        model: CourseSection,
        as: 'sections',
        through: {
            attributes: ['order_index']
        }
    }]
});
```

