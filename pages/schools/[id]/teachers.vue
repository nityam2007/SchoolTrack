<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })
const { teachers } = useSchoolDetail()
</script>

<template>
  <SchoolTeachersTable :teachers="teachers" />
</template>
