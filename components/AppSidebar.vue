<script setup lang="ts">
const auth = useAuthStore()
const { items } = useNav()
const route = useRoute()

const onLogout = () => {
  auth.logout()
  navigateTo('/login')
}

const roleLabel = computed(() => {
  switch (auth.user?.role) {
    case 'superadmin': return 'Super Admin'
    case 'schooladmin': return 'Principal'
    case 'teacher': return 'Teacher'
    default: return ''
  }
})
</script>

<template>
  <aside
    class="w-[220px] shrink-0 min-h-screen bg-surface border-r border-line flex flex-col px-4 py-6 gap-1"
  >
    <NuxtLink to="/dashboard" class="flex items-center gap-2.5 mb-6 pl-2">
      <div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-base">
        <i class="pi pi-building text-white" />
      </div>
      <span class="font-extrabold font-display text-base tracking-tight">SchoolTrack</span>
    </NuxtLink>

    <NuxtLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      :class="[
        'flex items-center gap-2.5 px-3.5 py-2.5 rounded-ctl text-sm transition-colors border',
        route.path.startsWith(item.to)
          ? 'bg-accentGlow text-accent border-accent/30 font-bold'
          : 'text-light border-transparent hover:bg-card hover:text-ink',
      ]"
    >
      <i :class="item.icon" />
      <span>{{ item.label }}</span>
    </NuxtLink>

    <div class="mt-auto flex flex-col gap-2">
      <div class="st-card-tight">
        <p class="text-sm font-bold m-0 truncate">{{ auth.user?.name }}</p>
        <p class="text-[11px] text-muted m-0 mt-0.5">{{ roleLabel }}</p>
      </div>
      <Button
        label="Sign Out"
        icon="pi pi-sign-out"
        severity="secondary"
        outlined
        size="small"
        class="w-full"
        @click="onLogout"
      />
    </div>
  </aside>
</template>
