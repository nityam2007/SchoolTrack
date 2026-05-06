<script setup lang="ts">
import type { Student } from '~/types/database'
defineProps<{ student: Student }>()
</script>

<template>
  <div class="st-card">
    <p class="st-h3 mb-4">Profile</p>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
      <div><p class="st-label mb-0.5">Father's name</p><p class="m-0">{{ student.father_name || '—' }}</p></div>
      <div><p class="st-label mb-0.5">Mother's name</p><p class="m-0">{{ student.mother_name || '—' }}</p></div>
      <div>
        <p class="st-label mb-0.5">Parent phone</p>
        <p class="m-0 font-mono">{{ student.parent_phone || '—' }}</p>
      </div>
      <div><p class="st-label mb-0.5">Date of birth</p><p class="m-0">{{ student.dob || '—' }}</p></div>
      <div><p class="st-label mb-0.5">Gender</p><p class="m-0">{{ student.gender || '—' }}</p></div>
      <div>
        <p class="st-label mb-0.5">Student ID</p>
        <p class="m-0"><code class="bg-surface text-light px-2 py-0.5 rounded text-[11px]">{{ student.id }}</code></p>
      </div>
    </div>
  </div>
</template>
