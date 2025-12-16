<template>
  <div class="container-xxl py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h3 class="text-center mb-4">Login</h3>
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
                  <label class="form-label">Password</label>
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
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </form>
              <p class="text-center mt-3">
                Don't have an account? 
                <router-link to="/register">Register</router-link>
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
const form = ref({
  email: '',
  password: ''
})

const handleLogin = async (event) => {
  event.preventDefault()
  loading.value = true
  const result = await authStore.login(form.value)
  loading.value = false

console.log(result);

  if (result.success) {
    if (result.user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } else {
    alert(result.message)
  }
}
</script>

