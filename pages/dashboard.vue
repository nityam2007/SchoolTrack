<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const platformStats = computed(() => {
  const totalSchools = db.schools.length
  const activeSchools = db.schools.filter((s) => s.active).length
  const totalStudents = db.students.length
  const totalCredits = db.schools.reduce((acc, s) => acc + s.credits, 0)
  const totalMessages = db.messages.length
  return { totalSchools, activeSchools, totalStudents, totalCredits, totalMessages }
})

const schoolStats = computed(() => {
  const sid = auth.schoolId
  if (!sid) return null
  const school = db.schools.find((s) => s.id === sid)
  return {
    school,
    classes: db.classesForSchool(sid).length,
    teachers: db.teachersForSchool(sid).length,
    students: db.studentsForSchool(sid).length,
  }
})

const teacherStats = computed(() => {
  const cid = auth.user?.classId
  if (!cid) return null
  const cls = db.classes.find((c) => c.id === cid)
  const roster = db.studentsForClass(cid)
  const today = new Date().toISOString().split('T')[0]
  const marked = db.attendance.filter((a) => a.class_id === cid && a.date === today)
  return {
    className: cls?.name ?? '—',
    students: roster.length,
    markedToday: marked.length,
    isMarked: marked.length > 0,
  }
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="db.loading && !db.loaded" class="st-card text-muted">Loading…</div>

    <template v-if="auth.role === 'superadmin'">
      <h2 class="st-h2 m-0">Platform Overview</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Schools" :value="platformStats.totalSchools" :sub="`${platformStats.activeSchools} active`" tone="accent" icon="pi pi-building" />
        <StatCard label="Total Students" :value="platformStats.totalStudents" tone="violet" icon="pi pi-users" />
        <StatCard label="Credits in Circulation" :value="platformStats.totalCredits" tone="ok" icon="pi pi-credit-card" />
        <StatCard label="Messages Sent" :value="platformStats.totalMessages" tone="warn" icon="pi pi-comments" />
      </div>
      <div class="st-card">
        <p class="font-bold mb-4">Schools</p>
        <DataTable :value="db.schools" responsive-layout="scroll" striped-rows>
          <Column field="id" header="ID" />
          <Column field="name" header="Name" />
          <Column field="city" header="City" />
          <Column header="Credits">
            <template #body="{ data }">
              <span :class="data.credits < 100 ? 'text-danger' : 'text-ok'" class="font-bold">{{ data.credits }}</span>
            </template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              <Tag :value="data.active ? 'Active' : 'Inactive'" :severity="data.active ? 'success' : 'danger'" />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>

    <template v-else-if="auth.role === 'schooladmin' && schoolStats">
      <h2 class="st-h2 m-0">{{ schoolStats.school?.name }} — Today</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Classes" :value="schoolStats.classes" tone="accent" icon="pi pi-th-large" />
        <StatCard label="Teachers" :value="schoolStats.teachers" tone="violet" icon="pi pi-id-card" />
        <StatCard label="Students" :value="schoolStats.students" tone="ok" icon="pi pi-users" />
        <StatCard
          label="Credits"
          :value="schoolStats.school?.credits ?? 0"
          :tone="(schoolStats.school?.credits ?? 0) < 100 ? 'danger' : 'warn'"
          icon="pi pi-credit-card"
        />
      </div>
      <div class="st-card">
        <p class="font-bold mb-2">Welcome back, Principal.</p>
        <p class="text-muted text-sm m-0">
          Manage attendance, students, teachers, holidays, parent messages, and report cards from the sidebar.
        </p>
      </div>
    </template>

    <template v-else-if="auth.role === 'teacher' && teacherStats">
      <h2 class="st-h2 m-0">{{ teacherStats.className }} — Today</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Students" :value="teacherStats.students" tone="accent" icon="pi pi-users" />
        <StatCard
          label="Marked Today"
          :value="teacherStats.markedToday"
          :tone="teacherStats.isMarked ? 'ok' : 'warn'"
          icon="pi pi-check-square"
        />
        <StatCard
          label="Status"
          :value="teacherStats.isMarked ? 'Done' : 'Pending'"
          :tone="teacherStats.isMarked ? 'ok' : 'danger'"
          icon="pi pi-clock"
        />
      </div>
      <div class="st-card flex items-center justify-between">
        <div>
          <p class="font-bold m-0">Mark today's attendance</p>
          <p class="text-muted text-sm m-0 mt-1">A classroom photo is required.</p>
        </div>
        <Button label="Mark Attendance" icon="pi pi-check-square" @click="navigateTo('/mark-attendance')" />
      </div>
    </template>
  </div>
</template>
