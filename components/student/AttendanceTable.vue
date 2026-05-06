<script setup lang="ts">
import type { Attendance } from '~/types/database'
defineProps<{ records: Attendance[]; last30: number }>()
const fmtDate = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="st-card">
    <div class="flex items-center justify-between mb-4">
      <p class="st-h3 m-0">Attendance history</p>
      <span class="text-muted text-xs">{{ last30 }} records in last 30 days</span>
    </div>
    <EmptyState
      v-if="!records.length"
      icon="pi pi-calendar"
      title="No attendance recorded"
      description="Once teachers begin marking attendance, daily entries will appear here."
    />
    <DataTable v-else :value="records" responsive-layout="scroll" striped-rows paginator :rows="10">
      <Column field="date" header="Date" sortable>
        <template #body="{ data }">
          <span class="font-semibold tabular-nums">{{ fmtDate.format(new Date(data.date)) }}</span>
        </template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="data.status" :severity="data.status === 'present' ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column header="Photo">
        <template #body="{ data }">
          <Tag :value="data.photo ? 'Captured' : 'Missing'" :severity="data.photo ? 'success' : 'warn'" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
