<script setup lang="ts">
import type { Teacher } from '~/types/database'
defineProps<{ teacher: Teacher }>()
</script>

<template>
  <div class="st-card">
    <p class="st-h3 mb-4">Contact</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
      <div>
        <p class="st-label mb-0.5">Email</p>
        <p class="m-0 font-mono">{{ teacher.email }}</p>
      </div>
      <div>
        <p class="st-label mb-0.5">Phone</p>
        <p class="m-0 font-mono">{{ teacher.phone || '—' }}</p>
      </div>
    </div>
  </div>
</template>
