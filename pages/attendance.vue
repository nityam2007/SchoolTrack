<script setup lang="ts">
import type { AttendancePhoto } from '~/types/database'

definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()

const date = ref(todayLocal())
const selClass = ref<string>('all')

const classes = computed(() => (db.activeSchoolId ? db.classesForSchool(db.activeSchoolId) : []))

onMounted(() => { if (db.activeSchoolId) db.loadAttendancePhotos(db.activeSchoolId) })
watch(() => db.activeSchoolId, (id) => { if (id) db.loadAttendancePhotos(id) })

const records = computed(() => {
  if (!db.activeSchoolId) return []
  return db.attendance.filter(
    (a) => a.school_id === db.activeSchoolId && a.date === date.value && (selClass.value === 'all' || a.class_id === selClass.value),
  )
})
const enriched = computed(() =>
  records.value.map((a) => ({
    ...a,
    student_name: db.studentMap.get(a.student_id)?.name ?? a.student_id,
    class_name: db.classMap.get(a.class_id)?.name ?? a.class_id,
  })),
)
const present = computed(() => enriched.value.filter((a) => a.status === 'present').length)
const absent = computed(() => enriched.value.filter((a) => a.status === 'absent').length)

// ── Classroom photos (private bucket → short-lived signed URLs) ──────────────
const photos = computed(() =>
  db.attendancePhotos.filter((p) => p.date === date.value && (selClass.value === 'all' || p.class_id === selClass.value)),
)
const signed = ref<Record<string, string>>({})
const ensureSigned = async (p: AttendancePhoto) => {
  if (signed.value[p.path]) return
  try {
    const { data } = await useSb().storage.from('attendance-photos').createSignedUrl(p.path, 3600)
    if (data?.signedUrl) signed.value = { ...signed.value, [p.path]: data.signedUrl }
  } catch { /* bucket not provisioned yet */ }
}
watch(photos, (list) => list.forEach(ensureSigned), { immediate: true })

const zoom = ref<string | null>(null)
const exportCsv = () => {
  downloadFile(
    toCsv(enriched.value.map((a) => ({ student: a.student_name, class: a.class_name, status: a.status })), ['student', 'class', 'status']),
    `attendance-${date.value}.csv`,
  )
}
const clsName = (id: string) => db.classMap.get(id)?.name ?? id
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h2 class="st-h2 m-0">Attendance Records</h2>
      <Button label="Export" icon="pi pi-download" severity="secondary" outlined @click="exportCsv" />
    </div>

    <div class="st-card !p-4 flex flex-wrap items-center gap-3">
      <input v-model="date" type="date" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      <select v-model="selClass" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent min-w-[160px]">
        <option value="all">All classes</option>
        <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <Tag :value="`${present} Present`" severity="success" />
      <Tag :value="`${absent} Absent`" severity="danger" />
    </div>

    <!-- Classroom photos (proof) -->
    <div v-if="photos.length" class="st-card">
      <p class="st-h3 mb-3">Classroom photos · {{ date }}</p>
      <div class="flex flex-wrap gap-4">
        <div v-for="p in photos" :key="p.id" class="w-44">
          <button type="button" class="block w-44 h-28 rounded-card overflow-hidden border border-line bg-surface2 hover:border-accent transition-colors" @click="signed[p.path] && (zoom = signed[p.path])">
            <img v-if="signed[p.path]" :src="signed[p.path]" alt="classroom" class="w-full h-full object-cover">
            <span v-else class="flex items-center justify-center w-full h-full text-muted text-xs"><i class="pi pi-image mr-1" /> loading…</span>
          </button>
          <p class="text-xs text-light mt-1.5 font-medium">{{ clsName(p.class_id) }}</p>
        </div>
      </div>
    </div>

    <div class="st-card !p-0 overflow-hidden">
      <DataTable :value="enriched" responsive-layout="scroll" striped-rows paginator :rows="15">
        <Column field="student_name" header="Student" sortable />
        <Column field="class_name" header="Class" sortable />
        <Column header="Status">
          <template #body="{ data }"><Tag :value="data.status" :severity="data.status === 'present' ? 'success' : 'danger'" /></template>
        </Column>
        <Column header="Photo proof">
          <template #body="{ data }"><Tag :value="data.photo ? 'Saved' : 'Missing'" :severity="data.photo ? 'success' : 'danger'" /></template>
        </Column>
      </DataTable>
    </div>

    <Dialog :visible="!!zoom" modal header="Classroom photo" :style="{ width: '720px' }" @update:visible="(v) => { if (!v) zoom = null }">
      <img v-if="zoom" :src="zoom" alt="classroom" class="w-full rounded-card">
    </Dialog>
  </div>
</template>
