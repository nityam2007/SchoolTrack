<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })
const { cls, roster } = useTeacherDetail()
</script>

<template>
  <TeacherRoster :cls="cls" :roster="roster" />
</template>
