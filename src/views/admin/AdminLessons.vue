<template>
  <div>
    <div class="topbar">
      <div>
        <h5 class="mb-0">Quản lý Bài học</h5>
      </div>
      <div>
        <button class="btn btn-primary" @click="showAddLessonModal">
          <i class="fa fa-plus me-2"></i>Thêm Bài học
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
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Khóa học</label>
            <select v-model="selectedCourseId" class="form-select" @change="loadLessons">
              <option value="">Tất cả khóa học</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted mb-1">Tìm kiếm</label>
            <input 
              v-model="searchTerm" 
              type="text" 
              class="form-control" 
              placeholder="Tìm kiếm bài học..." 
              @input="applyFilters"
            >
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Trạng thái</label>
            <select v-model="statusFilter" class="form-select" @change="applyFilters">
              <option value="">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small text-muted mb-1">Section</label>
            <select v-model="sectionFilter" class="form-select" @change="applyFilters">
              <option value="">Tất cả</option>
              <option v-for="section in uniqueSections" :key="section" :value="section">{{ section }}</option>
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-outline-secondary w-100" @click="clearFilters">
              <i class="fa fa-times me-1"></i>Xóa bộ lọc
            </button>
          </div>
        </div>

        <div v-if="filteredLessons.length === 0" class="text-center text-muted py-5">
          Không có bài học nào
        </div>
        <template v-else>
          <div class="mb-3 text-muted">
            Hiển thị {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} trong tổng số {{ pagination.total }} bài học
          </div>
          <div v-for="lesson in paginatedLessons" :key="lesson.id" class="lesson-item">
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
                    <i class="fa fa-eye" style="color: #fff;"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteLesson(lesson.id)">
                    <i class="fa fa-trash"></i>
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
              <div class="mb-3" v-if="lessonForm.videoType !== 'local'">
                <label class="form-label d-flex justify-content-between">
                  <span>Video URL</span>
                  <small class="text-muted">Chỉ dùng khi chọn YouTube/Vimeo/External</small>
                </label>
                <input v-model="lessonForm.videoUrl" type="text" class="form-control" placeholder="https://www.youtube.com/watch?v=...">
              </div>
              <div class="mb-3">
                <label class="form-label d-flex justify-content-between">
                  <span>Loại media</span>
                  <small class="text-muted">Mỗi bài học chỉ 1 loại media</small>
                </label>
                <select v-model="lessonForm.videoType" class="form-select">
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="local">Upload file (MP4/Audio/PDF)</option>
                  <option value="external">External URL</option>
                </select>
                <small class="text-muted">
                  - YouTube/Vimeo/External: không upload file<br>
                  - Upload file: lưu bài học rồi dùng nút Upload Files
                </small>
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung bài học</label>
                <div ref="ckeditorContainer" id="ckeditor-container"></div>
              </div>
              <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select v-model="lessonForm.status" class="form-select">
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                </select>
              </div>

              <!-- Upload file (gọn trong accordion, chỉ chọn 1 loại media) -->
              <div v-if="lessonForm.videoType === 'local'" class="accordion mb-3" id="uploadAccordion">
                <div class="accordion-item">
                  <h2 class="accordion-header" id="headingUpload">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseUpload">
                      Upload file (chỉ 1 loại media)
                    </button>
                  </h2>
                  <div id="collapseUpload" class="accordion-collapse collapse" data-bs-parent="#uploadAccordion">
                    <div class="accordion-body">
                      <p class="text-muted small mb-3">
                        Chỉ khả dụng khi đã lưu bài học (có ID) và chọn loại media = "Upload file".
                      </p>

                      <div class="d-flex flex-wrap gap-3 mb-3">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" id="upload-video" value="video" v-model="uploadChoice">
                          <label class="form-check-label" for="upload-video">Video (MP4)</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" id="upload-audio" value="audio" v-model="uploadChoice">
                          <label class="form-check-label" for="upload-audio">Audio (MP3)</label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" id="upload-pdf" value="pdf" v-model="uploadChoice">
                          <label class="form-check-label" for="upload-pdf">PDF</label>
                        </div>
                      </div>

                      <div>
                        <label class="form-label small">Chọn file {{ uploadChoiceLabel }}</label>
                        <input
                          type="file"
                          class="form-control"
                          :accept="uploadChoiceAccept"
                          :disabled="!editingLesson || lessonForm.videoType !== 'local' || currentUploading"
                          @change="(e) => uploadInline(e, uploadChoice)"
                        >
                        <small v-if="currentUploading" class="text-primary">Đang upload... {{ currentUploadProgress }}%</small>
                      </div>

                      <small class="text-muted d-block mt-2">
                        Mỗi bài học chỉ 1 loại media. Đổi loại sẽ cần xóa loại cũ trước khi upload.
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveLesson">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { Modal } from 'bootstrap'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const router = useRouter()
const loading = ref(false)
const courses = ref([])
const lessons = ref([])
const selectedCourseId = ref('')
const editingLesson = ref(null)
const searchTerm = ref('')
const statusFilter = ref('')
const sectionFilter = ref('')
const ckeditorContainer = ref(null)
let editorInstance = null
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})
const uploadingVideo = ref(false)
const uploadingAudio = ref(false)
const uploadingPdf = ref(false)
const uploadProgressVideo = ref(0)
const uploadProgressAudio = ref(0)
const uploadProgressPdf = ref(0)
const uploadChoice = ref('video')
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

