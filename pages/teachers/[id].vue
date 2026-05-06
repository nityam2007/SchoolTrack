<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const { id, teacher, cls, otherClasses } = useTeacherDetail()
const db = useDbStore()
const toast = useToast()

const tabs = computed(() => [
  { label: 'Overview', icon: 'pi pi-id-card', to: `/teachers/${id.value}` },
  { label: 'Roster',   icon: 'pi pi-users',   to: `/teachers/${id.value}/roster` },
])

const showReassign = ref(false)
const reassignTo = ref<string | null>(null)
const submitting = ref(false)

const openReassign = () => {
  reassignTo.value = teacher.value?.class_id ?? null
  showReassign.value = true
}

const submitReassign = async () => {
  if (!teacher.value || submitting.value) return
  submitting.value = true
  try {
    const { error } = await useSb().from('teachers').update({ class_id: reassignTo.value }).eq('id', teacher.value.id)
    if (error) throw error
    teacher.value.class_id = reassignTo.value
    toastOk(toast, 'Class assignment updated')
    showReassign.value = false
  } catch (e) {
    toastError(toast, e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="teacher" class="flex flex-col gap-6 animate-fade-in">
    <TeacherHeader :teacher="teacher" @reassign="openReassign" />
    <DetailTabs :tabs="tabs" />
    <NuxtPage />
    <TeacherReassignDialog
      v-model:visible="showReassign"
      v-model="reassignTo"
      :cls="cls"
      :options="otherClasses"
      :submitting="submitting"
      @submit="submitReassign"
    />
  </div>
  <EmptyState
    v-else-if="db.loaded"
    icon="pi pi-search-minus"
    title="Teacher not found"
    :description="`No teacher exists with id ${id}, or the record has been removed.`"
    action-label="Back to teachers"
    action-icon="pi pi-arrow-left"
    @action="navigateTo('/teachers')"
  />
  <TableSkeleton v-else :rows="6" :cols="4" />
</template>
