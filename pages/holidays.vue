<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()
const toast = useToast()
const confirm = useConfirm()

const fmtDate = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtWeekday = new Intl.DateTimeFormat('en', { weekday: 'long' })

const form = reactive({ date: '', title: '' })

const holidays = computed(() =>
  db.activeSchoolId
    ? [...db.holidaysForSchool(db.activeSchoolId)].sort((a, b) => a.date.localeCompare(b.date))
    : [],
)

const add = async () => {
  if (!db.activeSchoolId || !form.date || !form.title) return
  try {
    await db.addHoliday({
      id: makeId('H'),
      school_id: db.activeSchoolId,
      date: form.date,
      title: form.title,
    })
    form.date = ''
    form.title = ''
  } catch (e) {
    toastError(toast, e)
  }
}

const remove = (id: string) => {
  const h = db.holidays.find((x) => x.id === id)
  confirm.require({
    message: h ? `Remove "${h.title}" on ${h.date}?` : 'Remove this holiday?',
    header: 'Confirm removal',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Remove',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await db.removeHoliday(id)
        toastOk(toast, 'Holiday removed')
      } catch (e) {
        toastError(toast, e)
      }
    },
  })
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
        <Button label="Add" icon="pi pi-plus" @click="add" />
      </div>
    </div>
    <EmptyState
      v-if="!holidays.length"
      icon="pi pi-calendar"
      title="No holidays scheduled"
      description="Add public holidays so attendance is automatically paused on those days."
    />
    <div v-else class="st-card !p-0 overflow-hidden">
      <DataTable :value="holidays" responsive-layout="scroll" striped-rows>
        <Column field="date" header="Date" sortable>
          <template #body="{ data }">
            <span class="font-semibold tabular-nums">{{ fmtDate.format(new Date(data.date)) }}</span>
          </template>
        </Column>
        <Column field="title" header="Title" sortable />
        <Column header="Day">
          <template #body="{ data }">
            <span class="st-chip bg-violet/10 text-violet">{{ fmtWeekday.format(new Date(data.date)) }}</span>
          </template>
        </Column>
        <Column header="Actions" :style="{ width: '80px' }">
          <template #body="{ data }">
            <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="remove(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
