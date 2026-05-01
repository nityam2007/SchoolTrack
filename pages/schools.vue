<script setup lang="ts">
const db = useDbStore()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="st-h2 m-0">Schools</h2>
      <Button label="Add School" icon="pi pi-plus" />
    </div>
    <div class="st-card">
      <DataTable
        :value="db.schools"
        responsive-layout="scroll"
        striped-rows
        paginator
        :rows="10"
      >
        <Column field="id" header="ID" sortable />
        <Column field="name" header="Name" sortable />
        <Column field="city" header="City" sortable />
        <Column field="students" header="Students" sortable />
        <Column header="Credits" sortable>
          <template #body="{ data }">
            <span :class="data.credits < 100 ? 'text-danger' : 'text-ok'" class="font-bold">
              {{ data.credits }}
            </span>
          </template>
        </Column>
        <Column field="adminEmail" header="Admin Email" />
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.active ? 'Active' : 'Inactive'"
              :severity="data.active ? 'success' : 'danger'"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
