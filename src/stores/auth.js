import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // Parse user from localStorage (it's stored as JSON string)
  const cachedUser = localStorage.getItem('user')
  const user = ref(cachedUser ? JSON.parse(cachedUser) : null)
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
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  // Login
  async function login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
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
  }

  // Fetch current user
  async function fetchUser() {
    try {
      const response = await api.get('/auth/me')
      console.log('fetchUser success:', response.data.user)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      console.error('fetchUser error:', error.response?.status, error.response?.data)
      logout()
      return { success: false }
    }
  }

  // Initialize auth once per app start
  async function init() {
    if (initialized.value) {
      console.log('init: already initialized')
      return
    }
    initialized.value = true

    // restore cached user (optimistic) then refresh from API
    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      try {
        user.value = JSON.parse(cachedUser)
        console.log('init: restored cached user:', user.value)
      } catch (e) {
        console.error('init: failed to parse cached user:', e)
        localStorage.removeItem('user')
      }
    }

    if (token.value) {
      console.log('init: token exists, fetching user from API')
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      await fetchUser()
    } else {
      console.log('init: no token found')
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
    ensureInit
  }
})

