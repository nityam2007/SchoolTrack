<script setup lang="ts">
import type { Exam, ExamStatus } from '~/types/database'

const db = useDbStore()
const toast = useToast()
const confirm = useConfirm()

definePageMeta({ middleware: ['principal-only'] })

const sid = computed(() => db.activeSchoolId)

const showNew = ref(false)
const form = reactive<Partial<Exam>>({
  name: '', class_id: '', date_label: '', session: '2025-26', max_marks: 100, status: 'upcoming',
})

const PRESETS = ['Unit Test 1', 'Unit Test 2', 'Half Yearly', 'Pre-Final', 'Final Examination', 'Sessional']

const classes = computed(() => (sid.value ? db.classesForSchool(sid.value) : []))
const exams = computed(() => (sid.value ? db.examsForSchool(sid.value) : []))

const subjectsCount = computed(() => (sid.value ? db.subjectsForSchool(sid.value).length : 0))

const create = async () => {
  if (!sid.value || !form.name || !form.class_id) {
    toast.add({ severity: 'warn', summary: 'Name and class are required', life: 3000 })
    return
  }
  try {
    await db.addExam({
      id: makeId('EX'),
      school_id: sid.value,
      class_id: form.class_id!,
      name: form.name!,
      date_label: form.date_label ?? '',
      session: form.session ?? '2025-26',
      max_marks: Number(form.max_marks ?? 100),
      status: 'upcoming',
    })
    toastOk(toast, 'Exam created')
    showNew.value = false
    Object.assign(form, { name: '', class_id: '', date_label: '', session: '2025-26', max_marks: 100 })
  } catch (e) {
    toastError(toast, e)
  }
}

const cycleStatus = async (e: Exam) => {
  const next: Record<ExamStatus, ExamStatus> = { upcoming: 'open', open: 'closed', closed: 'upcoming' }
  try { await db.updateExam(e.id, { status: next[e.status] }) }
  catch (err) { toastError(toast, err) }
}

const cycleLabel = (s: ExamStatus) =>
  s === 'upcoming' ? 'Open for Entry' : s === 'open' ? 'Close Exam' : 'Re-open'

const removeExam = (e: Exam) => {
  confirm.require({
    message: `Delete exam "${e.name}"? All marks entered for this exam will be lost. Cannot be undone.`,
    header: 'Delete exam',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await db.removeExam(e.id)
        toastOk(toast, 'Exam deleted')
      } catch (err) { toastError(toast, err) }
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/report-cards">
          <Button icon="pi pi-arrow-left" severity="secondary" text />
        </NuxtLink>
        <h2 class="st-h2 m-0">Exam Setup</h2>
      </div>
      <Button label="New Exam" icon="pi pi-plus" @click="showNew = true" />
    </div>

    <Dialog v-model:visible="showNew" modal header="Create Exam" :style="{ width: '560px' }">
      <div class="flex flex-col gap-3">
        <div>
          <p class="text-xs text-muted font-semibold mb-2">Quick presets</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in PRESETS"
              :key="p"
              type="button"
              class="px-3 py-1.5 rounded-lg border text-xs"
              :class="form.name === p ? 'bg-accent border-accent text-white font-bold' : 'bg-surface border-line text-light'"
              @click="form.name = p"
            >
              {{ p }}
            </button>
          </div>
        </div>
        <InputText v-model="form.name" placeholder="Exam Name *" />
        <Dropdown v-model="form.class_id" :options="classes" option-value="id" option-label="name" placeholder="Class *" />
        <InputText v-model="form.date_label" placeholder="Date / Month (e.g. July 2025)" />
        <InputText v-model="form.session" placeholder="Session (e.g. 2025-26)" />
        <InputNumber v-model="form.max_marks" placeholder="Max Marks" :min="0" />
        <Button label="Create Exam" @click="create" />
      </div>
    </Dialog>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="ex in exams" :key="ex.id" class="st-card flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-extrabold m-0">{{ ex.name }}</p>
            <p class="text-muted text-xs m-0 mt-0.5">
              Session {{ ex.session }} · {{ ex.date_label || 'TBD' }}
            </p>
          </div>
          <Tag
            :value="ex.status.toUpperCase()"
            :severity="ex.status === 'open' ? 'success' : ex.status === 'closed' ? 'secondary' : 'warn'"
          />
        </div>
        <div class="bg-surface rounded-ctl p-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p class="text-muted text-[11px] m-0">Class</p>
            <p class="font-bold m-0">
              {{ classes.find((c) => c.id === ex.class_id)?.name ?? '—' }}
            </p>
          </div>
          <div>
            <p class="text-muted text-[11px] m-0">Subjects</p>
            <p class="font-bold m-0">{{ subjectsCount }}</p>
          </div>
          <div>
            <p class="text-muted text-[11px] m-0">Max Marks</p>
            <p class="font-bold m-0">{{ ex.max_marks }}</p>
          </div>
          <div>
            <p class="text-muted text-[11px] m-0">Marks Entered</p>
            <p class="font-bold m-0">
              {{ db.marksForExam(ex.id).length }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <Button
            :label="cycleLabel(ex.status)"
            :severity="ex.status === 'open' ? 'success' : ex.status === 'closed' ? 'secondary' : 'warn'"
            class="flex-1"
            size="small"
            @click="cycleStatus(ex)"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            outlined
            size="small"
            aria-label="Delete exam"
            @click="removeExam(ex)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
