<script setup lang="ts">
interface Tab { label: string; to: string; icon?: string }
defineProps<{ tabs: Tab[] }>()
const route = useRoute()
const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
</script>

<template>
  <nav class="flex gap-1 border-b border-line overflow-x-auto -mx-1 px-1">
    <NuxtLink
      v-for="t in tabs"
      :key="t.to"
      :to="t.to"
      class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors"
      :class="isActive(t.to)
        ? 'border-accent text-accent'
        : 'border-transparent text-light hover:text-ink'"
    >
      <i v-if="t.icon" :class="t.icon" class="text-[13px]" />
      {{ t.label }}
    </NuxtLink>
  </nav>
</template>
