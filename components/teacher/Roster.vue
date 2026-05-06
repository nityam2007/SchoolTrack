<script setup lang="ts">
import type { Class, Student } from '~/types/database'
defineProps<{ cls: Class | null; roster: Student[] }>()
</script>

<template>
  <div class="st-card">
    <p class="st-h3 mb-4">{{ cls?.name ?? 'Unassigned' }} roster</p>
    <EmptyState
      v-if="!roster.length"
      icon="pi pi-users"
      :title="cls ? 'No students in this class yet' : 'Teacher has no class assigned'"
      :description="cls ? 'Add students to this class from the Students page.' : 'Use Reassign class above to link a class to this teacher.'"
    />
    <DataTable v-else :value="roster" responsive-layout="scroll" striped-rows>
      <Column field="roll" header="Roll" sortable />
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <NuxtLink :to="`/students/${data.id}`" class="font-semibold hover:text-accent">
            {{ data.name }}
          </NuxtLink>
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
