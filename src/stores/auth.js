import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(localStorage.getItem('user') || null)
  const token = ref(localStorage.getItem('token') || null)
  const initialized = ref(false)
  let initPromise = null

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isInstructor = computed(() => ['instructor', 'admin'].includes(user.value?.role))

  // Set auth token
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  // Set user
  function setUser(userData) {
    console.log(userData, '333333333');
    
    user.value = userData
    console.log(user.value, '444444444');
    
  }

  // Login
  async function login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      console.log(response.data, '222222222');
      
      setToken(response.data.token)
      setUser(response.data.user)
      
      return { success: true }
    } catch (error) {
      console.error('Login error', error.response || error.message)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  // Register
  async function register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      setToken(response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Logout
  function logout() {
    setToken(null)
    setUser(null)
    console.log(user.value, '555555555');
    
  }

  // Fetch current user
  async function fetchUser() {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      logout()
      return { success: false }
    }
  }

  // Initialize auth once per app start
  async function init() {
    if (initialized.value) return
    initialized.value = true

    // restore cached user (optimistic) then refresh from API
    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      try {
        user.value = JSON.parse(cachedUser)
      } catch (e) {
        localStorage.removeItem('user')
      }
    }

    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      await fetchUser()
    }
  }

  function ensureInit() {
    if (!initPromise) {
      initPromise = init()
    }
    return initPromise
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isInstructor,
    login,
    register,
    logout,
    fetchUser,
    persist: true
  }
})

