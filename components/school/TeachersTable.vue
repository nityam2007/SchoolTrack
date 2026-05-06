<script setup lang="ts">
import type { Teacher } from '~/types/database'
defineProps<{ teachers: Teacher[] }>()
const db = useDbStore()
</script>

<template>
  <div class="st-card">
    <p class="st-h3 mb-4">Teachers</p>
    <DataTable :value="teachers" responsive-layout="scroll" striped-rows>
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <NuxtLink :to="`/teachers/${data.id}`" class="font-semibold hover:text-accent">{{ data.name }}</NuxtLink>
        </template>
      </Column>
      <Column field="email" header="Email">
        <template #body="{ data }">
          <span class="font-mono text-xs text-light">{{ data.email }}</span>
        </template>
      </Column>
      <Column header="Class">
        <template #body="{ data }">
          <span class="st-chip" :class="data.class_id ? 'bg-accentSoft text-accent' : 'bg-warn/10 text-warn'">
            {{ data.class_id ? db.classMap.get(data.class_id)?.name ?? data.class_id : 'Unassigned' }}
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
</template>
