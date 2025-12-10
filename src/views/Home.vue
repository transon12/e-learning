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
            <h1 class="display-3 text-white animated slideInDown">Our Courses</h1>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb justify-content-center">
                <li class="breadcrumb-item"><a class="text-white" href="#">Home</a></li>
                <li class="breadcrumb-item"><a class="text-white" href="#">Pages</a></li>
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
          <h6 class="section-title bg-white text-center text-primary px-3">Categories</h6>
          <h1 class="mb-5">Courses Categories</h1>
        </div>
        <div class="row g-3">
          <div v-for="category in categories" :key="category.id" class="col-lg-7 col-md-6">
            <div class="row g-3">
              <div class="col-lg-12 col-md-12 wow zoomIn" data-wow-delay="0.1s">
                <a class="position-relative d-block overflow-hidden" href="">
                  <img class="img-fluid" :src="category.image" alt="">
                  <div class="bg-white text-center position-absolute bottom-0 end-0 me-4" style="bottom: -1px;">
                    <h5 class="m-0">{{ category.name }}</h5>
                    <small class="text-primary">{{ category.count }} Courses</small>
                  </div>
                </a>
              </div>
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
          <h6 class="section-title bg-white text-center text-primary px-3">Our Courses</h6>
          <h1 class="mb-5">Featured Courses</h1>
        </div>
        <div class="row g-4 justify-content-center">
          <div v-for="course in courses" :key="course.id" class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="course-item bg-light">
              <div class="position-relative overflow-hidden">
                <img class="img-fluid" :src="course.thumbnail || '/img/course-1.jpg'" :alt="course.title">
                <div class="w-100 d-flex justify-content-center position-absolute bottom-0 start-0 end-0 mb-4" style="background: linear-gradient(rgba(0, 0, 0, .7), rgba(0, 0, 0, .7));">
                  <router-link
                    :to="{ name: 'CourseDetail', params: { id: course.id } }"
                    class="flex-shrink-0 btn btn-sm btn-primary px-3 border-end"
                    style="border-radius: 30px 0 0 30px;"
                  >
                    Read More
                  </router-link>
                  <router-link
                    :to="{ name: 'CourseDetail', params: { id: course.id } }"
                    class="flex-shrink-0 btn btn-sm btn-primary px-3"
                    style="border-radius: 0 30px 30px 0;"
                  >
                    Join Now
                  </router-link>
                </div>
              </div>
              <div class="text-center p-4 pb-0">
                <h3 class="mb-0">${{ course.price || 0 }}</h3>
                <div class="mb-3">
                  <small class="fa fa-star text-primary"></small>
                  <small class="fa fa-star text-primary"></small>
                  <small class="fa fa-star text-primary"></small>
                  <small class="fa fa-star text-primary"></small>
                  <small class="fa fa-star text-primary"></small>
                  <small>({{ course.ratings_count || 0 }})</small>
                </div>
                <h5 class="mb-4">{{ course.title }}</h5>
              </div>
              <div class="d-flex border-top">
                <small class="flex-fill text-center border-end py-2"><i class="fa fa-user text-primary me-2"></i>{{ course.instructor?.username || 'Instructor' }}</small>
                <small class="flex-fill text-center border-end py-2"><i class="fa fa-clock text-primary me-2"></i>{{ course.duration || 0 }} Hrs</small>
                <small class="flex-fill text-center py-2"><i class="fa fa-user text-primary me-2"></i>{{ course.enrolledCount || 0 }} Students</small>
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
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const courses = ref([])
const categories = ref([
  { id: 1, name: 'Web Design', count: 25, image: '/img/cat-1.jpg' },
  { id: 2, name: 'Development', count: 15, image: '/img/cat-2.jpg' },
  { id: 3, name: 'Game Design', count: 20, image: '/img/cat-3.jpg' },
  { id: 4, name: 'Apps Design', count: 22, image: '/img/cat-4.jpg' }
])

onMounted(async () => {
  try {
    const response = await api.get('/courses?limit=6')
    courses.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching courses:', error)
  } finally {
    loading.value = false
  }
})
</script>

