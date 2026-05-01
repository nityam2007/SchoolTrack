<script setup lang="ts">
import type { School } from '~/types/database'

const db = useDbStore()
const toast = useToast()

const showAdd = ref(false)
const form = reactive<Partial<School>>({ name: '', city: '', credits: 200, active: true })

const submit = async () => {
  if (!form.name) {
    toast.add({ severity: 'warn', summary: 'Name is required', life: 3000 })
    return
  }
  const id = `SCH${(db.schools.length + 1).toString().padStart(3, '0')}`
  try {
    await db.addSchool({
      id,
      name: form.name!,
      city: form.city ?? '',
      credits: Number(form.credits ?? 0),
      active: form.active ?? true,
    })
    toast.add({ severity: 'success', summary: 'School added', life: 2000 })
    showAdd.value = false
    Object.assign(form, { name: '', city: '', credits: 200, active: true })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Failed', detail: (e as Error).message, life: 4000 })
  }
}

const toggleActive = async (s: School) => {
  try { await db.updateSchool(s.id, { active: !s.active }) }
  catch (e) { toast.add({ severity: 'error', summary: 'Failed', detail: (e as Error).message, life: 4000 }) }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="st-h2 m-0">Schools</h2>
      <Button label="Add School" icon="pi pi-plus" @click="showAdd = true" />
    </div>
    <div class="st-card">
      <DataTable :value="db.schools" responsive-layout="scroll" striped-rows paginator :rows="10">
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Name" sortable />
        <Column field="city" header="City" sortable />
        <Column header="Credits" sortable>
          <template #body="{ data }">
            <span :class="data.credits < 100 ? 'text-danger' : 'text-ok'" class="font-bold">{{ data.credits }}</span>
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :value="data.active ? 'Active' : 'Inactive'" :severity="data.active ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column header="Actions" :style="{ width: '160px' }">
          <template #body="{ data }">
            <Button
              :label="data.active ? 'Disable' : 'Enable'"
              :severity="data.active ? 'danger' : 'success'"
              size="small"
              outlined
              @click="toggleActive(data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showAdd" modal header="Add School" :style="{ width: '440px' }">
      <div class="flex flex-col gap-3">
        <InputText v-model="form.name" placeholder="School Name *" />
        <InputText v-model="form.city" placeholder="City" />
        <InputNumber v-model="form.credits" placeholder="Initial Credits" :min="0" />
        <Button label="Create School" @click="submit" />
        <Message severity="info" :closable="false">
          Create the Principal's login user separately in Supabase (Auth → Users) with metadata <code>{ role: 'schooladmin', school_id: '&lt;new id&gt;' }</code>.
        </Message>
      </div>
    </Dialog>
  </div>
</template>
