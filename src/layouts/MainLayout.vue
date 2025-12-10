<template>
  <div>
    <Navbar />
    <router-view />
    <Footer />
    <BackToTop />
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import BackToTop from '@/components/BackToTop.vue'
</script>

