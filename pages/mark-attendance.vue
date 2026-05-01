<script setup lang="ts">
import type { Attendance, AttendanceStatus } from '~/types/database'

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()

const today = new Date().toISOString().split('T')[0]

const cls = computed(() =>
  auth.user?.classId ? db.classes.find((c) => c.id === auth.user!.classId) ?? null : null,
)
const roster = computed(() => (auth.user?.classId ? db.studentsForClass(auth.user.classId) : []))
const isHoliday = computed(() => db.holidays.some((h) => h.date === today))
const alreadyMarked = computed(() =>
  auth.user?.classId
    ? db.attendance.some((a) => a.class_id === auth.user!.classId && a.date === today)
    : false,
)

// Default everyone to present.
const states = ref<Record<string, AttendanceStatus>>({})
watchEffect(() => {
  for (const s of roster.value) if (!states.value[s.id]) states.value[s.id] = 'present'
})

const photoTaken = ref(false)
const submitting = ref(false)

const setAll = (status: AttendanceStatus) => {
  for (const s of roster.value) states.value[s.id] = status
}

const toggle = (id: string) => {
  states.value[id] = states.value[id] === 'present' ? 'absent' : 'present'
}

const submit = async () => {
  if (!photoTaken.value) {
    toast.add({ severity: 'warn', summary: 'Classroom photo required', life: 3000 })
    return
  }
  if (!auth.user?.classId || !auth.schoolId) return
  const records: Attendance[] = roster.value.map((s) => ({
    id: `A${Date.now().toString(36).toUpperCase()}-${s.id}`,
    school_id: auth.schoolId!,
    class_id: auth.user!.classId!,
    student_id: s.id,
    date: today,
    status: states.value[s.id] ?? 'present',
    teacher_id: auth.user!.teacherId ?? null,
    photo: true,
    timestamp: new Date().toISOString(),
  }))
  submitting.value = true
  try {
    await db.upsertAttendanceBatch(records)
    toast.add({ severity: 'success', summary: 'Attendance saved', life: 2000 })
    navigateTo('/dashboard')
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Failed', detail: (e as Error).message, life: 4000 })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="st-h2 m-0">Mark Attendance — {{ cls?.name ?? '—' }}</h2>
      <Tag :value="today" severity="info" />
    </div>

    <div v-if="isHoliday" class="st-card text-center py-12">
      <i class="pi pi-calendar text-warn text-5xl mb-4 block" />
      <p class="font-bold text-xl mb-1">Today is a holiday</p>
      <p class="text-muted text-sm">{{ db.holidays.find((h) => h.date === today)?.title }}</p>
    </div>

    <template v-else>
      <Message v-if="alreadyMarked" severity="warn" :closable="false">
        Attendance has already been submitted for today. Re-submitting will override the previous record.
      </Message>

      <div class="flex flex-wrap items-center gap-2">
        <Button label="All Present" icon="pi pi-check" severity="success" outlined @click="setAll('present')" />
        <Button label="All Absent" icon="pi pi-times" severity="danger" outlined @click="setAll('absent')" />
      </div>

      <div class="st-card flex items-center justify-between flex-wrap gap-3">
        <div>
          <p class="font-bold m-0">Classroom Photo</p>
          <p class="text-muted text-xs m-0 mt-1">Required proof. In a real device this triggers the live camera.</p>
        </div>
        <Button
          :label="photoTaken ? 'Photo Captured ✓' : 'Take Photo'"
          :icon="photoTaken ? 'pi pi-refresh' : 'pi pi-camera'"
          :severity="photoTaken ? 'secondary' : 'primary'"
          @click="photoTaken = true"
        />
      </div>

      <div class="st-card flex flex-col gap-2">
        <div
          v-for="s in roster"
          :key="s.id"
          class="flex items-center justify-between px-4 py-3 rounded-ctl border cursor-pointer transition-colors"
          :class="
            states[s.id] === 'present'
              ? 'bg-ok/10 border-ok/40'
              : 'bg-danger/10 border-danger/40'
          "
          @click="toggle(s.id)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-ctl flex items-center justify-center font-bold text-sm text-white"
              :class="states[s.id] === 'present' ? 'bg-ok' : 'bg-danger'"
            >
              {{ s.roll }}
            </div>
            <span class="font-semibold">{{ s.name }}</span>
          </div>
          <Tag
            :value="states[s.id]"
            :severity="states[s.id] === 'present' ? 'success' : 'danger'"
          />
        </div>
      </div>

      <div class="flex justify-end">
        <Button
          label="Submit Attendance"
          icon="pi pi-check"
          size="large"
          :loading="submitting"
          @click="submit"
        />
      </div>
    </template>
  </div>
</template>
