<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div></div>
      <div>
        <button class="btn btn-primary" @click="showAddInstructorModal">
          <i class="fa fa-plus me-2"></i>Tạo Giảng viên
        </button>
      </div>
    </div>

    <div class="content-card">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h5 class="mb-0">Danh sách Giảng viên</h5>
        <div>
          <input 
            v-model="searchTerm" 
            type="text" 
            class="form-control form-control-sm d-inline-block" 
            style="width: 250px;" 
            placeholder="Tìm kiếm giảng viên..."
            @input="loadInstructors"
          >
          <button class="btn btn-primary btn-sm ms-2" @click="loadInstructors">
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
                <th>Giảng viên</th>
                <th>Email</th>
                <th>Số khóa học</th>
                <th>Tổng học viên</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="instructor in instructors" :key="instructor.id">
                <td>{{ instructor.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2" style="width: 35px; height: 35px; background: #fb873f; color: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">
                      {{ (instructor.profile_first_name || instructor.username || 'A').charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="fw-bold">
                        {{ instructor.profile_first_name && instructor.profile_last_name 
                          ? `${instructor.profile_first_name} ${instructor.profile_last_name}` 
                          : instructor.username }}
                      </div>
                      <small class="text-muted">@{{ instructor.username }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ instructor.email }}</td>
                <td>
                  <span class="badge bg-primary">{{ instructor.courseCount || 0 }}</span>
                </td>
                <td>
                  <span class="badge bg-success">{{ instructor.totalStudents || 0 }}</span>
                </td>
                <td>{{ formatDate(instructor.created_at) }}</td>
                <td>
                  <span :class="instructor.is_active ? 'badge bg-success' : 'badge bg-danger'">
                    {{ instructor.is_active ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </td>
                <td>
                  <button 
                    class="btn btn-sm btn-outline-primary me-1" 
                    @click="showAssignCourseModal(instructor)"
                    title="Gán khóa học"
                  >
                    <i class="fa fa-book me-1"></i>Gán khóa học
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-info" 
                    @click="viewInstructorCourses(instructor)"
                    title="Xem khóa học"
                  >
                    <i class="fa fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="instructors.length === 0" class="text-center text-muted py-5">
          Không có giảng viên nào
        </div>
      </div>
    </div>

    <!-- Add Instructor Modal -->
    <div class="modal fade" id="addInstructorModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tạo Giảng viên</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createInstructor">
              <div class="mb-3">
                <label class="form-label">Tên đăng nhập *</label>
                <input 
                  v-model="instructorForm.username" 
                  type="text" 
                  class="form-control" 
                  required
                  placeholder="username"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Email *</label>
                <input 
                  v-model="instructorForm.email" 
                  type="email" 
                  class="form-control" 
                  required
                  placeholder="email@example.com"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Mật khẩu *</label>
                <input 
                  v-model="instructorForm.password" 
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
                    v-model="instructorForm.profile_first_name" 
                    type="text" 
                    class="form-control"
                    placeholder="Họ"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tên</label>
                  <input 
                    v-model="instructorForm.profile_last_name" 
                    type="text" 
                    class="form-control"
                    placeholder="Tên"
                  >
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input 
                  v-model="instructorForm.profile_phone" 
                  type="tel" 
                  class="form-control"
                  placeholder="Số điện thoại"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Giới thiệu</label>
                <textarea 
                  v-model="instructorForm.profile_bio" 
                  class="form-control" 
                  rows="3"
                  placeholder="Giới thiệu về giảng viên"
                ></textarea>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ submitting ? 'Đang tạo...' : 'Tạo Giảng viên' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Course Modal -->
    <div class="modal fade" id="assignCourseModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Gán Khóa học cho Giảng viên</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedInstructor" class="mb-3">
              <strong>Giảng viên:</strong> 
              {{ selectedInstructor.profile_first_name && selectedInstructor.profile_last_name 
                ? `${selectedInstructor.profile_first_name} ${selectedInstructor.profile_last_name}` 
                : selectedInstructor.username }}
            </div>
            
            <div class="mb-3">
              <label class="form-label">Chọn khóa học</label>
              <select 
                v-model="selectedCourseId" 
                class="form-select"
                @change="loadCourseDetails"
              >
                <option value="">-- Chọn khóa học --</option>
                <option 
                  v-for="course in availableCourses" 
                  :key="course.id" 
                  :value="course.id"
                >
                  {{ course.title }} 
                  <span v-if="course.instructor_id" class="text-muted">
                    (Đã gán: {{ getInstructorName(course.instructor_id) }})
                  </span>
                </option>
              </select>
            </div>

            <div v-if="selectedCourseId && courseDetails" class="alert alert-info">
              <strong>Thông tin khóa học:</strong><br>
              <small>
                Danh mục: {{ courseDetails.category }}<br>
                Trạng thái: {{ courseDetails.status === 'published' ? 'Đã xuất bản' : 'Bản nháp' }}<br>
                <span v-if="courseDetails.instructor_id">
                  Giảng viên hiện tại: {{ getInstructorName(courseDetails.instructor_id) }}
                </span>
                <span v-else class="text-muted">Chưa có giảng viên</span>
              </small>
            </div>

            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
              <button 
                type="button" 
                class="btn btn-primary" 
                @click="assignCourse"
                :disabled="!selectedCourseId || assigning"
              >
                <span v-if="assigning" class="spinner-border spinner-border-sm me-2"></span>
                {{ assigning ? 'Đang gán...' : 'Gán Khóa học' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Instructor Courses Modal -->
    <div class="modal fade" id="viewCoursesModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Khóa học của Giảng viên</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedInstructor" class="mb-3">
              <strong>Giảng viên:</strong> 
              {{ selectedInstructor.profile_first_name && selectedInstructor.profile_last_name 
                ? `${selectedInstructor.profile_first_name} ${selectedInstructor.profile_last_name}` 
                : selectedInstructor.username }}
            </div>

            <div v-if="instructorCoursesLoading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>

            <div v-else-if="instructorCourses.length === 0" class="text-center text-muted py-3">
              Giảng viên này chưa có khóa học nào
            </div>

            <div v-else class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên khóa học</th>
                    <th>Danh mục</th>
                    <th>Trạng thái</th>
                    <th>Học viên</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="course in instructorCourses" :key="course.id">
                    <td>{{ course.id }}</td>
                    <td>{{ course.title }}</td>
                    <td>{{ course.category }}</td>
                    <td>
                      <span :class="course.status === 'published' ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp' }}
                      </span>
                    </td>
                    <td>{{ course.enrolled_count || 0 }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="unassignCourse(course.id)"
                        title="Hủy gán"
                      >
                        <i class="fa fa-times"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
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

const loading = ref(false)
const submitting = ref(false)
const assigning = ref(false)
const instructors = ref([])
const availableCourses = ref([])
const instructorCourses = ref([])
const instructorCoursesLoading = ref(false)
const searchTerm = ref('')
const selectedInstructor = ref(null)
const selectedCourseId = ref(null)
const courseDetails = ref(null)

const instructorForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'instructor',
  profile_first_name: '',
  profile_last_name: '',
  profile_phone: '',
  profile_bio: ''
})

let addInstructorModal = null
let assignCourseModal = null
let viewCoursesModal = null

onMounted(() => {
  loadInstructors()
  loadAvailableCourses()
  
  // Initialize modals
  addInstructorModal = new Modal(document.getElementById('addInstructorModal'))
  assignCourseModal = new Modal(document.getElementById('assignCourseModal'))
  viewCoursesModal = new Modal(document.getElementById('viewCoursesModal'))
})

const loadInstructors = async () => {
  loading.value = true
  try {
    const params = { role: 'instructor', limit: 1000 }
    if (searchTerm.value) {
      params.search = searchTerm.value
    }
    
    const response = await api.get('/admin/users', { params })
    instructors.value = (response.data.data || []).map(instructor => {
      const courses = instructor.courses || []
      return {
        ...instructor,
        courseCount: courses.length,
        totalStudents: courses.reduce((sum, course) => sum + (course.enrolled_count || course.enrolledCount || 0), 0)
      }
    })
  } catch (error) {
    console.error('Error loading instructors:', error)
    alert('Lỗi khi tải danh sách giảng viên')
  } finally {
    loading.value = false
  }
}

const loadAvailableCourses = async () => {
  try {
    // Load all courses (including unpublished) for admin
    const response = await api.get('/courses', {
      params: { limit: 1000 } // Get all courses
    })
    availableCourses.value = response.data.data || []
  } catch (error) {
    console.error('Error loading courses:', error)
  }
}

const showAddInstructorModal = () => {
  instructorForm.value = {
    username: '',
    email: '',
    password: '',
    role: 'instructor',
    profile_first_name: '',
    profile_last_name: '',
    profile_phone: '',
    profile_bio: ''
  }
  addInstructorModal.show()
}

const createInstructor = async () => {
  submitting.value = true
  try {
    await api.post('/admin/users', instructorForm.value)
    alert('Tạo giảng viên thành công!')
    addInstructorModal.hide()
    loadInstructors()
  } catch (error) {
    alert(error.response?.data?.message || 'Lỗi khi tạo giảng viên')
  } finally {
    submitting.value = false
  }
}

const showAssignCourseModal = (instructor) => {
  selectedInstructor.value = instructor
  selectedCourseId.value = null
  courseDetails.value = null
  assignCourseModal.show()
}

const loadCourseDetails = async () => {
  if (!selectedCourseId.value) {
    courseDetails.value = null
    return
  }
  
  try {
    const response = await api.get(`/courses/${selectedCourseId.value}`)
    courseDetails.value = response.data.data
  } catch (error) {
    console.error('Error loading course details:', error)
  }
}

const assignCourse = async () => {
  if (!selectedCourseId.value || !selectedInstructor.value) return
  
  assigning.value = true
  try {
    await api.put(`/courses/${selectedCourseId.value}`, {
      instructor_id: selectedInstructor.value.id
    })
    alert('Gán khóa học thành công!')
    assignCourseModal.hide()
    loadInstructors()
    loadAvailableCourses()
  } catch (error) {
    alert(error.response?.data?.message || 'Lỗi khi gán khóa học')
  } finally {
    assigning.value = false
  }
}

const viewInstructorCourses = async (instructor) => {
  selectedInstructor.value = instructor
  instructorCoursesLoading.value = true
  instructorCourses.value = []
  viewCoursesModal.show()
  
  try {
    const response = await api.get('/courses', {
      params: { instructor_id: instructor.id, limit: 1000 }
    })
    instructorCourses.value = response.data.data || []
  } catch (error) {
    console.error('Error loading instructor courses:', error)
    alert('Lỗi khi tải danh sách khóa học')
  } finally {
    instructorCoursesLoading.value = false
  }
}

const unassignCourse = async (courseId) => {
  if (!confirm('Bạn có chắc muốn hủy gán khóa học này?')) return
  
  try {
    await api.put(`/courses/${courseId}`, {
      instructor_id: null
    })
    alert('Hủy gán khóa học thành công!')
    viewInstructorCourses(selectedInstructor.value)
    loadInstructors()
  } catch (error) {
    alert(error.response?.data?.message || 'Lỗi khi hủy gán khóa học')
  }
}

const getInstructorName = (instructorId) => {
  const instructor = instructors.value.find(i => i.id === instructorId)
  if (!instructor) return 'Không xác định'
  return instructor.profile_first_name && instructor.profile_last_name
    ? `${instructor.profile_first_name} ${instructor.profile_last_name}`
    : instructor.username
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
</style>

