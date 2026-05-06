<script setup lang="ts">
import type { Teacher } from '~/types/database'
defineProps<{ teacher: Teacher }>()
defineEmits<{ reassign: [] }>()
</script>

<template>
  <div class="flex items-start justify-between flex-wrap gap-3">
    <div class="flex items-start gap-4">
      <NuxtLink to="/teachers">
        <Button icon="pi pi-arrow-left" severity="secondary" text rounded aria-label="Back to teachers" />
      </NuxtLink>
      <div class="w-14 h-14 rounded-card bg-ok/10 ring-1 ring-ok/20 flex items-center justify-center">
        <i class="pi pi-id-card text-ok text-2xl" />
      </div>
      <div>
        <p class="text-muted text-xs font-semibold uppercase tracking-wider">Teacher · {{ teacher.id }}</p>
        <h2 class="st-h1 m-0">{{ teacher.name }}</h2>
        <p class="text-muted text-sm m-0 mt-1 flex items-center gap-2 font-mono">
          <i class="pi pi-envelope text-[11px]" />{{ teacher.email }}
        </p>
      </div>
    </div>
    <div class="flex gap-2">
      <Button label="Reassign class" icon="pi pi-refresh" severity="secondary" outlined @click="$emit('reassign')" />
    </div>
  </div>
</template>
