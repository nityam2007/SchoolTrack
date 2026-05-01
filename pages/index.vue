<script setup lang="ts">
// Root URL just funnels to the dashboard; auth middleware handles redirect to /login
// for unauthenticated visitors.
definePageMeta({ layout: false })
await navigateTo('/dashboard')
</script>

<template>
  <div />
</template>
