<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
const { greeting, firstName } = useUserDisplay()

const today = new Date().toISOString().split('T')[0]

// ── Super Admin
const platformStats = computed(() => ({
  totalSchools:  db.schools.length,
  activeSchools: db.schools.filter((s) => s.active).length,
  totalStudents: db.students.length,
  totalCredits:  db.schools.reduce((acc, s) => acc + s.credits, 0),
  totalMessages: db.messages.length,
  lowCredit:     db.schools.filter((s) => s.credits < 100).length,
}))

// ── Principal
const schoolStats = computed(() => {
  const sid = auth.schoolId
  if (!sid) return null
  const school = db.schools.find((s) => s.id === sid)!
  const att = db.attendance.filter((a) => a.school_id === sid && a.date === today)
  const present = att.filter((a) => a.status === 'present').length
  const absent  = att.filter((a) => a.status === 'absent').length
  const total   = present + absent
  return {
    school,
    classes:  db.classesForSchool(sid).length,
    teachers: db.teachersForSchool(sid).length,
    students: db.studentsForSchool(sid).length,
    present,
    absent,
    rate: total ? Math.round((present / total) * 100) : 0,
  }
})


// ── Teacher
const teacherStats = computed(() => {
  const cid = auth.user?.classId
  if (!cid) return null
  const cls = db.classes.find((c) => c.id === cid)
  const roster = db.studentsForClass(cid)
  const marked = db.attendance.filter((a) => a.class_id === cid && a.date === today)
  const present = marked.filter((a) => a.status === 'present').length
  const isHoliday = db.holidays.some((h) => h.date === today)
  return {
    className: cls?.name ?? '—',
    students: roster.length,
    present,
    absent: marked.length - present,
    isMarked: marked.length > 0,
    isHoliday,
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 animate-fade-in">
    <!-- Hero -->
    <div class="flex items-end justify-between flex-wrap gap-3">
      <div>
        <p class="text-muted text-sm font-medium">{{ greeting }}, {{ firstName }} 👋</p>
        <h2 class="st-h1 m-0 mt-1">
          <template v-if="auth.role === 'superadmin'">Platform overview</template>
          <template v-else-if="auth.role === 'schooladmin' && schoolStats">
            {{ schoolStats.school.name }}
          </template>
          <template v-else-if="auth.role === 'teacher' && teacherStats">
            {{ teacherStats.className }} · today
          </template>
        </h2>
        <p class="text-muted text-sm mt-1.5">
          {{ new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) }}
        </p>
      </div>

      <div v-if="auth.role === 'teacher' && teacherStats" class="flex gap-2">
        <Button
          v-if="!teacherStats.isHoliday"
          :label="teacherStats.isMarked ? 'Re-mark Attendance' : 'Mark Attendance'"
          :icon="teacherStats.isMarked ? 'pi pi-refresh' : 'pi pi-check-square'"
          :severity="teacherStats.isMarked ? 'secondary' : 'primary'"
          :outlined="teacherStats.isMarked"
          @click="navigateTo('/mark-attendance')"
        />
      </div>
    </div>

    <div v-if="db.loading && !db.loaded" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton v-for="i in 4" :key="i" height="6rem" class="!rounded-card" />
    </div>

    <!-- Super Admin -->
    <template v-else-if="auth.role === 'superadmin'">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Schools" :value="platformStats.totalSchools" :sub="`${platformStats.activeSchools} active`" tone="accent" icon="pi pi-building" />
        <StatCard label="Students" :value="platformStats.totalStudents" sub="across the platform" tone="violet" icon="pi pi-users" />
        <StatCard label="Credits" :value="platformStats.totalCredits" :sub="platformStats.lowCredit ? `${platformStats.lowCredit} school(s) low` : 'all healthy'" :tone="platformStats.lowCredit ? 'warn' : 'ok'" icon="pi pi-credit-card" />
        <StatCard label="Messages" :value="platformStats.totalMessages" sub="lifetime sent" tone="warn" icon="pi pi-comments" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="st-card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <p class="st-h3 m-0">Schools</p>
            <NuxtLink to="/schools">
              <Button label="Manage" icon="pi pi-arrow-right" icon-pos="right" text size="small" />
            </NuxtLink>
          </div>
          <DataTable :value="db.schools" responsive-layout="scroll" class="!text-sm">
            <Column field="name" header="Name">
              <template #body="{ data }">
                <div>
                  <p class="font-semibold m-0">{{ data.name }}</p>
                  <p class="text-muted text-xs m-0 mt-0.5">{{ data.city }}</p>
                </div>
              </template>
            </Column>
            <Column header="Credits">
              <template #body="{ data }">
                <span :class="data.credits < 100 ? 'text-danger' : 'text-ok'" class="font-bold tabular-nums">
                  {{ data.credits }}
                </span>
              </template>
            </Column>
            <Column header="Status">
              <template #body="{ data }">
                <span class="st-chip" :class="data.active ? 'bg-ok/10 text-ok' : 'bg-danger/10 text-danger'">
                  <span class="st-chip-dot" :class="data.active ? 'bg-ok' : 'bg-danger'" />
                  {{ data.active ? 'Active' : 'Inactive' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>

        <div class="st-card">
          <p class="st-h3 mb-4">Quick actions</p>
          <div class="flex flex-col gap-2">
            <NuxtLink to="/credits"
              class="flex items-center justify-between bg-surface hover:bg-surface2 border border-line hover:border-accent/30 rounded-ctl px-3 py-3 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-ctl bg-accentSoft flex items-center justify-center">
                  <i class="pi pi-credit-card text-accent text-sm" />
                </div>
                <div>
                  <p class="font-semibold text-sm m-0">Top up credits</p>
                  <p class="text-xs text-muted m-0">manage school balances</p>
                </div>
              </div>
              <i class="pi pi-chevron-right text-muted text-xs" />
            </NuxtLink>
            <NuxtLink to="/analytics"
              class="flex items-center justify-between bg-surface hover:bg-surface2 border border-line hover:border-accent/30 rounded-ctl px-3 py-3 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-ctl bg-violet/10 flex items-center justify-center">
                  <i class="pi pi-chart-bar text-violet text-sm" />
                </div>
                <div>
                  <p class="font-semibold text-sm m-0">Platform analytics</p>
                  <p class="text-xs text-muted m-0">attendance trends</p>
                </div>
              </div>
              <i class="pi pi-chevron-right text-muted text-xs" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <!-- Principal -->
    <template v-else-if="auth.role === 'schooladmin' && schoolStats">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Classes" :value="schoolStats.classes" tone="accent" icon="pi pi-th-large" />
        <StatCard label="Teachers" :value="schoolStats.teachers" tone="violet" icon="pi pi-id-card" />
        <StatCard label="Students" :value="schoolStats.students" tone="ok" icon="pi pi-users" />
        <StatCard
          label="Credits"
          :value="schoolStats.school.credits"
          :sub="schoolStats.school.credits < 100 ? 'low — request top up' : 'healthy'"
          :tone="schoolStats.school.credits < 100 ? 'danger' : 'warn'"
          icon="pi pi-credit-card"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Today snapshot -->
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
                <p class="text-3xl font-extrabold text-ok font-display tabular-nums">{{ schoolStats.present }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">Absent</p>
                <p class="text-3xl font-extrabold text-danger font-display tabular-nums">{{ schoolStats.absent }}</p>
              </div>
              <div>
                <p class="text-xs text-muted">Rate</p>
                <p class="text-3xl font-extrabold text-accent font-display tabular-nums">{{ schoolStats.rate }}%</p>
              </div>
            </div>
            <ProgressBar :value="schoolStats.rate" :show-value="false" class="mt-5 h-1.5" />
          </div>
        </div>

        <!-- Absentee feed -->
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
            <div
              v-for="(a, i) in db.absenteesToday"
              :key="i"
              class="flex items-center gap-3 bg-surface rounded-ctl px-3 py-2"
            >
              <span class="w-7 h-7 rounded-ctl bg-danger/15 text-danger text-[11px] font-bold flex items-center justify-center shrink-0">
                {{ a.roll }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold m-0 truncate">{{ a.student_name }}</p>
                <p class="text-xs text-muted m-0">{{ a.class_name }}</p>
              </div>
            </div>
          </div>
          <NuxtLink v-if="db.absenteesToday.length" to="/messages" class="block mt-3">
            <Button label="Notify parents" icon="pi pi-send" severity="success" outlined size="small" class="w-full" />
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Teacher -->
    <template v-else-if="auth.role === 'teacher' && teacherStats">
      <div v-if="teacherStats.isHoliday" class="st-card text-center py-12">
        <i class="pi pi-calendar text-warn text-5xl mb-3 block" />
        <p class="font-bold text-lg m-0">Today is a holiday</p>
        <p class="text-muted text-sm mt-1">Enjoy your day — attendance is paused.</p>
      </div>
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Students" :value="teacherStats.students" tone="accent" icon="pi pi-users" />
          <StatCard
            label="Present today"
            :value="teacherStats.isMarked ? teacherStats.present : '—'"
            :sub="teacherStats.isMarked ? `${teacherStats.absent} absent` : 'not yet marked'"
            :tone="teacherStats.isMarked ? 'ok' : 'warn'"
            icon="pi pi-check"
          />
          <StatCard
            label="Status"
            :value="teacherStats.isMarked ? 'Submitted' : 'Pending'"
            :sub="teacherStats.isMarked ? 'with photo proof' : 'mark before 10:00 AM'"
            :tone="teacherStats.isMarked ? 'ok' : 'danger'"
            icon="pi pi-clock"
          />
        </div>
        <div class="st-card relative overflow-hidden">
          <div
            class="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            :style="`background: ${teacherStats.isMarked ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.18)'};`"
          />
          <div class="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p class="font-bold m-0">
                {{ teacherStats.isMarked ? 'Today\'s attendance is in.' : 'Mark today\'s attendance' }}
              </p>
              <p class="text-muted text-sm m-0 mt-1">
                {{ teacherStats.isMarked ? 'Re-marking will override the existing record.' : 'A live classroom photo is required as proof.' }}
              </p>
            </div>
            <Button
              :label="teacherStats.isMarked ? 'Re-mark' : 'Start marking'"
              :icon="teacherStats.isMarked ? 'pi pi-refresh' : 'pi pi-check-square'"
              :severity="teacherStats.isMarked ? 'secondary' : 'primary'"
              :outlined="teacherStats.isMarked"
              @click="navigateTo('/mark-attendance')"
            />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
