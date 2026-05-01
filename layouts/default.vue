<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-bg text-ink flex">
    <AppSidebar v-if="auth.isAuthenticated" />
    <div class="flex-1 flex flex-col min-w-0">
      <AppTopNav v-if="auth.isAuthenticated" />
      <main class="flex-1 p-8 overflow-y-auto overflow-x-hidden">
        <slot />
      </main>
    </div>
    <Toast position="top-right" />
    <ConfirmDialog />
  </div>
</template>
