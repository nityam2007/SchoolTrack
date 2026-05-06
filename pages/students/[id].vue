<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const { id, student, cls } = useStudentDetail()
const db = useDbStore()
const toast = useToast()
const confirm = useConfirm()
const router = useRouter()

const tabs = computed(() => [
  { label: 'Overview',   icon: 'pi pi-user',     to: `/students/${id.value}` },
  { label: 'Attendance', icon: 'pi pi-calendar', to: `/students/${id.value}/attendance` },
  { label: 'Exams',      icon: 'pi pi-file',     to: `/students/${id.value}/exams` },
])

const remove = () => {
  if (!student.value) return
  const s = student.value
  confirm.require({
    message: `Remove ${s.name} (Roll ${s.roll})? This deletes attendance and marks history. Cannot be undone.`,
    header: 'Remove student',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Remove',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await db.removeStudent(s.id)
        toastOk(toast, 'Student removed')
        router.replace('/students')
      } catch (e) { toastError(toast, e) }
    },
  })
}
</script>

<template>
  <div v-if="student" class="flex flex-col gap-6 animate-fade-in">
    <StudentHeader :student="student" :cls="cls" @remove="remove" />
    <DetailTabs :tabs="tabs" />
    <NuxtPage />
  </div>
  <EmptyState
    v-else-if="db.loaded"
    icon="pi pi-search-minus"
    title="Student not found"
    :description="`No student exists with id ${id}, or it has been removed.`"
    action-label="Back to students"
    action-icon="pi pi-arrow-left"
    @action="navigateTo('/students')"
  />
  <TableSkeleton v-else :rows="6" :cols="4" />
</template>
