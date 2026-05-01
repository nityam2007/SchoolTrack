<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
const route = useRoute()

const examId = computed(() => route.params.examId as string)
const studentId = computed(() => route.params.studentId as string)

const exam = computed(() => db.exams.find((e) => e.id === examId.value) ?? null)
const student = computed(() => db.students.find((s) => s.id === studentId.value) ?? null)
const cls = computed(() =>
  student.value ? db.classes.find((c) => c.id === student.value!.class_id) ?? null : null,
)
const school = computed(() =>
  student.value ? db.schools.find((s) => s.id === student.value!.school_id) ?? null : null,
)
const subjects = computed(() =>
  auth.schoolId ? db.subjectsForSchool(auth.schoolId) : [],
)
const marks = computed(() =>
  exam.value && student.value ? db.marksForExamStudent(exam.value.id, student.value.id) : [],
)

const stats = computed(() =>
  marks.value.length ? calcReportStats(subjects.value, marks.value) : null,
)

const remarks = computed(() => {
  if (!stats.value) return '—'
  const p = stats.value.overall_pct
  if (p >= 75) return 'Excellent performance. Keep up the great work!'
  if (p >= 50) return 'Good effort. Focus on weaker subjects for improvement.'
  return 'Needs improvement. Regular practice and attention recommended.'
})

const handlePrint = () => window.print()
</script>

