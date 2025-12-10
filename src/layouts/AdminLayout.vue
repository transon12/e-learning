<template>
  <div>
    <AdminSidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
</script>

<style scoped>
.main-content {
  margin-left: 250px;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.topbar {
  background: white;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>

