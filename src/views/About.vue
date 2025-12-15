<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="about">
      <!-- Header -->
      <div class="container-fluid bg-primary py-5 mb-5 page-header">
        <div class="container py-5">
          <div class="row justify-content-center">
            <div class="col-lg-10 text-center">
              <h1 class="display-3 text-white animated slideInDown text-break">{{ about.title }}</h1>
              <p v-if="about.subtitle" class="fs-4 text-white text-break">{{ about.subtitle }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- About Content -->
      <div class="container-xxl py-5">
        <div class="container">
          <div class="row g-5">
            <!-- Image -->
            <div v-if="about.imageUrl" class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s" style="min-height: 400px;">
              <div class="position-relative h-100">
                <img class="img-fluid position-absolute w-100 h-100 rounded" :src="resolveImage(about.imageUrl)" alt="About Us" style="object-fit: cover;">
              </div>
            </div>

            <!-- Content -->
            <div :class="about.imageUrl ? 'col-lg-6' : 'col-lg-12'">
              <div class="wow fadeInUp" data-wow-delay="0.3s">
                <h6 class="section-title bg-white text-start pe-3 text-break">Về chúng tôi</h6>
                <h1 class="mb-4 text-break" style="color: #fb873f;">{{ about.title }}</h1>
                
                <div v-if="about.description" class="mb-4">
                  <p class="mb-4 text-break">{{ about.description }}</p>
                </div>

                <!-- Mission -->
                <div v-if="about.mission" class="mb-4">
                  <h3 class="mb-3 text-break" style="color: #fb873f;">Sứ mệnh</h3>
                  <p class="text-break">{{ about.mission }}</p>
                </div>

                <!-- Vision -->
                <div v-if="about.vision" class="mb-4">
                  <h3 class="mb-3 text-break" style="color: #fb873f;">Tầm nhìn</h3>
                  <p class="text-break">{{ about.vision }}</p>
                </div>

                <!-- Values -->
                <div v-if="about.values" class="mb-4">
                  <h3 class="mb-3 text-break" style="color: #fb873f;">Giá trị cốt lõi</h3>
                  <ul class="list-unstyled">
                    <li v-for="(value, index) in parseValues(about.values)" :key="index" class="mb-2 text-break">
                      <i class="fa fa-check text-primary me-2"></i>{{ value }}
                    </li>
                  </ul>
                </div>

                <!-- Team Description -->
                <div v-if="about.teamDescription" class="mb-4">
                  <h3 class="mb-3 text-break" style="color: #fb873f;">Đội ngũ</h3>
                  <p class="text-break">{{ about.teamDescription }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="container-xxl py-5 bg-light">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
                <div class="p-4 d-flex flex-column flex-grow-1">
                  <i class="fa fa-graduation-cap fa-3x text-primary mb-4 mx-auto"></i>
                  <h5 class="mb-3 text-break">Giảng viên chuyên nghiệp</h5>
                  <p class="mb-0 flex-grow-1 text-break">Đội ngũ giảng viên giàu kinh nghiệm và nhiệt huyết</p>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
              <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
                <div class="p-4 d-flex flex-column flex-grow-1">
                  <i class="fa fa-certificate fa-3x text-primary mb-4 mx-auto"></i>
                  <h5 class="mb-3 text-break">Chứng chỉ uy tín</h5>
                  <p class="mb-0 flex-grow-1 text-break">Nhận chứng chỉ sau khi hoàn thành khóa học</p>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
              <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
                <div class="p-4 d-flex flex-column flex-grow-1">
                  <i class="fa fa-users fa-3x text-primary mb-4 mx-auto"></i>
                  <h5 class="mb-3 text-break">Cộng đồng lớn</h5>
                  <p class="mb-0 flex-grow-1 text-break">Tham gia cộng đồng học viên đông đảo</p>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.7s">
              <div class="service-item text-center pt-3 shadow h-100 d-flex flex-column">
                <div class="p-4 d-flex flex-column flex-grow-1">
                  <i class="fa fa-headset fa-3x text-primary mb-4 mx-auto"></i>
                  <h5 class="mb-3 text-break">Hỗ trợ 24/7</h5>
                  <p class="mb-0 flex-grow-1 text-break">Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn</p>
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
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(true)
const about = ref(null)
const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''

const normalizedBaseUrl = computed(() => apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : '')

const resolveImage = (imageUrl) => {
  if (!imageUrl) return '/img/about.jpg'
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  return `${normalizedBaseUrl.value}${path}`
}

const parseValues = (values) => {
  if (!values) return []
  try {
    // Try to parse as JSON array
    const parsed = JSON.parse(values)
    return Array.isArray(parsed) ? parsed : [values]
  } catch {
    // If not JSON, split by comma
    return values.split(',').map(v => v.trim()).filter(v => v)
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/about')
    about.value = response.data.data
  } catch (error) {
    console.error('Error fetching about:', error)
  } finally {
    loading.value = false
  }
})
</script>

