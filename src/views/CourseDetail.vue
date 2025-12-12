<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-else-if="course">
      <!-- Header -->
      <div class="container-fluid bg-primary py-5 mb-5 page-header">
        <div class="container py-5">
          <div class="row justify-content-center">
            <div class="col-lg-10 text-center">
              <h1 class="display-3 text-white animated slideInDown">{{ course.title }}</h1>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Detail -->
      <div class="container-xxl py-5">
        <div class="container">
          <div class="row g-5">
            <div class="col-lg-8">
              <div class="mb-5">
                <img class="img-fluid rounded w-100" :src="resolveThumbnail(course.thumbnail)" :alt="course.title">
              </div>
              <div class="mb-5">
                <h3 class="mb-4">About This Course</h3>
                <p>{{ course.description || course.shortDescription }}</p>
              </div>

              <!-- Syllabus -->
              <div class="mb-5">
                <h3 class="mb-4">Course Content</h3>
                <div class="accordion" id="syllabusAccordion">
                  <div v-for="(section, index) in course.sections" :key="section.id" class="accordion-item">
                    <h2 class="accordion-header">
                      <button 
                        class="accordion-button" 
                        type="button" 
                        :class="{ collapsed: index !== 0 }"
                        :data-bs-target="`#section-${section.id}`"
                        data-bs-toggle="collapse"
                      >
                        {{ section.title }}
                      </button>
                    </h2>
                    <div 
                      :id="`section-${section.id}`" 
                      class="accordion-collapse collapse"
                      :class="{ show: index === 0 }"
                      data-bs-parent="#syllabusAccordion"
                    >
                      <div class="accordion-body">
                        <ul class="list-unstyled">
                          <li v-for="lesson in section.lessons" :key="lesson.id" class="mb-2">
                            <router-link 
                              :to="`/lesson/${lesson.id}`" 
                              class="text-decoration-none"
                            >
                              <i class="fa fa-play-circle text-primary me-2"></i>
                              {{ lesson.title }}
                              <span class="text-muted ms-2">({{ lesson.duration }} min)</span>
                            </router-link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-4">
              <div class="bg-light rounded p-5 mb-5 wow fadeInUp" data-wow-delay="0.1s">
                <h4 class="mb-4">Course Details</h4>
                <p><i class="fa fa-signal text-primary me-2"></i>Level: {{ course.level }}</p>
                <p><i class="fa fa-clock text-primary me-2"></i>Duration: {{ course.duration }} Hours</p>
                <p><i class="fa fa-book text-primary me-2"></i>Lessons: {{ course.totalLessons }}</p>
                <p><i class="fa fa-users text-primary me-2"></i>Students: {{ course.enrolledCount }}</p>
                <p><i class="fa fa-star text-primary me-2"></i>Rating: {{ course.ratings_average || 0 }}/5</p>
                <div class="d-flex justify-content-between mb-3">
                  <h5 class="mb-0">Price:</h5>
                  <h5 class="mb-0">${{ course.isFree ? 'Free' : course.price }}</h5>
                </div>
                <div v-if="enrollmentStatus === 'pending'" class="alert alert-warning mb-3">
                  <i class="fa fa-clock me-2"></i>
                  Yêu cầu đăng ký của bạn đang chờ admin duyệt
                </div>
                <div v-else-if="enrollmentStatus === 'rejected'" class="alert alert-danger mb-3">
                  <i class="fa fa-times me-2"></i>
                  Yêu cầu đăng ký của bạn đã bị từ chối. Vui lòng liên hệ admin.
                </div>
                <button 
                  v-if="enrollmentStatus !== 'approved'"
                  class="btn btn-primary w-100 py-3" 
                  @click="enrollCourse"
                  :disabled="enrollmentStatus === 'pending'"
                >
                  {{ enrollmentStatus === 'pending' ? 'Đang chờ duyệt...' : enrollmentStatus === 'rejected' ? 'Gửi lại yêu cầu' : 'Đăng ký khóa học' }}
                </button>
                <div v-else class="alert alert-success">
                  <i class="fa fa-check me-2"></i>
                  Bạn đã được duyệt vào khóa học này
                </div>
              </div>
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
const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''

const loading = ref(true)
const course = ref(null)
const isEnrolled = ref(false)
const enrollmentStatus = ref(null)

const courseId = computed(() => route.params.id)
const normalizedBaseUrl = computed(() => apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '')

const resolveThumbnail = (thumb) => {
  if (!thumb) return '/img/course-1.jpg'
  if (/^https?:\/\//i.test(thumb)) return thumb
  const path = thumb
  return `${normalizedBaseUrl.value}${path}`
}

onMounted(async () => {
  await fetchCourse()
  if (authStore.isAuthenticated) {
    await checkEnrollment()
  }
})

const fetchCourse = async () => {
  try {
    const response = await api.get(`/courses/${courseId.value}`)
    course.value = response.data.data
  } catch (error) {
    console.error('Error fetching course:', error)
  } finally {
    loading.value = false
  }
}

const checkEnrollment = async () => {
  try {
    const response = await api.get(`/enrollments/${courseId.value}/progress`)
    isEnrolled.value = response.data.success
    enrollmentStatus.value = response.data.data?.status || null
  } catch (error) {
    isEnrolled.value = false
    enrollmentStatus.value = null
  }
}

const enrollCourse = async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  try {
    await api.post(`/enrollments/${courseId.value}`)
    isEnrolled.value = true
    enrollmentStatus.value = 'pending'
    alert('Đã gửi yêu cầu đăng ký! Vui lòng chờ admin duyệt.')
    await checkEnrollment()
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to enroll')
  }
}
</script>

