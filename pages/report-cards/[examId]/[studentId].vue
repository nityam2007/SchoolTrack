<script setup lang="ts">
import { REPORT_TEMPLATES } from '~/composables/useReportTemplate'

const db = useDbStore()
const route = useRoute()

// Marks are lazy-loaded (not part of the eager startup load).
onMounted(() => db.ensureMarks())

const { template, setTemplate } = useReportTemplate()

const examId = computed(() => route.params.examId as string)
const studentId = computed(() => route.params.studentId as string)

const exam = computed(() => db.exams.find((e) => e.id === examId.value) ?? null)
const student = computed(() => db.students.find((s) => s.id === studentId.value) ?? null)
const cls = computed(() => (student.value ? db.classes.find((c) => c.id === student.value!.class_id) ?? null : null))
const school = computed(() => (student.value ? db.schools.find((s) => s.id === student.value!.school_id) ?? null : null))
const subjects = computed(() => (db.activeSchoolId ? db.subjectsForSchool(db.activeSchoolId) : []))
const marks = computed(() => (exam.value && student.value ? db.marksForExamStudent(exam.value.id, student.value.id) : []))
const stats = computed(() => (marks.value.length ? calcReportStats(subjects.value, marks.value) : null))

const handlePrint = () => window.print()
</script>

<template>
  <div v-if="exam && student && stats" class="flex flex-col gap-4 print:gap-0">
    <div class="flex items-center justify-between gap-3 flex-wrap print:hidden">
      <NuxtLink to="/report-cards">
        <Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined />
      </NuxtLink>
      <div class="flex items-center gap-2">
        <span class="text-muted text-xs hidden sm:inline">Template</span>
        <select
          :value="template"
          class="h-9 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent"
          @change="setTemplate(($event.target as HTMLSelectElement).value as any)"
        >
          <option v-for="t in REPORT_TEMPLATES" :key="t.id" :value="t.id">{{ t.label }}</option>
        </select>
        <Button label="Download PDF" icon="pi pi-print" @click="handlePrint" />
      </div>
    </div>

    <ReportCard :exam="exam" :student="student" :cls="cls" :school="school" :subjects="subjects" :stats="stats" :template="template" />
  </div>

  <div v-else class="st-card text-muted">Loading report card…</div>
</template>
