<script setup lang="ts">
import type { School } from '~/types/database'
const props = defineProps<{ school: School }>()
const emit = defineEmits<{ topup: []; toggle: [] }>()
</script>

<template>
  <div class="flex items-start justify-between flex-wrap gap-3">
    <div class="flex items-start gap-4">
      <NuxtLink to="/schools">
        <Button icon="pi pi-arrow-left" severity="secondary" text rounded aria-label="Back to schools" />
      </NuxtLink>
      <div class="w-14 h-14 rounded-card bg-accentSoft ring-1 ring-accent/20 flex items-center justify-center">
        <i class="pi pi-building text-accent text-2xl" />
      </div>
      <div>
        <p class="text-muted text-xs font-semibold uppercase tracking-wider">School · {{ school.id }}</p>
        <h2 class="st-h1 m-0">{{ school.name }}</h2>
        <p class="text-muted text-sm m-0 mt-1 flex items-center gap-2">
          <i class="pi pi-map-marker text-[11px]" />{{ school.city || 'No city set' }}
          <span class="opacity-50">·</span>
          <span class="st-chip" :class="school.active ? 'bg-ok/10 text-ok' : 'bg-danger/10 text-danger'">
            <span class="st-chip-dot" :class="school.active ? 'bg-ok' : 'bg-danger'" />
            {{ school.active ? 'Active' : 'Inactive' }}
          </span>
        </p>
      </div>
    </div>
    <div class="flex gap-2">
      <Button label="Top up credits" icon="pi pi-credit-card" severity="secondary" outlined @click="emit('topup')" />
      <Button
        :label="school.active ? 'Disable school' : 'Enable school'"
        :icon="school.active ? 'pi pi-ban' : 'pi pi-check'"
        :severity="school.active ? 'danger' : 'success'"
        @click="emit('toggle')"
      />
    </div>
  </div>
</template>
