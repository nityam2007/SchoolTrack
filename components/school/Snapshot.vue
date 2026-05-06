<script setup lang="ts">
defineProps<{
  totalRecords: number
  presentRate: number
  absentees7d: number
  messages: number
}>()
</script>

<template>
  <div class="st-card lg:col-span-2">
    <p class="st-h3 mb-4">Operational snapshot</p>
    <div class="grid grid-cols-3 gap-4">
      <div>
        <p class="st-label">Attendance rate</p>
        <p class="text-3xl font-extrabold font-display tabular-nums" :class="presentRate >= 80 ? 'text-ok' : 'text-warn'">
          {{ totalRecords ? `${presentRate}%` : '—' }}
        </p>
        <p class="text-xs text-muted">{{ totalRecords }} records on file</p>
      </div>
      <div>
        <p class="st-label">Absentees last 7d</p>
        <p class="text-3xl font-extrabold font-display tabular-nums text-danger">{{ absentees7d }}</p>
      </div>
      <div>
        <p class="st-label">Messages sent</p>
        <p class="text-3xl font-extrabold font-display tabular-nums text-accent">{{ messages }}</p>
        <p class="text-xs text-muted">lifetime</p>
      </div>
    </div>
  </div>
</template>
