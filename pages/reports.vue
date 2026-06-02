<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()
onMounted(() => db.ensureMarks())

const tab = ref<'class' | 'student' | 'performance'>('class')
const sid = computed(() => db.activeSchoolId)
const classes = computed(() => (sid.value ? db.classesForSchool(sid.value) : []))

// Filters
const today = todayLocal()
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }
const from = ref(daysAgo(90))
const to = ref(today)
const classFilter = ref('')
const q = ref('')

const scopedAtt = computed(() =>
  db.attendance.filter((a) =>
    a.school_id === sid.value && a.date >= from.value && a.date <= to.value &&
    (!classFilter.value || a.class_id === classFilter.value),
  ),
)

// ── Class report ───────────────────────────────────────────────────────────
const byClass = computed(() =>
  classes.value.map((c) => {
    const att = scopedAtt.value.filter((a) => a.class_id === c.id)
    const present = att.filter((a) => a.status === 'present').length
    return { class_name: c.name, total: att.length, present, absent: att.length - present, rate: att.length ? Math.round((present / att.length) * 100) : 0 }
  }),
)
const byClassBars = computed(() => byClass.value.filter((c) => c.total).map((c) => ({ label: c.class_name, value: c.rate })))

// ── Student report ─────────────────────────────────────────────────────────
const byStudent = computed(() => {
  const list = (sid.value ? db.studentsForSchool(sid.value) : []).filter((s) => !classFilter.value || s.class_id === classFilter.value)
  const t = q.value.trim().toLowerCase()
  return list
    .filter((s) => !t || `${s.name} ${s.roll}`.toLowerCase().includes(t))
    .map((s) => {
      const att = scopedAtt.value.filter((a) => a.student_id === s.id)
      const present = att.filter((a) => a.status === 'present').length
      return { id: s.id, name: s.name, roll: s.roll, class_name: db.classMap.get(s.class_id)?.name ?? '—', total: att.length, present, absent: att.length - present, rate: att.length ? Math.round((present / att.length) * 100) : 0 }
    })
})

// ── Performance (marks) ──────────────────────────────────────────────────────
const subjects = computed(() => (sid.value ? db.subjectsForSchool(sid.value) : []))
const perfExams = computed(() => (sid.value ? (classFilter.value ? db.examsForClass(classFilter.value) : db.examsForSchool(sid.value)) : []))
const selExam = ref('')
watchEffect(() => { if (perfExams.value.length && !perfExams.value.some((e) => e.id === selExam.value)) selExam.value = perfExams.value[0].id })
const perfRows = computed(() => {
  const ex = perfExams.value.find((e) => e.id === selExam.value)
  if (!ex) return []
  const t = q.value.trim().toLowerCase()
  return db.studentsForClass(ex.class_id)
    .filter((s) => !t || `${s.name} ${s.roll}`.toLowerCase().includes(t))
    .map((s) => {
      const marks = db.marksForExamStudent(ex.id, s.id)
      const stats = marks.length ? calcReportStats(subjects.value, marks) : null
      return { id: s.id, roll: s.roll, name: s.name, pct: stats?.overall_pct ?? null, grade: stats?.overall_grade ?? '—', cgpa: stats?.cgpa ?? null, passed: stats?.passed ?? null }
    })
})
const subjectAvg = computed(() => {
  const ex = perfExams.value.find((e) => e.id === selExam.value)
  if (!ex) return []
  return subjects.value.map((sub) => {
    const all = db.marksForExam(ex.id).filter((m) => m.subject_id === sub.id)
    if (!all.length) return null
    const max = sub.theory_max + sub.practical_max
    const avg = Math.round(all.reduce((a, m) => a + ((m.theory + m.practical) / max) * 100, 0) / all.length)
    return { label: sub.name, value: avg }
  }).filter((x): x is { label: string; value: number } => x !== null)
})

