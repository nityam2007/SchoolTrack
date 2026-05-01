<script setup lang="ts">
import type { Teacher } from '~/types/database'

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()

const showAdd = ref(false)
const form = reactive<Partial<Teacher>>({ name: '', email: '', class_id: null, phone: '' })

const teachers = computed(() => (auth.schoolId ? db.teachersForSchool(auth.schoolId) : []))
const classes = computed(() => (auth.schoolId ? db.classesForSchool(auth.schoolId) : []))

const enriched = computed(() =>
  teachers.value.map((t) => ({
    ...t,
    class_name: classes.value.find((c) => c.id === t.class_id)?.name ?? 'Unassigned',
  })),
)

const submit = async () => {
  if (!auth.schoolId || !form.name || !form.email) {
    toast.add({ severity: 'warn', summary: 'Missing fields', detail: 'Name and email are required.', life: 3000 })
    return
  }
  try {
    await db.addTeacher({
      id: `T${Date.now().toString(36).toUpperCase()}`,
      school_id: auth.schoolId,
      class_id: form.class_id ?? null,
      name: form.name!,
      email: form.email!,
      phone: form.phone ?? '',
    })
    toast.add({ severity: 'success', summary: 'Teacher added', life: 2000 })
    showAdd.value = false
    Object.assign(form, { name: '', email: '', class_id: null, phone: '' })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Failed', detail: (e as Error).message, life: 4000 })
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="st-h2 m-0">Teachers</h2>
      <Button label="Add Teacher" icon="pi pi-plus" @click="showAdd = true" />
    </div>
    <div class="st-card">
      <DataTable :value="enriched" responsive-layout="scroll" striped-rows>
        <Column field="name" header="Name" sortable />
        <Column field="email" header="Email" />
        <Column header="Assigned Class">
          <template #body="{ data }">
            <Tag :value="data.class_name" :severity="data.class_id ? 'info' : 'warn'" />
          </template>
        </Column>
        <Column field="phone" header="Phone" />
      </DataTable>
    </div>

    <Dialog v-model:visible="showAdd" modal header="Add Teacher" :style="{ width: '440px' }">
      <div class="flex flex-col gap-3">
        <InputText v-model="form.name" placeholder="Full Name *" />
        <InputText v-model="form.email" placeholder="Email *" type="email" />
        <InputText v-model="form.phone" placeholder="Phone" />
        <Dropdown
          v-model="form.class_id"
          :options="classes"
          option-value="id"
          option-label="name"
          placeholder="Assign Class"
          show-clear
        />
        <Message severity="info" :closable="false">
          The Principal must separately invite the teacher in Supabase to give them login access.
        </Message>
        <Button label="Add Teacher" @click="submit" />
      </div>
    </Dialog>
  </div>
</template>
