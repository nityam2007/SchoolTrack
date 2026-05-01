<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  actionIcon?: string
}
withDefaults(defineProps<Props>(), { icon: 'pi pi-inbox' })
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="st-card flex flex-col items-center justify-center text-center py-14 animate-fade-in">
    <div class="w-14 h-14 rounded-full bg-accentSoft flex items-center justify-center mb-4 ring-1 ring-accent/20">
      <i :class="icon" class="text-accent text-2xl" />
    </div>
    <p class="font-bold text-ink text-base mb-1">{{ title }}</p>
    <p v-if="description" class="text-muted text-sm max-w-sm">{{ description }}</p>
    <Button
      v-if="actionLabel"
      :label="actionLabel"
      :icon="actionIcon"
      class="mt-5"
      @click="$emit('action')"
    />
  </div>
</template>
