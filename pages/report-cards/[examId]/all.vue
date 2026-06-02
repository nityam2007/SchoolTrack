<script setup lang="ts">
const db = useDbStore()
const route = useRoute()
onMounted(() => db.ensureMarks())

const { template } = useReportTemplate()
const examId = computed(() => route.params.examId as string)
const exam = computed(() => db.exams.find((e) => e.id === examId.value) ?? null)
const school = computed(() => (exam.value ? db.schools.find((s) => s.id === exam.value!.school_id) ?? null : null))
const subjects = computed(() => (exam.value ? db.subjectsForSchool(exam.value.school_id) : []))

// Every student in the exam's class who has marks, with computed stats.
const cards = computed(() => {
  if (!exam.value) return []
  return db.studentsForClass(exam.value.class_id)
    .map((student) => {
      const marks = db.marksForExamStudent(exam.value!.id, student.id)
      if (!marks.length) return null
      return {
        student,
        cls: db.classMap.get(student.class_id) ?? null,
        stats: calcReportStats(subjects.value, marks),
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
})

const printAll = () => window.print()
</script>

<template>
  <div v-if="exam" class="flex flex-col gap-6 print:gap-0">
    <div class="flex items-center justify-between gap-3 flex-wrap print:hidden">
      <div>
        <NuxtLink :to="`/report-cards`"><Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined /></NuxtLink>
      </div>
      <div class="text-center">
        <p class="font-bold m-0">{{ exam.name }} — all report cards</p>
        <p class="text-muted text-xs m-0">{{ cards.length }} card(s) with marks · use “Save as PDF” in the print dialog</p>
      </div>
      <Button label="Download all (PDF)" icon="pi pi-print" :disabled="!cards.length" @click="printAll" />
    </div>

    <div v-if="!cards.length" class="st-card text-center text-muted py-12 print:hidden">
      No marks entered for this exam yet.
    </div>

    <div class="flex flex-col gap-8 print:gap-0">
      <div v-for="c in cards" :key="c.student.id" class="report-page">
        <ReportCard :exam="exam" :student="c.student" :cls="c.cls" :school="school" :subjects="subjects" :stats="c.stats" :template="template" />
      </div>
    </div>
  </div>
  <div v-else class="st-card text-muted">Loading…</div>
</template>

<style scoped>
@media print {
  .report-page { break-after: page; }
  .report-page:last-child { break-after: auto; }
}
</style>
