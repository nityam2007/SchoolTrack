<script setup lang="ts">
const auth = useAuthStore()
const { items } = useNav()
const { initials, roleMeta } = useUserDisplay()
const route = useRoute()

const isActive = (to: string) =>
  to === '/dashboard' ? route.path === '/dashboard' : route.path.startsWith(to)

const onLogout = async () => {
  await auth.logout()
  navigateTo('/login')
}
</script>

<template>
  <aside class="w-[240px] shrink-0 min-h-screen bg-surface/95 backdrop-blur border-r border-line flex flex-col px-3 py-5 gap-1">
    <NuxtLink
      to="/dashboard"
      class="flex items-center gap-2.5 mb-5 px-2 py-1.5 rounded-ctl hover:bg-surface2 transition-colors"
    >
      <div class="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-glow">
        <i class="pi pi-building text-white text-sm" />
      </div>
      <span class="font-extrabold font-display text-base tracking-tight">SchoolTrack</span>
    </NuxtLink>

    <div class="px-2 mb-2">
      <span class="st-label">Menu</span>
    </div>

    <nav class="flex flex-col gap-0.5">
      <NuxtLink
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="group relative flex items-center gap-3 px-3 py-2.5 rounded-ctl text-sm transition-all"
        :class="
          isActive(item.to)
            ? 'bg-accentSoft text-accent font-bold'
            : 'text-light hover:bg-surface2 hover:text-ink'
        "
      >
        <span
          v-if="isActive(item.to)"
          class="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-accent"
        />
        <i :class="[item.icon, 'text-[15px]', isActive(item.to) ? '' : 'group-hover:text-accent']" />
        <span class="flex-1">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mt-auto pt-3 flex flex-col gap-2">
      <div class="st-card-tight !p-3 flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full ring-1 flex items-center justify-center font-bold text-sm shrink-0"
          :class="roleMeta.tone"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold truncate m-0 leading-tight">{{ auth.user?.name }}</p>
          <p class="text-[11px] text-muted truncate m-0">{{ roleMeta.label }}</p>
        </div>
      </div>
      <Button
        label="Sign Out"
        icon="pi pi-sign-out"
        severity="secondary"
        text
        size="small"
        class="!justify-start"
        @click="onLogout"
      />
    </div>
  </aside>
</template>
