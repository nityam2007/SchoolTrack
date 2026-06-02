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
  <aside class="w-[244px] shrink-0 bg-surface border-r border-line flex flex-col px-4 py-5 gap-1">
    <!-- Brand -->
    <NuxtLink to="/dashboard" class="flex items-center gap-2.5 mb-5 px-1">
      <div class="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-[0_4px_12px_-2px_rgba(18,109,251,0.5)]">
        <i class="pi pi-bookmark-fill text-white text-sm" />
      </div>
      <span class="font-bold font-display text-[18px] tracking-tight text-ink">SchoolTrack</span>
    </NuxtLink>

    <!-- Search -->
    <div class="relative mb-4">
      <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
      <input
        type="text"
        placeholder="Search"
        class="w-full h-10 pl-10 pr-3 rounded-ctl bg-surface border border-line text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accentSoft transition"
      >
    </div>

    <nav class="flex flex-col gap-0.5 overflow-y-auto">
      <NuxtLink
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="group flex items-center gap-3 h-[42px] px-3 rounded-ctl text-[14px] font-medium transition-colors"
        :class="
          isActive(item.to)
            ? 'bg-accentSoft text-accent font-semibold'
            : 'text-light hover:bg-surface2 hover:text-ink'
        "
      >
        <i
          :class="[item.icon, 'text-[16px] w-5 text-center', isActive(item.to) ? 'text-accent' : 'text-muted group-hover:text-light']"
        />
        <span class="flex-1">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- User block -->
    <div class="mt-auto pt-4">
      <div class="flex items-center gap-3 px-1 mb-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 text-white"
          :class="roleMeta.avatar"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[14px] font-semibold truncate m-0 leading-tight text-ink">{{ auth.user?.name }}</p>
          <p class="text-[11px] text-muted truncate m-0 mt-0.5">{{ roleMeta.label }}</p>
        </div>
      </div>
      <button
        type="button"
        class="flex items-center gap-3 h-9 px-3 w-full rounded-ctl text-[13.5px] font-semibold text-accent hover:bg-accentSoft transition-colors"
        @click="onLogout"
      >
        <i class="pi pi-sign-out text-[16px] w-5 text-center" />
        <span>Log out</span>
      </button>
    </div>
  </aside>
</template>
