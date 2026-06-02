<script setup lang="ts">
// Generic smooth area+line chart (pure SVG, no deps).
interface Pt { label: string; value: number }
const props = withDefaults(defineProps<{
  points: Pt[]
  color?: string
  height?: number
  fill?: boolean
  dashed?: boolean
  unit?: string
}>(), { color: '#126dfb', height: 200, fill: true, dashed: false, unit: '' })

const W = 540
const PAD = { top: 16, right: 14, bottom: 28, left: 40 }
const innerW = W - PAD.left - PAD.right
const innerH = computed(() => props.height - PAD.top - PAD.bottom)
const max = computed(() => Math.max(1, ...props.points.map((p) => p.value)) * 1.1)

const coords = computed(() =>
  props.points.map((p, i) => ({
    x: PAD.left + (props.points.length === 1 ? innerW / 2 : (i / (props.points.length - 1)) * innerW),
    y: PAD.top + innerH.value - (p.value / max.value) * innerH.value,
    ...p,
  })),
)

const linePath = computed(() => {
  const pts = coords.value
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
})
const areaPath = computed(() => {
  if (coords.value.length < 2) return ''
  const base = PAD.top + innerH.value
  const last = coords.value[coords.value.length - 1]
  return `${linePath.value} L ${last.x} ${base} L ${coords.value[0].x} ${base} Z`
})
const yTicks = computed(() =>
  [0, 0.5, 1].map((f) => ({
    y: PAD.top + innerH.value - f * innerH.value,
    label: Math.round(max.value * f).toString(),
  })),
)
const gid = `g${Math.round(props.height)}-${props.color.replace('#', '')}`
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${height}`" class="w-full h-auto">
    <defs>
      <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.22" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g>
      <line v-for="t in yTicks" :key="`g${t.y}`" :x1="PAD.left" :x2="W - PAD.right" :y1="t.y" :y2="t.y" stroke="#EEF2F7" stroke-width="1" />
      <text v-for="t in yTicks" :key="`t${t.y}`" :x="PAD.left - 8" :y="t.y + 4" text-anchor="end" font-size="11" fill="#94A3B8">{{ t.label }}{{ unit }}</text>
    </g>
    <path v-if="fill && areaPath" :d="areaPath" :fill="`url(#${gid})`" />
    <path :d="linePath" fill="none" :stroke="color" stroke-width="2.5" :stroke-dasharray="dashed ? '5 4' : '0'" stroke-linecap="round" />
    <circle v-for="c in coords" :key="`c${c.x}`" :cx="c.x" :cy="c.y" r="3" :fill="color" />
    <text v-for="(c, i) in coords" :key="`x${i}`" :x="c.x" :y="height - 6" text-anchor="middle" font-size="11" fill="#94A3B8">{{ c.label }}</text>
  </svg>
</template>
