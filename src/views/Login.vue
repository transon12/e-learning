<template>
  <div class="container-xxl py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h3 class="text-center mb-4">Đăng nhập</h3>

              <!-- Error Alert -->
              <div
                v-if="errorMessage"
                class="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i class="fa fa-exclamation-circle me-2"></i>{{ errorMessage }}
                <button
                  type="button"
                  class="btn-close"
                  @click="errorMessage = ''"
                  aria-label="Close"
                ></button>
              </div>

              <form @submit="handleLogin">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Mật khẩu</label>
                  <input
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    required
                  >
                </div>
                <button
                  type="submit"
                  class="btn btn-primary w-100 py-3"
                  :disabled="loading"
                >
                  {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>
              </form>
              <p class="text-center mt-3">
                Chưa có tài khoản?
                <router-link to="/register">Đăng ký</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const form = ref({
  email: '',
  password: ''
})

const handleLogin = async (event) => {
  event.preventDefault()
  errorMessage.value = '' // Clear previous error
  loading.value = true

  try {
    const result = await authStore.login(form.value)

    if (result.success) {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      // Display error message
      errorMessage.value = result.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
    }
  } catch (error) {
    errorMessage.value = 'Có lỗi xảy ra. Vui lòng thử lại sau.'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

