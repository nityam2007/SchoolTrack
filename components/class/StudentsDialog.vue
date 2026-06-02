<script setup lang="ts">
import type { Class } from '~/types/database'

const props = defineProps<{ visible: boolean; cls: Class | null }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const db = useDbStore()
const router = useRouter()
const q = ref('')

const students = computed(() => (props.cls ? db.studentsForClass(props.cls.id) : []))
const filtered = computed(() => {
  const t = q.value.trim().toLowerCase()
  return t ? students.value.filter((s) => `${s.name} ${s.roll}`.toLowerCase().includes(t)) : students.value
})
const open = (id: string) => { emit('update:visible', false); router.push(`/students/${id}`) }
const exportCsv = () => {
  if (!props.cls) return
  downloadFile(
    toCsv(students.value.map((s) => ({ roll: s.roll, name: s.name, parent_phone: s.parent_phone, attendance_pct: s.attendance_pct })),
      ['roll', 'name', 'parent_phone', 'attendance_pct']),
    `${props.cls.name}-students.csv`,
  )
}
</script>

<template>
  <Dialog :visible="visible" modal :header="cls ? `${cls.name} · students` : 'Students'" :style="{ width: '640px' }" @update:visible="emit('update:visible', $event)">
    <div class="flex items-center gap-2 mb-3">
      <span class="relative flex-1">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
        <input v-model="q" type="text" placeholder="Search name or roll…" class="w-full h-9 pl-10 pr-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </span>
      <Button label="Export" icon="pi pi-download" severity="secondary" outlined size="small" @click="exportCsv" />
    </div>
    <div v-if="!filtered.length" class="text-muted text-sm py-8 text-center">No students in this class.</div>
    <DataTable v-else :value="filtered" responsive-layout="scroll" striped-rows scrollable scroll-height="400px" class="!text-sm" :row-class="() => 'cursor-pointer'" @row-click="(e) => open(e.data.id)">
      <Column field="roll" header="Roll" sortable />
      <Column field="name" header="Name" sortable><template #body="{ data }"><span class="font-semibold">{{ data.name }}</span></template></Column>
      <Column header="Attendance"><template #body="{ data }"><span :class="data.attendance_pct >= 75 ? 'text-ok' : 'text-warn'" class="font-bold">{{ data.attendance_pct }}%</span></template></Column>
      <Column field="parent_phone" header="Parent"><template #body="{ data }"><span class="font-mono text-xs text-light">{{ data.parent_phone || '—' }}</span></template></Column>
    </DataTable>
  </Dialog>
</template>
