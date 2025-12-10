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
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <input 
            v-model="searchTerm" 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm khóa học..." 
            style="width: 300px;"
            @input="filterCourses"
          >
        </div>
        <div>
          <select v-model="categoryFilter" class="form-select d-inline-block" style="width: auto;" @change="filterCourses">
            <option value="">Tất cả danh mục</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="Web Development">Web Development</option>
          </select>
          <select v-model="statusFilter" class="form-select d-inline-block ms-2" style="width: auto;" @change="filterCourses">
            <option value="">Tất cả</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else>
        <div v-if="filteredCourses.length === 0" class="text-center text-muted py-5">
          Không có khóa học nào
        </div>
        <div v-for="course in filteredCourses" :key="course.id" class="course-card">
          <div class="row align-items-center">
            <div class="col-md-2">
              <img :src="course.thumbnail || '/img/course-1.jpg'" class="img-fluid rounded" :alt="course.title">
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
const loading = ref(true)
const courses = ref([])
const searchTerm = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const editingCourse = ref(null)
const courseForm = ref({
  title: '',
  description: '',
  category: '',
  level: 'Beginner',
  price: 0,
  isFree: true,
  status: 'draft'
})

const filteredCourses = computed(() => {
  let filtered = courses.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(term) ||
      course.description?.toLowerCase().includes(term)
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(course => course.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(course => course.status === statusFilter.value)
  }

  return filtered
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
  // Computed property handles filtering
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
    status: 'draft'
  }
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
    status: course.status
  }
  const modal = new Modal(document.getElementById('courseModal'))
  modal.show()
}

const saveCourse = async () => {
  try {
    if (editingCourse.value) {
      await api.put(`/courses/${editingCourse.value}`, courseForm.value)
      alert('Cập nhật khóa học thành công!')
    } else {
      await api.post('/courses', courseForm.value)
      alert('Tạo khóa học thành công!')
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
</style>

