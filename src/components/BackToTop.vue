<template>
  <a 
    v-show="showButton"
    href="#" 
    class="btn btn-lg btn-primary btn-lg-square back-to-top"
    @click.prevent="scrollToTop"
  >
    <i class="bi bi-arrow-up"></i>
  </a>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showButton = ref(false)

const handleScroll = () => {
  showButton.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  display: none;
  right: 45px;
  bottom: 45px;
  z-index: 99;
}

.back-to-top.show {
  display: block;
}
</style>

