<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div></div>
      <div>
        <button class="btn btn-primary" @click="showAddStudentModal">
          <i class="fa fa-plus me-2"></i>Tạo Học viên
        </button>
      </div>
    </div>

    <div class="content-card">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">Danh sách Học viên</h5>
        <div>
          <input 
            v-model="searchTerm" 
            type="text" 
            class="form-control form-control-sm d-inline-block" 
            style="width: 250px;" 
            placeholder="Tìm kiếm học viên..."
            @input="loadStudents"
          >
          <button class="btn btn-primary btn-sm ms-2" @click="loadStudents">
            <i class="fa fa-search"></i>
          </button>
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
                <th>Số khóa học đã đăng ký</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td>{{ student.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2">
                      {{ (student.profile_first_name || student.username || 'A').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="fw-bold">
                        {{ student.profile_first_name && student.profile_last_name 
                          ? `${student.profile_first_name} ${student.profile_last_name}` 
                          : student.username }}
                      </div>
                      <small class="text-muted">@{{ student.username }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ student.email }}</td>
                <td>
                  <span class="badge bg-primary">{{ student.enrollments?.length || 0 }}</span>
                </td>
                <td>{{ formatDate(student.created_at || student.createdAt) }}</td>
                <td>
                  <span :class="getStatusClass(student)">
                    {{ getStatusText(student) }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-info me-1" 
                    @click="viewStudentDetail(student)"
                    title="Xem chi tiết"
                  >
                    <i class="fa fa-eye text-white" ></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-primary me-1" 
                    @click="showAssignCoursesModal(student)"
                    title="Gán khóa học"
                  >
                    <i class="fa fa-book text-white"></i>
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-warning text-white" 
                    @click="toggleStudentStatus(student)"
                    :title="isStudentActive(student) ? 'Khóa tài khoản' : 'Mở khóa tài khoản'"
                  >
                    <i class="fa" :class="isStudentActive(student) ? 'fa-lock' : 'fa-unlock'"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="students.length === 0" class="text-center text-muted py-5">
          Không có học viên nào
        </div>
      </div>
    </div>

    <!-- Add Student Modal -->
    <div class="modal fade" id="addStudentModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tạo Học viên</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createStudent">
              <div class="mb-3">
                <label class="form-label">Tên đăng nhập *</label>
                <input 
                  v-model="studentForm.username" 
                  type="text" 
                  class="form-control" 
                  required
                  placeholder="username"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Email *</label>
                <input 
                  v-model="studentForm.email" 
                  type="email" 
                  class="form-control" 
                  required
                  placeholder="email@example.com"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Mật khẩu *</label>
                <input 
                  v-model="studentForm.password" 
                  type="password" 
                  class="form-control" 
                  required
                  minlength="6"
                  placeholder="Tối thiểu 6 ký tự"
                >
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Họ</label>
                  <input 
                    v-model="studentForm.profile_first_name" 
                    type="text" 
                    class="form-control"
                    placeholder="Họ"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tên</label>
                  <input 
                    v-model="studentForm.profile_last_name" 
                    type="text" 
                    class="form-control"
                    placeholder="Tên"
                  >
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input 
                  v-model="studentForm.profile_phone" 
                  type="tel" 
                  class="form-control"
                  placeholder="Số điện thoại"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Giới thiệu</label>
                <textarea 
                  v-model="studentForm.profile_bio" 
                  class="form-control" 
                  rows="3"
                  placeholder="Giới thiệu về học viên"
                ></textarea>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ submitting ? 'Đang tạo...' : 'Tạo Học viên' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- View Student Detail Modal -->
    <div class="modal fade" id="viewStudentModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết Học viên</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedStudent">
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Tên đăng nhập:</strong> {{ selectedStudent.username }}
                </div>
                <div class="col-md-6">
                  <strong>Email:</strong> {{ selectedStudent.email }}
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <strong>Họ tên:</strong> 
                  {{ selectedStudent.profile_first_name && selectedStudent.profile_last_name 
                    ? `${selectedStudent.profile_first_name} ${selectedStudent.profile_last_name}` 
                    : 'Chưa cập nhật' }}
                </div>
                <div class="col-md-6">
                  <strong>Số điện thoại:</strong> 
                  {{ selectedStudent.profile_phone || 'Chưa cập nhật' }}
                </div>
              </div>
              <div class="mb-3">
                <strong>Giới thiệu:</strong>
                <p>{{ selectedStudent.profile_bio || 'Chưa cập nhật' }}</p>
              </div>
              <div class="mb-3">
                <strong>Khóa học đã đăng ký:</strong> {{ studentEnrollments.length }}
                <div v-if="studentEnrollments.length > 0" class="mt-2">
                  <div 
                    v-for="enrollment in studentEnrollments" 
                    :key="enrollment.id"
                    class="d-flex justify-content-between align-items-center p-2 mb-2 border rounded"
                  >
                    <div>
                      <strong>{{ enrollment.course?.title || 'N/A' }}</strong>
                      <br>
                      <small class="text-muted">
                        Trạng thái: 
                        <span :class="getEnrollmentStatusClass(enrollment.status)">
                          {{ getEnrollmentStatusText(enrollment.status) }}
                        </span>
                        | Tiến độ: {{ enrollment.progress }}%
                      </small>
                    </div>
                    <button 
                      class="btn btn-sm btn-outline-danger"
                      @click="removeCourseAssignment(enrollment)"
                      title="Xóa khóa học"
                    >
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div v-else class="text-muted">Chưa có khóa học nào</div>
              </div>
              <div class="mb-3">
                <strong>Ngày tạo:</strong> {{ formatDate(selectedStudent.created_at || selectedStudent.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Courses Modal -->
    <div class="modal fade" id="assignCoursesModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Gán Khóa học cho {{ selectedStudentForAssign?.username }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingCourses" class="text-center py-3">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else>
              <div class="mb-3">
                <input 
                  v-model="courseSearchTerm" 
                  type="text" 
                  class="form-control" 
                  placeholder="Tìm kiếm khóa học..."
                  @input="filterCourses"
                >
              </div>
              <div v-if="filteredCourses.length > 0" style="max-height: 400px; overflow-y: auto;">
                <div 
                  v-for="course in filteredCourses" 
                  :key="course.id"
                  class="form-check mb-2 p-2 border rounded course-item"
                  :class="{ 'course-selected': isCourseSelected(course.id) }"
                  style="cursor: pointer; transition: all 0.2s;"
                  @click.stop="toggleCourseSelection(course.id)"
                >
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :value="course.id"
                    :id="`course-${course.id}`"
                    :checked="isCourseSelected(course.id)"
                    @click.stop="toggleCourseSelection(course.id)"
                    @change="toggleCourseSelection(course.id)"
                  >
                  <label 
                    class="form-check-label w-100" 
                    :for="`course-${course.id}`" 
                    style="cursor: pointer;"
                    @click.stop="toggleCourseSelection(course.id)"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="flex-grow-1">
                        <strong>{{ course.title || 'Không có tiêu đề' }}</strong>
                        <br>
                        <small class="text-muted">
                          {{ course.category || 'Chưa phân loại' }} | {{ course.level || 'N/A' }}
                        </small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div v-else-if="!loadingCourses" class="text-center text-muted py-5">
                <i class="fa fa-book fa-3x mb-3 d-block"></i>
                <p>Không tìm thấy khóa học nào</p>
                <small v-if="courses.length === 0">Vui lòng tạo khóa học trước khi gán cho học viên</small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="assignCourses"
              :disabled="selectedCourseIds.length === 0 || assigning"
            >
              <span v-if="assigning" class="spinner-border spinner-border-sm me-2"></span>
              {{ assigning ? 'Đang gán...' : `Gán ${selectedCourseIds.length} khóa học` }}
            </button>
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

const loading = ref(false)
const submitting = ref(false)
const students = ref([])
const searchTerm = ref('')
const selectedStudent = ref(null)
const selectedStudentForAssign = ref(null)
const studentEnrollments = ref([])
const courses = ref([])
const filteredCourses = ref([])
const loadingCourses = ref(false)
const courseSearchTerm = ref('')
const selectedCourseIds = ref([])
const assigning = ref(false)

const studentForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'student',
  profile_first_name: '',
  profile_last_name: '',
  profile_phone: '',
  profile_bio: ''
})

let addStudentModal = null
let viewStudentModal = null
let assignCoursesModal = null

onMounted(() => {
  loadStudents()
  
  // Initialize modals
  addStudentModal = new Modal(document.getElementById('addStudentModal'))
  viewStudentModal = new Modal(document.getElementById('viewStudentModal'))
  assignCoursesModal = new Modal(document.getElementById('assignCoursesModal'))
})

const loadStudents = async () => {
  loading.value = true
  try {
    const params = { role: 'student', limit: 1000 }
    if (searchTerm.value) {
      params.search = searchTerm.value
    }
    
    const response = await api.get('/admin/users', { params })
    students.value = response.data.data || []
  } catch (error) {
    console.error('Error loading students:', error)
    alert('Lỗi khi tải danh sách học viên')
  } finally {
    loading.value = false
  }
}

const showAddStudentModal = () => {
  studentForm.value = {
    username: '',
    email: '',
    password: '',
    role: 'student',
    profile_first_name: '',
    profile_last_name: '',
    profile_phone: '',
    profile_bio: ''
  }
  addStudentModal.show()
}

const createStudent = async () => {
  submitting.value = true
  try {
    await api.post('/admin/users', studentForm.value)
    alert('Tạo học viên thành công!')
    addStudentModal.hide()
    loadStudents()
  } catch (error) {
    alert(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Lỗi khi tạo học viên')
  } finally {
    submitting.value = false
  }
}

const viewStudentDetail = async (student) => {
  selectedStudent.value = student
  // Load enrollments for this student
  await loadStudentEnrollments(student.id)
  viewStudentModal.show()
}

const loadStudentEnrollments = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/enrollments`)
    studentEnrollments.value = response.data.data || []
  } catch (error) {
    console.error('Error loading student enrollments:', error)
    studentEnrollments.value = []
  }
}

const showAssignCoursesModal = async (student) => {
  selectedStudentForAssign.value = student
  selectedCourseIds.value = []
  courseSearchTerm.value = ''
  courses.value = []
  filteredCourses.value = []
  loadingCourses.value = true
  
  // Show modal first
  assignCoursesModal.show()
  
  try {
    // Load all courses
    const response = await api.get('/courses', { params: { limit: 1000 } })
    const coursesData = response.data.data || response.data || []
    
    // Load current enrollments to filter out already enrolled courses
    await loadStudentEnrollments(student.id)
    
    // Get list of already enrolled course IDs
    const enrolledCourseIds = studentEnrollments.value
      .filter(e => e.status === 'approved')
      .map(e => e.course_id || e.course?.id)
      .filter(id => id !== undefined)
    
    // Filter out already enrolled courses
    courses.value = coursesData.filter(course => 
      !enrolledCourseIds.includes(course.id) && 
      !enrolledCourseIds.includes(Number(course.id))
    )
    filteredCourses.value = courses.value
    
    console.log('Loaded courses:', courses.value.length, 'Total:', coursesData.length, 'Already enrolled:', enrolledCourseIds.length)
  } catch (error) {
    console.error('Error loading courses:', error)
    alert('Lỗi khi tải danh sách khóa học: ' + (error.response?.data?.message || error.message))
  } finally {
    loadingCourses.value = false
  }
}

const filterCourses = () => {
  if (!courseSearchTerm.value.trim()) {
    filteredCourses.value = courses.value
    return
  }
  
  const search = courseSearchTerm.value.toLowerCase()
  filteredCourses.value = courses.value.filter(course => 
    course.title?.toLowerCase().includes(search) ||
    course.category?.toLowerCase().includes(search) ||
    course.description?.toLowerCase().includes(search)
  )
}

const isCourseAlreadyEnrolled = (courseId) => {
  return studentEnrollments.value.some(e => 
    (e.course_id === courseId || e.course?.id === courseId) && e.status === 'approved'
  )
}

const isCourseSelected = (courseId) => {
  // Convert both to numbers for comparison to handle string/number mismatch
  const courseIdNum = Number(courseId)
  return selectedCourseIds.value.some(id => Number(id) === courseIdNum)
}

const toggleCourseSelection = (courseId) => {
  const courseIdNum = Number(courseId)
  const index = selectedCourseIds.value.findIndex(id => Number(id) === courseIdNum)
  if (index > -1) {
    selectedCourseIds.value.splice(index, 1)
  } else {
    selectedCourseIds.value.push(courseIdNum)
  }
}

const assignCourses = async () => {
  if (selectedCourseIds.value.length === 0) return
  
  assigning.value = true
  try {
    const response = await api.post(
      `/admin/users/${selectedStudentForAssign.value.id}/enrollments`,
      { courseIds: selectedCourseIds.value }
    )
    
    const successCount = response.data.data?.successful?.length || 0
    const errorCount = response.data.data?.errors?.length || 0
    
    let message = `Đã gán ${successCount} khóa học thành công`
    if (errorCount > 0) {
      message += `. ${errorCount} khóa học gặp lỗi`
    }
    
    alert(message)
    assignCoursesModal.hide()
    
    // Reload students list to update enrollment count
    await loadStudents()
    
    // Reload enrollments if detail modal is open
    if (selectedStudent.value?.id === selectedStudentForAssign.value.id) {
      await loadStudentEnrollments(selectedStudent.value.id)
    }
  } catch (error) {
    console.error('Error assigning courses:', error)
    alert(error.response?.data?.message || 'Lỗi khi gán khóa học')
  } finally {
    assigning.value = false
  }
}

const removeCourseAssignment = async (enrollment) => {
  if (!confirm(`Bạn có chắc muốn xóa khóa học "${enrollment.course?.title}" khỏi học viên này?`)) {
    return
  }
  
  try {
    await api.delete(`/admin/users/${selectedStudent.value.id}/enrollments/${enrollment.id}`)
    alert('Đã xóa khóa học thành công!')
    
    // Reload enrollments
    await loadStudentEnrollments(selectedStudent.value.id)
    
    // Reload students list to update enrollment count
    await loadStudents()
  } catch (error) {
    console.error('Error removing course assignment:', error)
    alert(error.response?.data?.message || 'Lỗi khi xóa khóa học')
  }
}

const getEnrollmentStatusClass = (status) => {
  const classes = {
    'approved': 'badge bg-success',
    'pending': 'badge bg-warning',
    'rejected': 'badge bg-danger'
  }
  return classes[status] || 'badge bg-secondary'
}

const getEnrollmentStatusText = (status) => {
  const texts = {
    'approved': 'Đã duyệt',
    'pending': 'Chờ duyệt',
    'rejected': 'Đã từ chối'
  }
  return texts[status] || status
}

const toggleStudentStatus = async (student) => {
  try {
    const response = await api.put(`/admin/users/${student.id}/status`)
    
    // Update local state immediately for instant UI update (no need to reload list)
    const studentIndex = students.value.findIndex(s => s.id === student.id)
    if (studentIndex !== -1) {
      // Update is_active from response (API returns isActive in camelCase)
      if (response.data?.data) {
        const updatedUser = response.data.data
        // Handle both camelCase and snake_case, update both for consistency
        const newStatus = updatedUser.isActive !== undefined 
          ? updatedUser.isActive 
          : updatedUser.is_active !== undefined 
            ? updatedUser.is_active 
            : !students.value[studentIndex].is_active
        
        // Update both fields to ensure consistency
        students.value[studentIndex].is_active = newStatus
        students.value[studentIndex].isActive = newStatus
      } else {
        // Toggle locally if response doesn't have data
        const newStatus = !students.value[studentIndex].is_active
        students.value[studentIndex].is_active = newStatus
        students.value[studentIndex].isActive = newStatus
      }
    }
    
    alert('Cập nhật trạng thái thành công!')
    // Note: No loadStudents() call - local state is updated immediately
  } catch (error) {
    alert(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
  }
}

const isStudentActive = (student) => {
  // Check both camelCase and snake_case, default to true if undefined/null
  const isActive = student.isActive !== undefined ? student.isActive : student.is_active
  return isActive !== false && isActive !== null
}

const getStatusClass = (student) => {
  return isStudentActive(student) ? 'badge bg-success' : 'badge bg-danger'
}

const getStatusText = (student) => {
  return isStudentActive(student) ? 'Hoạt động' : 'Không hoạt động'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.content-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-circle {
  width: 35px;
  height: 35px;
  background: #fb873f;
  color: white;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.course-item {
  border: 2px solid #e9ecef !important;
  background-color: #fff !important;
}

.course-item:hover {
  border-color: #fb873f !important;
  background-color: #fff9f5 !important;
}

.course-item.course-selected {
  border-color: #fb873f !important;
  background-color: #fff4ed !important;
  box-shadow: 0 0 0 0.2rem rgba(251, 135, 63, 0.25) !important;
}

.course-item.course-selected:hover {
  border-color: #e6772a !important;
  background-color: #ffead8 !important;
}

.course-item.course-selected .form-check-input:checked {
  background-color: #fb873f !important;
  border-color: #fb873f !important;
}

.course-item.course-selected strong {
  color: #fb873f !important;
  font-weight: 600 !important;
}

.course-item.course-selected label {
  color: #333 !important;
}
</style>

