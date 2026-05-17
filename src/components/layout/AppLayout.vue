<template>
  <div class="app-layout d-flex">
    <AppSidebar :is-collapsed="isSidebarCollapsed" />
    <div class="app-layout__main d-flex flex-column flex-grow-1 overflow-hidden">
      <AppNavbar @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />
      <main class="flex-grow-1 overflow-auto p-4 bg-light">
        <RouterView />
      </main>
    </div>
    <AppToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
import AppToastContainer from '@/components/ui/AppToastContainer.vue'

const isSidebarCollapsed = ref(false)
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-layout__main {
  min-width: 0;
}
</style>
