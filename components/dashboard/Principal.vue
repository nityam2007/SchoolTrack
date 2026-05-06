<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
const today = todayLocal()

const stats = computed(() => {
  const sid = auth.schoolId
  if (!sid) return null
  const school = db.schools.find((s) => s.id === sid)
  if (!school) return null
  const att = db.attendance.filter((a) => a.school_id === sid && a.date === today)
  const present = att.filter((a) => a.status === 'present').length
  const absent  = att.filter((a) => a.status === 'absent').length
  const total   = present + absent
  return {
    school,
    classes:  db.classesForSchool(sid).length,
    teachers: db.teachersForSchool(sid).length,
    students: db.studentsForSchool(sid).length,
    present, absent,
    rate: total ? Math.round((present / total) * 100) : 0,
  }
})
</script>

<template>
  <EmptyState
    v-if="!stats"
    icon="pi pi-building"
    title="No school assigned"
    description="Your account is set up as a school admin but isn't linked to a school yet. Ask the platform admin to assign one."
  />
  <div v-else class="flex flex-col gap-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Classes"  :value="stats.classes"  tone="accent" icon="pi pi-th-large" />
      <StatCard label="Teachers" :value="stats.teachers" tone="violet" icon="pi pi-id-card" />
      <StatCard label="Students" :value="stats.students" tone="ok"     icon="pi pi-users" />
      <StatCard
        label="Credits"
        :value="stats.school.credits"
        :sub="stats.school.credits < 100 ? 'low — request top up' : 'healthy'"
        :tone="stats.school.credits < 100 ? 'danger' : 'warn'"
        icon="pi pi-credit-card"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="st-card lg:col-span-2 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none" />
        <div class="relative">
          <div class="flex items-center justify-between mb-4">
            <p class="st-h3 m-0">Today's attendance</p>
            <NuxtLink to="/attendance">
              <Button label="View all" icon="pi pi-arrow-right" icon-pos="right" text size="small" />
            </NuxtLink>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-muted">Present</p>
              <p class="text-3xl font-extrabold text-ok font-display tabular-nums">{{ stats.present }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Absent</p>
              <p class="text-3xl font-extrabold text-danger font-display tabular-nums">{{ stats.absent }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">Rate</p>
              <p class="text-3xl font-extrabold text-accent font-display tabular-nums">{{ stats.rate }}%</p>
            </div>
          </div>
          <ProgressBar :value="stats.rate" :show-value="false" class="mt-5 h-1.5" />
        </div>
      </div>

      <div class="st-card">
        <div class="flex items-center justify-between mb-3">
          <p class="st-h3 m-0">Absent today</p>
          <Tag v-if="db.absenteesToday.length" :value="db.absenteesToday.length" severity="danger" />
        </div>
        <div v-if="!db.absenteesToday.length" class="text-muted text-sm py-6 text-center">
          <i class="pi pi-check-circle text-ok text-xl block mb-2" />
          No absentees recorded today.
        </div>
        <div v-else class="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          <NuxtLink
            v-for="(a, i) in db.absenteesToday"
            :key="i"
            :to="`/students/${a.student_id}`"
            class="flex items-center gap-3 bg-surface rounded-ctl px-3 py-2 hover:bg-surface2"
          >
            <span class="w-7 h-7 rounded-ctl bg-danger/15 text-danger text-[11px] font-bold flex items-center justify-center shrink-0">
              {{ a.roll }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold m-0 truncate">{{ a.student_name }}</p>
              <p class="text-xs text-muted m-0">{{ a.class_name }}</p>
            </div>
          </NuxtLink>
        </div>
        <NuxtLink v-if="db.absenteesToday.length" to="/messages" class="block mt-3">
          <Button label="Notify parents" icon="pi pi-send" severity="success" outlined size="small" class="w-full" />
        </NuxtLink>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DashboardUpcomingHolidays />
    </div>
  </div>
</template>
