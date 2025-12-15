<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else>
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="stat-card primary">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small">Tổng Học viên</div>
                <div class="h3 mb-0">{{ stats.totalUsers }}</div>
              </div>
              <i class="fa fa-users fa-2x text-primary"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card success">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small">Tổng Khóa học</div>
                <div class="h3 mb-0">{{ stats.totalCourses }}</div>
              </div>
              <i class="fa fa-book fa-2x text-success"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card info">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small">Tổng Bài học</div>
                <div class="h3 mb-0">{{ stats.totalLessons }}</div>
              </div>
              <i class="fa fa-video fa-2x text-info"></i>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="stat-card warning">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="text-muted small">Tổng Đăng ký</div>
                <div class="h3 mb-0">{{ stats.totalEnrollments }}</div>
              </div>
              <i class="fa fa-user-check fa-2x text-warning"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="stat-card">
            <h5 class="mb-3">Khóa học phổ biến nhất</h5>
            <div v-if="stats.popularCourses?.length">
              <div v-for="(course, index) in stats.popularCourses" :key="course.id" class="d-flex align-items-center mb-3 pb-3 border-bottom">
                <span class="badge bg-primary me-3">{{ index + 1 }}</span>
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ course.title }}</div>
                  <small class="text-muted">{{ course.enrolledCount || 0 }} học viên</small>
                </div>
              </div>
            </div>
            <p v-else class="text-center text-muted">Chưa có dữ liệu</p>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="stat-card">
            <h5 class="mb-3">Học viên mới nhất</h5>
            <div v-if="stats.recentUsers?.length">
              <div v-for="user in stats.recentUsers" :key="user.id" class="d-flex align-items-center mb-3 pb-3 border-bottom">
                <div class="user-avatar me-3">{{ user.username.charAt(0).toUpperCase() }}</div>
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ user.username }}</div>
                  <small class="text-muted">{{ user.email }}</small>
                </div>
                <small class="text-muted">{{ formatDate(user.createdAt) }}</small>
              </div>
            </div>
            <p v-else class="text-center text-muted">Chưa có dữ liệu</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const stats = ref({
  totalUsers: 0,
  totalCourses: 0,
  totalLessons: 0,
  totalEnrollments: 0,
  popularCourses: [],
  recentUsers: []
})

onMounted(async () => {
  try {
    const response = await api.get('/admin/stats')
    stats.value = response.data.data
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    loading.value = false
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

.stat-card.primary { border-left-color: #fb873f; }
.stat-card.success { border-left-color: #28a745; }
.stat-card.info { border-left-color: #17a2b8; }
.stat-card.warning { border-left-color: #ffc107; }

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fb873f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
</style>

