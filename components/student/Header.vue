<script setup lang="ts">
import type { Student, Class } from '~/types/database'
defineProps<{ student: Student; cls: Class | null }>()
defineEmits<{ remove: [] }>()
</script>

<template>
  <div class="flex items-start justify-between flex-wrap gap-3">
    <div class="flex items-start gap-4">
      <NuxtLink to="/students">
        <Button icon="pi pi-arrow-left" severity="secondary" text rounded aria-label="Back to students" />
      </NuxtLink>
      <div class="w-14 h-14 rounded-card bg-violet/10 ring-1 ring-violet/20 flex items-center justify-center">
        <i class="pi pi-user text-violet text-2xl" />
      </div>
      <div>
        <p class="text-muted text-xs font-semibold uppercase tracking-wider">
          Student · Roll {{ student.roll }}
        </p>
        <h2 class="st-h1 m-0">{{ student.name }}</h2>
        <p class="text-muted text-sm m-0 mt-1">
          {{ cls?.name ?? '—' }}
          <span v-if="student.gender" class="opacity-50">· {{ student.gender }}</span>
          <span v-if="student.dob" class="opacity-50">· DOB {{ student.dob }}</span>
        </p>
      </div>
    </div>
    <div class="flex gap-2">
      <Button label="Remove" icon="pi pi-trash" severity="danger" outlined @click="$emit('remove')" />
    </div>
  </div>
</template>
