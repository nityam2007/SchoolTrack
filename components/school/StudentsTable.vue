<script setup lang="ts">
import type { Student } from '~/types/database'
defineProps<{ students: Student[] }>()
const db = useDbStore()
</script>

<template>
  <div class="st-card">
    <p class="st-h3 mb-4">Students</p>
    <DataTable :value="students" responsive-layout="scroll" striped-rows paginator :rows="10">
      <Column field="roll" header="Roll" sortable />
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <NuxtLink :to="`/students/${data.id}`" class="font-semibold hover:text-accent">{{ data.name }}</NuxtLink>
        </template>
      </Column>
      <Column header="Class">
        <template #body="{ data }">
          {{ db.classMap.get(data.class_id)?.name ?? '—' }}
        </template>
      </Column>
      <Column field="parent_phone" header="Parent Phone">
        <template #body="{ data }">
          <span class="font-mono text-xs text-light">{{ data.parent_phone || '—' }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
