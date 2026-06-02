<script setup lang="ts">
// Horizontal bar list (label · value), value-proportional fill.
interface Pt { label: string; value: number }
const props = withDefaults(defineProps<{ data: Pt[]; color?: string; unit?: string }>(), {
  color: '#126dfb', unit: '',
})
const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`)
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <div v-if="!data.length" class="text-muted text-sm py-6 text-center">No data.</div>
    <div v-for="d in data" :key="d.label" class="relative h-9 rounded-lg bg-surface2 overflow-hidden">
      <div
        class="absolute inset-y-0 left-0 rounded-lg opacity-80"
        :style="{ width: `${Math.max(8, (d.value / max) * 100)}%`, background: color }"
      />
      <div class="absolute inset-0 flex items-center justify-between px-3.5">
        <span class="text-[13px] font-semibold text-ink truncate">{{ d.label }}</span>
        <span class="text-[12.5px] font-medium text-light tabular-nums">{{ fmt(d.value) }}{{ unit }}</span>
      </div>
    </div>
  </div>
</template>