const uniqueSections = computed(() => {
  const sections = new Set()
  lessons.value.forEach(lesson => {
    if (lesson.sectionName) {
      sections.add(lesson.sectionName)
    }
  })
  return Array.from(sections).sort()
})

const filteredLessons = computed(() => {
  let filtered = lessons.value

  // Filter theo course nếu có chọn (chỉ khi đang xem tất cả lessons)
  // Nếu đã load theo course thì không cần filter nữa vì data đã đúng
  if (selectedCourseId.value) {
    // Kiểm tra xem lessons có phải từ nhiều courses không
    const uniqueCourseIds = new Set(lessons.value.map(l => {
      const id = typeof l.course_id === 'number' ? l.course_id : parseInt(l.course_id || 0)
      return id
    }))
    
    // Chỉ filter nếu có nhiều courses trong data
    if (uniqueCourseIds.size > 1) {
      const courseIdNum = parseInt(selectedCourseId.value)
      filtered = filtered.filter(lesson => {
        const lessonCourseId = typeof lesson.course_id === 'number' 
          ? lesson.course_id 
          : parseInt(lesson.course_id || 0)
        return lessonCourseId === courseIdNum
      })
    }
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(lesson =>
      lesson.title.toLowerCase().includes(term) ||
      lesson.description?.toLowerCase().includes(term)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(lesson => lesson.status === statusFilter.value)
  }

  if (sectionFilter.value) {
    filtered = filtered.filter(lesson => lesson.sectionName === sectionFilter.value)
  }

  // Update pagination total và reset page nếu cần
  pagination.value.total = filtered.length
  const newPages = Math.ceil(filtered.length / pagination.value.limit)
  pagination.value.pages = newPages
  
  // Reset về trang 1 nếu trang hiện tại vượt quá số trang mới
  if (pagination.value.page > newPages && newPages > 0) {
    pagination.value.page = 1
  }

  return filtered
})

const paginatedLessons = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  return filteredLessons.value.slice(start, end)
})

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

onMounted(async () => {
  await loadCourses()
  // Tự động load tất cả lessons khi vào màn hình
  await loadAllLessons()
})

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy()
    editorInstance = null
  }
})

const loadCourses = async () => {
  try {
    const response = await api.get('/courses', { params: { limit: 1000 } })
    courses.value = response.data.data || []
  } catch (error) {
    console.error('Error loading courses:', error)
  }
}

