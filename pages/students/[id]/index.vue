<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })
const { student, cls, stats } = useStudentDetail()
</script>

<template>
  <div v-if="student" class="flex flex-col gap-4">
    <StudentKpis :stats="stats" :cls="cls" />
    <StudentProfile :student="student" />
  </div>
</template>
