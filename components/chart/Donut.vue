<script setup lang="ts">
// Semicircle gauge with a centred value.
const props = withDefaults(defineProps<{ value: number; max?: number; suffix?: string; color?: string }>(), {
  max: 100, suffix: '%', color: '#126dfb',
})
const R = 80
const ARC = Math.PI * R
const pct = computed(() => Math.min(1, Math.max(0, props.value / props.max)))
const dash = computed(() => pct.value * ARC)
const display = computed(() => (props.suffix === '%' ? Math.round(pct.value * 100) : props.value))
</script>

<template>
  <div class="relative flex items-end justify-center">
    <svg viewBox="0 0 200 110" class="w-[200px] overflow-visible">
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#EAF0FB" stroke-width="16" stroke-linecap="round" />
      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" :stroke="color" stroke-width="16" stroke-linecap="round" :stroke-dasharray="`${dash} ${ARC}`" />
    </svg>
    <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[34px] font-bold tracking-tight text-ink font-display">
      {{ display }}{{ suffix }}
    </span>
  </div>
</template>
