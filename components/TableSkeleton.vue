<script setup lang="ts">
withDefaults(defineProps<{ rows?: number; cols?: number }>(), { rows: 6, cols: 4 })
</script>

<template>
  <div class="st-card animate-fade-in">
    <div class="flex gap-3 mb-4">
      <Skeleton v-for="c in cols" :key="`h${c}`" height="0.85rem" :width="c === 1 ? '8rem' : '6rem'" />
    </div>
    <div v-for="r in rows" :key="r" class="flex gap-3 mb-3">
      <Skeleton v-for="c in cols" :key="`r${r}c${c}`" height="1.1rem" :width="c === 1 ? '8rem' : '6rem'" />
    </div>
  </div>
</template>
