<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in">
    <DashboardHero />
    <div v-if="db.loading && !db.loaded" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton v-for="i in 4" :key="i" height="6rem" class="!rounded-card" />
    </div>
    <DashboardSuperAdmin v-else-if="auth.role === 'superadmin'" />
    <DashboardPrincipal  v-else-if="auth.role === 'schooladmin'" />
    <DashboardTeacher    v-else-if="auth.role === 'teacher'" />
  </div>
</template>
