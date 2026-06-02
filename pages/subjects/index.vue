<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()
const toast = useToast()
const confirm = useConfirm()

const sid = computed(() => db.activeSchoolId)
const q = ref('')
const subjects = computed(() => {
  const all = sid.value ? db.subjectsForSchool(sid.value) : []
  const t = q.value.trim().toLowerCase()
  return t ? all.filter((s) => s.name.toLowerCase().includes(t)) : all
})

const showAdd = ref(false)

const remove = (id: string) => {
  const sub = db.subjects.find((x) => x.id === id)
  confirm.require({
    message: sub
      ? `Remove "${sub.name}"? Marks already entered for this subject will be deleted.`
      : 'Remove this subject?',
    header: 'Remove subject',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Remove',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await db.removeSubject(id)
        toastOk(toast, 'Subject removed')
      } catch (e) { toastError(toast, e) }
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="st-h2 m-0">Subjects</h2>
        <p class="text-muted text-sm m-0 mt-1">
          Manage the subjects used for exam marks and report cards.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="sid" class="relative">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input v-model="q" type="text" placeholder="Search subjects…" class="h-10 w-48 pl-10 pr-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accentSoft transition">
        </span>
        <Button label="Add Subject" icon="pi pi-plus" :disabled="!sid" @click="showAdd = true" />
      </div>
    </div>

    <EmptyState
      v-if="!sid"
      icon="pi pi-building"
      title="No school selected"
      description="Pick a school from the top-right switcher to manage its subjects."
    />
    <TableSkeleton v-else-if="db.loading && !db.loaded" :rows="4" :cols="5" />
    <EmptyState
      v-else-if="!subjects.length"
      icon="pi pi-book"
      title="No subjects yet"
      description="Add subjects so teachers can enter marks and the system can grade report cards."
      action-label="Add Subject"
      action-icon="pi pi-plus"
      @action="showAdd = true"
    />
    <SubjectTable v-else :subjects="subjects" @remove="remove" />

    <SubjectAddDialog v-model:visible="showAdd" :school-id="sid" />
  </div>
</template>
