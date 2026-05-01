<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const breakdown = computed(() => {
  if (!auth.schoolId) return []
  const classes = db.classesForSchool(auth.schoolId)
  return classes.map((c) => {
    const att = db.attendance.filter((a) => a.classId === c.id)
    const present = att.filter((a) => a.status === 'present').length
    const total = att.length
    const rate = total ? Math.round((present / total) * 100) : 0
    return { className: c.name, total, present, absent: total - present, rate }
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">Reports</h2>
    <div class="st-card">
      <p class="font-bold mb-4">Class-wise Attendance</p>
      <DataTable :value="breakdown" responsive-layout="scroll" striped-rows>
        <Column field="className" header="Class" sortable />
        <Column field="total" header="Records" sortable />
        <Column field="present" header="Present" sortable />
        <Column field="absent" header="Absent" sortable />
        <Column header="Rate" sortable>
          <template #body="{ data }">
            <span :class="data.rate >= 75 ? 'text-ok' : 'text-warn'" class="font-bold">
              {{ data.rate }}%
            </span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
