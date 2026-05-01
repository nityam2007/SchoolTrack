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
    case 'ok':     return { text: 'text-ok',     bg: 'bg-ok/10',     ring: 'ring-ok/20',     glow: 'from-ok/15' }
    case 'danger': return { text: 'text-danger', bg: 'bg-danger/10', ring: 'ring-danger/20', glow: 'from-danger/15' }
    case 'warn':   return { text: 'text-warn',   bg: 'bg-warn/10',   ring: 'ring-warn/20',   glow: 'from-warn/15' }
    case 'violet': return { text: 'text-violet', bg: 'bg-violet/10', ring: 'ring-violet/20', glow: 'from-violet/15' }
    default:       return { text: 'text-accent', bg: 'bg-accentSoft', ring: 'ring-accent/20', glow: 'from-accent/15' }
  }
})
</script>

<template>
  <div class="st-card st-card-hover relative overflow-hidden group">
    <div
      class="absolute inset-0 bg-gradient-to-br to-transparent opacity-50 pointer-events-none"
      :class="tone.glow"
    />
    <div class="relative flex flex-col gap-1.5">
      <div class="flex items-center justify-between">
        <span class="st-label">{{ label }}</span>
        <div
          v-if="icon"
          class="w-8 h-8 rounded-ctl flex items-center justify-center ring-1 transition-transform group-hover:scale-105"
          :class="[tone.bg, tone.ring]"
        >
          <i :class="[icon, tone.text]" class="text-sm" />
        </div>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-extrabold tracking-tight font-display" :class="tone.text">
          {{ value }}
        </span>
        <span
          v-if="trend !== undefined"
          class="text-[11px] font-semibold flex items-center gap-0.5"
          :class="trend >= 0 ? 'text-ok' : 'text-danger'"
        >
          <i :class="trend >= 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'" class="text-[10px]" />
          {{ Math.abs(trend) }}%
        </span>
      </div>
      <span v-if="sub" class="text-muted text-xs">{{ sub }}</span>
    </div>
  </div>
</template>
