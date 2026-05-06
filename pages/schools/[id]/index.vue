<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })

const { school, classes, teachers, students, messages, attendance, presentRate, absentees7d } = useSchoolDetail()
</script>

<template>
  <div v-if="school" class="flex flex-col gap-4">
    <SchoolKpis
      :school="school"
      :classes="classes.length"
      :teachers="teachers.length"
      :students="students.length"
    />
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <SchoolSnapshot
        :total-records="attendance.length"
        :present-rate="presentRate"
        :absentees7d="absentees7d"
        :messages="messages.length"
      />
      <SchoolQuickLinks />
    </div>
  </div>
</template>
