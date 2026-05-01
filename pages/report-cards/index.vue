<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const selExamId = ref<string>('')

const myExams = computed(() => {
  if (!auth.schoolId) return []
  if (auth.role === 'teacher' && auth.user?.classId) {
    return db.examsForClass(auth.user.classId)
  }
  return db.examsForSchool(auth.schoolId)
})
watchEffect(() => {
  if (!selExamId.value && myExams.value.length) selExamId.value = myExams.value[0].id
})

const selExam = computed(() => myExams.value.find((e) => e.id === selExamId.value) ?? null)

const subjects = computed(() =>
  auth.schoolId ? db.subjectsForSchool(auth.schoolId) : [],
)

const studentRows = computed(() => {
  if (!selExam.value) return []
  const classStudents = db.studentsForClass(selExam.value.class_id)
  return classStudents.map((s) => {
    const sMarks = db.marksForExamStudent(selExam.value!.id, s.id)
    const stats = sMarks.length > 0 ? calcReportStats(subjects.value, sMarks) : null
    return { student: s, stats }
  })
})

const subjectAvg = computed(() => {
  if (!selExam.value) return [] as { id: string; name: string; avg: number }[]
  return subjects.value.map((sub) => {
    const all = db.marksForExam(selExam.value!.id).filter((m) => m.subject_id === sub.id)
    if (!all.length) return { id: sub.id, name: sub.name, avg: 0 }
    const max = sub.theory_max + sub.practical_max
    const sum = all.reduce((a, m) => a + ((m.theory + m.practical) / max) * 100, 0)
    return { id: sub.id, name: sub.name, avg: Math.round(sum / all.length) }
  })
})

const gradeDistribution = computed(() => {
  const labels = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'] as const
  return labels.map((g) => ({
    grade: g,
    count: studentRows.value.filter((r) => r.stats?.overall_grade === g).length,
  }))
})

const total = computed(() => studentRows.value.length)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="st-h2 m-0">Report Cards</h2>
        <p class="text-muted text-sm m-0 mt-1">Academic results, grading and parent share.</p>
      </div>
      <NuxtLink v-if="auth.role === 'schooladmin'" to="/report-cards/exams">
        <Button label="Manage Exams" icon="pi pi-cog" severity="secondary" outlined />
      </NuxtLink>
    </div>

    <div class="st-card">
      <p class="font-bold mb-3">Select Examination</p>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="ex in myExams"
          :key="ex.id"
          type="button"
          class="px-4 py-2.5 rounded-ctl border text-sm transition-colors flex flex-col items-start gap-0.5"
          :class="
            selExamId === ex.id
              ? 'bg-accent text-white border-accent font-bold'
              : 'bg-surface text-light border-line hover:text-ink'
          "
          @click="selExamId = ex.id"
        >
          <span>{{ ex.name }}</span>
          <span class="text-[11px] opacity-80">{{ ex.date_label }} · {{ ex.status }}</span>
        </button>
        <span v-if="!myExams.length" class="text-muted text-sm py-2">
          No exams configured yet.
        </span>
      </div>
    </div>

    <div v-if="selExam" class="st-card">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <p class="font-bold m-0">Students — {{ selExam.name }}</p>
          <p class="text-muted text-xs m-0 mt-0.5">{{ total }} students</p>
        </div>
        <div class="flex gap-2">
          <NuxtLink
            v-if="auth.role === 'teacher'"
            :to="`/report-cards/marks/${selExam.id}`"
          >
            <Button label="Enter Marks" icon="pi pi-pencil" severity="warn" />
          </NuxtLink>
        </div>
      </div>

      <DataTable :value="studentRows" responsive-layout="scroll" striped-rows>
        <Column header="Roll">
          <template #body="{ data }">
            <strong>{{ data.student.roll }}</strong>
          </template>
        </Column>
        <Column header="Name">
          <template #body="{ data }">{{ data.student.name }}</template>
        </Column>
        <Column header="Total">
          <template #body="{ data }">
            <span v-if="data.stats">
              <strong>{{ data.stats.total_obtained }}</strong>
              <span class="text-muted text-xs">/{{ data.stats.total_max }}</span>
            </span>
            <span v-else class="text-warn">Pending</span>
          </template>
        </Column>
        <Column header="%">
          <template #body="{ data }">
            <span v-if="data.stats" :class="data.stats.overall_pct >= 60 ? 'text-ok' : 'text-warn'" class="font-bold">
              {{ data.stats.overall_pct }}%
            </span>
            <span v-else>—</span>
          </template>
        </Column>
        <Column header="Grade">
          <template #body="{ data }">
            <Tag v-if="data.stats" :value="data.stats.overall_grade" />
            <span v-else>—</span>
          </template>
        </Column>
        <Column header="CGPA">
          <template #body="{ data }">
            <strong v-if="data.stats">{{ data.stats.cgpa }}</strong>
            <span v-else>—</span>
          </template>
        </Column>
        <Column header="Result">
          <template #body="{ data }">
            <Tag
              v-if="data.stats"
              :value="data.stats.passed ? 'PASS' : 'FAIL'"
              :severity="data.stats.passed ? 'success' : 'danger'"
            />
            <span v-else>—</span>
          </template>
        </Column>
        <Column header="Actions" :style="{ width: '120px' }">
          <template #body="{ data }">
            <NuxtLink v-if="data.stats" :to="`/report-cards/${selExam.id}/${data.student.id}`">
              <Button icon="pi pi-eye" size="small" outlined />
            </NuxtLink>
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="selExam" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="st-card">
        <p class="font-bold mb-4">Grade Distribution</p>
        <div v-for="g in gradeDistribution" :key="g.grade" class="flex items-center gap-3 mb-2.5">
          <span class="w-8 font-extrabold text-accent">{{ g.grade }}</span>
          <ProgressBar :value="total ? (g.count / total) * 100 : 0" :show-value="false" class="flex-1 h-2" />
          <span class="text-muted text-xs w-6 text-right">{{ g.count }}</span>
        </div>
      </div>

      <div class="st-card">
        <p class="font-bold mb-4">Subject-wise Average</p>
        <div v-for="s in subjectAvg" :key="s.id" class="mb-3">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-semibold">{{ s.name }}</span>
            <span :class="s.avg >= 60 ? 'text-ok' : 'text-warn'" class="font-bold text-sm">
              {{ s.avg ? `${s.avg}%` : '—' }}
            </span>
          </div>
          <ProgressBar :value="s.avg" :show-value="false" class="h-1.5" />
        </div>
      </div>
    </div>
  </div>
</template>
