<template>
  <div>
    <!-- Spinner -->
    <div v-if="loading" id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <!-- Carousel Start -->
    <div class="container-fluid p-0 mb-4">
      <div ref="carouselElement" id="headerCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div class="carousel-item active position-relative">
            <img class="img-fluid w-100" src="/img/carousel-1.jpg" alt="" style="height: 500px; object-fit: cover;">
            <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center" style="background: rgba(24, 29, 56, .7);">
              <div class="container">
                <div class="row justify-content-start">
                  <div class="col-sm-10 col-lg-8">
                    <h5 class="text-uppercase mb-3 animated slideInDown" style="color: #fb873f;">Best E-learning platform</h5>
                    <h1 class="display-3 text-white animated slideInDown">Learn Job ready skills from free online courses with certificates</h1>
                    <p class="text-white mb-4 pb-2">Explore a wide range of courses designed to enhance your expertise in technology, business, arts, and more. Start learning today!</p>
                    <router-link to="/about" class="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Read More</router-link>
                    <router-link to="/register" class="btn btn-light py-md-3 px-md-5 animated slideInRight">Join Now</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-item position-relative">
            <img class="img-fluid w-100" src="/img/carousel-2.jpg" alt="" style="height: 500px; object-fit: cover;">
            <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center" style="background: rgba(24, 29, 56, .7);">
              <div class="container">
                <div class="row justify-content-start">
                  <div class="col-sm-10 col-lg-8">
                    <h5 class="text-uppercase mb-3 animated slideInDown" style="color: #fb873f;">Welcome to Secret Coder</h5>
                    <h1 class="display-3 text-white animated slideInDown">Interactive Learning Experience</h1>
                    <p class="text-white mb-4 pb-2">Engage with interactive lessons, quizzes, and projects. Experience hands-on learning that keeps you motivated and inspired.</p>
                    <router-link to="/about" class="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Read More</router-link>
                    <router-link to="/register" class="btn btn-light py-md-3 px-md-5 animated slideInRight">Join Now</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#headerCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#headerCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>
    <!-- Carousel End -->

    <!-- Service Start -->
    <div class="container-xxl py-5">
      <div class="container">
        <div class="row g-2 text-center">
          <div class="col-12 wow fadeInUp" data-wow-delay="0.3s">
            <h1 style="color: #fb873f;">Invest in your professional goals with Secret Coder</h1>
            <p class="mb-5">Get unlimited access to over 90% of courses, Projects, Specializations, and Professional Certificates on Coursera, taught by top instructors.</p>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="service-item text-center pt-3 shadow">
              <div class="p-4">
                <img src="/img/icon1.png" alt="" width="60px" class="mb-4">
                <h5 class="mb-3">Learn anything</h5>
                <p>Explore any interest or trending topic, take prerequisites, and advance your skills</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
            <div class="service-item text-center pt-3 shadow">
              <div class="p-4">
                <img src="/img/icon2.png" alt="" width="60px" class="mb-4">
                <h5 class="mb-3">Save money</h5>
                <p>Spend less money on your learning if you plan to take multiple courses this year</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
            <div class="service-item text-center pt-3 shadow">
              <div class="p-4">
                <img src="/img/icon3.png" alt="" width="60px" class="mb-4">
                <h5 class="mb-3">Flexible learning</h5>
                <p>Learn at your own pace, move between multiple courses, or switch to a different course</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
            <div class="service-item text-center pt-3 shadow">
              <div class="p-4">
                <img src="/img/icon4.png" alt="" width="60px" class="mb-4">
                <h5 class="mb-3">Unlimited certificates</h5>
                <p>Earn a certificate for every learning program that you complete at no additional cost</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Service End -->

    <!-- About Start -->
    <div class="container-xxl py-5">
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s" style="min-height: 400px;">
            <div class="position-relative h-100">
              <img class="img-fluid position-absolute w-100 h-100" src="/img/about.jpg" alt="" style="object-fit: cover;">
            </div>
          </div>
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
            <h6 class="section-title bg-white text-start pe-3">About Us</h6>
            <h1 class="mb-4" style="color: #fb873f;">Welcome to Secret Coder</h1>
            <p class="mb-4">At Secret Coder, we believe in accessible, innovative learning experiences that adapt to your schedule and learning style. Join us in embracing the future of education and unlock your potential with our immersive online courses.</p>
            <p class="mb-4">Welcome to Secret Coder, your gateway to boundless learning opportunities. We're dedicated to democratizing education, offering a diverse range of courses taught by industry experts. Our mission is to empower learners worldwide, fostering a community-driven platform where knowledge knows no limits.</p>
            <div class="row gy-2 gx-4 mb-4">
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Expert Instructors</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Live Interactive Sessions</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Comprehensive Course Catalog</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Community Engagement</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Personalized Learning Paths</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Certification and Recognition</p>
              </div>
            </div>
            <router-link to="/about" class="btn text-light py-3 px-5 mt-2" style="background-color: #fb873f;">Read More</router-link>
          </div>
        </div>
      </div>
    </div>
    <!-- About End -->

    <!-- Banner-1 Start -->
    <div class="container-xxl py-5 pt-5 bg-light">
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-6 p-5 wow fadeInUp" data-wow-delay="0.3s">
            <h1 class="mb-4" style="color: #fb873f;">Explore Free Courses</h1>
            <p class="mb-4">Start your online learning journey at Great Learning Academy for free with our short-term basic courses across various in-demand domains.</p>
            <router-link to="/register" class="btn text-light py-3 px-5 mt-2" style="background-color: #fb873f;">Start For Free</router-link>
          </div>
          <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s" style="min-height: 400px;">
            <div class="position-relative h-100">
              <img class="img-fluid position-absolute w-100 h-100" src="/img/banner-1.jpg" alt="" style="object-fit: cover;">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Banner-1 End -->

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
                <a href="#" class="text-center">{{ category.name }}</a>
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
                  <i class="fa fa-user-graduate me-2"></i>{{ formatLearners(course.enrolledCount || 0) }}
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
    <div class="container text-center">
      <router-link to="/courses" class="btn text-light py-3 px-5 mt-2 mb-5" style="background-color: #fb873f;">All Courses</router-link>
    </div>
    <!-- Courses End -->

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const courses = ref([])
const carouselElement = ref(null)
let carouselInstance = null
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
  
  // Khởi tạo Bootstrap carousel sau khi DOM được render
  await nextTick()
  if (carouselElement.value && window.bootstrap) {
    carouselInstance = new window.bootstrap.Carousel(carouselElement.value, {
      interval: 5000,
      ride: 'carousel'
    })
  }
})

onBeforeUnmount(() => {
  // Cleanup carousel khi component unmount
  if (carouselInstance) {
    carouselInstance.dispose()
    carouselInstance = null
  }
})
</script>


