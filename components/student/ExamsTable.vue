<script setup lang="ts">
import type { Exam } from '~/types/database'
import type { ReportStats } from '~/composables/useGrade'

interface Row { exam: Exam; stats: ReportStats | null }
defineProps<{ rows: Row[]; studentId: string }>()
</script>

<template>
  <div class="st-card">
    <p class="st-h3 mb-4">Exam results</p>
    <DataTable v-if="rows.length" :value="rows" responsive-layout="scroll" striped-rows>
      <Column header="Exam">
        <template #body="{ data }">
          <span class="font-semibold">{{ data.exam.name }}</span>
          <p class="text-muted text-xs m-0">{{ data.exam.date_label || '—' }}</p>
        </template>
      </Column>
      <Column header="Score">
        <template #body="{ data }">
          <span v-if="data.stats">
            <strong>{{ data.stats.total_obtained }}</strong>
            <span class="text-muted text-xs">/{{ data.stats.total_max }}</span>
          </span>
          <span v-else class="text-warn">Pending</span>
        </template>
      </Column>
      <Column header="Percentage">
        <template #body="{ data }">
          <span v-if="data.stats" :class="data.stats.overall_pct >= 60 ? 'text-ok' : 'text-warn'" class="font-bold">
            {{ data.stats.overall_pct }}%
          </span>
          <span v-else>—</span>
        </template>
      </Column>
      <Column header="Grade">
        <template #body="{ data }">
          <Tag v-if="data.stats" :value="data.stats.overall_grade" />
          <span v-else>—</span>
        </template>
      </Column>
      <Column header="Result">
        <template #body="{ data }">
          <Tag v-if="data.stats" :value="data.stats.passed ? 'PASS' : 'FAIL'" :severity="data.stats.passed ? 'success' : 'danger'" />
          <span v-else>—</span>
        </template>
      </Column>
      <Column header="" :style="{ width: '120px' }">
        <template #body="{ data }">
          <NuxtLink v-if="data.stats" :to="`/report-cards/${data.exam.id}/${studentId}`">
            <Button label="Open" icon="pi pi-external-link" size="small" outlined />
          </NuxtLink>
        </template>
      </Column>
    </DataTable>
    <EmptyState
      v-else
      icon="pi pi-file"
      title="No exams set up"
      description="Once exams are configured for this class, results will appear here."
    />
  </div>
</template>
