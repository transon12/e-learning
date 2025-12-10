<template>
  <div class="container-xxl py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h3 class="text-center mb-4">Register</h3>
              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input 
                    v-model="form.username" 
                    type="text" 
                    class="form-control" 
                    required
                  >
                </div>
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
                  {{ loading ? 'Registering...' : 'Register' }}
                </button>
              </form>
              <p class="text-center mt-3">
                Already have an account? 
                <router-link to="/login">Login</router-link>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const form = ref({
  username: '',
  email: '',
  password: ''
})

const handleRegister = async () => {
  loading.value = true
  const result = await authStore.register(form.value)
  loading.value = false

  if (result.success) {
    router.push('/')
  } else {
    alert(result.message)
  }
}
</script>

