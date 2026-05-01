<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const form = reactive({ date: '', title: '' })
const holidays = computed(() =>
  auth.schoolId
    ? [...db.holidaysForSchool(auth.schoolId)].sort((a, b) => a.date.localeCompare(b.date))
    : [],
)

const addHoliday = () => {
  if (!auth.schoolId || !form.date || !form.title) return
  db.addHoliday({
    id: `H${Date.now()}`,
    schoolId: auth.schoolId,
    date: form.date,
    title: form.title,
  })
  form.date = ''
  form.title = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">Holiday Management</h2>
    <div class="st-card">
      <p class="font-semibold mb-3">Add Holiday</p>
      <div class="flex flex-wrap gap-3 items-center">
        <InputText v-model="form.date" type="date" class="w-44" />
        <InputText v-model="form.title" placeholder="Holiday Title" class="flex-1 min-w-[200px]" />
        <Button label="Add" icon="pi pi-plus" @click="addHoliday" />
      </div>
    </div>
    <div class="st-card">
      <DataTable :value="holidays" responsive-layout="scroll" striped-rows>
        <Column field="date" header="Date" sortable />
        <Column field="title" header="Title" sortable />
        <Column header="Day">
          <template #body="{ data }">
            <Tag
              :value="new Date(data.date).toLocaleDateString('en', { weekday: 'long' })"
              severity="info"
            />
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              size="small"
              @click="db.removeHoliday(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
