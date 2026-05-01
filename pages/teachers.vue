<script setup lang="ts">
import type { Teacher } from '~/types/database'

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()

const showAdd = ref(false)
const form = reactive<Partial<Teacher>>({ name: '', email: '', class_id: null, phone: '' })

const teachers = computed(() => (auth.schoolId ? db.teachersForSchool(auth.schoolId) : []))
const classes = computed(() => (auth.schoolId ? db.classesForSchool(auth.schoolId) : []))

const enriched = computed(() => {
  const cm = db.classMap
  return teachers.value.map((t) => ({
    ...t,
    class_name: t.class_id ? cm.get(t.class_id)?.name ?? 'Unassigned' : 'Unassigned',
  }))
})

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
    <TableSkeleton v-if="db.loading && !db.loaded" :rows="4" :cols="4" />
    <EmptyState
      v-else-if="!enriched.length"
      icon="pi pi-id-card"
      title="No teachers yet"
      description="Add teachers to your school. After creating them here, invite them as users in Supabase Auth so they can sign in."
      action-label="Add Teacher"
      action-icon="pi pi-plus"
      @action="showAdd = true"
    />
    <div v-else class="st-card !p-0 overflow-hidden">
      <DataTable :value="enriched" responsive-layout="scroll" striped-rows>
        <Column field="name" header="Name" sortable>
          <template #body="{ data }">
            <span class="font-semibold">{{ data.name }}</span>
          </template>
        </Column>
        <Column field="email" header="Email">
          <template #body="{ data }">
            <span class="font-mono text-xs text-light">{{ data.email }}</span>
          </template>
        </Column>
        <Column header="Assigned Class">
          <template #body="{ data }">
            <span class="st-chip" :class="data.class_id ? 'bg-accentSoft text-accent' : 'bg-warn/10 text-warn'">
              {{ data.class_name }}
            </span>
          </template>
        </Column>
        <Column field="phone" header="Phone">
          <template #body="{ data }">
            <span class="font-mono text-xs text-light">{{ data.phone || '—' }}</span>
          </template>
        </Column>
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
