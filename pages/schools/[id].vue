<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })

const { id, school } = useSchoolDetail()
const db = useDbStore()
const toast = useToast()
const confirm = useConfirm()

const showTopUp = ref(false)

const tabs = computed(() => [
  { label: 'Overview', icon: 'pi pi-th-large', to: `/schools/${id.value}` },
  { label: 'Classes',  icon: 'pi pi-th-large', to: `/schools/${id.value}/classes` },
  { label: 'Teachers', icon: 'pi pi-id-card',  to: `/schools/${id.value}/teachers` },
  { label: 'Students', icon: 'pi pi-users',    to: `/schools/${id.value}/students` },
])

const onTopUp = async (amount: number) => {
  if (!school.value) return
  try {
    await db.topUpCredits(school.value.id, amount)
    toastOk(toast, `Added ${amount} credits`, 2500)
    showTopUp.value = false
  } catch (e) {
    toastError(toast, e, 'Top up failed')
  }
}

const onToggle = () => {
  if (!school.value) return
  const s = school.value
  confirm.require({
    message: `${s.active ? 'Disable' : 'Enable'} ${s.name}? ${s.active ? 'Users from this school will lose access.' : ''}`,
    header: s.active ? 'Disable school' : 'Enable school',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: s.active ? 'Disable' : 'Enable',
    rejectLabel: 'Cancel',
    acceptClass: s.active ? 'p-button-danger' : 'p-button-success',
    accept: async () => {
      try {
        await db.updateSchool(s.id, { active: !s.active })
        toastOk(toast, 'School updated')
      } catch (e) { toastError(toast, e) }
    },
  })
}
</script>

<template>
  <div v-if="school" class="flex flex-col gap-6 animate-fade-in">
    <SchoolHeader :school="school" @topup="showTopUp = true" @toggle="onToggle" />
    <DetailTabs :tabs="tabs" />
    <NuxtPage />
    <SchoolTopUpDialog v-model:visible="showTopUp" :school="school" @submit="onTopUp" />
  </div>
  <EmptyState
    v-else-if="db.loaded"
    icon="pi pi-search-minus"
    title="School not found"
    :description="`No school exists with id ${id}, or it has been removed.`"
    action-label="Back to schools"
    action-icon="pi pi-arrow-left"
    @action="navigateTo('/schools')"
  />
  <TableSkeleton v-else :rows="6" :cols="4" />
</template>
