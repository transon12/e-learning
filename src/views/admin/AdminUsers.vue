<template>
  <div>
    <div class="topbar">
      <div>
        <h5 class="mb-0">Quản lý Học viên</h5>
      </div>
      <div>
        <input 
          v-model="searchTerm" 
          type="text" 
          class="form-control form-control-sm d-inline-block" 
          style="width: 250px;" 
          placeholder="Tìm kiếm học viên..."
          @input="loadUsers"
        >
        <button class="btn btn-primary btn-sm ms-2" @click="loadUsers">
          <i class="fa fa-search"></i>
        </button>
      </div>
    </div>

    <div class="content-card">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">Danh sách Học viên</h5>
        <div>
          <select v-model="roleFilter" class="form-select form-select-sm d-inline-block" style="width: auto;" @change="loadUsers">
            <option value="">Tất cả</option>
            <option value="student">Học viên</option>
            <option value="instructor">Giảng viên</option>
            <option value="admin">Admin</option>
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
                <th>Vai trò</th>
                <th>Khóa học đã đăng ký</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="users.length === 0">
                <td colspan="8" class="text-center text-muted">Không tìm thấy học viên</td>
              </tr>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-2">{{ user.username.charAt(0).toUpperCase() }}</div>
                    <div>
                      <div class="fw-bold">{{ user.username }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="getRoleBadgeClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td>{{ user.enrollments?.length || 0 }}</td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <span :class="user.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ user.isActive ? 'Hoạt động' : 'Khóa' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-info me-1" @click="viewUserDetail(user)">
                    <i class="fa fa-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-warning" @click="toggleUserStatus(user)">
                    <i class="fa" :class="user.isActive ? 'fa-lock' : 'fa-unlock'"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav v-if="pagination.pages > 1">
          <ul class="pagination justify-content-center">
            <li v-for="page in pagination.pages" :key="page" class="page-item" :class="{ active: page === pagination.page }">
              <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- User Detail Modal -->
    <div class="modal fade" id="userDetailModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết Học viên</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedUser">
            <div class="row">
              <div class="col-md-6">
                <h6>Thông tin cơ bản</h6>
                <p><strong>Username:</strong> {{ selectedUser.username }}</p>
                <p><strong>Email:</strong> {{ selectedUser.email }}</p>
                <p><strong>Vai trò:</strong> {{ getRoleLabel(selectedUser.role) }}</p>
                <p><strong>Ngày tạo:</strong> {{ formatDateTime(selectedUser.createdAt) }}</p>
              </div>
              <div class="col-md-6">
                <h6>Khóa học đã đăng ký</h6>
                <ul v-if="selectedUser.enrollments?.length">
                  <li v-for="enrollment in selectedUser.enrollments" :key="enrollment.id">
                    {{ enrollment.course?.title || 'N/A' }}
                  </li>
                </ul>
                <p v-else class="text-muted">Chưa đăng ký khóa học nào</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { Modal } from 'bootstrap'

const loading = ref(true)
const users = ref([])
const searchTerm = ref('')
const roleFilter = ref('')
const selectedUser = ref(null)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    if (searchTerm.value) params.search = searchTerm.value
    if (roleFilter.value) params.role = roleFilter.value

    const response = await api.get('/admin/users', { params })
    users.value = response.data.data || []
    pagination.value = response.data.pagination || pagination.value
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  pagination.value.page = page
  loadUsers()
}

const viewUserDetail = (user) => {
  selectedUser.value = user
  const modal = new Modal(document.getElementById('userDetailModal'))
  modal.show()
}

const toggleUserStatus = async (user) => {
  const action = user.isActive ? 'khóa' : 'mở khóa'
  if (!confirm(`Bạn có chắc muốn ${action} học viên này?`)) return

  try {
    await api.put(`/admin/users/${user.id}/status`)
    await loadUsers()
  } catch (error) {
    alert('Lỗi: ' + (error.response?.data?.message || error.message))
  }
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Admin',
    instructor: 'Giảng viên',
    student: 'Học viên'
  }
  return labels[role] || role
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'badge bg-danger',
    instructor: 'badge bg-warning',
    student: 'badge bg-primary'
  }
  return classes[role] || 'badge bg-secondary'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN')
}
</script>

<style scoped>
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

