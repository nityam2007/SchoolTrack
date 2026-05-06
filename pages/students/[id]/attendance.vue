<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })
const { attendance, last30 } = useStudentDetail()
</script>

<template>
  <StudentAttendanceTable :records="attendance" :last30="last30.length" />
</template>
