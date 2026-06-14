<script setup lang="ts">
const auth = useAuthStore()
</script>

<template>
  <!-- Full-bleed app shell — the screen itself is the surface (no outer card
       frame), so dashboard widgets read as cards on the page, not cards inside
       a card. Sidebar is fixed; only the main content scrolls. -->
  <div class="h-screen bg-card text-ink flex overflow-hidden print:h-auto print:block print:overflow-visible">
    <ClientOnly>
      <AppSidebar v-if="auth.isAuthenticated" />
    </ClientOnly>
    <div class="flex-1 flex flex-col min-w-0">
      <ClientOnly>
        <ViewAsBanner v-if="auth.isAuthenticated" />
        <AppTopNav v-if="auth.isAuthenticated" />
      </ClientOnly>
      <main class="flex-1 px-5 lg:px-8 py-6 overflow-y-auto overflow-x-hidden print:overflow-visible">
        <div class="max-w-[1320px] w-full mx-auto">
          <!-- Page content depends on the auth store, which is hydrated only on
               the client. Wrapping the slot in <ClientOnly> avoids SSR/CSR
               mismatches caused by auth-conditional rendering inside pages. -->
          <ClientOnly>
            <slot />
            <template #fallback>
              <div class="flex flex-col gap-4 animate-pulse">
                <div class="h-8 bg-surface2 rounded-ctl w-48" />
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div v-for="i in 4" :key="i" class="h-24 bg-surface2 rounded-card" />
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>
      </main>
      <footer class="shrink-0 border-t border-line px-5 lg:px-8 py-2.5 text-center text-[11px] text-muted print:hidden">
        Skool Track <span class="text-light font-medium">by Blu Studio</span>
      </footer>
    </div>
    <ClientOnly>
      <Toast position="top-right" />
      <ConfirmDialog />
    </ClientOnly>
  </div>
</template>
