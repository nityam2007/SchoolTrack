<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-bg text-ink flex">
    <ClientOnly>
      <AppSidebar v-if="auth.isAuthenticated" />
    </ClientOnly>
    <div class="flex-1 flex flex-col min-w-0">
      <ClientOnly>
        <ViewAsBanner v-if="auth.isAuthenticated" />
        <AppTopNav v-if="auth.isAuthenticated" />
      </ClientOnly>
      <main class="flex-1 px-6 lg:px-10 py-8 overflow-y-auto overflow-x-hidden max-w-[1400px] w-full mx-auto">
        <!-- Page content depends on the auth store, which is hydrated only on
             the client. Wrapping the slot in <ClientOnly> avoids SSR/CSR
             mismatches caused by auth-conditional rendering inside pages. -->
        <ClientOnly>
          <slot />
          <template #fallback>
            <div class="flex flex-col gap-4 animate-pulse">
              <div class="h-8 bg-surface rounded-ctl w-48" />
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="i in 4" :key="i" class="h-24 bg-surface rounded-card" />
              </div>
            </div>
          </template>
        </ClientOnly>
      </main>
    </div>
    <ClientOnly>
      <Toast position="top-right" />
      <ConfirmDialog />
    </ClientOnly>
  </div>
</template>
