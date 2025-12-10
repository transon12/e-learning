<template>
  <div>
    <div class="topbar">
      <div>
        <h5 class="mb-0">Quản lý Bài học</h5>
      </div>
      <div>
        <select v-model="selectedCourseId" class="form-select d-inline-block me-2" style="width: 250px;" @change="loadLessons">
          <option value="">Chọn khóa học...</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
        </select>
        <button class="btn btn-primary" @click="showAddLessonModal">
          <i class="fa fa-plus me-2"></i>Thêm Bài học
        </button>
      </div>
    </div>

    <div class="content-card">
      <div v-if="!selectedCourseId" class="text-center text-muted py-5">
        Vui lòng chọn khóa học để xem bài học
      </div>
      <div v-else-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <div v-else>
        <div v-if="lessons.length === 0" class="text-center text-muted py-5">
          Không có bài học nào
        </div>
        <div v-for="lesson in lessons" :key="lesson.id" class="lesson-item">
          <div class="row align-items-center">
            <div class="col-md-1">
              <i class="fa fa-video text-danger fa-2x"></i>
            </div>
            <div class="col-md-6">
              <h6 class="mb-1">{{ lesson.title }}</h6>
              <p class="text-muted small mb-1">{{ lesson.sectionName || 'N/A' }}</p>
              <div class="d-flex gap-2">
                <span class="badge bg-secondary">{{ lesson.duration || 0 }} phút</span>
                <span :class="lesson.status === 'published' ? 'badge bg-success' : 'badge bg-warning'">
                  {{ lesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp' }}
                </span>
                <span v-if="lesson.file_video_path" class="badge bg-info">Có Video</span>
                <span v-if="lesson.file_audio_path" class="badge bg-success">Có Audio</span>
                <span v-if="lesson.file_pdf_path" class="badge bg-danger">Có PDF</span>
              </div>
            </div>
            <div class="col-md-2 text-center">
              <small class="text-muted">{{ lesson.viewCount || 0 }} lượt xem</small>
            </div>
            <div class="col-md-3">
              <div class="btn-group w-100">
                <button class="btn btn-sm btn-primary" @click="editLesson(lesson)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" @click="viewLesson(lesson.id)">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" @click="goToUpload(lesson.id)">
                  <i class="fa fa-upload"></i>
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteLesson(lesson.id)">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lesson Modal -->
    <div class="modal fade" id="lessonModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingLesson ? 'Sửa Bài học' : 'Thêm Bài học' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveLesson">
              <div class="mb-3">
                <label class="form-label">Tiêu đề *</label>
                <input v-model="lessonForm.title" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea v-model="lessonForm.description" class="form-control" rows="3"></textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Khóa học *</label>
                  <select v-model="lessonForm.course" class="form-select" required>
                    <option value="">Chọn khóa học</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Thời lượng (phút)</label>
                  <input v-model.number="lessonForm.duration" type="number" class="form-control" min="0">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Video URL (YouTube/Vimeo hoặc để trống nếu upload file)</label>
                <input v-model="lessonForm.videoUrl" type="text" class="form-control" placeholder="https://www.youtube.com/watch?v=...">
              </div>
              <div class="mb-3">
                <label class="form-label">Loại video</label>
                <select v-model="lessonForm.videoType" class="form-select">
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="local">Local File</option>
                  <option value="external">External URL</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung bài học (HTML)</label>
                <textarea v-model="lessonForm.content" class="form-control" rows="5"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model="lessonForm.status" class="form-select">
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveLesson">Lưu</button>
            <button type="button" class="btn btn-info" @click="goToUpload(editingLesson)">
              <i class="fa fa-upload me-1"></i>Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { Modal } from 'bootstrap'

const router = useRouter()
const loading = ref(false)
const courses = ref([])
const lessons = ref([])
const selectedCourseId = ref('')
const editingLesson = ref(null)
const lessonForm = ref({
  title: '',
  description: '',
  course: '',
  duration: 0,
  videoUrl: '',
  videoType: 'youtube',
  content: '',
  status: 'draft'
})

onMounted(() => {
  loadCourses()
})

const loadCourses = async () => {
  try {
    const response = await api.get('/courses', { params: { limit: 1000 } })
    courses.value = response.data.data || []
  } catch (error) {
    console.error('Error loading courses:', error)
  }
}

const loadLessons = async () => {
  if (!selectedCourseId.value) {
    lessons.value = []
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/lessons/course/${selectedCourseId.value}`)
    lessons.value = []
    if (response.data.data) {
      response.data.data.forEach(section => {
        section.lessons.forEach(lesson => {
          lessons.value.push({
            ...lesson,
            sectionName: section.title
          })
        })
      })
    }
  } catch (error) {
    console.error('Error loading lessons:', error)
  } finally {
    loading.value = false
  }
}

const showAddLessonModal = () => {
  editingLesson.value = null
  lessonForm.value = {
    title: '',
    description: '',
    course: selectedCourseId.value || '',
    duration: 0,
    videoUrl: '',
    videoType: 'youtube',
    content: '',
    status: 'draft'
  }
  const modal = new Modal(document.getElementById('lessonModal'))
  modal.show()
}

const editLesson = (lesson) => {
  editingLesson.value = lesson.id
  lessonForm.value = {
    title: lesson.title,
    description: lesson.description || '',
    course: lesson.course_id || lesson.course?.id || '',
    duration: lesson.duration || 0,
    videoUrl: lesson.videoUrl || '',
    videoType: lesson.videoType || 'youtube',
    content: lesson.content || '',
    status: lesson.status
  }
  const modal = new Modal(document.getElementById('lessonModal'))
  modal.show()
}

const saveLesson = async () => {
  try {
    if (editingLesson.value) {
      await api.put(`/lessons/${editingLesson.value}`, lessonForm.value)
      alert('Cập nhật bài học thành công!')
    } else {
      await api.post('/lessons', lessonForm.value)
      alert('Tạo bài học thành công!')
    }
    const modal = Modal.getInstance(document.getElementById('lessonModal'))
    modal.hide()
    await loadLessons()
  } catch (error) {
    alert('Lỗi: ' + (error.response?.data?.message || error.message))
  }
}

const deleteLesson = async (lessonId) => {
  if (!confirm('Bạn có chắc muốn xóa bài học này?')) return

  try {
    await api.delete(`/lessons/${lessonId}`)
    alert('Xóa bài học thành công!')
    await loadLessons()
  } catch (error) {
    alert('Lỗi: ' + (error.response?.data?.message || error.message))
  }
}

const viewLesson = (lessonId) => {
  router.push(`/lesson/${lessonId}`)
}

const goToUpload = (lessonId) => {
  router.push(`/lesson-upload/${lessonId}`)
}
</script>

<style scoped>
.lesson-item {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.lesson-item:hover {
  background: #f8f9fa;
}
</style>

