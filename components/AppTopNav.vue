<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
const route = useRoute()
const { initials, firstName, greeting } = useUserDisplay()

const userMenu = ref()
const userMenuItems = computed(() => [
  {
    label: auth.user?.email ?? '',
    items: [
      { label: 'Account settings', icon: 'pi pi-user', disabled: true },
      { label: 'Reload data', icon: 'pi pi-refresh', command: () => db.loadAll() },
      { separator: true },
      {
        label: 'Sign out',
        icon: 'pi pi-sign-out',
        command: async () => { await auth.logout(); navigateTo('/login') },
      },
    ],
  },
])

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  schools: 'Schools',
  credits: 'Credits',
  analytics: 'Analytics',
  attendance: 'Attendance',
  teachers: 'Teachers',
  students: 'Students',
  holidays: 'Holidays',
  messages: 'Messages',
  reports: 'Reports',
  'mark-attendance': 'Mark Attendance',
  'my-class': 'My Class',
  'report-cards': 'Report Cards',
}
const pageTitle = computed(() => {
  const seg = route.path.split('/').filter(Boolean)[0] ?? 'dashboard'
  return PAGE_TITLES[seg] ?? 'SchoolTrack'
})

const creditsTone = computed(() => {
  const c = db.activeSchool?.credits ?? 0
  if (c < 100) return { chip: 'bg-danger/10 text-danger', dot: 'bg-danger' }
  if (c < 250) return { chip: 'bg-warn/10 text-warn',     dot: 'bg-warn' }
  return         { chip: 'bg-ok/10 text-ok',              dot: 'bg-ok' }
})
</script>

<template>
  <header
    class="h-16 border-b border-line bg-bg/70 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6"
  >
    <div class="min-w-0 flex items-baseline gap-3">
      <h1 class="text-lg font-bold tracking-tight truncate">{{ pageTitle }}</h1>
      <span v-if="db.activeSchool" class="text-muted text-sm truncate hidden md:inline">
        · {{ db.activeSchool.name }}
      </span>
      <span v-else-if="auth.role === 'superadmin'" class="text-muted text-sm hidden md:inline">
        · Platform
      </span>
    </div>

    <div class="flex items-center gap-2">
      <span class="hidden md:block">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText placeholder="Search…" size="small" class="w-56" />
        </IconField>
      </span>

      <span
        v-if="db.activeSchool && auth.role === 'schooladmin'"
        class="st-chip !rounded-ctl !py-1.5 !px-3 !text-sm tabular-nums"
        :class="creditsTone.chip"
      >
        <span class="st-chip-dot" :class="creditsTone.dot" />
        <span class="font-bold">{{ db.activeSchool.credits }}</span>
        <span class="opacity-70 normal-case font-normal text-[11px]">credits</span>
      </span>

      <Button icon="pi pi-bell" severity="secondary" text rounded aria-label="Notifications" />

      <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
      <button
        class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface2 transition-colors"
        @click="(e) => userMenu.toggle(e)"
      >
        <span class="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
          {{ initials }}
        </span>
        <span class="text-xs font-semibold hidden sm:flex flex-col items-start leading-tight">
          <span class="text-muted">{{ greeting }}</span>
          <span class="text-ink">{{ firstName }}</span>
        </span>
        <i class="pi pi-chevron-down text-[10px] text-muted" />
      </button>
    </div>
  </header>
</template>
