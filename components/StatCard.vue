<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  sub?: string
  tone?: 'accent' | 'ok' | 'danger' | 'warn' | 'violet'
  icon?: string
}
const props = withDefaults(defineProps<Props>(), { tone: 'accent' })

const toneClass = computed(() => {
  switch (props.tone) {
    case 'ok': return 'text-ok'
    case 'danger': return 'text-danger'
    case 'warn': return 'text-warn'
    case 'violet': return 'text-violet'
    default: return 'text-accent'
  }
})
</script>

<template>
  <div class="st-card flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <span class="st-label">{{ label }}</span>
      <i v-if="icon" :class="[icon, toneClass, 'text-base']" />
    </div>
    <span class="text-3xl font-extrabold tracking-tight" :class="toneClass">{{ value }}</span>
    <span v-if="sub" class="text-muted text-xs">{{ sub }}</span>
  </div>
</template>
