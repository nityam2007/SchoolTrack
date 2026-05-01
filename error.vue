<script setup lang="ts">
defineProps<{ error: { statusCode?: number; message?: string } }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-bg text-ink flex items-center justify-center p-5">
    <div class="st-card max-w-md text-center">
      <h1 class="text-4xl font-extrabold mb-2 text-accent">{{ error?.statusCode ?? 500 }}</h1>
      <p class="text-muted mb-5">{{ error?.message ?? 'Something went wrong.' }}</p>
      <Button label="Go Home" icon="pi pi-home" @click="handleError" />
    </div>
  </div>
</template>
