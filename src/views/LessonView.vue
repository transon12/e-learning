<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-else-if="lesson" class="container-fluid py-5">
      <div class="container">
        <div class="row">
          <!-- Sidebar -->
          <div class="col-lg-3">
            <div class="lesson-sidebar bg-light rounded p-3">
              <h5 class="mb-3">Nội Dung khóa học</h5>
              <div v-for="section in sections" :key="section.id" class="mb-3">
                <h6 class="text-primary">{{ section.title }}</h6>
                <div v-for="l in section.lessons" :key="l.id" 
                     class="lesson-item" 
                     :class="{ active: l.id === lesson.id }"
                     @click="goToLesson(l.id)">
                  <div class="lesson-title">{{ l.title }}</div>
                  <div class="lesson-duration">{{ l.duration }} min</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="col-lg-9">
            <div v-if="authStore.isAuthenticated && enrollmentStatus !== 'approved'" class="alert alert-warning mb-4">
              <i class="fa fa-exclamation-triangle me-2"></i>
              <span v-if="enrollmentStatus === 'pending'">
                Bạn chưa được duyệt vào khóa học này. Vui lòng chờ admin duyệt.
              </span>
              <span v-else-if="enrollmentStatus === 'rejected'">
                Yêu cầu đăng ký của bạn đã bị từ chối. Vui lòng liên hệ admin.
              </span>
              <span v-else>
                Bạn cần đăng ký khóa học để xem nội dung này.
              </span>
              <router-link v-if="courseId" :to="`/course/${courseId}`" class="btn btn-sm btn-primary ms-2">
                Đăng ký khóa học
              </router-link>
            </div>
            <div v-else-if="!authStore.isAuthenticated" class="alert alert-info mb-4">
              <i class="fa fa-info-circle me-2"></i>
              Vui lòng đăng nhập và đăng ký khóa học để xem nội dung này.
            </div>
            <div v-if="canViewLesson">
              <div class="mb-4">
                <h2>{{ lesson.title }}</h2>
                <p class="text-muted">{{ lesson.description }}</p>
              </div>

              <!-- Media (ưu tiên 1 loại: youtube/vimeo -> video file -> audio) -->
              <div v-if="videoSource.src" class="video-container mb-4">
                <iframe 
                  v-if="videoSource.type === 'embed'"
                  :src="videoSource.src" 
                  frameborder="0" 
                  allowfullscreen
                  class="w-100 h-100 position-absolute"
                ></iframe>
                <video 
                  v-else-if="videoSource.type === 'file'"
                  :src="videoSource.src" 
                  controls 
                  class="w-100"
                ></video>
              </div>

              <!-- Audio Player (chỉ khi không có video) -->
              <div v-else-if="audioSource" class="mb-4">
                <audio :src="audioSource" controls class="w-100"></audio>
              </div>

              <!-- PDF Viewer (hiển thị cùng media) -->
              <div v-if="lesson.file_pdf_path" class="mb-4">
                <iframe 
                  :src="lesson.file_pdf_path.startsWith('http://') || lesson.file_pdf_path.startsWith('https://') 
                    ? lesson.file_pdf_path 
                    : `${normalizedBaseUrl}${lesson.file_pdf_path.startsWith('/') ? '' : '/'}${lesson.file_pdf_path}`" 
                  class="w-100" 
                  style="height: 600px;"
                ></iframe>
              </div>

              <!-- Content -->
              <div v-if="lesson.content" class="mb-4" v-html="lesson.content"></div>

              <!-- Navigation -->
              <div class="d-flex justify-content-between mt-4">
                <button 
                  class="btn btn-primary" 
                  @click="goToPrevious"
                  :disabled="!previousLesson"
                >
                  <i class="fa fa-arrow-left me-2"></i>Previous
                </button>
                <button 
                  class="btn btn-success" 
                  @click="markComplete"
                  v-if="authStore.isAuthenticated"
                >
                  <i class="fa fa-check me-2"></i>Mark Complete
                </button>
                <button 
                  class="btn btn-primary" 
                  @click="goToNext"
                  :disabled="!nextLesson"
                >
                  Next<i class="fa fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''

const loading = ref(true)
const lesson = ref(null)
const sections = ref([])
const allLessons = ref([])
const enrollmentStatus = ref(null)
const courseId = ref(null)
const canViewLesson = computed(() => {
  // Cho phép xem nếu bài học free/preview
  if (lesson.value?.isPreview) return true
  // Còn lại: phải đăng nhập và đã được duyệt
  return authStore.isAuthenticated && enrollmentStatus.value === 'approved'
})

// Chuẩn hóa base URL tránh lỗi trùng /
const normalizedBaseUrl = computed(() => {
  return apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''
})

