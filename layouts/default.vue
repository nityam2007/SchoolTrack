<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-bg text-ink flex">
    <AppSidebar v-if="auth.isAuthenticated" />
    <div class="flex-1 flex flex-col min-w-0">
      <AppTopNav v-if="auth.isAuthenticated" />
      <main class="flex-1 px-6 lg:px-10 py-8 overflow-y-auto overflow-x-hidden max-w-[1400px] w-full mx-auto">
        <slot />
      </main>
    </div>
    <Toast position="top-right" />
    <ConfirmDialog />
  </div>
</template>
