<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Đang tải...</span>
      </div>
    </div>

    <div v-else>
      <!-- Header -->
      <div class="container-fluid bg-primary py-5 mb-5 page-header">
        <div class="container py-5">
          <div class="row justify-content-center">
            <div class="col-lg-10 text-center">
              <h1 class="display-3 text-white animated slideInDown text-break">Liên hệ với chúng tôi</h1>
              <p class="fs-4 text-white text-break">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="container-xxl py-5">
        <div class="container">
          <div class="row g-5">
            <!-- Contact Info -->
            <div class="col-lg-4 wow fadeInUp" data-wow-delay="0.1s">
              <div class="bg-light rounded shadow-sm p-5 h-100">
                <h3 class="mb-4 text-break" style="color: #fb873f;">
                  <i class="fa fa-map-marker-alt me-2"></i>Thông tin liên hệ
                </h3>
                
                <div v-for="info in contactInfo.filter(i => i.type !== 'social')" :key="info.id" class="mb-4 pb-3 border-bottom">
                  <div class="d-flex align-items-start">
                    <div class="flex-shrink-0">
                      <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                        <i :class="`${getContactIcon(info)} fa-lg`"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <h6 class="mb-2 fw-bold text-break">{{ info.label }}</h6>
                      <p class="mb-0 text-break">
                        <a v-if="info.type === 'email'" :href="`mailto:${info.value}`" class="text-decoration-none text-dark">
                          {{ info.value }}
                        </a>
                        <a v-else-if="info.type === 'phone'" :href="`tel:${info.value}`" class="text-decoration-none text-dark">
                          {{ info.value }}
                        </a>
                        <span v-else class="text-break">{{ info.value }}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Social Links -->
                <div v-if="socialLinks.length > 0" class="mt-4 pt-3">
                  <h6 class="mb-3 fw-bold">Theo dõi chúng tôi</h6>
                  <div class="d-flex flex-wrap gap-2">
                    <a v-for="social in socialLinks" :key="social.id" :href="social.value" target="_blank" 
                       class="btn btn-outline-primary btn-social" :title="social.label">
                      <i :class="getSocialIcon(social)"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="col-lg-8 wow fadeInUp" data-wow-delay="0.3s">
              <div class="bg-light rounded shadow-sm p-5">
                <h3 class="mb-4 text-break" style="color: #fb873f;">
                  <i class="fa fa-envelope me-2"></i>Gửi tin nhắn
                </h3>
                
                <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                  {{ successMessage }}
                  <button type="button" class="btn-close" @click="successMessage = ''"></button>
                </div>

                <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                  {{ errorMessage }}
                  <button type="button" class="btn-close" @click="errorMessage = ''"></button>
                </div>

                <form @submit.prevent="submitForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="form-floating">
                        <input 
                          type="text" 
                          class="form-control" 
                          id="name" 
                          v-model="form.name"
                          placeholder="Tên của bạn"
                          required
                        >
                        <label for="name">Tên của bạn *</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating">
                        <input 
                          type="email" 
                          class="form-control" 
                          id="email" 
                          v-model="form.email"
                          placeholder="Email của bạn"
                          required
                        >
                        <label for="email">Email của bạn *</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-floating">
                        <input 
                          type="tel" 
                          class="form-control" 
                          id="phone" 
                          v-model="form.phone"
                          placeholder="Số điện thoại"
                        >
                        <label for="phone">Số điện thoại</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-floating">
                        <input 
                          type="text" 
                          class="form-control" 
                          id="subject" 
                          v-model="form.subject"
                          placeholder="Chủ đề"
                          required
                        >
                        <label for="subject">Chủ đề *</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-floating">
                        <textarea 
                          class="form-control" 
                          id="message" 
                          v-model="form.message"
                          placeholder="Tin nhắn của bạn"
                          style="height: 150px"
                          required
                        ></textarea>
                        <label for="message">Tin nhắn của bạn *</label>
                      </div>
                    </div>
                    <div class="col-12">
                      <button class="btn text-white py-3 px-5" type="submit" :disabled="submitting" style="background-color: #fb873f;">
                        <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-if="!submitting" class="fa fa-paper-plane me-2"></i>
                        {{ submitting ? 'Đang gửi...' : 'Gửi tin nhắn' }}
                      </button>
                    </div>
                  </div>
                </form>
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
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(true)
const submitting = ref(false)
const contactInfo = ref([])
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const socialLinks = computed(() => {
  return contactInfo.value.filter(info => info.type === 'social' && info.value.startsWith('http'))
})