<template>
  <div v-if="exam && student && stats" class="flex flex-col gap-4 print:gap-0">
    <div class="flex items-center justify-between print:hidden">
      <NuxtLink to="/report-cards">
        <Button label="Back" icon="pi pi-arrow-left" severity="secondary" outlined />
      </NuxtLink>
      <Button label="Print / PDF" icon="pi pi-print" @click="handlePrint" />
    </div>

    <article class="report-card mx-auto bg-white text-[#1a1a2e] rounded shadow-2xl print:shadow-none print:rounded-none">
      <header class="report-header">
        <div class="report-logo">🏫</div>
        <div class="flex-1">
          <h1 class="report-school-name">{{ school?.name }}</h1>
          <p class="report-school-meta">{{ school?.city }}</p>
          <p class="report-school-meta">CBSE · Session 2025–2026</p>
        </div>
        <div class="report-session">
          <span class="report-session-label">Academic Session</span>
          <span class="report-session-value">2025–2026</span>
        </div>
      </header>

      <div class="report-title-bar">
        Progress Report Card — {{ exam.name }}
      </div>

      <div class="p-8">
        <!-- Student Info -->
        <div class="report-student-grid">
          <div><span>Student Name</span><strong>{{ student.name }}</strong></div>
          <div><span>Class & Section</span><strong>{{ cls?.name ?? '—' }}</strong></div>
          <div><span>Roll Number</span><strong>{{ student.roll }}</strong></div>
          <div><span>Date of Birth</span><strong>{{ student.dob ?? '—' }}</strong></div>
          <div><span>Gender</span><strong>{{ student.gender ?? '—' }}</strong></div>
          <div><span>Examination</span><strong>{{ exam.name }}</strong></div>
          <div><span>Father's Name</span><strong>{{ student.father_name ?? '—' }}</strong></div>
          <div><span>Mother's Name</span><strong>{{ student.mother_name ?? '—' }}</strong></div>
          <div><span>Date of Exam</span><strong>{{ exam.date_label || '—' }}</strong></div>
        </div>

        <!-- Marks -->
        <table class="report-marks">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Theory Max</th>
              <th>Theory</th>
              <th>Pract. Max</th>
              <th>Practical</th>
              <th>Total</th>
              <th>Max</th>
              <th>%</th>
              <th>Grade</th>
              <th>GP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in stats.rows" :key="row.subject_id">
              <td class="text-left font-semibold">{{ row.subject_name }}</td>
              <td>{{ subjects.find((s) => s.id === row.subject_id)?.theory_max }}</td>
              <td><strong>{{ row.theory }}</strong></td>
              <td>{{ subjects.find((s) => s.id === row.subject_id)?.practical_max || '—' }}</td>
              <td>
                <strong v-if="subjects.find((s) => s.id === row.subject_id)?.has_practical">{{ row.practical }}</strong>
                <span v-else>—</span>
              </td>
              <td><strong>{{ row.obtained }}</strong></td>
              <td>{{ row.max }}</td>
              <td>{{ row.pct }}%</td>
              <td>
                <span class="report-grade-pill" :style="{ background: row.color + '20', color: row.color }">
                  {{ row.grade }}
                </span>
              </td>
              <td>{{ row.gp }}</td>
              <td :class="row.passed ? 'text-[#2e7d32]' : 'text-[#c62828]'">
                <strong>{{ row.passed ? 'PASS' : 'FAIL' }}</strong>
              </td>
            </tr>
            <tr class="report-totals">
              <td colspan="5" class="text-left">GRAND TOTAL</td>
              <td>{{ stats.total_obtained }}</td>
              <td>{{ stats.total_max }}</td>
              <td>{{ stats.overall_pct }}%</td>
              <td>{{ stats.overall_grade }}</td>
              <td>{{ stats.cgpa }}</td>
              <td>{{ stats.passed ? 'PASS ✓' : 'FAIL ✗' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Summary cards -->
        <div class="report-summary">
          <div>
            <span>Total Marks</span>
            <strong>{{ stats.total_obtained }}/{{ stats.total_max }}</strong>
          </div>
          <div>
            <span>Percentage</span>
            <strong :class="stats.overall_pct >= 60 ? 'text-[#2e7d32]' : 'text-[#c62828]'">
              {{ stats.overall_pct }}%
            </strong>
          </div>
          <div><span>CGPA</span><strong>{{ stats.cgpa }}</strong></div>
          <div>
            <span>Attendance</span>
            <strong :class="student.attendance_pct >= 75 ? 'text-[#2e7d32]' : 'text-[#c62828]'">
              {{ student.attendance_pct }}%
            </strong>
          </div>
        </div>

        <!-- Grading scale -->
        <div class="report-scale">
          <p>Grading Scale</p>
          <span><strong>A+ (90-100)</strong> = 10 GP</span>
          <span><strong>A (80-89)</strong> = 9 GP</span>
          <span><strong>B+ (70-79)</strong> = 8 GP</span>
          <span><strong>B (60-69)</strong> = 7 GP</span>
          <span><strong>C+ (50-59)</strong> = 6 GP</span>
          <span><strong>C (40-49)</strong> = 5 GP</span>
          <span><strong>D (33-39)</strong> = 4 GP</span>
          <span><strong>F (&lt;33)</strong> = 0 GP</span>
        </div>

        <!-- Remarks + Result -->
        <div class="report-remarks-grid">
          <div class="report-remarks">
            <p>Teacher's Remarks</p>
            <p class="italic">{{ remarks }}</p>
          </div>
          <div class="report-result">
            <p>Result</p>
            <h2 :class="stats.passed ? 'text-[#2e7d32]' : 'text-[#c62828]'">
              {{ stats.passed ? 'PROMOTED' : 'DETAINED' }}
            </h2>
            <p class="text-xs text-[#666]">Overall Grade: {{ stats.overall_grade }} · CGPA: {{ stats.cgpa }}</p>
          </div>
        </div>

        <!-- Signatures -->
        <div class="report-signatures">
          <div v-for="role in ['Class Teacher', 'Examination Controller', 'Principal']" :key="role">
            <div class="signature-line" />
            <p>{{ role }}</p>
          </div>
        </div>

        <p class="report-footer">
          This is a computer-generated report card · {{ school?.name }} · Session 2025–2026
        </p>
      </div>
    </article>
  </div>

  <div v-else class="st-card text-muted">Loading report card…</div>
</template>

<style scoped>
.report-card {
  width: 794px;
  max-width: 100%;
  font-family: 'Source Serif 4', 'DM Serif Text', serif;
  background: #fff;
}
.report-header {
  background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%);
  padding: 28px 40px;
  display: flex;
  align-items: center;
  gap: 24px;
  color: #fff;
}
.report-logo {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 36px;
  flex-shrink: 0;
  box-shadow: 0 4px 20px #0004;
}
.report-school-name { font-size: 26px; font-weight: 800; margin: 0; letter-spacing: 0.5px; }
.report-school-meta { color: #BBDEFB; font-size: 12px; margin: 2px 0 0; }
.report-session { background: #ffffff20; border-radius: 8px; padding: 8px 16px; text-align: right; }
.report-session-label { display: block; color: #90CAF9; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
.report-session-value { color: #fff; font-size: 18px; font-weight: 700; }

.report-title-bar {
  background: #E3F2FD;
  border-bottom: 3px solid #1565c0;
  padding: 10px 40px;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: #1565c0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.report-student-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border: 1.5px solid #1565c0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}
.report-student-grid > div {
  padding: 8px 14px;
  border-right: 1px solid #BBDEFB;
  border-bottom: 1px solid #BBDEFB;
}
.report-student-grid > div:nth-child(3n) { border-right: none; }
.report-student-grid > div:nth-child(n+7) { border-bottom: none; }
.report-student-grid span {
  display: block;
  font-size: 10px;
  font-weight: 700;
  color: #1565c0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
}
.report-student-grid strong { font-size: 14px; color: #1a1a2e; }

.report-marks { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
.report-marks thead tr { background: #1565c0; }
.report-marks th { color: #fff; font-weight: 700; font-size: 11px; padding: 9px 8px; text-align: center; }
.report-marks td { padding: 8px; text-align: center; border-bottom: 1px solid #E3F2FD; color: #1a1a2e; }
.report-marks tbody tr:nth-child(even) { background: #F8FAFE; }
.report-marks .report-totals { background: #1565c0; color: #fff; font-weight: 800; }
.report-marks .report-totals td { color: #fff; }
.report-grade-pill { padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 13px; }

.report-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.report-summary > div {
  border: 2px solid #1565c020;
  border-radius: 10px;
  padding: 12px 16px;
  text-align: center;
  background: #1565c008;
}
.report-summary span { display: block; font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
.report-summary strong { font-size: 22px; font-weight: 800; color: #1565c0; font-family: 'Playfair Display', serif; }

.report-scale {
  background: #F8FAFE;
  border: 1px solid #BBDEFB;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 11px;
  color: #444;
}
.report-scale p { font-weight: 700; color: #1565c0; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px; }
.report-scale span { display: inline-block; margin-right: 16px; }

.report-remarks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
.report-remarks, .report-result { border: 1px solid #BBDEFB; border-radius: 8px; padding: 14px; }
.report-remarks p:first-child, .report-result p:first-child {
  font-size: 11px; font-weight: 700; color: #1565c0; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;
}
.report-remarks .italic { font-size: 13px; color: #333; min-height: 48px; }
.report-result h2 { font-size: 28px; font-weight: 800; font-family: 'Playfair Display', serif; margin: 0; }

.report-signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; border-top: 1px solid #BBDEFB; padding-top: 16px; }
.report-signatures > div { text-align: center; }
.signature-line { border-bottom: 1.5px solid #1a1a2e; margin: 0 20px 6px; height: 36px; }
.report-signatures p { font-size: 12px; font-weight: 700; color: #1565c0; }

.report-footer { text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #E3F2FD; font-size: 10px; color: #aaa; }

@media print {
  .report-card { width: 100%; box-shadow: none; }
  @page { size: A4; margin: 12mm; }
}
</style>
