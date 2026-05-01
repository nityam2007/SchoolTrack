<script setup lang="ts">
import type { AttendanceStatus } from '~/types/database'

const auth = useAuthStore()
const db = useDbStore()

const today = new Date().toISOString().split('T')[0]

const roster = computed(() => (auth.user?.classId ? db.studentsForClass(auth.user.classId) : []))

// status state — keyed by studentId.
const states = ref<Record<string, AttendanceStatus>>(
  Object.fromEntries(roster.value.map((s) => [s.id, 'present'])),
)

const photoTaken = ref(false)

const setAll = (status: AttendanceStatus) => {
  for (const s of roster.value) states.value[s.id] = status
}

const submit = () => {
  if (!photoTaken.value) {
    alert('A classroom photo is required.')
    return
  }
  for (const s of roster.value) {
    db.upsertAttendance({
      id: `A${Date.now()}-${s.id}`,
      schoolId: s.schoolId,
      classId: s.classId,
      studentId: s.id,
      date: today,
      status: states.value[s.id] ?? 'present',
      teacherId: auth.user?.teacherId ?? '',
      photo: true,
      timestamp: new Date().toISOString(),
    })
  }
  alert('Attendance saved.')
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="st-h2 m-0">Mark Attendance — {{ today }}</h2>
      <div class="flex gap-2">
        <Button label="All Present" severity="success" outlined @click="setAll('present')" />
        <Button label="All Absent" severity="danger" outlined @click="setAll('absent')" />
      </div>
    </div>

    <div class="st-card flex items-center justify-between">
      <div>
        <p class="font-bold m-0">Classroom Photo</p>
        <p class="text-muted text-xs m-0 mt-1">
          Required proof. Live capture only — gallery uploads disabled.
        </p>
      </div>
      <Button
        :label="photoTaken ? 'Retake Photo' : 'Take Photo'"
        :icon="photoTaken ? 'pi pi-refresh' : 'pi pi-camera'"
        :severity="photoTaken ? 'secondary' : 'primary'"
        @click="photoTaken = true"
      />
    </div>

    <div class="st-card">
      <DataTable :value="roster" responsive-layout="scroll" striped-rows>
        <Column field="roll" header="Roll" />
        <Column field="name" header="Name" />
        <Column header="Status" :style="{ width: '320px' }">
          <template #body="{ data }">
            <SelectButton
              v-model="states[data.id]"
              :options="['present', 'absent']"
              :allow-empty="false"
            >
              <template #option="slotProps">
                <span
                  :class="
                    slotProps.option === 'present' ? 'text-ok' : 'text-danger'
                  "
                  class="capitalize font-semibold"
                >
                  {{ slotProps.option }}
                </span>
              </template>
            </SelectButton>
          </template>
        </Column>
      </DataTable>
    </div>

    <div class="flex justify-end">
      <Button label="Submit Attendance" icon="pi pi-check" size="large" @click="submit" />
    </div>
  </div>
</template>
