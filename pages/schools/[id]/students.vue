<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })
const { students } = useSchoolDetail()
</script>

<template>
  <SchoolStudentsTable :students="students" />
</template>