const loadAllLessons = async () => {
  loading.value = true
  try {
    // Load tất cả lessons từ tất cả courses
    const response = await api.get('/lessons', { params: { limit: 1000 } })
    const allLessonsData = response.data.data || []
    
    // Map lessons với section info từ section_id nếu có
    lessons.value = allLessonsData.map(lesson => ({
      ...lesson,
      sectionName: 'N/A' // Sẽ được cập nhật khi load theo course
    }))
  } catch (error) {
    console.error('Error loading all lessons:', error)
    lessons.value = []
  } finally {
    loading.value = false
  }
}

const loadLessonsByCourse = async () => {
  if (!selectedCourseId.value) {
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
    alert('Lỗi khi tải danh sách bài học')
  } finally {
    loading.value = false
  }
}

const loadLessons = async () => {
  // Reset filters và pagination khi chọn course
  searchTerm.value = ''
  statusFilter.value = ''
  sectionFilter.value = ''
  pagination.value.page = 1

  if (!selectedCourseId.value) {
    // Nếu chọn "Tất cả khóa học", load lại tất cả lessons
    await loadAllLessons()
    return
  }

  // Load lessons của course được chọn
  await loadLessonsByCourse()
}

const applyFilters = () => {
  // Reset về trang 1 khi filter
  pagination.value.page = 1
}

const clearFilters = () => {
  searchTerm.value = ''
  statusFilter.value = ''
  sectionFilter.value = ''
  pagination.value.page = 1
}

// Watch để reset pagination khi filter thay đổi
watch([searchTerm, statusFilter, sectionFilter], () => {
  pagination.value.page = 1
})

const goToPage = (page) => {
  if (page < 1 || page > pagination.value.pages || page === '...') return
  pagination.value.page = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetPagination = () => {
  pagination.value.page = 1
}

const initCKEditor = async () => {
  if (editorInstance) {
    editorInstance.destroy()
    editorInstance = null
  }

  await nextTick()
  
  const container = document.getElementById('ckeditor-container')
  if (container) {
    try {
      editorInstance = await ClassicEditor.create(container, {
        initialData: lessonForm.value.content || '',
        licenseKey: 'GPL',
        toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'insertTable', '|', 'undo', 'redo']
      })
      
      editorInstance.model.document.on('change:data', () => {
        lessonForm.value.content = editorInstance.getData()
      })
    } catch (error) {
      console.error('Error initializing CKEditor:', error)
    }
  }
}

const showAddLessonModal = async () => {
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
  
  // Khởi tạo CKEditor sau khi modal hiển thị
  await nextTick()
  setTimeout(() => {
    initCKEditor()
  }, 300)
}

const editLesson = async (lesson) => {
  editingLesson.value = lesson.id

  // Luôn fetch chi tiết mới nhất để đảm bảo có đầy đủ nội dung HTML
  let detail = null
  try {
    const res = await api.get(`/lessons/${lesson.id}`)
    detail = res.data?.data || null
  } catch (error) {
    console.error('Error fetching lesson detail:', error)
    // fallback dùng dữ liệu hiện tại trên list
    detail = lesson
  }

  lessonForm.value = {
    title: detail?.title || lesson.title,
    description: detail?.description || lesson.description || '',
    course: detail?.course_id || lesson.course_id || lesson.course?.id || '',
    duration: detail?.duration || lesson.duration || 0,
    videoUrl: detail?.videoUrl || lesson.videoUrl || '',
    videoType: detail?.videoType || lesson.videoType || 'youtube',
    content: detail?.content || lesson.content || '',
    status: detail?.status || lesson.status
  }

  const modal = new Modal(document.getElementById('lessonModal'))
  modal.show()
  
  // Khởi tạo CKEditor sau khi modal hiển thị với nội dung detail
  await nextTick()
  setTimeout(() => {
    initCKEditor()
  }, 300)
}

