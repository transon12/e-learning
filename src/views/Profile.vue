<template>
  <div class="profile-page">
    <!-- Spinner -->
    <div v-if="loading" id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="sr-only">Đang tải...</span>
      </div>
    </div>

    <!-- Profile Header -->
    <div class="profile-header" :style="headerBackgroundStyle">
      <div class="cover-overlay"></div>
      <div class="container">
        <div class="profile-info">
          <div class="avatar-wrapper">
            <div class="avatar-circle">
              {{ (user?.profile_first_name || user?.username || 'U').charAt(0).toUpperCase() }}
            </div>
            <button class="btn btn-sm btn-light edit-avatar-btn" @click="showEditModal" title="Chỉnh sửa">
              <i class="fa fa-camera"></i>
            </button>
          </div>
          <div class="profile-details">
            <h2 class="profile-name">{{ displayName }}</h2>
            <p class="profile-email">
              <i class="fa fa-envelope me-2"></i>{{ user?.email }}
            </p>
            <div class="profile-meta">
              <span :class="getRoleBadgeClass(user?.role)" class="role-badge">
                <i class="fa fa-user-tag me-1"></i>{{ getRoleLabel(user?.role) }}
              </span>
              <span class="join-date">
                <i class="fa fa-calendar me-1"></i>Tham gia {{ formatDate(user?.created_at || user?.createdAt) }}
              </span>
            </div>
          </div>
          <div class="profile-actions">
            <button class="btn btn-primary btn-lg" @click="showEditModal">
              <i class="fa fa-edit me-2"></i>Chỉnh sửa hồ sơ
            </button>
            <button class="btn btn-outline-light btn-lg" @click="showChangePasswordModal">
              <i class="fa fa-key me-2"></i>Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="stat-card stat-primary">
              <div class="stat-icon">
                <i class="fa fa-book"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ enrollments.length }}</h3>
                <p class="stat-label">Khóa học đã đăng ký</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card stat-success">
              <div class="stat-icon">
                <i class="fa fa-check-circle"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ completedCourses }}</h3>
                <p class="stat-label">Khóa học đã hoàn thành</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card stat-info">
              <div class="stat-icon">
                <i class="fa fa-clock"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-number">{{ totalStudyHours }}</h3>
                <p class="stat-label">Giờ học</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container-xxl py-5">
      <div class="container">
        <div class="row">
          <!-- Personal Info -->
          <div class="col-lg-6 mb-4">
            <div class="info-card">
              <div class="card-header-custom">
                <h5 class="mb-0">
                  <i class="fa fa-user-circle me-2"></i>Thông tin cá nhân
                </h5>
              </div>
              <div class="card-body-custom">
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fa fa-user"></i>
                  </div>
                  <div class="info-content">
                    <label>Tên đăng nhập</label>
                    <p>{{ user?.username }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fa fa-envelope"></i>
                  </div>
                  <div class="info-content">
                    <label>Email</label>
                    <p>{{ user?.email }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fa fa-id-card"></i>
                  </div>
                  <div class="info-content">
                    <label>Họ và tên</label>
                    <p>{{ user?.profile_first_name && user?.profile_last_name 
                      ? `${user.profile_first_name} ${user.profile_last_name}` 
                      : 'Chưa cập nhật' }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fa fa-phone"></i>
                  </div>
                  <div class="info-content">
                    <label>Số điện thoại</label>
                    <p>{{ user?.profile_phone || 'Chưa cập nhật' }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">
                    <i class="fa fa-info-circle"></i>
                  </div>
                  <div class="info-content">
                    <label>Giới thiệu</label>
                    <p class="bio-text">{{ user?.profile_bio || 'Chưa cập nhật' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enrolled Courses -->
          <div class="col-lg-6 mb-4">
            <div class="info-card">
              <div class="card-header-custom">
                <h5 class="mb-0">
                  <i class="fa fa-graduation-cap me-2"></i>Khóa học của tôi
                </h5>
              </div>
              <div class="card-body-custom">
                <div v-if="enrollments.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <i class="fa fa-book-open"></i>
                  </div>
                  <h6>Chưa có khóa học nào</h6>
                  <p class="text-muted">Bắt đầu hành trình học tập của bạn ngay hôm nay!</p>
                  <router-link to="/courses" class="btn btn-primary">
                    <i class="fa fa-search me-2"></i>Khám phá khóa học
                  </router-link>
                </div>
                <div v-else class="courses-list">
                  <div 
                    v-for="enrollment in enrollments" 
                    :key="enrollment.id" 
                    class="course-item"
                  >
                    <div class="course-thumbnail">
                      <img 
                        :src="resolveThumbnail(enrollment.course?.thumbnail)" 
                        :alt="enrollment.course?.title"
                      >
                    </div>
                    <div class="course-info">
                      <h6 class="course-title">
                        <router-link 
                          :to="{ name: 'CourseDetail', params: { id: enrollment.course?.id } }" 
                          class="text-dark text-decoration-none"
                        >
                          {{ enrollment.course?.title }}
                        </router-link>
                      </h6>
                      <div class="progress-wrapper">
                        <div class="progress-info">
                          <span class="progress-text">Tiến độ</span>
                          <span class="progress-percent">{{ enrollment.progress || 0 }}%</span>
                        </div>
                        <div class="progress">
                          <div 
                            class="progress-bar" 
                            :style="`width: ${enrollment.progress || 0}%`"
                            role="progressbar"
                          ></div>
                        </div>
                      </div>
                      <div class="course-status">
                        <span :class="getStatusBadgeClass(enrollment.status)">
                          {{ getStatusLabel(enrollment.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div class="modal fade" id="editProfileModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa fa-edit me-2"></i>Chỉnh sửa hồ sơ
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="fa fa-user me-1"></i>Họ
                  </label>
                  <input 
                    v-model="profileForm.profile_first_name" 
                    type="text" 
                    class="form-control"
                    placeholder="Nhập họ"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">
                    <i class="fa fa-user me-1"></i>Tên
                  </label>
                  <input 
                    v-model="profileForm.profile_last_name" 
                    type="text" 
                    class="form-control"
                    placeholder="Nhập tên"
                  >
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">
                  <i class="fa fa-phone me-1"></i>Số điện thoại
                </label>
                <input 
                  v-model="profileForm.profile_phone" 
                  type="tel" 
                  class="form-control"
                  placeholder="Nhập số điện thoại"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">
                  <i class="fa fa-info-circle me-1"></i>Giới thiệu
                </label>
                <textarea 
                  v-model="profileForm.profile_bio" 
                  class="form-control" 
                  rows="4"
                  placeholder="Giới thiệu về bản thân"
                ></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="updating">
                  <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                  {{ updating ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div class="modal fade" id="changePasswordModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa fa-key me-2"></i>Đổi mật khẩu
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">
                  <i class="fa fa-lock me-1"></i>Mật khẩu hiện tại
                </label>
                <input 
                  v-model="passwordForm.currentPassword" 
                  type="password" 
                  class="form-control"
                  required
                  placeholder="Nhập mật khẩu hiện tại"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">
                  <i class="fa fa-key me-1"></i>Mật khẩu mới
                </label>
                <input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  class="form-control"
                  required
                  minlength="6"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">
                  <i class="fa fa-check-circle me-1"></i>Xác nhận mật khẩu mới
                </label>
                <input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  class="form-control"
                  required
                  placeholder="Nhập lại mật khẩu mới"
                >
              </div>
              <div v-if="passwordError" class="alert alert-danger">
                <i class="fa fa-exclamation-circle me-2"></i>{{ passwordError }}
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="changingPassword">
                  <span v-if="changingPassword" class="spinner-border spinner-border-sm me-2"></span>
                  {{ changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { Modal } from 'bootstrap'

const authStore = useAuthStore()
const loading = ref(true)
const updating = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const user = ref(null)
const enrollments = ref([])

const profileForm = ref({
  profile_first_name: '',
  profile_last_name: '',
  profile_phone: '',
  profile_bio: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

let editProfileModal = null
let changePasswordModal = null

const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
const normalizedBaseUrl = computed(() => apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '')

const headerBackgroundStyle = computed(() => {
  // Có thể lấy từ user profile hoặc dùng hình mặc định
  const coverImage = user.value?.profile_cover_image || '/img/carousel-1.jpg'
  return {
    backgroundImage: `url(${coverImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const displayName = computed(() => {
  if (user.value?.profile_first_name && user.value?.profile_last_name) {
    return `${user.value.profile_first_name} ${user.value.profile_last_name}`
  }
  return user.value?.username || 'User'
})

const completedCourses = computed(() => {
  return enrollments.value.filter(e => e.progress >= 100).length
})

const totalStudyHours = computed(() => {
  return enrollments.value.reduce((total, enrollment) => {
    return total + (enrollment.course?.duration || enrollment.course?.durationHours || 0)
  }, 0)
})

const resolveThumbnail = (thumb) => {
  if (!thumb) return '/img/course-1.jpg'
  if (/^https?:\/\//i.test(thumb)) return thumb
  const path = thumb.startsWith('/') ? thumb : `${thumb}`
  return `${normalizedBaseUrl.value}${path}`
}

const getRoleBadgeClass = (role) => {
  const classes = {
    'admin': 'badge bg-danger',
    'instructor': 'badge bg-primary',
    'student': 'badge bg-success'
  }
  return classes[role] || 'badge bg-secondary'
}

const getRoleLabel = (role) => {
  const labels = {
    'admin': 'Quản trị viên',
    'instructor': 'Giảng viên',
    'student': 'Học viên'
  }
  return labels[role] || role
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'approved': 'badge bg-success',
    'pending': 'badge bg-warning',
    'rejected': 'badge bg-danger'
  }
  return classes[status] || 'badge bg-secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    'approved': 'Đã duyệt',
    'pending': 'Chờ duyệt',
    'rejected': 'Từ chối'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadProfile = async () => {
  loading.value = true
  try {
    const response = await api.get('/users/profile')
    user.value = response.data.data
    enrollments.value = user.value.enrollments || []
    
    // Update auth store
    authStore.user = user.value
  } catch (error) {
    console.error('Error loading profile:', error)
    alert('Lỗi khi tải thông tin hồ sơ')
  } finally {
    loading.value = false
  }
}

const showEditModal = () => {
  profileForm.value = {
    profile_first_name: user.value?.profile_first_name || '',
    profile_last_name: user.value?.profile_last_name || '',
    profile_phone: user.value?.profile_phone || '',
    profile_bio: user.value?.profile_bio || ''
  }
  editProfileModal.show()
}

const updateProfile = async () => {
  // Validation
  if (!profileForm.value.profile_first_name && !profileForm.value.profile_last_name) {
    alert('Vui lòng nhập ít nhất họ hoặc tên')
    return
  }

  updating.value = true
  try {
    const response = await api.put('/users/profile', profileForm.value)
    user.value = response.data.data
    enrollments.value = user.value.enrollments || []
    authStore.user = user.value
    editProfileModal.hide()
    alert('Cập nhật hồ sơ thành công!')
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        (error.response?.data?.errors && error.response.data.errors.length > 0 
                          ? error.response.data.errors[0].msg 
                          : 'Lỗi khi cập nhật hồ sơ')
    alert(errorMessage)
  } finally {
    updating.value = false
  }
}

const showChangePasswordModal = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordError.value = ''
  changePasswordModal.show()
}

const changePassword = async () => {
  // Validation
  if (!passwordForm.value.currentPassword) {
    passwordError.value = 'Vui lòng nhập mật khẩu hiện tại'
    return
  }

  if (!passwordForm.value.newPassword) {
    passwordError.value = 'Vui lòng nhập mật khẩu mới'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Mật khẩu mới và xác nhận không khớp'
    return
  }

  changingPassword.value = true
  passwordError.value = ''
  
  try {
    const response = await api.put('/auth/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    changePasswordModal.hide()
    alert('Đổi mật khẩu thành công!')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    if (error.response?.data?.message) {
      passwordError.value = error.response.data.message
    } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
      passwordError.value = error.response.data.errors[0].msg || 'Lỗi khi đổi mật khẩu'
    } else {
      passwordError.value = 'Lỗi khi đổi mật khẩu. Vui lòng thử lại.'
    }
  } finally {
    changingPassword.value = false
  }
}

onMounted(async () => {
  await loadProfile()
  
  // Initialize modals
  editProfileModal = new Modal(document.getElementById('editProfileModal'))
  changePasswordModal = new Modal(document.getElementById('changePasswordModal'))
})
</script>

<style scoped>
.profile-page {
  background: #f8f9fa;
  min-height: 100vh;
}

/* Profile Header */
.profile-header {
  position: relative;
  padding: 120px 0 60px;
  margin-bottom: -40px;
  overflow: hidden;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(38, 37, 37, 0.92) 0%, rgba(40, 39, 39, 0.76) 10%, rgba(121, 118, 115, 0.8) 100%);
  z-index: 1;
}

.profile-info {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 30px;
  flex-wrap: wrap;
  z-index: 2;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: -60px;
}

.avatar-circle {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #fb873f 0%, #f69050 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: bold;
  border: 5px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 10px;
  right: 0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.profile-details {
  flex: 1;
  color: white;
  padding-bottom: 20px;
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
}

.profile-email {
  font-size: 1.1rem;
  margin-bottom: 15px;
  opacity: 0.9;
}

.profile-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.role-badge {
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 20px;
}

.join-date {
  font-size: 0.9rem;
  opacity: 0.8;
}

.profile-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  padding-bottom: 20px;
}

/* Stats Section */
.stats-section {
  padding: 60px 0 40px;
  background: white;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-left: 4px solid;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-primary {
  border-left-color: #fb873f;
}

.stat-primary .stat-number {
  color: #fb873f;
}

.stat-success {
  border-left-color: #48bb78;
}

.stat-info {
  border-left-color: #4299e1;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: white;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #fb873f 0%, #f69050 100%);
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #2d3748;
}

.stat-label {
  margin: 5px 0 0;
  color: #718096;
  font-size: 0.95rem;
}

/* Info Cards */
.info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.card-header-custom {
  background: linear-gradient(135deg, #fb873f 0%, #f69050 100%);
  color: white;
  padding: 20px 25px;
}

.card-header-custom h5 {
  color: white;
  font-weight: 600;
}

.card-body-custom {
  padding: 25px;
}

.info-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fb873f 0%, #f69050 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-content label {
  display: block;
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-content p {
  margin: 0;
  color: #2d3748;
  font-size: 1rem;
}

.bio-text {
  line-height: 1.6;
  color: #4a5568;
}

/* Courses List */
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.course-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.course-item:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(5px);
}

.course-thumbnail {
  width: 100px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  flex: 1;
}

.course-title {
  margin-bottom: 10px;
  font-size: 1rem;
  font-weight: 600;
}

.course-title a {
  color: #2d3748;
  transition: color 0.3s ease;
}

.course-title a:hover {
  color: #fb873f;
}

.progress-wrapper {
  margin-bottom: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.85rem;
}

.progress-text {
  color: #718096;
}

.progress-percent {
  color: #2d3748;
  font-weight: 600;
}

.progress {
  height: 8px;
  border-radius: 10px;
  background: #e2e8f0;
  overflow: hidden;
}

.progress-bar {
  background: linear-gradient(90deg, #fb873f 0%, #f69050 100%);
  border-radius: 10px;
  transition: width 0.6s ease;
}

.course-status {
  margin-top: 8px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 20px;
}

.empty-state h6 {
  color: #2d3748;
  margin-bottom: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-details {
    text-align: center;
  }

  .profile-actions {
    justify-content: center;
    width: 100%;
  }

  .profile-actions .btn {
    flex: 1;
    min-width: 150px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .info-item {
    flex-direction: column;
    gap: 10px;
  }

  .course-item {
    flex-direction: column;
  }

  .course-thumbnail {
    width: 100%;
    height: 150px;
  }
}
</style>
