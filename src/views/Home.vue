<template>
  <div>
    <!-- Spinner -->
    <div v-if="loading" id="spinner" class="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="sr-only">Đang tải...</span>
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
                  <div class="col-sm-10 col-lg-8 hero-content">
                    <h5 class="text-uppercase mb-3 animated slideInDown text-break" style="color: #fb873f;">Nền tảng E-learning tốt nhất</h5>
                    <h1 class="display-3 text-white animated slideInDown text-break">Học kỹ năng sẵn sàng cho công việc với khóa học miễn phí có chứng chỉ</h1>
                    <p class="text-white mb-4 pb-2 text-break">Khám phá các khóa học về công nghệ, kinh doanh, nghệ thuật và hơn thế nữa. Bắt đầu học ngay!</p>
                    <router-link to="/about" class="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Đọc thêm</router-link>
                    <router-link to="/register" class="btn btn-light py-md-3 px-md-5 animated slideInRight">Tham gia ngay</router-link>
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
                  <div class="col-sm-10 col-lg-8 hero-content">
                    <h5 class="text-uppercase mb-3 animated slideInDown text-break" style="color: #fb873f;">Chào mừng đến với Secret Coder</h5>
                    <h1 class="display-3 text-white animated slideInDown text-break">Trải nghiệm học tập tương tác</h1>
                    <p class="text-white mb-4 pb-2 text-break">Tham gia với các bài học tương tác, câu đố và dự án. Trải nghiệm học tập thực hành giúp bạn luôn có động lực và cảm hứng.</p>
                    <router-link to="/about" class="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft">Đọc thêm</router-link>
                    <router-link to="/register" class="btn btn-light py-md-3 px-md-5 animated slideInRight">Tham gia ngay</router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#headerCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Trước</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#headerCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Tiếp theo</span>
        </button>
      </div>
    </div>
    <!-- Carousel End -->

    <!-- Service Start -->
    <div class="container-xxl py-5">
      <div class="container">
        <div class="row g-2 text-center">
          <div class="col-12 wow fadeInUp" data-wow-delay="0.3s">
            <h1 class="text-break" style="color: #fb873f;">Đầu tư vào mục tiêu nghề nghiệp của bạn với Secret Coder</h1>
            <p class="mb-5 text-break">Nhận quyền truy cập không giới hạn vào hơn 90% khóa học, Dự án, Chuyên ngành và Chứng chỉ Chuyên nghiệp, được giảng dạy bởi các giảng viên hàng đầu.</p>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
              <div class="p-4 d-flex flex-column flex-grow-1">
                <img src="/img/icon1.png" alt="" width="60px" class="mb-4 mx-auto">
                <h5 class="mb-3">Học bất cứ điều gì</h5>
                <p class="mb-0 flex-grow-1">Khám phá mọi chủ đề đang thịnh hành và nâng cao kỹ năng của bạn</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
            <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
              <div class="p-4 d-flex flex-column flex-grow-1">
                <img src="/img/icon2.png" alt="" width="60px" class="mb-4 mx-auto">
                <h5 class="mb-3">Tiết kiệm chi phí</h5>
                <p class="mb-0 flex-grow-1">Tiết kiệm khi đăng ký nhiều khóa học trong năm</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
            <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
              <div class="p-4 d-flex flex-column flex-grow-1">
                <img src="/img/icon3.png" alt="" width="60px" class="mb-4 mx-auto">
                <h5 class="mb-3">Học tập linh hoạt</h5>
                <p class="mb-0 flex-grow-1">Học theo tốc độ của bạn và chuyển đổi giữa các khóa học dễ dàng</p>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
            <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
              <div class="p-4 d-flex flex-column flex-grow-1">
                <img src="/img/icon4.png" alt="" width="60px" class="mb-4 mx-auto">
                <h5 class="mb-3">Chứng chỉ không giới hạn</h5>
                <p class="mb-0 flex-grow-1">Nhận chứng chỉ cho mọi khóa học hoàn thành, không phát sinh thêm phí</p>
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
            <h6 class="section-title bg-white text-start pe-3 text-break">Về chúng tôi</h6>
            <h1 class="mb-4 text-break" style="color: #fb873f;">Chào mừng đến với Secret Coder</h1>
            <p class="mb-4 text-break">Tại Secret Coder, chúng tôi tin vào những trải nghiệm học tập dễ tiếp cận và đổi mới, phù hợp với lịch trình và phong cách học tập của bạn. Hãy tham gia cùng chúng tôi để đón nhận tương lai của giáo dục và khám phá tiềm năng của bạn với các khóa học trực tuyến đầy tính tương tác của chúng tôi.</p>
            <p class="mb-4 text-break">Chào mừng đến với Secret Coder, cánh cửa của bạn đến với những cơ hội học tập vô hạn. Chúng tôi cam kết dân chủ hóa giáo dục, cung cấp nhiều khóa học đa dạng được giảng dạy bởi các chuyên gia trong ngành. Sứ mệnh của chúng tôi là trao quyền cho người học trên toàn thế giới, xây dựng một nền tảng cộng đồng nơi kiến thức không có giới hạn.</p>
            <div class="row gy-2 gx-4 mb-4">
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Giảng viên chuyên nghiệp</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Buổi học tương tác trực tiếp</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Danh mục khóa học toàn diện</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Tham gia cộng đồng</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Lộ trình học tập cá nhân hóa</p>
              </div>
              <div class="col-sm-6">
                <p class="mb-0"><i class="fa fa-arrow-right me-2"></i>Chứng nhận và công nhận</p>
              </div>
            </div>
            <router-link to="/about" class="btn text-light py-3 px-5 mt-2" style="background-color: #fb873f;">Đọc thêm</router-link>
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
            <h1 class="mb-4 text-break" style="color: #fb873f;">Khám phá các khóa học miễn phí</h1>
            <p class="mb-4 text-break">Bắt đầu hành trình học tập trực tuyến của bạn tại Secret Coder miễn phí với các khóa học cơ bản ngắn hạn của chúng tôi trên nhiều lĩnh vực đang được quan tâm.</p>
            <router-link to="/register" class="btn text-light py-3 px-5 mt-2" style="background-color: #fb873f;">Bắt đầu miễn phí</router-link>
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
          <h6 class="section-title bg-white text-center px-3 text-break">Danh mục</h6>
          <h1 class="mb-5 text-break" style="color: #fb873f;">Các chủ đề phổ biến để khám phá</h1>
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
          <h6 class="section-title bg-white text-center px-3 text-break">Khóa học phổ biến</h6>
          <h1 class="mb-5 text-break" style="color: #fb873f;">Khám phá các khóa học trực tuyến miễn phí mới và đang thịnh hành</h1>
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
                  <i class="fa fa-user-graduate me-2"></i>{{ formatLearners(course.enrolledCount || 0) }}
                </small>
                <small class="flex-fill text-center py-1 px-2">
                  <i class="fa fa-user me-2"></i>{{ course.level === 'Beginner' ? 'Người mới bắt đầu' : course.level === 'Intermediate' ? 'Trung cấp' : course.level === 'Advanced' ? 'Nâng cao' : course.level || 'Người mới bắt đầu' }}
                </small>
              </div>
              <div class="d-flex">
                <small class="flex-fill text-left p-2 px-2">
                  <i class="fa fa-clock me-2"></i>{{ course.duration || 0 }} Giờ
                </small>
                <small class="py-1 px-2 fw-bold fs-6 text-center">₹ {{ course.price || 0 }}</small>
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
    <div class="container text-center">
      <router-link to="/courses" class="btn text-light py-3 px-5 mt-2 mb-5" style="background-color: #fb873f;">Tất cả khóa học</router-link>
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

<style scoped>
.hero-content {
  max-width: 820px;
}

.text-break {
  word-break: break-word;
}

.service-item .p-4 p {
  min-height: 72px;
}

@media (max-width: 576px) {
  .display-3 {
    font-size: 2rem;
  }
  .hero-content {
    max-width: 100%;
  }
}
</style>

