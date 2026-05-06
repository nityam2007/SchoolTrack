<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()
const today = todayLocal()

const stats = computed(() => {
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
  <EmptyState
    v-if="!stats"
    icon="pi pi-id-card"
    title="No class assigned"
    description="Your teacher account isn't linked to a class yet. The principal can assign one in the Teachers page."
  />
  <div v-else-if="stats.isHoliday" class="st-card text-center py-12">
    <i class="pi pi-calendar text-warn text-5xl mb-3 block" />
    <p class="font-bold text-lg m-0">Today is a holiday</p>
    <p class="text-muted text-sm mt-1">Enjoy your day — attendance is paused.</p>
  </div>
  <div v-else class="flex flex-col gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Students" :value="stats.students" tone="accent" icon="pi pi-users" />
      <StatCard
        label="Present today"
        :value="stats.isMarked ? stats.present : '—'"
        :sub="stats.isMarked ? `${stats.absent} absent` : 'not yet marked'"
        :tone="stats.isMarked ? 'ok' : 'warn'"
        icon="pi pi-check"
      />
      <StatCard
        label="Status"
        :value="stats.isMarked ? 'Submitted' : 'Pending'"
        :sub="stats.isMarked ? 'with photo proof' : 'mark before 10:00 AM'"
        :tone="stats.isMarked ? 'ok' : 'danger'"
        icon="pi pi-clock"
      />
    </div>
    <div class="st-card relative overflow-hidden">
      <div
        class="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        :style="`background: ${stats.isMarked ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.18)'};`"
      />
      <div class="relative flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p class="font-bold m-0">
            {{ stats.isMarked ? 'Today\'s attendance is in.' : 'Mark today\'s attendance' }}
          </p>
          <p class="text-muted text-sm m-0 mt-1">
            {{ stats.isMarked ? 'Re-marking will override the existing record.' : 'A live classroom photo is required as proof.' }}
          </p>
        </div>
        <Button
          :label="stats.isMarked ? 'Re-mark' : 'Start marking'"
          :icon="stats.isMarked ? 'pi pi-refresh' : 'pi pi-check-square'"
          :severity="stats.isMarked ? 'secondary' : 'primary'"
          :outlined="stats.isMarked"
          @click="navigateTo('/mark-attendance')"
        />
      </div>
    </div>
  </div>
</template>
