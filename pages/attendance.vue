<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()

const date = ref(todayLocal())
const selClass = ref<string>('all')

const classes = computed(() =>
  db.activeSchoolId ? db.classesForSchool(db.activeSchoolId) : [],
)

const records = computed(() => {
  if (!db.activeSchoolId) return []
  return db.attendance.filter(
    (a) =>
      a.school_id === db.activeSchoolId &&
      a.date === date.value &&
      (selClass.value === 'all' || a.class_id === selClass.value),
  )
})

const enriched = computed(() =>
  records.value.map((a) => ({
    ...a,
    student_name: db.students.find((s) => s.id === a.student_id)?.name ?? a.student_id,
    class_name: db.classes.find((c) => c.id === a.class_id)?.name ?? a.class_id,
  })),
)

const present = computed(() => enriched.value.filter((a) => a.status === 'present').length)
const absent = computed(() => enriched.value.filter((a) => a.status === 'absent').length)
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">Attendance Records</h2>
    <div class="flex flex-wrap items-center gap-3">
      <InputText v-model="date" type="date" class="w-44" />
      <Dropdown
        v-model="selClass"
        :options="[{ id: 'all', name: 'All Classes' }, ...classes]"
        option-value="id"
        option-label="name"
        class="w-48"
      />
      <Tag :value="`${present} Present`" severity="success" />
      <Tag :value="`${absent} Absent`" severity="danger" />
    </div>
    <div class="st-card">
      <DataTable :value="enriched" responsive-layout="scroll" striped-rows>
        <Column field="student_name" header="Student" sortable />
        <Column field="class_name" header="Class" sortable />
        <Column header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="data.status === 'present' ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column header="Photo">
          <template #body="{ data }">
            <Tag :value="data.photo ? 'Saved' : 'Missing'" :severity="data.photo ? 'success' : 'danger'" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
