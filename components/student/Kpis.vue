<script setup lang="ts">
import type { Class } from '~/types/database'
defineProps<{
  stats: { present: number; absent: number; total: number; rate: number }
  cls: Class | null
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard label="Attendance" :value="stats.total ? `${stats.rate}%` : '—'" :sub="stats.total ? `${stats.total} records` : 'no data'" :tone="stats.rate >= 75 ? 'ok' : 'warn'" icon="pi pi-percentage" />
    <StatCard label="Present" :value="stats.present" tone="ok"     icon="pi pi-check" />
    <StatCard label="Absent"  :value="stats.absent"  tone="danger" icon="pi pi-times" />
    <StatCard label="Class"   :value="cls?.name ?? '—'" tone="accent" icon="pi pi-th-large" />
  </div>
</template>