const saveLesson = async () => {
  try {
    // Ràng buộc 1 loại media:
    // - Nếu chọn youtube/vimeo/external => yêu cầu videoUrl
    // - Nếu chọn local => videoUrl có thể trống (sẽ upload file sau)
    if (lessonForm.value.videoType !== 'local' && !lessonForm.value.videoUrl) {
      alert('Vui lòng nhập Video URL khi chọn YouTube/Vimeo/External')
      return
    }

    // Lấy nội dung từ CKEditor trước khi save
    if (editorInstance) {
      lessonForm.value.content = editorInstance.getData()
    }
    
    if (editingLesson.value) {
      await api.put(`/lessons/${editingLesson.value}`, lessonForm.value)
      alert('Cập nhật bài học thành công!')
    } else {
      await api.post('/lessons', lessonForm.value)
      alert('Tạo bài học thành công!')
    }
    const modal = Modal.getInstance(document.getElementById('lessonModal'))
    modal.hide()
    
    // Destroy editor khi đóng modal
    if (editorInstance) {
      editorInstance.destroy()
      editorInstance = null
    }
    
    await loadLessons()
  } catch (error) {
    alert('Lỗi: ' + (error.response?.data?.message || error.message))
  }
}

const uploadInline = async (event, type) => {
  if (!editingLesson.value) {
    alert('Vui lòng lưu bài học trước khi upload file.')
    return
  }
  if (lessonForm.value.videoType !== 'local') {
    alert('Chỉ upload khi loại media = "Upload file".')
    return
  }

  const file = event.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append(type, file)

  const setUploading = (val) => {
    if (type === 'video') uploadingVideo.value = val
    if (type === 'audio') uploadingAudio.value = val
    if (type === 'pdf') uploadingPdf.value = val
  }
  const setProgress = (val) => {
    if (type === 'video') uploadProgressVideo.value = val
    if (type === 'audio') uploadProgressAudio.value = val
    if (type === 'pdf') uploadProgressPdf.value = val
  }

  try {
    setUploading(true)
    setProgress(0)
    await api.post(
      `/upload/lesson/${editingLesson.value}/${type}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setProgress(percent)
        }
      }
    )
    alert(`Upload ${type} thành công!`)
    // Sau upload, refresh list (để đồng bộ)
    await loadLessons()
  } catch (error) {
    alert('Lỗi upload: ' + (error.response?.data?.message || error.message))
  } finally {
    setUploading(false)
    setProgress(0)
    // reset input
    event.target.value = ''
  }
}

const uploadChoiceAccept = computed(() => {
  if (uploadChoice.value === 'video') return 'video/mp4,video/*'
  if (uploadChoice.value === 'audio') return 'audio/mp3,audio/*'
  return 'application/pdf'
})

const uploadChoiceLabel = computed(() => {
  if (uploadChoice.value === 'video') return '(MP4)'
  if (uploadChoice.value === 'audio') return '(MP3)'
  return '(PDF)'
})

const currentUploading = computed(() => {
  if (uploadChoice.value === 'video') return uploadingVideo.value
  if (uploadChoice.value === 'audio') return uploadingAudio.value
  return uploadingPdf.value
})

const currentUploadProgress = computed(() => {
  if (uploadChoice.value === 'video') return uploadProgressVideo.value
  if (uploadChoice.value === 'audio') return uploadProgressAudio.value
  return uploadProgressPdf.value
})

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

#ckeditor-container {
  min-height: 300px;
}

:deep(.ck-editor__editable) {
  min-height: 300px;
}
@media (max-width: 991.98px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .topbar .btn {
    width: 100%;
  }
  .row.g-3 > [class*='col-'] {
    width: 100%;
  }
  .lesson-item .row {
    flex-direction: column;
    gap: 10px;
  }
  .lesson-item .btn-group {
    display: flex;
    justify-content: flex-start;
    gap: 6px;
  }
}

@media (max-width: 575.98px) {
  .lesson-item {
    padding: 12px;
  }
}
</style>

