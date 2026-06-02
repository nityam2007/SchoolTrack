<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  sub?: string
  tone?: 'accent' | 'ok' | 'danger' | 'warn' | 'violet'
  icon?: string
  trend?: number   // percentage delta — positive = up
}
const props = withDefaults(defineProps<Props>(), { tone: 'accent' })

const tone = computed(() => {
  switch (props.tone) {
    case 'ok':     return { text: 'text-ok',     bg: 'bg-ok/10' }
    case 'danger': return { text: 'text-danger', bg: 'bg-danger/10' }
    case 'warn':   return { text: 'text-warn',   bg: 'bg-warn/10' }
    case 'violet': return { text: 'text-violet', bg: 'bg-violet/10' }
    default:       return { text: 'text-accent', bg: 'bg-accentSoft' }
  }
})
</script>

<template>
  <div class="st-card st-card-hover group">
    <div class="flex items-start justify-between">
      <span class="text-[13px] font-semibold text-light">{{ label }}</span>
      <div
        v-if="icon"
        class="w-9 h-9 rounded-ctl flex items-center justify-center transition-transform group-hover:scale-105"
        :class="tone.bg"
      >
        <i :class="[icon, tone.text]" class="text-[15px]" />
      </div>
    </div>

    <div class="flex items-baseline gap-2 mt-3">
      <span class="text-[30px] leading-none font-bold tracking-tight font-display text-ink tabular-nums">
        {{ value }}
      </span>
      <span
        v-if="trend !== undefined"
        class="text-[12px] font-semibold flex items-center gap-0.5"
        :class="trend >= 0 ? 'text-ok' : 'text-danger'"
      >
        <i :class="trend >= 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'" class="text-[10px]" />
        {{ Math.abs(trend) }}%
      </span>
    </div>

    <span v-if="sub" class="text-muted text-[13px] mt-1.5 block">{{ sub }}</span>
  </div>
</template>
