<template>
  <div>
    <div class="topbar">
      <div>
        <h5 class="mb-0">Quản lý Đăng ký Khóa học</h5>
      </div>
      <div>
        <input
          v-model="searchTerm"
          type="text"
          class="form-control form-control-sm d-inline-block"
          style="width: 250px;"
          placeholder="Tìm kiếm..."
          @input="loadEnrollments"
        >
        <button class="btn btn-primary btn-sm ms-2" @click="loadEnrollments">
          <i class="fa fa-search"></i>
        </button>
      </div>
    </div>

    <div class="content-card">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">Danh sách Yêu cầu Đăng ký</h5>
        <div>
          <select v-model="statusFilter" class="form-select form-select-sm d-inline-block" style="width: auto;" @change="loadEnrollments">
            <option value="">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Học viên</th>
                <th>Email</th>
                <th>Khóa học</th>
                <th>Danh mục</th>
                <th>Tiến độ</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="enrollments.length === 0">
                <td colspan="9" class="text-center text-muted">Không tìm thấy yêu cầu đăng ký</td>
              </tr>
              <tr v-for="enrollment in enrollments" :key="enrollment.id">
                <td>{{ enrollment.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-2">{{ enrollment.user?.username?.charAt(0).toUpperCase() || 'U' }}</div>
                    <div>
                      <div class="fw-bold">{{ enrollment.user?.username || 'N/A' }}</div>
                      <small class="text-muted">{{ enrollment.user?.profile_first_name || enrollment.user?.profile_first_name }} {{ enrollment.user?.profile_last_name || enrollment.user?.profile_last_name }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ enrollment.user?.email || 'N/A' }}</td>
                <td>
                  <router-link :to="`/course/${enrollment.course?.id}`" class="text-decoration-none">
                    {{ enrollment.course?.title || 'N/A' }}
                  </router-link>
                </td>
                <td>{{ enrollment.course?.category || 'N/A' }}</td>
                <td>{{ enrollment.progress || 0 }}%</td>
                <td>{{ formatDate(enrollment.enrolledAt || enrollment.createdAt) }}</td>
                <td>
                  <span :class="getStatusBadgeClass(enrollment.status)">
                    {{ getStatusLabel(enrollment.status) }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="enrollment.status === 'pending'"
                    class="btn btn-sm btn-success me-1"
                    @click="approveEnrollment(enrollment)"
                  >
                    <i class="fa fa-check"></i> Duyệt
                  </button>
                  <button
                    v-if="enrollment.status === 'pending'"
                    class="btn btn-sm btn-danger me-1"
                    @click="rejectEnrollment(enrollment)"
                  >
                    <i class="fa fa-times"></i> Từ chối
                  </button>
                  <button
                    v-if="enrollment.status === 'rejected'"
                    class="btn btn-sm btn-success me-1"
                    @click="approveEnrollment(enrollment)"
                  >
                    <i class="fa fa-check"></i> Duyệt lại
                  </button>
                  <button
                    v-if="enrollment.status === 'approved'"
                    class="btn btn-sm btn-danger me-1"
                    @click="rejectEnrollment(enrollment)"
                  >
                    <i class="fa fa-times"></i> Hủy duyệt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const enrollments = ref([])
const searchTerm = ref('')
const statusFilter = ref('pending')

const loadEnrollments = async () => {
  loading.value = true
  try {
    const params = {}
    if (statusFilter.value) params.status = statusFilter.value

    const response = await api.get('/enrollments', { params })
    let data = response.data.data || []

    if (searchTerm.value) {
      const term = searchTerm.value.toLowerCase()
      data = data.filter(e =>
        e.user?.username?.toLowerCase().includes(term) ||
        e.user?.email?.toLowerCase().includes(term) ||
        e.course?.title?.toLowerCase().includes(term)
      )
    }

    enrollments.value = data
  } catch (error) {
    console.error('Error loading enrollments:', error)
    alert('Lỗi khi tải danh sách đăng ký')
  } finally {
    loading.value = false
  }
}

const approveEnrollment = async (enrollment) => {
  if (!confirm(`Duyệt đăng ký của ${enrollment.user?.username} cho khóa học "${enrollment.course?.title}"?`)) return
  try {
    await api.put(`/enrollments/${enrollment.id}/approve`)
    alert('Đã duyệt đăng ký thành công!')
    await loadEnrollments()
  } catch (error) {
    console.error('Error approving enrollment:', error)
    alert(error.response?.data?.message || 'Lỗi khi duyệt đăng ký')
  }
}

const rejectEnrollment = async (enrollment) => {
  const action = enrollment.status === 'approved' ? 'hủy duyệt' : 'từ chối'
  if (!confirm(`Bạn có chắc chắn muốn ${action} đăng ký của ${enrollment.user?.username}?`)) return
  try {
    await api.put(`/enrollments/${enrollment.id}/reject`)
    alert(`Đã ${action} đăng ký thành công!`)
    await loadEnrollments()
  } catch (error) {
    console.error('Error rejecting enrollment:', error)
    alert(error.response?.data?.message || `Lỗi khi ${action} đăng ký`)
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'badge bg-success'
    case 'rejected':
      return 'badge bg-danger'
    case 'pending':
      return 'badge bg-warning'
    default:
      return 'badge bg-secondary'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'approved':
      return 'Đã duyệt'
    case 'rejected':
      return 'Từ chối'
    case 'pending':
      return 'Chờ duyệt'
    default:
      return status
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN')
}

onMounted(() => {
  loadEnrollments()
})
</script>

<style scoped>
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

@media (max-width: 991.98px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .topbar input {
    width: 100% !important;
  }
  .topbar button {
    width: 100%;
  }
  .table {
    font-size: 13px;
  }
}

@media (max-width: 767.98px) {
  .table-responsive {
    overflow-x: auto;
  }
  .table tbody td {
    white-space: nowrap;
  }
  .btn-sm {
    margin-bottom: 4px;
    width: 100%;
  }
  td:last-child {
    min-width: 160px;
  }
}
</style>

