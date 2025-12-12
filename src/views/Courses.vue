<template>
  <div>
    <!-- Spinner -->
    <div v-if="loading" id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <!-- Header Start -->
    <div class="container-fluid bg-primary py-5 mb-5 page-header">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-10 text-center">
            <h1 class="display-3 text-white animated slideInDown">Courses</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb justify-content-center">
                <li class="breadcrumb-item">
                  <router-link to="/" class="text-white">Home</router-link>
                </li>
                <li class="breadcrumb-item text-white active" aria-current="page">Courses</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>
    <!-- Header End -->

    <!-- Categories Start -->
    <div class="container-xxl py-5 category">
      <div class="container">
        <div class="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h6 class="section-title bg-white text-center px-3">Categories</h6>
          <h1 class="mb-5" style="color: #fb873f;">Popular Topics to Explore</h1>
        </div>
        <div class="row g-2 m-2">
          <div v-for="category in categories" :key="category.id" class="col-lg-3 col-md-6 text-center">
            <div class="content shadow p-3 mb-2 wow fadeInUp" data-wow-delay="0.3s">
              <img :src="category.image" class="img-fluid" alt="categories">
              <h5 class="my-2">
                <a href="#" class="text-center text-decoration-none">{{ category.name }}</a>
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Categories End -->

    <!-- Courses Start -->
    <div class="container-xxl py-5">
      <div class="container">
        <div class="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h6 class="section-title bg-white text-center px-3">Popular Courses</h6>
          <h1 class="mb-5" style="color: #fb873f;">Explore new and trending free online courses</h1>
        </div>
        <div class="row g-4 py-2">
          <div v-for="course in courses" :key="course.id" class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="course-item shadow d-flex flex-column h-100">
              <div class="position-relative overflow-hidden text-light image">
                <img class="img-fluid w-100" :src="resolveThumbnail(course.thumbnail)" :alt="course.title" style="height: 200px; object-fit: cover;">
                <div 
                  :style="`position:absolute;top: 15px;left: 16px; font-size:12px; border-radius:3px; background-color:${(course.price || 0) === 0 ? '#fb873f' : '#0ed44c'};`"
                  class="px-2 py-1 fw-bold text-uppercase text-white"
                >
                  {{ (course.price || 0) === 0 ? 'FREE' : 'PAID' }}
                </div>
              </div>
              <div class="p-2 pb-0 flex-grow-1">
                <h5 class="mb-1">
                  <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="text-dark text-decoration-none">{{ course.title }}</router-link>
                </h5>
              </div>
              <div class="d-flex">
                <small class="flex-fill text-center py-1 px-2">
                  <i class="fa fa-star text-warning me-2"></i>{{ course.rating || '4.5' }}
                </small>
                <small class="flex-fill text-center py-1 px-2">
                  <i class="fa fa-user-graduate me-2"></i>{{ formatLearners(course.enrolledCount || 0) }} Learners
                </small>
                <small class="flex-fill text-center py-1 px-2">
                  <i class="fa fa-user me-2"></i>{{ course.level || 'Beginner' }}
                </small>
              </div>
              <div class="d-flex">
                <small class="flex-fill text-left p-2 px-2">
                  <i class="fa fa-clock me-2"></i>{{ course.duration || 0 }} Hrs
                </small>
                <small class="py-1 px-2 fw-bold fs-6 text-center">₹ {{ course.price || 0 }}</small>
                <small class="text-primary py-1 px-2 fw-bold fs-6" style="float:right;">
                  <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="text-primary text-decoration-none">Enroll Now</router-link>
                  <i class="fa fa-chevron-right me-2 fs-10"></i>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Courses End -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const courses = ref([])
const categories = ref([
  { id: 1, name: 'Giới thiệu bản thân', image: '/img/cat1.png' },
  { id: 2, name: 'Sở thích', image: '/img/cat2.png' },
  { id: 3, name: 'Đồ ăn', image: '/img/cat3.png' },
  { id: 4, name: 'Du lịch', image: '/img/cat4.png' },
  { id: 5, name: 'Công việc', image: '/img/cat5.png' },
  { id: 6, name: 'Trường học / Việc học', image: '/img/cat6.png' },
  { id: 7, name: 'Gia đình', image: '/img/cat7.png' },
  { id: 8, name: 'Sức khỏe', image: '/img/cat8.png' },
])
const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''

const normalizedBaseUrl = computed(() => apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '')

const resolveThumbnail = (thumb) => {
  if (!thumb) return '/img/course-1.jpg'
  // Nếu là url tuyệt đối (http/https) thì dùng nguyên
  if (/^https?:\/\//i.test(thumb)) return thumb
  const path = thumb.startsWith('/') ? thumb : `${thumb}`
  return `${normalizedBaseUrl.value}${path}`
}

const formatLearners = (count) => {
  if (count >= 100000) {
    return `${(count / 100000).toFixed(1)}L+`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K+`
  }
  return `${count}+`
}

onMounted(async () => {
  try {
    const response = await api.get('/courses')
    courses.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching courses:', error)
  } finally {
    loading.value = false
  }
})
</script>

