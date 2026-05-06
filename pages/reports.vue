<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()

const breakdown = computed(() => {
  if (!db.activeSchoolId) return []
  return db.classesForSchool(db.activeSchoolId).map((c) => {
    const att = db.attendance.filter((a) => a.class_id === c.id)
    const present = att.filter((a) => a.status === 'present').length
    const total = att.length
    const rate = total ? Math.round((present / total) * 100) : 0
    return { class_name: c.name, total, present, absent: total - present, rate }
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">Reports</h2>
    <div class="st-card">
      <p class="font-bold mb-4">Class-wise Attendance</p>
      <DataTable :value="breakdown" responsive-layout="scroll" striped-rows>
        <Column field="class_name" header="Class" sortable />
        <Column field="total" header="Records" sortable />
        <Column field="present" header="Present" sortable />
        <Column field="absent" header="Absent" sortable />
        <Column header="Rate" sortable>
          <template #body="{ data }">
            <span :class="data.rate >= 75 ? 'text-ok' : 'text-warn'" class="font-bold">{{ data.rate }}%</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
