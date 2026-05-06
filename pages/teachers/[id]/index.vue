<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })
const { teacher, cls, roster, todayAttendance, last30 } = useTeacherDetail()
</script>

<template>
  <div v-if="teacher" class="flex flex-col gap-4">
    <TeacherKpis :cls="cls" :roster="roster.length" :today-attendance="todayAttendance" :last30="last30" />
    <TeacherContact :teacher="teacher" />
  </div>
</template>
