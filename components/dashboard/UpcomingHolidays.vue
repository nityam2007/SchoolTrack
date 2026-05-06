<script setup lang="ts">
const db = useDbStore()
const fmtDate = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' })
const fmtWeekday = new Intl.DateTimeFormat('en', { weekday: 'short' })
const today = todayLocal()

const upcoming = computed(() => {
  const sid = db.activeSchoolId
  if (!sid) return []
  return db.holidaysForSchool(sid)
    .filter((h) => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)
})

const todayHoliday = computed(() => upcoming.value.find((h) => h.date === today) ?? null)
</script>

<template>
  <div class="st-card">
    <div class="flex items-center justify-between mb-3">
      <p class="st-h3 m-0">Upcoming holidays</p>
      <NuxtLink to="/holidays">
        <Button label="Manage" icon="pi pi-arrow-right" icon-pos="right" text size="small" />
      </NuxtLink>
    </div>
    <div
      v-if="todayHoliday"
      class="bg-warn/10 border border-warn/30 rounded-ctl px-3 py-2.5 mb-3 flex items-start gap-2"
    >
      <i class="pi pi-info-circle text-warn mt-0.5" />
      <div>
        <p class="text-sm font-bold text-warn m-0">Today: {{ todayHoliday.title }}</p>
        <p class="text-xs text-muted m-0">Attendance is paused.</p>
      </div>
    </div>
    <div v-if="!upcoming.length" class="text-muted text-sm py-6 text-center">
      <i class="pi pi-calendar-plus text-muted text-xl block mb-2" />
      No holidays scheduled.
    </div>
    <div v-else class="flex flex-col gap-1.5">
      <div
        v-for="h in upcoming"
        :key="h.id"
        class="flex items-center gap-3 bg-surface rounded-ctl px-3 py-2"
      >
        <div class="w-10 text-center">
          <p class="text-xs text-muted m-0 leading-none">{{ fmtWeekday.format(new Date(h.date)) }}</p>
          <p class="text-sm font-bold m-0 mt-0.5 tabular-nums">{{ fmtDate.format(new Date(h.date)) }}</p>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold m-0 truncate">{{ h.title }}</p>
          <p
            v-if="h.date === today"
            class="text-[11px] font-bold text-warn m-0"
          >TODAY</p>
        </div>
      </div>
    </div>
  </div>
</template>
