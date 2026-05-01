<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const search = ref('')

const classes = computed(() => (auth.schoolId ? db.classesForSchool(auth.schoolId) : []))
const filtered = computed(() => {
  const all = auth.schoolId ? db.studentsForSchool(auth.schoolId) : []
  const q = search.value.toLowerCase()
  return all
    .filter((s) => s.name.toLowerCase().includes(q) || s.roll.includes(q))
    .map((s) => ({
      ...s,
      className: classes.value.find((c) => c.id === s.classId)?.name ?? s.classId,
    }))
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="st-h2 m-0">Students</h2>
      <div class="flex items-center gap-3">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="search" placeholder="Search name or roll..." class="w-64" />
        </IconField>
        <Button label="Add Student" icon="pi pi-plus" />
      </div>
    </div>
    <div class="st-card">
      <DataTable
        :value="filtered"
        responsive-layout="scroll"
        striped-rows
        paginator
        :rows="10"
      >
        <Column field="roll" header="Roll" sortable />
        <Column field="name" header="Name" sortable />
        <Column field="className" header="Class" sortable />
        <Column field="parentPhone" header="Parent Phone" />
      </DataTable>
    </div>
  </div>
</template>