const exportCsv = () => {
  if (tab.value === 'class') downloadFile(toCsv(byClass.value, ['class_name', 'total', 'present', 'absent', 'rate']), 'class-attendance-report.csv')
  else if (tab.value === 'student') downloadFile(toCsv(byStudent.value.map(({ id, ...r }) => r), ['roll', 'name', 'class_name', 'total', 'present', 'absent', 'rate']), 'student-attendance-report.csv')
  else downloadFile(toCsv(perfRows.value.map(({ id, ...r }) => r), ['roll', 'name', 'pct', 'grade', 'cgpa', 'passed']), 'performance-report.csv')
}
const TABS = [{ k: 'class', l: 'Attendance · by class', i: 'pi pi-th-large' }, { k: 'student', l: 'Attendance · by student', i: 'pi pi-user' }, { k: 'performance', l: 'Performance (marks)', i: 'pi pi-chart-bar' }] as const
const setRange = (n: number) => { from.value = daysAgo(n); to.value = today }
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="st-h2 m-0">Reports &amp; Analytics</h2>
        <p class="text-muted text-sm mt-1">Attendance and performance reports with filters &amp; export.</p>
      </div>
      <Button label="Export CSV" icon="pi pi-download" severity="secondary" outlined @click="exportCsv" />
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-line flex-wrap">
      <button v-for="t in TABS" :key="t.k" type="button" class="px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2"
        :class="tab === t.k ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'" @click="tab = t.k as typeof tab">
        <i :class="t.i" class="text-xs" />{{ t.l }}
      </button>
    </div>

    <!-- Filters -->
    <div class="st-card !p-4 flex flex-wrap items-end gap-3">
      <div class="flex flex-col gap-1">
        <label class="st-label">Class</label>
        <select v-model="classFilter" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent min-w-[150px]">
          <option value="">All classes</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <template v-if="tab !== 'performance'">
        <div class="flex flex-col gap-1"><label class="st-label">From</label><input v-model="from" type="date" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent"></div>
        <div class="flex flex-col gap-1"><label class="st-label">To</label><input v-model="to" type="date" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent"></div>
        <div class="flex gap-1.5"><Button label="30d" size="small" severity="secondary" outlined @click="setRange(30)" /><Button label="90d" size="small" severity="secondary" outlined @click="setRange(90)" /></div>
      </template>
      <div v-if="tab === 'performance'" class="flex flex-col gap-1">
        <label class="st-label">Exam</label>
        <select v-model="selExam" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent min-w-[160px]">
          <option v-for="e in perfExams" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
      </div>
      <div v-if="tab !== 'class'" class="flex flex-col gap-1 flex-1 min-w-[180px]">
        <label class="st-label">Search student</label>
        <input v-model="q" type="text" placeholder="Name or roll…" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </div>
    </div>

    <!-- Class report -->
    <template v-if="tab === 'class'">
      <div class="st-card"><p class="st-h3 mb-4">Attendance rate by class</p><ChartBars :data="byClassBars" unit="%" /></div>
      <div class="st-card !p-0 overflow-hidden">
        <DataTable :value="byClass" responsive-layout="scroll" striped-rows class="!text-sm">
          <Column field="class_name" header="Class" sortable />
          <Column field="total" header="Records" sortable />
          <Column field="present" header="Present" sortable />
          <Column field="absent" header="Absent" sortable />
          <Column header="Rate" sortable><template #body="{ data }"><span :class="data.rate >= 75 ? 'text-ok' : 'text-warn'" class="font-bold">{{ data.total ? `${data.rate}%` : '—' }}</span></template></Column>
        </DataTable>
      </div>
    </template>

    <!-- Student report -->
    <div v-else-if="tab === 'student'" class="st-card !p-0 overflow-hidden">
      <DataTable :value="byStudent" responsive-layout="scroll" striped-rows paginator :rows="15" class="!text-sm">
        <Column field="roll" header="Roll" sortable />
        <Column field="name" header="Name" sortable><template #body="{ data }"><span class="font-semibold">{{ data.name }}</span></template></Column>
        <Column field="class_name" header="Class" sortable />
        <Column field="present" header="Present" sortable />
        <Column field="absent" header="Absent" sortable />
        <Column header="Rate" sortable><template #body="{ data }"><span :class="data.rate >= 75 ? 'text-ok' : 'text-warn'" class="font-bold">{{ data.total ? `${data.rate}%` : '—' }}</span></template></Column>
      </DataTable>
    </div>

    <!-- Performance -->
    <template v-else>
      <div class="st-card"><p class="st-h3 mb-4">Average % by subject</p><ChartBars :data="subjectAvg" unit="%" color="#7c5cff" /></div>
      <div class="st-card !p-0 overflow-hidden">
        <DataTable :value="perfRows" responsive-layout="scroll" striped-rows paginator :rows="15" class="!text-sm">
          <Column field="roll" header="Roll" sortable />
          <Column field="name" header="Name" sortable><template #body="{ data }"><span class="font-semibold">{{ data.name }}</span></template></Column>
          <Column header="%" sortable><template #body="{ data }"><span v-if="data.pct !== null" :class="data.pct >= 60 ? 'text-ok' : 'text-warn'" class="font-bold">{{ data.pct }}%</span><span v-else class="text-warn">Pending</span></template></Column>
          <Column header="Grade"><template #body="{ data }"><Tag v-if="data.pct !== null" :value="data.grade" /><span v-else>—</span></template></Column>
          <Column header="CGPA"><template #body="{ data }">{{ data.cgpa ?? '—' }}</template></Column>
          <Column header="Result"><template #body="{ data }"><Tag v-if="data.passed !== null" :value="data.passed ? 'PASS' : 'FAIL'" :severity="data.passed ? 'success' : 'danger'" /><span v-else>—</span></template></Column>
        </DataTable>
      </div>
    </template>
  </div>
</template>
