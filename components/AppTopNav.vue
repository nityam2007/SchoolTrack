<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
const route = useRoute()

const userMenu = ref()
const userMenuItems = ref([
  {
    label: 'Account',
    items: [
      { label: 'Profile', icon: 'pi pi-user' },
      { label: 'Settings', icon: 'pi pi-cog' },
      { separator: true },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => {
          auth.logout()
          navigateTo('/login')
        },
      },
    ],
  },
])

// Active school context (Principals & Teachers — Super Admin sees platform-wide).
const activeSchool = computed(() =>
  auth.schoolId ? db.schools.find((s) => s.id === auth.schoolId) ?? null : null,
)

const initials = computed(() => {
  const name = auth.user?.name ?? ''
  return name
    .replace(/^Principal — /, '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

// Page title from current route name.
const pageTitle = computed(() => {
  const seg = route.path.split('/').filter(Boolean)[0] ?? 'dashboard'
  return seg
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
})

const creditsTone = computed(() => {
  const c = activeSchool.value?.credits ?? 0
  if (c < 100) return 'danger'
  if (c < 250) return 'warn'
  return 'success'
})
</script>

<template>
  <header
    class="h-16 border-b border-line bg-surface/60 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-6"
  >
    <div class="flex items-center gap-3">
      <h1 class="text-lg font-bold tracking-tight">{{ pageTitle }}</h1>
      <span v-if="activeSchool" class="text-muted text-sm">/ {{ activeSchool.name }}</span>
    </div>

    <div class="flex items-center gap-3">
      <!-- Search -->
      <span class="p-input-icon-left hidden md:block">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText placeholder="Search..." size="small" class="w-64" />
        </IconField>
      </span>

      <!-- Credits badge (Principal sees their school's credits) -->
      <div
        v-if="activeSchool && auth.role === 'schooladmin'"
        class="flex items-center gap-2 px-3 py-1.5 rounded-ctl border"
        :class="{
          'border-danger/40 bg-danger/10 text-danger': creditsTone === 'danger',
          'border-warn/40 bg-warn/10 text-warn': creditsTone === 'warn',
          'border-ok/40 bg-ok/10 text-ok': creditsTone === 'success',
        }"
      >
        <i class="pi pi-credit-card text-xs" />
        <span class="text-sm font-bold">{{ activeSchool.credits }}</span>
        <span class="text-[11px] opacity-80">credits</span>
      </div>

      <!-- Notifications -->
      <Button icon="pi pi-bell" severity="secondary" text rounded aria-label="Notifications" />

      <!-- User menu -->
      <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
      <button
        class="flex items-center gap-2 px-2 py-1 rounded-ctl hover:bg-card transition-colors"
        @click="(e) => userMenu.toggle(e)"
      >
        <Avatar :label="initials" shape="circle" class="!bg-accent !text-white" />
        <span class="text-sm font-semibold hidden sm:inline">{{ auth.user?.name }}</span>
        <i class="pi pi-chevron-down text-xs text-muted" />
      </button>
    </div>
  </header>
</template>
