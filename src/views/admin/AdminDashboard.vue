<template>
  <div>
          <h2 class="mb-4">Dashboard</h2>
          
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else class="row g-4">
            <!-- Stats Cards -->
            <div class="col-md-3">
              <div class="card text-center">
                <div class="card-body">
                  <h3 class="text-primary">{{ stats.totalUsers }}</h3>
                  <p class="mb-0">Total Users</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card text-center">
                <div class="card-body">
                  <h3 class="text-primary">{{ stats.totalCourses }}</h3>
                  <p class="mb-0">Total Courses</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card text-center">
                <div class="card-body">
                  <h3 class="text-primary">{{ stats.totalLessons }}</h3>
                  <p class="mb-0">Total Lessons</p>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card text-center">
                <div class="card-body">
                  <h3 class="text-primary">{{ stats.totalEnrollments }}</h3>
                  <p class="mb-0">Enrollments</p>
                </div>
              </div>
            </div>

            <!-- Recent Users -->
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5>Recent Users</h5>
                </div>
                <div class="card-body">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in stats.recentUsers" :key="user.id">
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.role }}</td>
                        <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
                      </tr>
                    </tbody>
                  </table>
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
  recentUsers: []
})

onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  loading.value = true
  try {
    const response = await api.get('/admin/stats')
    stats.value = response.data.data || {
      totalUsers: 0,
      totalCourses: 0,
      totalLessons: 0,
      totalEnrollments: 0,
      recentUsers: []
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    alert('Lỗi khi tải thống kê')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card {
  min-height: 120px;
}

@media (max-width: 991.98px) {
  .row.g-4 > [class*='col-'] {
    margin-bottom: 12px;
  }
  .card {
    min-height: auto;
  }
  .table {
    font-size: 13px;
  }
}

@media (max-width: 575.98px) {
  .table-responsive {
    overflow-x: auto;
  }
  h2 {
    font-size: 22px;
  }
}
</style>

