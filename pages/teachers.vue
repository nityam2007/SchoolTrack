<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const teachers = computed(() => (auth.schoolId ? db.teachersForSchool(auth.schoolId) : []))
const classes = computed(() => (auth.schoolId ? db.classesForSchool(auth.schoolId) : []))

const enriched = computed(() =>
  teachers.value.map((t) => ({
    ...t,
    className: classes.value.find((c) => c.id === t.classId)?.name ?? 'Unassigned',
  })),
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="st-h2 m-0">Teachers</h2>
      <Button label="Add Teacher" icon="pi pi-plus" />
    </div>
    <div class="st-card">
      <DataTable :value="enriched" responsive-layout="scroll" striped-rows>
        <Column field="name" header="Name" sortable />
        <Column field="email" header="Email" />
        <Column header="Assigned Class">
          <template #body="{ data }">
            <Tag :value="data.className" :severity="data.classId ? 'info' : 'warn'" />
          </template>
        </Column>
        <Column field="phone" header="Phone" />
      </DataTable>
    </div>
  </div>
</template>
