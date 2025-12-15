<template>
  <div>
    <div class="topbar">
      <div>
        <h5 class="mb-0">Quản lý Khóa học</h5>
      </div>
      <div>
        <button class="btn btn-primary" @click="showAddCourseModal">
          <i class="fa fa-plus me-2"></i>Thêm Khóa học
        </button>
      </div>
    </div>

    <div class="content-card">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <div v-else>
        <!-- Filter Section -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label small text-muted mb-1">Tìm kiếm</label>
            <input 
              v-model="searchTerm" 
              type="text" 
              class="form-control" 
              placeholder="Tìm kiếm khóa học..." 
              @input="filterCourses"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Danh mục</label>
            <select v-model="categoryFilter" class="form-select" @change="filterCourses">
              <option value="">Tất cả danh mục</option>
              <option v-for="category in uniqueCategories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Trạng thái</label>
            <select v-model="statusFilter" class="form-select" @change="filterCourses">
              <option value="">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
              <i class="fa fa-times me-1"></i>Xóa bộ lọc
            </button>
          </div>
        </div>

        <div v-if="filteredCourses.length === 0" class="text-center text-muted py-5">
          Không có khóa học nào
        </div>
        <template v-else>
          <div class="mb-3 text-muted">
            Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} trong tổng số {{ pagination.total }} khóa học
          </div>
          <div v-for="course in paginatedCourses" :key="course.id" class="course-card">
            <div class="row align-items-center">
              <div class="col-md-2">
                <img :src="resolveThumbnail(course.thumbnail)" class="img-fluid rounded" :alt="course.title">
              </div>
              <div class="col-md-6">
                <h5 class="mb-1">{{ course.title }}</h5>
                <p class="text-muted small mb-2">{{ course.shortDescription || course.description?.substring(0, 100) || '' }}...</p>
                <div class="d-flex gap-2">
                  <span class="badge bg-primary">{{ course.category }}</span>
                  <span class="badge bg-info">{{ course.level }}</span>
                  <span :class="course.isFree ? 'badge bg-success' : 'badge bg-warning'">
                    {{ course.isFree ? 'Miễn phí' : `$${course.price}` }}
                  </span>
                </div>
              </div>
              <div class="col-md-2 text-center">
                <div class="mb-1">
                  <strong>{{ course.enrolledCount || 0 }}</strong>
                  <small class="text-muted d-block">Học viên</small>
                </div>
                <div>
                  <strong>{{ course.totalLessons || 0 }}</strong>
                  <small class="text-muted d-block">Bài học</small>
                </div>
              </div>
              <div class="col-md-2">
                <div class="btn-group-vertical w-100">
                  <button class="btn btn-sm btn-primary mb-1" @click="editCourse(course)">
                    <i class="fa fa-edit me-1"></i>Sửa
                  </button>
                  <button class="btn btn-sm btn-info mb-1" @click="viewCourse(course.id)">
                    <i class="fa fa-eye me-1"></i>Xem
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteCourse(course.id)">
                    <i class="fa fa-trash me-1"></i>Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <nav v-if="pagination.pages > 1" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                <a class="page-link" href="#" @click.prevent="goToPage(pagination.page - 1)">Trước</a>
              </li>
              <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === pagination.page, disabled: page === '...' }">
                <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                <span v-else class="page-link">{{ page }}</span>
              </li>
              <li class="page-item" :class="{ disabled: pagination.page === pagination.pages }">
                <a class="page-link" href="#" @click.prevent="goToPage(pagination.page + 1)">Sau</a>
              </li>
            </ul>
            <div class="text-center mt-2">
              <select v-model.number="pagination.limit" class="form-select form-select-sm d-inline-block" style="width: auto;" @change="resetPagination">
                <option :value="10">10 / trang</option>
                <option :value="20">20 / trang</option>
                <option :value="50">50 / trang</option>
                <option :value="100">100 / trang</option>
              </select>
            </div>
          </nav>
        </template>
      </div>
    </div>

    <!-- Course Modal -->
    <div class="modal fade" id="courseModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingCourse ? 'Sửa Khóa học' : 'Thêm Khóa học' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCourse">
              <div class="mb-3">
                <label class="form-label">Tiêu đề *</label>
                <input v-model="courseForm.title" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô tả *</label>
                <textarea v-model="courseForm.description" class="form-control" rows="3" required></textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Danh mục *</label>
                  <select v-model="courseForm.category" class="form-select" required>
                    <option value="">Chọn danh mục</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="Web Development">Web Development</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Cấp độ *</label>
                  <select v-model="courseForm.level" class="form-select" required>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Giá ($)</label>
                  <input v-model.number="courseForm.price" type="number" class="form-control" min="0">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Miễn phí</label>
                  <div class="form-check form-switch mt-2">
                    <input v-model="courseForm.isFree" class="form-check-input" type="checkbox">
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model="courseForm.status" class="form-select">
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                </select>
              </div>
            <div class="mb-3">
              <label class="form-label d-flex justify-content-between">
                <span>Ảnh đại diện</span>
                <small class="text-muted">PNG/JPG, tối đa 5MB</small>
              </label>
              <input
                type="file"
                class="form-control"
                accept="image/*"
                @change="onAvatarSelected"
              >
              <div class="mt-2 d-flex align-items-center gap-3">
                <img
                  v-if="avatarPreview || courseForm.thumbnail"
                  :src="avatarPreview || courseForm.thumbnail"
                  alt="thumbnail preview"
                  class="rounded"
                  style="width: 120px; height: 80px; object-fit: cover;"
                >
                <small class="text-muted" v-else>Chưa có ảnh</small>
                <small v-if="uploadingAvatar" class="text-primary">Đang upload... {{ uploadProgressAvatar }}%</small>
              </div>
            </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveCourse">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { Modal } from 'bootstrap'

