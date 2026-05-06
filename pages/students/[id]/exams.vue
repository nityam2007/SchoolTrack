<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })
const { id, examRows } = useStudentDetail()
</script>

<template>
  <StudentExamsTable :rows="examRows" :student-id="id" />
</template>
