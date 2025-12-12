<template>
  <div>
    <div class="topbar">
      <div>
        <h5 class="mb-0">Quản lý Sections & Lessons</h5>
      </div>
      <div>
        <select v-model="selectedCourseId" class="form-select d-inline-block me-2" style="width: 250px;" @change="loadCourseSections">
          <option value="">Chọn khóa học...</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
        </select>
        <button v-if="selectedCourseId" class="btn btn-primary" @click="showAddSectionModal">
          <i class="fa fa-plus me-2"></i>Thêm Section
        </button>
      </div>
    </div>

    <div class="content-card">
      <div v-if="!selectedCourseId" class="text-center text-muted py-5">
        Vui lòng chọn khóa học để quản lý sections
      </div>
      <div v-else-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <div v-else>
        <!-- Filter Section -->
        <div class="d-flex justify-content-between align-items-center mb-4" v-if="sections.length > 0">
          <div>
            <input 
              v-model="searchTerm" 
              type="text" 
              class="form-control" 
              placeholder="Tìm kiếm section hoặc lesson..." 
              style="width: 300px;"
              @input="applyFilters"
            >
          </div>
          <div>
            <select v-model="lessonCountFilter" class="form-select d-inline-block" style="width: auto;" @change="applyFilters">
              <option value="">Tất cả sections</option>
              <option value="0">Sections trống</option>
              <option value="1+">Có lessons</option>
            </select>
          </div>
        </div>

        <div v-if="filteredSections.length === 0" class="text-center text-muted py-5">
          <span v-if="sections.length === 0">Chưa có section nào. Hãy thêm section đầu tiên!</span>
          <span v-else>Không tìm thấy section nào phù hợp</span>
        </div>
        <div v-else>
          <div v-for="(section, sectionIndex) in filteredSections" :key="section.id" class="section-card mb-4">
            <div class="section-header">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-0">
                    <i class="fa fa-folder me-2"></i>
                    {{ section.title }}
                    <span class="badge bg-secondary ms-2">{{ section.lessons?.length || 0 }} bài học</span>
                  </h6>
                </div>
                <div>
                  <button class="btn btn-sm btn-info me-2" @click="showAddLessonModal(section)">
                    <i class="fa fa-plus me-1"></i>Thêm Lesson
                  </button>
                  <button class="btn btn-sm btn-warning me-2" @click="editSection(section)">
                    <i class="fa fa-edit me-1"></i>Sửa
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteSection(section.id)">
                    <i class="fa fa-trash me-1"></i>Xóa
                  </button>
                </div>
              </div>
            </div>
            <div class="section-lessons mt-3">
              <div v-if="!section.lessons || section.lessons.length === 0" class="text-muted text-center py-3">
                Chưa có lesson nào trong section này
              </div>
              <div v-else>
                <div v-for="(lesson, lessonIndex) in section.lessons" :key="lesson.id" class="lesson-item">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <span class="lesson-order me-3">{{ lessonIndex + 1 }}</span>
                      <div>
                        <strong>{{ lesson.title }}</strong>
                        <small class="text-muted d-block">{{ lesson.duration || 0 }} phút</small>
                      </div>
                    </div>
                    <div>
                      <button class="btn btn-sm btn-outline-primary me-2" @click="moveLessonUp(section.id, lesson.id, lessonIndex)">
                        <i class="fa fa-arrow-up"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-primary me-2" @click="moveLessonDown(section.id, lesson.id, lessonIndex)">
                        <i class="fa fa-arrow-down"></i>
                      </button>
                      <button class="btn btn-sm btn-danger" @click="removeLessonFromSection(section.id, lesson.id)">
                        <i class="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Modal -->
    <div class="modal fade" id="sectionModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingSection ? 'Sửa Section' : 'Thêm Section' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Tên Section</label>
              <input v-model="sectionForm.title" type="text" class="form-control" placeholder="Ví dụ: Phần 1 - Giới thiệu">
            </div>
            <div class="mb-3">
              <label class="form-label">Thứ tự</label>
              <input v-model.number="sectionForm.order_index" type="number" class="form-control" min="0">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveSection">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Lesson to Section Modal -->
    <div class="modal fade" id="addLessonModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm Lesson vào Section</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="availableLessons.length === 0" class="text-muted text-center py-3">
              Không còn lesson nào để thêm vào section này
            </div>
            <div v-else>
              <div class="mb-3">
                <label class="form-label">Chọn Lesson</label>
                <select v-model="selectedLessonId" class="form-select">
                  <option value="">-- Chọn lesson --</option>
                  <option v-for="lesson in availableLessons" :key="lesson.id" :value="lesson.id">
                    {{ lesson.title }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Thứ tự trong section</label>
                <input v-model.number="lessonOrderIndex" type="number" class="form-control" min="0" :placeholder="`Mặc định: ${(selectedSection?.lessons?.length || 0) + 1}`">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="addLessonToSection" :disabled="!selectedLessonId">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import api from '@/services/api'

const courses = ref([])
const selectedCourseId = ref('')
const sections = ref([])
const loading = ref(false)
const editingSection = ref(null)
const selectedSection = ref(null)
const selectedLessonId = ref('')
const lessonOrderIndex = ref(null)
const allLessons = ref([])
const searchTerm = ref('')
const lessonCountFilter = ref('')

const sectionForm = ref({
  title: '',
  order_index: 0
})

const filteredSections = computed(() => {
  let filtered = sections.value

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(section => {
      // Tìm trong tên section
      if (section.title.toLowerCase().includes(term)) return true
      // Tìm trong tên lessons
      if (section.lessons) {
        return section.lessons.some(lesson => 
          lesson.title.toLowerCase().includes(term)
        )
      }
      return false
    })
  }

  if (lessonCountFilter.value) {
    if (lessonCountFilter.value === '0') {
      filtered = filtered.filter(section => !section.lessons || section.lessons.length === 0)
    } else if (lessonCountFilter.value === '1+') {
      filtered = filtered.filter(section => section.lessons && section.lessons.length > 0)
    }
  }

  return filtered
})

