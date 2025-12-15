<template>
  <div class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-header">
      <h4 class="mb-0"><i class="fa fa-graduation-cap me-2"></i>Admin Panel</h4>
      <button class="btn btn-sm btn-outline-light d-lg-none" @click="$emit('toggle')">
        <i class="fa fa-times"></i>
      </button>
    </div>
    <ul class="sidebar-menu">
      <li>
        <router-link to="/admin" :class="{ active: $route.path === '/admin' }">
          <i class="fa fa-home"></i><span>Dashboard</span>
        </router-link>
      </li>
    
      <li>
        <router-link to="/admin/courses" :class="{ active: $route.path === '/admin/courses' }">
          <i class="fa fa-book"></i><span>Quản lý Khóa học</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/lessons" :class="{ active: $route.path === '/admin/lessons' }">
          <i class="fa fa-video"></i><span>Quản lý Bài học</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/sections" :class="{ active: $route.path === '/admin/sections' }">
          <i class="fa fa-folder"></i><span>Sections & Lessons</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/enrollments" :class="{ active: $route.path === '/admin/enrollments' }">
          <i class="fa fa-user-check"></i><span>Duyệt Đăng ký</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/stats" :class="{ active: $route.path === '/admin/stats' }">
          <i class="fa fa-chart-bar"></i><span>Thống kê</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/instructors" :class="{ active: $route.path === '/admin/instructors' }">
          <i class="fa fa-chalkboard-teacher"></i><span>Quản lý Giảng viên</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/students" :class="{ active: $route.path === '/admin/students' }">
          <i class="fa fa-user-graduate"></i><span>Tạo Học viên</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/contact-messages" :class="{ active: $route.path === '/admin/contact-messages' }">
          <i class="fa fa-envelope"></i><span>Tin nhắn Liên hệ</span>
        </router-link>
      </li>
      <li>
        <router-link to="/">
          <i class="fa fa-arrow-left"></i><span>Về Trang chủ</span>
        </router-link>
      </li>
      <li>
        <a href="#" @click.prevent="handleLogout">
          <i class="fa fa-sign-out-alt"></i><span>Đăng xuất</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    authStore.logout()
    router.push('/')
  }
}
</script>

<style scoped>
.sidebar {
  min-height: 100vh;
  background: linear-gradient(135deg, #181d38 0%, #2d3561 100%);
  color: white;
  position: fixed;
  width: 250px;
  left: 0;
  top: 0;
  padding-top: 20px;
  z-index: 1000;
  transform: translateX(0);
  transition: transform 0.2s ease;
}

.sidebar:not(.open) {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin: 5px 0;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.sidebar-menu a:hover,
.sidebar-menu a.active {
  background: rgba(251, 135, 63, 0.2);
  color: #fb873f;
  border-left-color: #fb873f;
}

.sidebar-menu a i {
  width: 25px;
  margin-right: 15px;
}

@media (min-width: 992px) {
  .sidebar {
    transform: translateX(0) !important;
  }
}
</style>