// Get icon for contact info based on type
const getContactIcon = (info) => {
  // If icon exists in database and is valid, use it
  if (info.icon && info.icon.trim()) {
    // Ensure icon has 'fa' or 'fab' prefix
    const icon = info.icon.trim()
    if (icon.startsWith('fa ') || icon.startsWith('fab ')) {
      return icon
    }
    return `fa ${icon}`
  }
  
  // Otherwise, use default icons based on type
  const iconMap = {
    'address': 'fa fa-map-marker-alt',
    'phone': 'fa fa-phone-alt',
    'email': 'fa fa-envelope',
    'social': 'fa fa-share-alt'
  }
  
  return iconMap[info.type] || 'fa fa-info-circle'
}

// Get icon for social links
const getSocialIcon = (social) => {
  if (social.icon && social.icon.trim()) {
    const icon = social.icon.trim()
    // Check if it's a brand icon (fab) or regular icon (fa)
    if (icon.includes('facebook')) return 'fab fa-facebook-f'
    if (icon.includes('twitter')) return 'fab fa-twitter'
    if (icon.includes('linkedin')) return 'fab fa-linkedin-in'
    if (icon.includes('youtube')) return 'fab fa-youtube'
    if (icon.includes('instagram')) return 'fab fa-instagram'
    if (icon.startsWith('fa ') || icon.startsWith('fab ')) {
      return icon
    }
    return `fa ${icon}`
  }
  
  // Default based on URL
  const url = social.value.toLowerCase()
  if (url.includes('facebook')) return 'fab fa-facebook-f'
  if (url.includes('twitter')) return 'fab fa-twitter'
  if (url.includes('linkedin')) return 'fab fa-linkedin-in'
  if (url.includes('youtube')) return 'fab fa-youtube'
  if (url.includes('instagram')) return 'fab fa-instagram'
  
  return 'fa fa-share-alt'
}

onMounted(async () => {
  await fetchContactInfo()
  
  // Pre-fill form if user is logged in
  if (authStore.isAuthenticated && authStore.user) {
    form.value.name = authStore.user.profile_first_name && authStore.user.profile_last_name
      ? `${authStore.user.profile_first_name} ${authStore.user.profile_last_name}`
      : authStore.user.username || ''
    form.value.email = authStore.user.email || ''
  }
})

const fetchContactInfo = async () => {
  try {
    const response = await api.get('/contact/info')
    contactInfo.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching contact info:', error)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  submitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await api.post('/contact/message', {
      ...form.value,
      userId: authStore.isAuthenticated ? authStore.user.id : null
    })

    successMessage.value = response.data.message || 'Tin nhắn của bạn đã được gửi thành công!'
    
    // Reset form
    form.value = {
      name: authStore.isAuthenticated && authStore.user?.profile_first_name && authStore.user?.profile_last_name
        ? `${authStore.user.profile_first_name} ${authStore.user.profile_last_name}`
        : authStore.user?.username || '',
      email: authStore.user?.email || '',
      phone: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.btn-social {
  width: 45px;
  height: 45px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.btn-social:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.form-control:focus {
  border-color: #fb873f;
  box-shadow: 0 0 0 0.2rem rgba(251, 135, 63, 0.25);
}

.form-floating > label {
  color: #6c757d;
}

.bg-light {
  background-color: #f8f9fa !important;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}
</style>