const router = useRouter()
const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''
const normalizedBaseUrl = computed(() => apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '')
const loading = ref(true)
const courses = ref([])
const searchTerm = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const editingCourse = ref(null)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})
const avatarFile = ref(null)
const avatarPreview = ref('')
const uploadingAvatar = ref(false)
const uploadProgressAvatar = ref(0)
const courseForm = ref({
  title: '',
  description: '',
  category: '',
  level: 'Beginner',
  price: 0,
  isFree: true,
  status: 'draft'
})

const uniqueCategories = computed(() => {
  const categories = new Set()
  courses.value.forEach(course => {
    if (course.category) {
      categories.add(course.category)
    }
  })
  return Array.from(categories).sort()
})

const filteredCourses = computed(() => {
  let filtered = courses.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(term) ||
      course.description?.toLowerCase().includes(term) ||
      course.shortDescription?.toLowerCase().includes(term)
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(course => course.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(course => course.status === statusFilter.value)
  }

  // Update pagination total
  pagination.value.total = filtered.length
  pagination.value.pages = Math.ceil(filtered.length / pagination.value.limit)

  return filtered
})

const paginatedCourses = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  return filteredCourses.value.slice(start, end)
})

const resolveThumbnail = (thumb) => {
  if (!thumb) return '/img/course-1.jpg'
  // Nếu là url tuyệt đối (http/https) thì dùng nguyên
  if (/^https?:\/\//i.test(thumb)) return thumb
  const path = thumb.startsWith('/') ? thumb : `/${thumb}`
  return `${normalizedBaseUrl.value}${path}`
}

const visiblePages = computed(() => {
  const pages = []
  const totalPages = pagination.value.pages
  const currentPage = pagination.value.page

  if (totalPages <= 7) {
    // Hiển thị tất cả nếu <= 7 trang
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Hiển thị với ellipsis
    if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    }
  }
  return pages
})

onMounted(() => {
  loadCourses()
})

const loadCourses = async () => {
  loading.value = true
  try {
    const response = await api.get('/courses', { params: { limit: 1000 } })
    courses.value = response.data.data || []
  } catch (error) {
    console.error('Error loading courses:', error)
  } finally {
    loading.value = false
  }
}

