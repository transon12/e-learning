<template>
  <div>
    <AdminSidebar :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    <div class="main-content" :class="{ 'sidebar-open': isSidebarOpen }">
      <button class="sidebar-toggle d-lg-none btn btn-primary" @click="toggleSidebar">
        <i class="fa fa-bars"></i>
      </button>

      <div class="admin-header d-flex align-items-center justify-content-between">
        <div>
          <h4 class="mb-0 fw-bold" style="color: #333;">{{ pageTitle }}</h4>
        </div>
        <div class="dropdown">
            <span class="avatar-circle me-2">{{ (authStore.user?.username || 'A').charAt(0).toUpperCase() }}</span>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm">
            <li class="px-3 py-2">
              <div class="fw-bold">{{ authStore.user?.username || 'Admin' }}</div>
              <div class="text-muted small">{{ authStore.user?.email || '' }}</div>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                <i class="fa fa-sign-out-alt me-2"></i>Đăng xuất
              </a>
            </li>
          </ul>
        </div>
      </div>

      <router-view />
    </div>
    <div v-if="isSidebarOpen" class="mobile-overlay d-lg-none" @click="toggleSidebar"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const route = useRoute()

const pageTitle = computed(() => {
  const titleMap = {
    'Admin': 'Dashboard',
    'AdminUsers': 'Quản lý Học viên',
    'AdminCourses': 'Quản lý Khóa học',
    'AdminLessons': 'Quản lý Bài học',
    'AdminCourseSections': 'Quản lý Chương học',
    'AdminEnrollments': 'Quản lý Đăng ký Khóa học',
    'AdminStats': 'Thống kê & Báo cáo',
    'AdminInstructors': 'Quản lý Giảng viên',
    'AdminStudents': 'Quản lý Học viên',
    'AdminContactMessages': 'Quản lý Tin nhắn Liên hệ'
  }
  return titleMap[route.name] || 'Admin'
})

const isSidebarOpen = ref(true)
const authStore = useAuthStore()
const router = useRouter()

const handleResize = () => {
  if (window.innerWidth < 992) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    authStore.logout()
    router.push('/login')
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.main-content {
  margin-left: 250px;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
  transition: margin-left 0.2s ease;
}

.admin-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 12px 16px;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.admin-user-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 30px;
}

.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fb873f;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.sidebar-toggle {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1100;
  border-radius: 50%;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.topbar {
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

@media (max-width: 991.98px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }
}
</style>

