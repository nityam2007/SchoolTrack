<script setup lang="ts">
import type { Class } from '~/types/database'
defineProps<{ classes: Class[] }>()
const db = useDbStore()
</script>

<template>
  <div class="st-card">
    <p class="st-h3 mb-4">Classes</p>
    <DataTable :value="classes" responsive-layout="scroll" striped-rows>
      <Column field="id" header="ID">
        <template #body="{ data }">
          <code class="bg-surface text-light px-2 py-0.5 rounded text-[11px]">{{ data.id }}</code>
        </template>
      </Column>
      <Column field="name" header="Name" sortable />
      <Column field="grade" header="Grade" sortable />
      <Column field="section" header="Section" />
      <Column header="Students">
        <template #body="{ data }">
          <strong>{{ db.studentsForClass(data.id).length }}</strong>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
