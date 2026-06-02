<script setup lang="ts">
import type { Attendance } from '~/types/database'
const props = defineProps<{ records: Attendance[]; last30: number }>()
const fmtDate = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

const status = ref<'all' | 'present' | 'absent'>('all')
const from = ref('')
const to = ref('')

const filtered = computed(() =>
  props.records.filter((r) => {
    if (status.value !== 'all' && r.status !== status.value) return false
    if (from.value && r.date < from.value) return false
    if (to.value && r.date > to.value) return false
    return true
  }),
)
const summary = computed(() => {
  const present = filtered.value.filter((r) => r.status === 'present').length
  const total = filtered.value.length
  return { present, absent: total - present, total, rate: total ? Math.round((present / total) * 100) : 0 }
})
const exportCsv = () => {
  downloadFile(
    toCsv(filtered.value.map((r) => ({ date: r.date, status: r.status, photo: r.photo ? 'yes' : 'no' })), ['date', 'status', 'photo']),
    'attendance.csv',
  )
}
const reset = () => { status.value = 'all'; from.value = ''; to.value = '' }
</script>

<template>
  <div class="st-card">
    <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
      <div>
        <p class="st-h3 m-0">Attendance history</p>
        <p class="text-muted text-xs mt-1">
          {{ summary.total }} record(s) · <span class="text-ok">{{ summary.present }} present</span>
          · <span class="text-danger">{{ summary.absent }} absent</span> · {{ summary.rate }}% rate
          <span class="opacity-60">· {{ last30 }} in last 30d</span>
        </p>
      </div>
      <Button label="Export" icon="pi pi-download" severity="secondary" outlined size="small" @click="exportCsv" />
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-end gap-3 mb-4">
      <div class="flex flex-col gap-1">
        <label class="st-label">Status</label>
        <SelectButton v-model="status" :options="[{ l: 'All', v: 'all' }, { l: 'Present', v: 'present' }, { l: 'Absent', v: 'absent' }]" option-label="l" option-value="v" :allow-empty="false" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">From</label>
        <input v-model="from" type="date" class="h-9 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">To</label>
        <input v-model="to" type="date" class="h-9 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </div>
      <Button v-if="status !== 'all' || from || to" label="Clear" icon="pi pi-times" text size="small" @click="reset" />
    </div>

    <EmptyState
      v-if="!filtered.length"
      icon="pi pi-calendar"
      :title="records.length ? 'No records match the filters' : 'No attendance recorded'"
      description="Daily entries appear here once teachers mark attendance."
    />
    <DataTable v-else :value="filtered" responsive-layout="scroll" striped-rows paginator :rows="12">
      <Column field="date" header="Date" sortable>
        <template #body="{ data }"><span class="font-semibold tabular-nums">{{ fmtDate.format(new Date(data.date)) }}</span></template>
      </Column>
      <Column header="Status">
        <template #body="{ data }"><Tag :value="data.status" :severity="data.status === 'present' ? 'success' : 'danger'" /></template>
      </Column>
      <Column header="Photo">
        <template #body="{ data }"><Tag :value="data.photo ? 'Captured' : 'Missing'" :severity="data.photo ? 'success' : 'warn'" /></template>
      </Column>
    </DataTable>
  </div>
</template>
