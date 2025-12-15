<template>
  <nav class="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
    <router-link to="/" class="navbar-brand d-flex align-items-center px-4 px-lg-5">
      <p class="m-0 fw-bold" style="font-size: 25px;">
        <img src="/img/icon.png" alt="" height="50px">
        Secret<span style="color: #fb873f;">Coder</span>
      </p>
    </router-link>
    <button 
      type="button" 
      class="navbar-toggler me-4" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarCollapse"
      @click="toggleNavbar"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarCollapse">
      <div class="navbar-nav ms-auto p-4 p-lg-0">
        <router-link to="/" class="nav-item nav-link" :class="{ active: $route.path === '/' }">
          Trang chủ
        </router-link>
        <router-link to="/about" class="nav-item nav-link" :class="{ active: $route.path === '/about' }">
          Về chúng tôi
        </router-link>
        <router-link to="/courses" class="nav-item nav-link" :class="{ active: $route.path === '/courses' }">
          Khóa học
        </router-link>
        <div class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" @click.prevent>Pages</a>
          <div class="dropdown-menu fade-down">
            <router-link to="/team" class="dropdown-item">Our Team</router-link>
            <router-link to="/testimonial" class="dropdown-item">Testimonial</router-link>
          </div>
        </div>
        <router-link to="/contact" class="nav-item nav-link" :class="{ active: $route.path === '/contact' }">
          Liên hệ
        </router-link>
        <template v-if="authStore.isAuthenticated">
          <div class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" @click.prevent>
              <i class="fa fa-user"></i> {{ authStore.user?.username }}
            </a>
            <div class="dropdown-menu dropdown-menu-end fade-down">
              <router-link to="/profile" class="dropdown-item">Hồ sơ</router-link>
              <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item">Quản trị</router-link>
              <a href="#" class="dropdown-item" @click.prevent="handleLogout">Đăng xuất</a>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-item nav-link">
            <i class="fa fa-user"></i>
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const toggleNavbar = () => {
  // Bootstrap will handle the collapse
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.nav-item.dropdown {
  position: relative;
}

.dropdown-menu {
  min-width: 180px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #fb873f;
}

.dropdown-item.router-link-active {
  background-color: #fff5f0;
  color: #fb873f;
}

@media (max-width: 991.98px) {
  .dropdown-menu {
    position: static !important;
    float: none;
    width: 100%;
    margin-top: 0;
    box-shadow: none;
    border: none;
    border-top: 1px solid #eee;
  }
  
  .dropdown-menu-end {
    right: auto;
    left: auto;
  }
}
</style>

