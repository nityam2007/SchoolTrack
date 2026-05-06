<script setup lang="ts">
import type { Class } from '~/types/database'

definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()
const toast = useToast()
const confirm = useConfirm()

const sid = computed(() => db.activeSchoolId)
const classes = computed(() => sid.value ? db.classesForSchool(sid.value) : [])

const showAdd = ref(false)
const showRename = ref(false)
const renaming = ref<Class | null>(null)

const openRename = (c: Class) => { renaming.value = c; showRename.value = true }

const remove = (id: string) => {
  const c = db.classes.find((x) => x.id === id)
  const studentsIn = db.studentsForClass(id).length
  confirm.require({
    message: c
      ? studentsIn
        ? `${c.name} has ${studentsIn} student(s). Move them to another class first or this will fail.`
        : `Remove ${c.name}? This cannot be undone.`
      : 'Remove this class?',
    header: 'Remove class',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Remove',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await db.removeClass(id)
        toastOk(toast, 'Class removed')
      } catch (e) { toastError(toast, e) }
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="st-h2 m-0">Classes</h2>
        <p class="text-muted text-sm m-0 mt-1">Sections / grades for this school. Students and teachers attach to classes.</p>
      </div>
      <Button label="Add Class" icon="pi pi-plus" :disabled="!sid" @click="showAdd = true" />
    </div>

    <EmptyState
      v-if="!sid"
      icon="pi pi-building"
      title="No school selected"
      description="Pick a school from the top-right switcher to manage classes."
    />
    <TableSkeleton v-else-if="db.loading && !db.loaded" :rows="4" :cols="5" />
    <EmptyState
      v-else-if="!classes.length"
      icon="pi pi-th-large"
      title="No classes yet"
      description="Add classes (e.g. Grade 5-A) so you can attach students and teachers."
      action-label="Add Class"
      action-icon="pi pi-plus"
      @action="showAdd = true"
    />
    <ClassTable v-else :classes="classes" @remove="remove" @rename="openRename" />

    <ClassAddDialog v-model:visible="showAdd" :school-id="sid" />
    <ClassRenameDialog v-model:visible="showRename" :cls="renaming" />
  </div>
</template>
