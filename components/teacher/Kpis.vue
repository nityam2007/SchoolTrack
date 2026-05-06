<script setup lang="ts">
import type { Class } from '~/types/database'
defineProps<{
  cls: Class | null
  roster: number
  todayAttendance: { present: number; absent: number; total: number } | null
  last30: { rate: number; total: number }
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard label="Class" :value="cls?.name ?? 'Unassigned'" :tone="cls ? 'accent' : 'warn'" icon="pi pi-th-large" />
    <StatCard label="Roster" :value="roster" tone="violet" icon="pi pi-users" />
    <StatCard
      label="Today's attendance"
      :value="todayAttendance ? `${todayAttendance.present}/${todayAttendance.total}` : 'Not marked'"
      :sub="todayAttendance ? `${todayAttendance.absent} absent` : 'pending'"
      :tone="todayAttendance ? 'ok' : 'warn'"
      icon="pi pi-check-square"
    />
    <StatCard
      label="30-day rate"
      :value="last30.total ? `${last30.rate}%` : '—'"
      :sub="`${last30.total} records`"
      :tone="last30.rate >= 75 ? 'ok' : 'warn'"
      icon="pi pi-percentage"
    />
  </div>
</template>
