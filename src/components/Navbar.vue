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
          Home
        </router-link>
        <router-link to="/about" class="nav-item nav-link" :class="{ active: $route.path === '/about' }">
          About
        </router-link>
        <router-link to="/courses" class="nav-item nav-link" :class="{ active: $route.path === '/courses' }">
          Courses
        </router-link>
        <div class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Pages</a>
          <div class="dropdown-menu fade-down m-0">
            <router-link to="/team" class="dropdown-item">Our Team</router-link>
            <router-link to="/testimonial" class="dropdown-item">Testimonial</router-link>
          </div>
        </div>
        <router-link to="/contact" class="nav-item nav-link" :class="{ active: $route.path === '/contact' }">
          Contact
        </router-link>
        <template v-if="authStore.isAuthenticated">
          <div class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
              <i class="fa fa-user"></i> {{ authStore.user?.username }}
            </a>
            <div class="dropdown-menu fade-down m-0">
              <router-link to="/profile" class="dropdown-item">Profile</router-link>
              <router-link v-if="authStore.isAdmin" to="/admin" class="dropdown-item">Admin</router-link>
              <a href="#" class="dropdown-item" @click.prevent="handleLogout">Logout</a>
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

