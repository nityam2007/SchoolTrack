<script setup lang="ts">
import type { Student } from '~/types/database'

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()

const search = ref('')
const showAdd = ref(false)
const form = reactive<Partial<Student>>({
  name: '', roll: '', class_id: '', parent_phone: '',
  dob: null, gender: null, father_name: '', mother_name: '',
})

const classes = computed(() => (auth.schoolId ? db.classesForSchool(auth.schoolId) : []))
const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  const all = auth.schoolId ? db.studentsForSchool(auth.schoolId) : []
  return all
    .filter((s) => !q || s.name.toLowerCase().includes(q) || s.roll.includes(q))
    .map((s) => ({
      ...s,
      class_name: classes.value.find((c) => c.id === s.class_id)?.name ?? s.class_id,
    }))
})

const submit = async () => {
  if (!auth.schoolId || !form.name || !form.class_id || !form.roll) {
    toast.add({ severity: 'warn', summary: 'Missing fields', detail: 'Name, class, and roll are required.', life: 3000 })
    return
  }
  const id = `S${Date.now().toString(36).toUpperCase()}`
  try {
    await db.addStudent({
      id,
      school_id: auth.schoolId,
      class_id: form.class_id!,
      name: form.name!,
      roll: form.roll!,
      parent_phone: form.parent_phone ?? '',
      dob: form.dob ?? null,
      gender: form.gender ?? null,
      father_name: form.father_name ?? null,
      mother_name: form.mother_name ?? null,
      attendance_pct: 0,
    })
    toast.add({ severity: 'success', summary: 'Student added', life: 2000 })
    showAdd.value = false
    Object.assign(form, { name: '', roll: '', class_id: '', parent_phone: '', dob: null, gender: null, father_name: '', mother_name: '' })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Failed to add', detail: (e as Error).message, life: 4000 })
  }
}

const remove = async (id: string) => {
  if (!confirm('Remove this student?')) return
  try { await db.removeStudent(id) }
  catch (e) { toast.add({ severity: 'error', summary: 'Failed', detail: (e as Error).message, life: 4000 }) }
}
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
        <Button label="Add Student" icon="pi pi-plus" @click="showAdd = true" />
      </div>
    </div>

    <div class="st-card">
      <DataTable :value="filtered" responsive-layout="scroll" striped-rows paginator :rows="10">
        <Column field="roll" header="Roll" sortable />
        <Column field="name" header="Name" sortable />
        <Column field="class_name" header="Class" sortable />
        <Column field="parent_phone" header="Parent Phone" />
        <Column header="Actions" :style="{ width: '120px' }">
          <template #body="{ data }">
            <Button icon="pi pi-trash" severity="danger" text size="small" @click="remove(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showAdd" modal header="Add Student" :style="{ width: '480px' }">
      <div class="flex flex-col gap-3">
        <InputText v-model="form.name" placeholder="Full Name *" />
        <Dropdown
          v-model="form.class_id"
          :options="classes"
          option-value="id"
          option-label="name"
          placeholder="Select Class *"
        />
        <InputText v-model="form.roll" placeholder="Roll Number *" />
        <InputText v-model="form.parent_phone" placeholder="Parent Phone (+91…)" />
        <InputText v-model="form.dob" type="date" placeholder="DOB" />
        <Dropdown
          v-model="form.gender"
          :options="['Male', 'Female', 'Other']"
          placeholder="Gender"
          show-clear
        />
        <InputText v-model="form.father_name" placeholder="Father's Name" />
        <InputText v-model="form.mother_name" placeholder="Mother's Name" />
        <Button label="Add Student" @click="submit" />
      </div>
    </Dialog>
  </div>
</template>
