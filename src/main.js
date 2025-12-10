import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from '@/stores'
import '@/assets/css/bootstrap.min.css'
import '@/assets/css/lib/animate.min.css'
import '@/assets/css/lib/owl.carousel.min.css'
import '@/assets/css/lib/owl.theme.default.min.css'
import '@/assets/css/style.css'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(pinia)
app.use(router)

// Khởi tạo auth từ localStorage để giữ phiên sau reload
useAuthStore().ensureInit?.()

app.mount('#app')

