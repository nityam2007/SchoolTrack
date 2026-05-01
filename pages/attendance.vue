<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const date = ref('2026-03-04')
const selClass = ref<string>('all')

const classes = computed(() =>
  auth.schoolId ? db.classesForSchool(auth.schoolId) : [],
)

const records = computed(() => {
  if (!auth.schoolId) return []
  return db.attendance.filter(
    (a) =>
      a.schoolId === auth.schoolId &&
      a.date === date.value &&
      (selClass.value === 'all' || a.classId === selClass.value),
  )
})

const enriched = computed(() =>
  records.value.map((a) => ({
    ...a,
    studentName: db.students.find((s) => s.id === a.studentId)?.name ?? a.studentId,
    className: db.classes.find((c) => c.id === a.classId)?.name ?? a.classId,
  })),
)
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
    </div>
    <div class="st-card">
      <DataTable :value="enriched" responsive-layout="scroll" striped-rows>
        <Column field="studentName" header="Student" sortable />
        <Column field="className" header="Class" sortable />
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.status"
              :severity="data.status === 'present' ? 'success' : 'danger'"
            />
          </template>
        </Column>
        <Column header="Photo">
          <template #body="{ data }">
            <Tag
              :value="data.photo ? 'Saved' : 'Missing'"
              :severity="data.photo ? 'success' : 'danger'"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
