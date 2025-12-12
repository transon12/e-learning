import axios from 'axios'

// Allow override via .env (VITE_API_BASE_URL), fallback to proxy /api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Clear auth store (will be handled by router guard)
      // Don't redirect here - let router guard handle it
    }
    return Promise.reject(error)
  }
)

export default api

