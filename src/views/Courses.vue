<template>
  <div>
    <!-- Spinner -->
    <div v-if="loading" id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="sr-only">Đang tải...</span>
      </div>
    </div>

    <!-- Header Start -->
    <div class="container-fluid bg-primary py-5 mb-5 page-header">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-10 text-center">
            <h1 class="display-3 text-white animated slideInDown text-break">Khóa học</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb justify-content-center">
                <li class="breadcrumb-item">
                  <router-link to="/" class="text-white">Trang chủ</router-link>
                </li>
                <li class="breadcrumb-item text-white active" aria-current="page">Khóa học</li>
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
          <h6 class="section-title bg-white text-center px-3">Danh mục</h6>
          <h1 class="mb-5 text-break" style="color: #fb873f;">Các chủ đề phổ biến để khám phá</h1>
        </div>
        <div class="row g-2 m-2">
          <div v-for="category in categories" :key="category.id" class="col-lg-3 col-md-6 text-center">
            <div 
              class="content shadow p-3 mb-2 wow fadeInUp category-card" 
              :class="{ 'category-active': selectedCategory === category.name }"
              data-wow-delay="0.3s"
              @click="filterByCategory(category.name)"
              style="cursor: pointer; transition: all 0.3s ease;"
            >
              <img :src="category.image" class="img-fluid" alt="categories" style="max-height: 80px; object-fit: contain;">
              <h5 class="my-2">
                <span class="text-center text-decoration-none">{{ category.name }}</span>
              </h5>
            </div>
          </div>
        </div>
        <div v-if="selectedCategory" class="text-center mt-3">
          <button class="btn btn-outline-secondary btn-sm" @click="clearCategoryFilter">
            <i class="fa fa-times me-1"></i>Xóa bộ lọc: {{ selectedCategory }}
          </button>
        </div>
      </div>
    </div>
    <!-- Categories End -->

    <!-- Courses Start -->
    <div class="container-xxl py-5">
      <div class="container">
        <div class="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h6 class="section-title bg-white text-center px-3">Khóa học phổ biến</h6>
          <h1 class="mb-5 text-break" style="color: #fb873f;">
            {{ selectedCategory ? `Khóa học: ${selectedCategory}` : 'Khám phá các khóa học trực tuyến miễn phí mới và đang thịnh hành' }}
          </h1>
        </div>
        <div v-if="filteredCourses.length === 0 && !loading" class="text-center py-5">
          <p class="text-muted">Không có khóa học nào trong danh mục này.</p>
        </div>
        <div class="row g-4 py-2">
          <div v-for="course in filteredCourses" :key="course.id" class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="course-item shadow d-flex flex-column h-100">
              <div class="position-relative overflow-hidden text-light image">
                <img class="img-fluid w-100" :src="resolveThumbnail(course.thumbnail)" :alt="course.title" style="height: 200px; object-fit: cover;">
                <div 
                  :style="`position:absolute;top: 15px;left: 16px; font-size:12px; border-radius:3px; background-color:${(course.price || 0) === 0 ? '#fb873f' : '#0ed44c'};`"
                  class="px-2 py-1 fw-bold text-uppercase text-white"
                >
                  {{ (course.price || 0) === 0 ? 'MIỄN PHÍ' : 'TRẢ PHÍ' }}
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
                  <i class="fa fa-user-graduate me-2"></i>{{ formatLearners(course.enrolledCount || 0) }} Học viên
                </small>
                <small class="flex-fill text-center py-1 px-2">
                  <i class="fa fa-user me-2"></i>{{ course.level === 'Beginner' ? 'Người mới bắt đầu' : course.level === 'Intermediate' ? 'Trung cấp' : course.level === 'Advanced' ? 'Nâng cao' : course.level || 'Người mới bắt đầu' }}
                </small>
              </div>
              <div class="d-flex">
                <small class="flex-fill text-left p-2 px-2">
                  <i class="fa fa-clock me-2"></i>{{ course.duration || 0 }} Giờ
                </small>
                <small class="py-1 px-2 fw-bold fs-6 text-center">{{ (course.price || 0) === 0 ? 'Miễn phí' : `₫ ${course.price || 0}` }}</small>
                <small class="text-primary py-1 px-2 fw-bold fs-6" style="float:right;">
                  <router-link :to="{ name: 'CourseDetail', params: { id: course.id } }" class="text-primary text-decoration-none">Đăng ký ngay</router-link>
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
const allCourses = ref([])
const selectedCategory = ref('')
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

const filteredCourses = computed(() => {
  if (!selectedCategory.value) {
    return courses.value
  }
  return courses.value.filter(course => 
    course.category && course.category.toLowerCase() === selectedCategory.value.toLowerCase()
  )
})
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

const filterByCategory = (categoryName) => {
  if (selectedCategory.value === categoryName) {
    clearCategoryFilter()
  } else {
    selectedCategory.value = categoryName
    // Scroll to courses section
    setTimeout(() => {
      const coursesSection = document.querySelector('.container-xxl.py-5:last-child')
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }
}

const clearCategoryFilter = () => {
  selectedCategory.value = ''
}

onMounted(async () => {
  try {
    const response = await api.get('/courses')
    allCourses.value = response.data.data || []
    courses.value = allCourses.value
  } catch (error) {
    console.error('Error fetching courses:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.category-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.category-active {
  border: 2px solid #fb873f;
  background-color: #fff5f0;
}

.category-card h5 span {
  color: #333;
  font-weight: 500;
}

.category-active h5 span {
  color: #fb873f;
  font-weight: 600;
}
</style>

