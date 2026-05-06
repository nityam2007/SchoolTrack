<script setup lang="ts">
import type { Marks } from '~/types/database'

const db = useDbStore()
const route = useRoute()
const toast = useToast()

const examId = computed(() => route.params.examId as string)
const exam = computed(() => db.exams.find((e) => e.id === examId.value) ?? null)
const subjects = computed(() => (db.activeSchoolId ? db.subjectsForSchool(db.activeSchoolId) : []))
const roster = computed(() =>
  exam.value ? db.studentsForClass(exam.value.class_id) : [],
)

const selStudentId = ref<string>('')
watchEffect(() => {
  if (!selStudentId.value && roster.value.length) selStudentId.value = roster.value[0].id
})
const selStudent = computed(() => roster.value.find((s) => s.id === selStudentId.value) ?? null)

// Working copy of marks: { [subjectId]: { theory, practical } }
const draft = ref<Record<string, { theory: number; practical: number }>>({})

const loadDraft = () => {
  if (!exam.value || !selStudentId.value) return
  const saved = db.marksForExamStudent(exam.value.id, selStudentId.value)
  const next: typeof draft.value = {}
  for (const sub of subjects.value) {
    const m = saved.find((x) => x.subject_id === sub.id)
    next[sub.id] = { theory: m?.theory ?? 0, practical: m?.practical ?? 0 }
  }
  draft.value = next
}
watch([selStudentId, () => exam.value?.id, () => subjects.value.length], loadDraft, { immediate: true })

const stats = computed(() => calcReportStats(subjects.value, Object.entries(draft.value).map(([subject_id, v]) => ({
  id: '', school_id: db.activeSchoolId ?? '', exam_id: examId.value, student_id: selStudentId.value, subject_id, theory: v.theory, practical: v.practical,
})) as unknown as Marks[]))

const saving = ref(false)
const save = async () => {
  if (!exam.value || !selStudentId.value || !db.activeSchoolId) return
  const rows = subjects.value.map((sub) => ({
    school_id: db.activeSchoolId!,
    exam_id: exam.value!.id,
    student_id: selStudentId.value,
    subject_id: sub.id,
    theory: Number(draft.value[sub.id]?.theory ?? 0),
    practical: Number(draft.value[sub.id]?.practical ?? 0),
  }))
  saving.value = true
  try {
    await db.upsertMarks(rows)
    toastOk(toast, 'Marks saved')
  } catch (e) {
    toastError(toast, e)
  } finally {
    saving.value = false
  }
}

const clamp = (n: number, max: number) => Math.max(0, Math.min(max, Number.isFinite(n) ? n : 0))
</script>

<template>
  <div v-if="exam" class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <NuxtLink to="/report-cards">
          <Button icon="pi pi-arrow-left" severity="secondary" text />
        </NuxtLink>
        <div>
          <h2 class="st-h2 m-0">Enter Marks — {{ exam.name }}</h2>
          <p class="text-muted text-sm m-0 mt-0.5">{{ exam.date_label }}</p>
        </div>
      </div>
      <Button label="Save Marks" icon="pi pi-save" :loading="saving" @click="save" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
      <!-- Roster -->
      <div class="st-card">
        <p class="st-label mb-3">Students</p>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="s in roster"
            :key="s.id"
            type="button"
            class="text-left px-3 py-2.5 rounded-ctl border transition-colors"
            :class="
              selStudentId === s.id
                ? 'bg-accentGlow border-accent text-accent font-bold'
                : 'border-line text-light hover:text-ink'
            "
            @click="selStudentId = s.id"
          >
            <span class="font-semibold">{{ s.roll }} — {{ s.name }}</span>
          </button>
        </div>
      </div>

      <!-- Marks form -->
      <div v-if="selStudent" class="st-card">
        <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <p class="font-extrabold text-base m-0">{{ selStudent.name }}</p>
            <p class="text-muted text-sm m-0">Roll {{ selStudent.roll }}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-extrabold text-accent">
              {{ stats.total_obtained }}<span class="text-muted text-sm">/{{ stats.total_max }}</span>
            </div>
            <div class="text-xs text-muted">{{ stats.overall_pct }}% · Grade {{ stats.overall_grade }}</div>
          </div>
        </div>

        <DataTable :value="subjects" responsive-layout="scroll" striped-rows>
          <Column field="name" header="Subject" />
          <Column header="Theory Max">
            <template #body="{ data }">{{ data.theory_max }}</template>
          </Column>
          <Column header="Theory">
            <template #body="{ data }">
              <InputNumber
                :model-value="draft[data.id]?.theory"
                :min="0"
                :max="data.theory_max"
                input-class="w-20 text-center"
                show-buttons
                @update:model-value="
                  (v) => (draft[data.id] = { ...draft[data.id], theory: clamp(v ?? 0, data.theory_max) })
                "
              />
            </template>
          </Column>
          <Column header="Pract. Max">
            <template #body="{ data }">{{ data.has_practical ? data.practical_max : '—' }}</template>
          </Column>
          <Column header="Practical">
            <template #body="{ data }">
              <InputNumber
                v-if="data.has_practical"
                :model-value="draft[data.id]?.practical"
                :min="0"
                :max="data.practical_max"
                input-class="w-20 text-center"
                show-buttons
                @update:model-value="
                  (v) => (draft[data.id] = { ...draft[data.id], practical: clamp(v ?? 0, data.practical_max) })
                "
              />
              <span v-else class="text-muted">—</span>
            </template>
          </Column>
          <Column header="Total" sortable>
            <template #body="{ data }">
              <strong>
                {{ (draft[data.id]?.theory ?? 0) + (draft[data.id]?.practical ?? 0) }}
              </strong>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
  <div v-else class="st-card text-muted">Loading exam…</div>
</template>
