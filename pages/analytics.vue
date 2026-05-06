<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })

const db = useDbStore()

const totals = computed(() => {
  const att = db.attendance
  const present = att.filter((a) => a.status === 'present').length
  const absent = att.filter((a) => a.status === 'absent').length
  const total = att.length
  const rate = total ? Math.round((present / total) * 100) : 0
  return { present, absent, total, rate }
})

const bySchool = computed(() =>
  db.schools.map((s) => {
    const att = db.attendance.filter((a) => a.school_id === s.id)
    const present = att.filter((a) => a.status === 'present').length
    return {
      id: s.id,
      name: s.name,
      city: s.city,
      records: att.length,
      rate: att.length ? Math.round((present / att.length) * 100) : 0,
    }
  }),
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">Platform Analytics</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Records" :value="totals.total" tone="accent" icon="pi pi-database" />
      <StatCard label="Present" :value="totals.present" tone="ok" icon="pi pi-check" />
      <StatCard label="Absent" :value="totals.absent" tone="danger" icon="pi pi-times" />
      <StatCard label="Attendance Rate" :value="`${totals.rate}%`" tone="warn" icon="pi pi-percentage" />
    </div>
    <div class="st-card">
      <p class="font-bold mb-4">Attendance by School</p>
      <div v-for="s in bySchool" :key="s.id" class="mb-5">
        <div class="flex items-center justify-between mb-1.5">
          <div>
            <span class="font-semibold">{{ s.name }}</span>
            <span class="text-muted text-xs ml-2">{{ s.city }}</span>
          </div>
          <span :class="s.rate >= 75 ? 'text-ok' : 'text-warn'" class="font-bold text-sm">
            {{ s.records ? `${s.rate}%` : '—' }}
          </span>
        </div>
        <ProgressBar :value="s.rate" class="h-1.5" />
      </div>
    </div>
  </div>
</template>