// Ưu tiên hiển thị 1 loại media duy nhất: YouTube/Vimeo -> video file -> audio
const videoSource = computed(() => {
  if (!lesson.value) return { type: null, src: null }

  // Youtube/Vimeo embed
  if (lesson.value.videoType === 'youtube' || lesson.value.videoType === 'vimeo') {
    return { type: 'embed', src: lesson.value.videoUrl }
  }

  // Video file đã upload (có thể là S3 URL hoặc local path)
  if (lesson.value.file_video_path) {
    // Nếu đã là full URL (S3), dùng trực tiếp
    if (lesson.value.file_video_path.startsWith('http://') || lesson.value.file_video_path.startsWith('https://')) {
      return { type: 'file', src: lesson.value.file_video_path }
    }
    // Nếu là local path, thêm base URL
    const path = lesson.value.file_video_path.startsWith('/')
      ? lesson.value.file_video_path
      : `/${lesson.value.file_video_path}`
    return { type: 'file', src: `${normalizedBaseUrl.value}${path}` }
  }

  // Video local lưu ở videoUrl (có thể là S3 URL hoặc local path)
  if ((lesson.value.videoType === 'local' || lesson.value.videoType === 's3') && lesson.value.videoUrl) {
    // Nếu đã là full URL (S3), dùng trực tiếp
    if (lesson.value.videoUrl.startsWith('http://') || lesson.value.videoUrl.startsWith('https://')) {
      return { type: 'file', src: lesson.value.videoUrl }
    }
    // Nếu là local path, thêm base URL
    const path = lesson.value.videoUrl.startsWith('/')
      ? lesson.value.videoUrl
      : `/${lesson.value.videoUrl}`
    return { type: 'file', src: `${normalizedBaseUrl.value}${path}` }
  }

  return { type: null, src: null }
})

const audioSource = computed(() => {
  // Chỉ hiển thị audio nếu KHÔNG có video
  if (videoSource.value.src) return null
  if (!lesson.value?.file_audio_path) return null

  // Nếu đã là full URL (S3), dùng trực tiếp
  if (lesson.value.file_audio_path.startsWith('http://') || lesson.value.file_audio_path.startsWith('https://')) {
    return lesson.value.file_audio_path
  }
  
  // Nếu là local path, thêm base URL
  const path = lesson.value.file_audio_path.startsWith('/')
    ? lesson.value.file_audio_path
    : `/${lesson.value.file_audio_path}`
  return `${normalizedBaseUrl.value}${path}`
})

const currentIndex = computed(() => {
  return allLessons.value.findIndex(l => l.id === parseInt(route.params.id))
})

const previousLesson = computed(() => {
  const index = currentIndex.value
  return index > 0 ? allLessons.value[index - 1] : null
})

const nextLesson = computed(() => {
  const index = currentIndex.value
  return index < allLessons.value.length - 1 ? allLessons.value[index + 1] : null
})

onMounted(async () => {
  await fetchLesson()
  await fetchSections()
})

// Refetch when route changes (Next/Previous)
watch(() => route.params.id, async (newId) => {
  if (!newId) return
  loading.value = true
  await fetchLesson()
  await fetchSections()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

const fetchLesson = async () => {
  try {
    const response = await api.get(`/lessons/${route.params.id}`)
    lesson.value = response.data.data
    courseId.value = lesson.value.course_id
    
    // Check enrollment status if user is authenticated
    if (authStore.isAuthenticated && courseId.value) {
      await checkEnrollment()
    }
    
    // Fetch course sections to get all lessons
    if (lesson.value.course_id) {
      await fetchSections()
    }
  } catch (error) {
    console.error('Error fetching lesson:', error)
  } finally {
    loading.value = false
  }
}

const fetchSections = async () => {
  if (!lesson.value?.course_id) return
  
  try {
    const response = await api.get(`/lessons/course/${lesson.value.course_id}`)
    sections.value = response.data.data || []
    
    // Flatten all lessons
    allLessons.value = sections.value.flatMap(section => 
      section.lessons.map(l => ({ ...l, sectionTitle: section.title }))
    )
  } catch (error) {
    console.error('Error fetching sections:', error)
  }
}

const checkEnrollment = async () => {
  if (!courseId.value || !authStore.isAuthenticated) {
    enrollmentStatus.value = null
    return
  }
  
  try {
    const response = await api.get(`/enrollments/${courseId.value}/progress`)
    enrollmentStatus.value = response.data.data?.status || null
  } catch (error) {
    enrollmentStatus.value = null
  }
}

const goToLesson = (lessonId) => {
  router.push(`/lesson/${lessonId}`)
  fetchLesson()
}

const goToPrevious = () => {
  if (previousLesson.value) {
    router.push(`/lesson/${previousLesson.value.id}`)
  }
}

const goToNext = () => {
  if (nextLesson.value) {
    router.push(`/lesson/${nextLesson.value.id}`)
  }
}

const markComplete = async () => {
  if (!lesson.value?.course_id) return
  if (!canViewLesson.value) {
    alert('Bạn cần được duyệt vào khóa học trước khi đánh dấu hoàn thành.')
    return
  }
  
  try {
    await api.post(`/enrollments/${lesson.value.course_id}/complete-lesson/${lesson.value.id}`)
    alert('Lesson marked as complete!')
  } catch (error) {
    console.error('Error marking lesson complete:', error)
  }
}
</script>

<style scoped>
.lesson-sidebar {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  position: sticky;
  top: 80px;
}

.lesson-item {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s;
}

.lesson-item:hover {
  background-color: #f8f9fa;
}

.lesson-item.active {
  background-color: #fb873f;
  color: white;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
}
</style>

