<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const today = new Date().toISOString().split('T')[0]

const cls = computed(() =>
  auth.user?.classId ? db.classes.find((c) => c.id === auth.user!.classId) ?? null : null,
)

const roster = computed(() => {
  if (!auth.user?.classId) return []
  return db.studentsForClass(auth.user.classId).map((s) => {
    const att = db.attendance.find((a) => a.studentId === s.id && a.date === today)
    return { ...s, todayStatus: att?.status ?? '—' }
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">{{ cls?.name ?? 'My Class' }}</h2>
    <div class="st-card">
      <DataTable :value="roster" responsive-layout="scroll" striped-rows>
        <Column field="roll" header="Roll" sortable />
        <Column field="name" header="Name" sortable />
        <Column field="parentPhone" header="Parent Phone" />
        <Column header="Today">
          <template #body="{ data }">
            <Tag
              v-if="data.todayStatus !== '—'"
              :value="data.todayStatus"
              :severity="data.todayStatus === 'present' ? 'success' : 'danger'"
            />
            <span v-else class="text-muted">—</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
