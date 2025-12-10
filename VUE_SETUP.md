# Vue 3 Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── assets/          # Static assets (CSS, images)
├── components/      # Reusable Vue components
│   ├── Navbar.vue
│   ├── Footer.vue
│   └── BackToTop.vue
├── layouts/         # Layout components
│   └── MainLayout.vue
├── router/          # Vue Router configuration
│   └── index.js
├── services/        # API services
│   └── api.js
├── stores/          # Pinia stores
│   └── auth.js
├── views/           # Page components
│   ├── Home.vue
│   ├── CourseDetail.vue
│   ├── LessonView.vue
│   ├── Login.vue
│   ├── Register.vue
│   └── admin/
│       └── AdminDashboard.vue
├── App.vue          # Root component
└── main.js          # Entry point
```

## 🔧 Configuration

### Vite Config
- Port: 3000
- Proxy: `/api` → `http://localhost:5000`

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📦 Dependencies

- **Vue 3** - Progressive JavaScript framework
- **Vue Router 4** - Official router for Vue.js
- **Pinia** - State management
- **Axios** - HTTP client
- **Vite** - Build tool

## 🎯 Features

✅ Single Page Application (SPA)
✅ Component-based architecture
✅ State management with Pinia
✅ API integration
✅ Authentication & Authorization
✅ Admin panel
✅ Responsive design

## 🔄 Migration from HTML

All HTML pages have been converted to Vue components:
- `index.html` → `Home.vue`
- `single.html` → `CourseDetail.vue`
- `lesson.html` → `LessonView.vue`
- `admin.html` → `AdminDashboard.vue`
- `login.html` → `Login.vue`
- `signup.html` → `Register.vue`

## 🚦 Routes

- `/` - Home page
- `/course/:id` - Course detail
- `/lesson/:id` - Lesson view
- `/login` - Login page
- `/register` - Register page
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/courses` - Course management
- `/admin/lessons` - Lesson management
- `/admin/stats` - Statistics

## 📝 Notes

- CSS files are copied to `src/assets/css/`
- Images remain in `/img/` directory
- Bootstrap and other libraries loaded via CDN
- API calls use Axios with interceptors
- Authentication state managed by Pinia

