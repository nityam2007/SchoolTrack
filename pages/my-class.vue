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
    const att = db.attendance.find((a) => a.student_id === s.id && a.date === today)
    return { ...s, today_status: att?.status ?? null }
  })
})

const stats = computed(() => {
  const total = roster.value.length
  const present = roster.value.filter((s) => s.today_status === 'present').length
  const absent = roster.value.filter((s) => s.today_status === 'absent').length
  return { total, present, absent }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">{{ cls?.name ?? 'My Class' }}</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="Total Students" :value="stats.total" tone="accent" icon="pi pi-users" />
      <StatCard label="Present Today" :value="stats.present" tone="ok" icon="pi pi-check" />
      <StatCard label="Absent Today" :value="stats.absent" tone="danger" icon="pi pi-times" />
    </div>
    <div class="st-card">
      <DataTable :value="roster" responsive-layout="scroll" striped-rows>
        <Column field="roll" header="Roll" sortable />
        <Column field="name" header="Name" sortable />
        <Column field="parent_phone" header="Parent Phone" />
        <Column header="Today">
          <template #body="{ data }">
            <Tag
              v-if="data.today_status"
              :value="data.today_status"
              :severity="data.today_status === 'present' ? 'success' : 'danger'"
            />
            <span v-else class="text-muted">Not marked</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
