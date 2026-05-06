<script setup lang="ts">
import type { Subject } from '~/types/database'
defineProps<{ subjects: Subject[] }>()
defineEmits<{ remove: [id: string] }>()
</script>

<template>
  <div class="st-card !p-0 overflow-hidden">
    <DataTable :value="subjects" responsive-layout="scroll" striped-rows paginator :rows="10">
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <span class="font-semibold">{{ data.name }}</span>
        </template>
      </Column>
      <Column header="Theory">
        <template #body="{ data }">
          <span v-if="data.has_theory" class="font-mono text-xs">{{ data.theory_max }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </Column>
      <Column header="Practical">
        <template #body="{ data }">
          <span v-if="data.has_practical" class="font-mono text-xs">{{ data.practical_max }}</span>
          <span v-else class="text-muted">—</span>
        </template>
      </Column>
      <Column header="Total">
        <template #body="{ data }">
          <strong class="tabular-nums">{{ (data.has_theory ? data.theory_max : 0) + (data.has_practical ? data.practical_max : 0) }}</strong>
        </template>
      </Column>
      <Column field="passing_marks" header="Pass" sortable>
        <template #body="{ data }">
          <span class="font-mono text-xs">{{ data.passing_marks }}</span>
        </template>
      </Column>
      <Column header="Actions" :style="{ width: '80px' }">
        <template #body="{ data }">
          <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="$emit('remove', data.id)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