onMounted(() => {
  loadCourses()
})

const applyFilters = () => {
  // Computed property handles filtering
}

const loadCourses = async () => {
  try {
    const response = await api.get('/courses', { params: { limit: 1000 } })
    courses.value = response.data.data || []
  } catch (error) {
    console.error('Error loading courses:', error)
    alert('Lỗi khi tải danh sách khóa học')
  }
}

const loadCourseSections = async () => {
  if (!selectedCourseId.value) {
    sections.value = []
    searchTerm.value = ''
    lessonCountFilter.value = ''
    return
  }

  loading.value = true
  try {
    // Load sections với lessons
    const response = await api.get(`/lessons/course/${selectedCourseId.value}`)
    sections.value = response.data.data || []
    
    // Load tất cả lessons của course để có thể thêm vào sections
    await loadAllLessons()
  } catch (error) {
    console.error('Error loading sections:', error)
    alert('Lỗi khi tải sections')
  } finally {
    loading.value = false
  }
}

const loadAllLessons = async () => {
  try {
    // Load tất cả lessons của course (không phân biệt section)
    const response = await api.get(`/lessons`, { 
      params: { 
        course: selectedCourseId.value,
        limit: 1000 
      } 
    })
    allLessons.value = response.data.data || []
  } catch (error) {
    console.error('Error loading all lessons:', error)
    allLessons.value = []
  }
}

const availableLessons = computed(() => {
  if (!selectedSection.value) return []
  
  // Lấy danh sách lesson IDs đã có trong section
  const existingLessonIds = (selectedSection.value.lessons || []).map(l => l.id)
  
  // Trả về các lessons chưa có trong section này
  return allLessons.value.filter(lesson => !existingLessonIds.includes(lesson.id))
})

const showAddSectionModal = () => {
  editingSection.value = null
  sectionForm.value = {
    title: '',
    order_index: sections.value.length
  }
  const modal = new Modal(document.getElementById('sectionModal'))
  modal.show()
}

const editSection = (section) => {
  editingSection.value = section.id
  sectionForm.value = {
    title: section.title,
    order_index: section.order_index || 0
  }
  const modal = new Modal(document.getElementById('sectionModal'))
  modal.show()
}

