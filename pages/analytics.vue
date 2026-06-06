<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })

const db = useDbStore()
onMounted(() => db.ensureMarks())

// ── Filters ────────────────────────────────────────────────────────────────
const school = ref<string>('') // '' = all schools
const today = todayLocal()
const daysAgo = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
const from = ref(daysAgo(30))
const to = ref(today)

const schoolOptions = computed(() => [{ id: '', name: 'All schools' }, ...db.schools])

const att = computed(() =>
  db.attendance.filter((a) =>
    (!school.value || a.school_id === school.value) && a.date >= from.value && a.date <= to.value,
  ),
)

const totals = computed(() => {
  const present = att.value.filter((a) => a.status === 'present').length
  const absent = att.value.filter((a) => a.status === 'absent').length
  const total = att.value.length
  return { present, absent, total, rate: total ? Math.round((present / total) * 100) : 0 }
})

// Daily attendance-rate trend.
const trend = computed(() => {
  const byDate = new Map<string, { p: number; t: number }>()
  for (const a of att.value) {
    const e = byDate.get(a.date) ?? { p: 0, t: 0 }
    e.t++; if (a.status === 'present') e.p++
    byDate.set(a.date, e)
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-21)
    .map(([date, v]) => ({ label: date.slice(5), value: v.t ? Math.round((v.p / v.t) * 100) : 0 }))
})

// Attendance rate by school (when viewing all).
const bySchool = computed(() =>
  db.schools.map((s) => {
    const a = att.value.filter((x) => x.school_id === s.id)
    const present = a.filter((x) => x.status === 'present').length
    return { id: s.id, name: s.name, city: s.city, records: a.length, rate: a.length ? Math.round((present / a.length) * 100) : 0 }
  }).filter((s) => s.records),
)
const bySchoolBars = computed(() => bySchool.value.map((s) => ({ label: s.name, value: s.rate })))

// Marks performance — average % per subject (needs marks; lazy-loaded).
const perf = computed(() => {
  const marks = db.marks.filter((m) => !school.value || m.school_id === school.value)
  if (!marks.length) return []
  const subj = new Map(db.subjects.map((s) => [s.id, s]))
  const agg = new Map<string, { name: string; sum: number; n: number }>()
  for (const m of marks) {
    const s = subj.get(m.subject_id)
    if (!s) continue
    const max = s.theory_max + s.practical_max
    if (!max) continue
    const pct = ((m.theory + m.practical) / max) * 100
    const e = agg.get(s.id) ?? { name: s.name, sum: 0, n: 0 }
    e.sum += pct; e.n++
    agg.set(s.id, e)
  }
  return [...agg.values()].map((e) => ({ label: e.name, value: Math.round(e.sum / e.n) })).sort((a, b) => b.value - a.value)
})

const exportCsv = () => {
  downloadFile(
    toCsv(bySchool.value.map((s) => ({ school: s.name, city: s.city, records: s.records, attendance_rate: s.rate })),
      ['school', 'city', 'records', 'attendance_rate']),
    'analytics-by-school.csv',
  )
}
const setRange = (n: number) => { from.value = daysAgo(n); to.value = today }
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="st-h2 m-0">Analytics</h2>
        <p class="text-muted text-sm mt-1">Attendance &amp; performance across the platform</p>
      </div>
      <div class="flex items-center gap-2 print:hidden">
        <Button label="Export" icon="pi pi-download" severity="secondary" outlined @click="exportCsv" />
        <Button label="Print / PDF" icon="pi pi-print" severity="secondary" outlined @click="printPage" />
      </div>
    </div>

    <!-- Filters -->
    <div class="st-card !p-4 flex flex-wrap items-end gap-3 print:hidden">
      <div class="flex flex-col gap-1">
        <label class="st-label">School</label>
        <select v-model="school" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent min-w-[180px]">
          <option v-for="s in schoolOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">From</label>
        <input v-model="from" type="date" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">To</label>
        <input v-model="to" type="date" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </div>
      <div class="flex gap-1.5">
        <Button label="7d" size="small" severity="secondary" outlined @click="setRange(7)" />
        <Button label="30d" size="small" severity="secondary" outlined @click="setRange(30)" />
        <Button label="90d" size="small" severity="secondary" outlined @click="setRange(90)" />
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard label="Records" :value="totals.total" tone="accent" icon="pi pi-database" />
      <StatCard label="Present" :value="totals.present" tone="ok" icon="pi pi-check" />
      <StatCard label="Absent" :value="totals.absent" tone="danger" icon="pi pi-times" />
      <StatCard label="Attendance rate" :value="`${totals.rate}%`" tone="warn" icon="pi pi-percentage" />
    </div>

    <!-- Trend + by-school -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="st-card">
        <p class="st-h3 mb-2">Attendance rate trend</p>
        <ChartLine v-if="trend.length" :points="trend" unit="%" :height="220" />
        <p v-else class="text-muted text-sm py-10 text-center">No attendance in this range.</p>
      </div>
      <div class="st-card">
        <p class="st-h3 mb-4">Attendance rate by school</p>
        <ChartBars :data="bySchoolBars" unit="%" />
      </div>
    </div>

    <!-- Performance -->
    <div class="st-card">
      <p class="st-h3 mb-4">Average performance by subject</p>
      <ChartBars v-if="perf.length" :data="perf" unit="%" color="#7c5cff" />
      <p v-else class="text-muted text-sm py-8 text-center">No marks recorded in this scope yet.</p>
    </div>
  </div>
</template>
