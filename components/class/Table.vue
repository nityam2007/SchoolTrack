<script setup lang="ts">
import type { Class } from '~/types/database'
defineProps<{ classes: Class[] }>()
defineEmits<{ remove: [id: string]; rename: [c: Class] }>()

const db = useDbStore()
</script>

<template>
  <div class="st-card !p-0 overflow-hidden">
    <DataTable :value="classes" responsive-layout="scroll" striped-rows paginator :rows="10">
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <span class="font-semibold">{{ data.name }}</span>
        </template>
      </Column>
      <Column field="grade" header="Grade" sortable />
      <Column field="section" header="Section" sortable />
      <Column header="Students">
        <template #body="{ data }">
          <strong>{{ db.studentsForClass(data.id).length }}</strong>
        </template>
      </Column>
      <Column header="Teacher">
        <template #body="{ data }">
          <span class="text-xs">
            {{ db.teachers.find((t) => t.class_id === data.id)?.name ?? '—' }}
          </span>
        </template>
      </Column>
      <Column header="Actions" :style="{ width: '120px' }">
        <template #body="{ data }">
          <div class="flex gap-1.5">
            <Button icon="pi pi-pencil" severity="secondary" outlined size="small" aria-label="Rename" @click="$emit('rename', data)" />
            <Button icon="pi pi-trash"  severity="danger"    outlined size="small" aria-label="Delete" @click="$emit('remove', data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
