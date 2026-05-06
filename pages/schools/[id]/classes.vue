<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })
const { classes } = useSchoolDetail()
</script>

<template>
  <SchoolClassesTable :classes="classes" />
</template>