const saveSection = async () => {
  try {
    if (!sectionForm.value.title.trim()) {
      alert('Vui lòng nhập tên section')
      return
    }

    if (editingSection.value) {
      // Update section - cần tạo API endpoint cho việc này
      // Tạm thời dùng course API nếu có
      await api.put(`/courses/${selectedCourseId.value}/sections/${editingSection.value}`, {
        title: sectionForm.value.title,
        order_index: sectionForm.value.order_index
      })
    } else {
      // Create section - cần tạo API endpoint
      await api.post(`/courses/${selectedCourseId.value}/sections`, {
        title: sectionForm.value.title,
        order_index: sectionForm.value.order_index
      })
    }

    const modal = Modal.getInstance(document.getElementById('sectionModal'))
    modal.hide()
    await loadCourseSections()
  } catch (error) {
    console.error('Error saving section:', error)
    alert('Lỗi khi lưu section: ' + (error.response?.data?.message || error.message))
  }
}

const deleteSection = async (sectionId) => {
  if (!confirm('Bạn có chắc muốn xóa section này? Tất cả lessons trong section sẽ bị xóa khỏi section.')) {
    return
  }

  try {
    // Cần tạo API endpoint DELETE /api/courses/:courseId/sections/:sectionId
    await api.delete(`/courses/${selectedCourseId.value}/sections/${sectionId}`)
    await loadCourseSections()
  } catch (error) {
    console.error('Error deleting section:', error)
    alert('Lỗi khi xóa section: ' + (error.response?.data?.message || error.message))
  }
}

const showAddLessonModal = (section) => {
  selectedSection.value = section
  selectedLessonId.value = ''
  lessonOrderIndex.value = null
  const modal = new Modal(document.getElementById('addLessonModal'))
  modal.show()
}

const addLessonToSection = async () => {
  if (!selectedLessonId.value || !selectedSection.value) {
    alert('Vui lòng chọn lesson')
    return
  }

  try {
    const orderIndex = lessonOrderIndex.value !== null ? lessonOrderIndex.value : ((selectedSection.value.lessons?.length || 0) + 1)
    
    await api.post('/section-lessons', {
      section_id: selectedSection.value.id,
      lesson_id: selectedLessonId.value,
      order_index: orderIndex
    })

    const modal = Modal.getInstance(document.getElementById('addLessonModal'))
    modal.hide()
    await loadCourseSections()
  } catch (error) {
    console.error('Error adding lesson to section:', error)
    alert('Lỗi khi thêm lesson: ' + (error.response?.data?.message || error.message))
  }
}

const removeLessonFromSection = async (sectionId, lessonId) => {
  if (!confirm('Bạn có chắc muốn xóa lesson khỏi section này?')) {
    return
  }

  try {
    await api.delete(`/section-lessons/${sectionId}/${lessonId}`)
    await loadCourseSections()
  } catch (error) {
    console.error('Error removing lesson:', error)
    alert('Lỗi khi xóa lesson: ' + (error.response?.data?.message || error.message))
  }
}

const moveLessonUp = async (sectionId, lessonId, currentIndex) => {
  if (currentIndex === 0) return

  try {
    const newOrderIndex = currentIndex
    await api.put(`/section-lessons/${sectionId}/${lessonId}`, {
      order_index: newOrderIndex
    })
    await loadCourseSections()
  } catch (error) {
    console.error('Error moving lesson:', error)
    alert('Lỗi khi di chuyển lesson')
  }
}

const moveLessonDown = async (sectionId, lessonId, currentIndex) => {
  const section = sections.value.find(s => s.id === sectionId)
  if (!section || currentIndex >= (section.lessons?.length || 0) - 1) return

  try {
    const newOrderIndex = currentIndex + 2
    await api.put(`/section-lessons/${sectionId}/${lessonId}`, {
      order_index: newOrderIndex
    })
    await loadCourseSections()
  } catch (error) {
    console.error('Error moving lesson:', error)
    alert('Lỗi khi di chuyển lesson')
  }
}
</script>

<style scoped>
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
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
}

.section-header {
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 15px;
}

.section-lessons {
  padding-left: 20px;
}

.lesson-item {
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #fb873f;
}

.lesson-order {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #fb873f;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
}

@media (max-width: 991.98px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .topbar select,
  .topbar button {
    width: 100% !important;
  }
  .section-card {
    padding: 15px;
  }
  .section-header .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .section-header .btn {
    margin-bottom: 6px;
  }
  .lesson-item .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .lesson-item .btn {
    margin-bottom: 6px;
  }
}
</style>

