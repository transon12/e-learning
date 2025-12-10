import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'course/:id',
        name: 'CourseDetail',
        component: () => import('@/views/CourseDetail.vue'),
        props: true
      },
      {
        path: 'lesson/:id',
        name: 'LessonView',
        component: () => import('@/views/LessonView.vue'),
        props: true
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/Login.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/Register.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('@/views/admin/AdminDashboard.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/AdminUsers.vue')
      },
      {
        path: 'courses',
        name: 'AdminCourses',
        component: () => import('@/views/admin/AdminCourses.vue')
      },
      {
        path: 'lessons',
        name: 'AdminLessons',
        component: () => import('@/views/admin/AdminLessons.vue')
      },
      {
        path: 'stats',
        name: 'AdminStats',
        component: () => import('@/views/admin/AdminStats.vue')
      }
    ]
  },
  {
    path: '/lesson-upload/:lessonId?',
    name: 'LessonUpload',
    component: () => import('@/views/LessonUpload.vue'),
    props: true,
    meta: { requiresAuth: true, requiresInstructor: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Khôi phục store (token/user) trước khi kiểm tra quyền
  await authStore.ensureInit?.()
console.log(authStore, '======================>');

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'Home' })
    return
  }

  if (to.meta.requiresInstructor && !['instructor', 'admin'].includes(authStore.user?.role)) {
    next({ name: 'Home' })
    return
  }

  next()
})

export default router

