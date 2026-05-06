<script setup lang="ts">
import type { School } from '~/types/database'
defineProps<{
  school: School
  classes: number
  teachers: number
  students: number
}>()
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard label="Credits" :value="school.credits" :sub="school.credits < 100 ? 'low — top up' : 'healthy'" :tone="school.credits < 100 ? 'danger' : 'ok'" icon="pi pi-credit-card" />
    <StatCard label="Classes"  :value="classes"  tone="accent" icon="pi pi-th-large" />
    <StatCard label="Teachers" :value="teachers" tone="violet" icon="pi pi-id-card" />
    <StatCard label="Students" :value="students" tone="ok"     icon="pi pi-users" />
  </div>
</template>
