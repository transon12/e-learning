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
            <div class="mb-4">
              <h2>{{ lesson.title }}</h2>
              <p class="text-muted">{{ lesson.description }}</p>
            </div>

            <!-- Video Player -->
            <div v-if="lesson.videoUrl" class="video-container mb-4">
              <iframe 
                v-if="lesson.videoType === 'youtube' || lesson.videoType === 'vimeo'"
                :src="lesson.videoUrl" 
                frameborder="0" 
                allowfullscreen
                class="w-100 h-100 position-absolute"
              ></iframe>
              <video 
                v-else-if="lesson.videoType === 'local'"
                :src="lesson.videoUrl" 
                controls 
                class="w-100"
              ></video>
            </div>

            <!-- Audio Player -->
            <div v-if="lesson.file_audio_path" class="mb-4">
              <audio :src="`/uploads/${lesson.file_audio_path}`" controls class="w-100"></audio>
            </div>

            <!-- PDF Viewer -->
            <div v-if="lesson.file_pdf_path" class="mb-4">
              <iframe 
                :src="`/uploads/${lesson.file_pdf_path}`" 
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const lesson = ref(null)
const sections = ref([])
const allLessons = ref([])

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

const fetchLesson = async () => {
  try {
    const response = await api.get(`/lessons/${route.params.id}`)
    lesson.value = response.data.data
    
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