const filterCourses = () => {
  // Reset về trang 1 khi filter
  pagination.value.page = 1
}

const clearFilters = () => {
  searchTerm.value = ''
  categoryFilter.value = ''
  statusFilter.value = ''
  pagination.value.page = 1
}

const goToPage = (page) => {
  if (page < 1 || page > pagination.value.pages || page === '...') return
  pagination.value.page = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetPagination = () => {
  pagination.value.page = 1
}

const showAddCourseModal = () => {
  editingCourse.value = null
  courseForm.value = {
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    price: 0,
    isFree: true,
    status: 'draft',
    thumbnail: ''
  }
  avatarFile.value = null
  avatarPreview.value = ''
  const modal = new Modal(document.getElementById('courseModal'))
  modal.show()
}

const editCourse = (course) => {
  editingCourse.value = course.id
  courseForm.value = {
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    price: course.price || 0,
    isFree: course.isFree,
    status: course.status,
    thumbnail: course.thumbnail
  }
  avatarFile.value = null
  avatarPreview.value = ''
  const modal = new Modal(document.getElementById('courseModal'))
  modal.show()
}

const saveCourse = async () => {
  try {
    let courseId = editingCourse.value

    if (editingCourse.value) {
      await api.put(`/courses/${editingCourse.value}`, courseForm.value)
      alert('Cập nhật khóa học thành công!')
    } else {
      const res = await api.post('/courses', courseForm.value)
      courseId = res.data?.data?.id
      alert('Tạo khóa học thành công!')
    }

    // Nếu có chọn avatar thì upload sau khi có courseId
    if (avatarFile.value && courseId) {
      await uploadAvatar(courseId)
    }

    const modal = Modal.getInstance(document.getElementById('courseModal'))
    modal.hide()
    await loadCourses()
  } catch (error) {
    alert('Lỗi: ' + (error.response?.data?.message || error.message))
  }
}

const deleteCourse = async (courseId) => {
  if (!confirm('Bạn có chắc muốn xóa khóa học này?')) return

  try {
    await api.delete(`/courses/${courseId}`)
    alert('Xóa khóa học thành công!')
    await loadCourses()
  } catch (error) {
    alert('Lỗi: ' + (error.response?.data?.message || error.message))
  }
}

const viewCourse = (courseId) => {
  router.push(`/course/${courseId}`)
}

const onAvatarSelected = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

const uploadAvatar = async (courseId) => {
  if (!avatarFile.value) return
  const formData = new FormData()
  formData.append('avatar', avatarFile.value)

  try {
    uploadingAvatar.value = true
    uploadProgressAvatar.value = 0
    const response = await api.post(`/upload/course/${courseId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        uploadProgressAvatar.value = Math.round((e.loaded * 100) / (e.total || 1))
      }
    })
    
    // Cập nhật thumbnail URL từ response (có thể là S3 URL hoặc local URL)
    if (response.data?.data?.thumbnail) {
      courseForm.value.thumbnail = response.data.data.thumbnail
      // Cập nhật preview nếu là S3 URL
      if (response.data.data.thumbnail.startsWith('http://') || response.data.data.thumbnail.startsWith('https://')) {
        avatarPreview.value = response.data.data.thumbnail
      }
    }
    
    alert('Upload ảnh đại diện thành công!')
  } catch (error) {
    alert('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message))
  } finally {
    uploadingAvatar.value = false
    uploadProgressAvatar.value = 0
  }
}
</script>

<style scoped>
.course-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.course-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 767.98px) {
  .course-card .row {
    flex-direction: column;
    gap: 12px;
  }
  .course-card img {
    width: 100%;
    height: auto;
  }
  .course-card .btn-group-vertical {
    flex-direction: row;
    gap: 6px;
  }
  .course-card .btn-group-vertical .btn {
    width: auto;
  }
}
</style>

