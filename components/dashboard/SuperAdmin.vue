<script setup lang="ts">
import { avatarGradient, initialsOf } from '~/composables/useAvatar'

const db = useDbStore()

const stats = computed(() => {
  const funded = db.schools.filter((s) => s.credits >= 100).length
  return {
    totalSchools:  db.schools.length,
    activeSchools: db.schools.filter((s) => s.active).length,
    totalStudents: db.students.length,
    totalCredits:  db.schools.reduce((acc, s) => acc + s.credits, 0),
    totalMessages: db.messages.length,
    lowCredit:     db.schools.filter((s) => s.credits < 100).length,
    funded,
    fundedPct:     db.schools.length ? Math.round((funded / db.schools.length) * 100) : 0,
  }
})

// Schools ranked by enrolment for the "Schools" list card.
const topSchools = computed(() =>
  [...db.schools]
    .map((s) => ({ ...s, students: db.studentsForSchool(s.id).length }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 5),
)

// Gauge geometry for the funded-schools ring.
const R = 80
const ARC = Math.PI * R
const dash = computed(() => (stats.value.fundedPct / 100) * ARC)
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- KPI row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard label="Schools"  :value="stats.totalSchools"  :sub="`${stats.activeSchools} active`" tone="accent" icon="pi pi-building" />
      <StatCard label="Students" :value="stats.totalStudents" sub="across the platform" tone="violet" icon="pi pi-users" />
      <StatCard label="Credits"  :value="stats.totalCredits"  :sub="stats.lowCredit ? `${stats.lowCredit} school(s) low` : 'all healthy'" :tone="stats.lowCredit ? 'warn' : 'ok'" icon="pi pi-wallet" />
      <StatCard label="Messages" :value="stats.totalMessages" sub="lifetime sent" tone="accent" icon="pi pi-comment" />
    </div>

    <!-- Schools list + Funded gauge -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="st-card lg:col-span-2 !p-6">
        <div class="flex items-center justify-between mb-1">
          <h3 class="st-h2 m-0">Schools</h3>
          <NuxtLink to="/schools" class="text-[13px] font-semibold text-accent hover:text-accent/80 flex items-center gap-1.5">
            All schools <i class="pi pi-arrow-right text-[10px]" />
          </NuxtLink>
        </div>

        <div v-if="!topSchools.length" class="text-muted text-sm py-10 text-center">No schools yet.</div>
        <div v-else class="flex flex-col -mx-2 mt-2">
          <NuxtLink
            v-for="s in topSchools"
            :key="s.id"
            :to="`/schools/${s.id}`"
            class="group flex items-center gap-3 rounded-ctl px-3 py-2.5 hover:bg-surface2 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[13px] font-semibold shrink-0"
              :class="avatarGradient(s.name)"
            >
              {{ initialsOf(s.name) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[14.5px] font-semibold text-ink leading-tight truncate m-0 group-hover:text-accent transition-colors">{{ s.name }}</p>
              <p class="text-[12.5px] text-muted truncate m-0">{{ s.city }} · {{ s.students }} students</p>
            </div>
            <span
              class="st-chip"
              :class="s.credits < 100 ? 'bg-danger/10 text-danger' : 'bg-ok/10 text-ok'"
            >
              <span class="st-chip-dot" :class="s.credits < 100 ? 'bg-danger' : 'bg-ok'" />
              {{ s.credits }}
            </span>
            <i class="pi pi-chevron-right text-muted text-[11px] hidden sm:block" />
          </NuxtLink>
        </div>
      </div>

      <!-- Funded gauge -->
      <div class="st-card flex flex-col">
        <h3 class="st-h3 m-0 text-center">Funded schools</h3>
        <div class="relative flex-1 flex items-end justify-center mt-3 min-h-[120px]">
          <svg viewBox="0 0 200 110" class="w-[200px] overflow-visible">
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#EAF0FB" stroke-width="16" stroke-linecap="round" />
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#126dfb" stroke-width="16" stroke-linecap="round" :stroke-dasharray="`${dash} ${ARC}`" />
          </svg>
          <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[36px] font-bold tracking-tight text-ink font-display">{{ stats.fundedPct }}%</span>
        </div>
        <p class="text-center text-[13px] text-muted mt-3">
          {{ stats.funded }} of {{ stats.totalSchools }} schools fully funded
        </p>
        <NuxtLink to="/credits" class="mt-4 -mx-6 -mb-6 px-6 py-4 border-t border-line text-[13.5px] font-semibold text-accent hover:bg-surface2 rounded-b-card flex items-center justify-center gap-1.5 transition-colors">
          Top up credits <i class="pi pi-arrow-right text-[10px]" />
        </NuxtLink>
      </div>
    </div>

    <!-- Quick actions + Holidays -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="st-card lg:col-span-2">
        <h3 class="st-h3 mb-4">Quick actions</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NuxtLink to="/credits" class="flex items-center justify-between bg-surface2 hover:bg-accentSoft border border-line hover:border-accent/30 rounded-ctl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-ctl bg-accentSoft flex items-center justify-center"><i class="pi pi-wallet text-accent text-sm" /></div>
              <div>
                <p class="font-semibold text-[14px] text-ink m-0">Top up credits</p>
                <p class="text-[12px] text-muted m-0">manage balances</p>
              </div>
            </div>
            <i class="pi pi-chevron-right text-muted text-xs" />
          </NuxtLink>
          <NuxtLink to="/analytics" class="flex items-center justify-between bg-surface2 hover:bg-accentSoft border border-line hover:border-accent/30 rounded-ctl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-ctl bg-violet/10 flex items-center justify-center"><i class="pi pi-chart-bar text-violet text-sm" /></div>
              <div>
                <p class="font-semibold text-[14px] text-ink m-0">Platform analytics</p>
                <p class="text-[12px] text-muted m-0">attendance trends</p>
              </div>
            </div>
            <i class="pi pi-chevron-right text-muted text-xs" />
          </NuxtLink>
          <NuxtLink to="/schools" class="flex items-center justify-between bg-surface2 hover:bg-accentSoft border border-line hover:border-accent/30 rounded-ctl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-ctl bg-ok/10 flex items-center justify-center"><i class="pi pi-building text-ok text-sm" /></div>
              <div>
                <p class="font-semibold text-[14px] text-ink m-0">Manage schools</p>
                <p class="text-[12px] text-muted m-0">add or edit</p>
              </div>
            </div>
            <i class="pi pi-chevron-right text-muted text-xs" />
          </NuxtLink>
          <NuxtLink to="/messages" class="flex items-center justify-between bg-surface2 hover:bg-accentSoft border border-line hover:border-accent/30 rounded-ctl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-ctl bg-warn/10 flex items-center justify-center"><i class="pi pi-comment text-warn text-sm" /></div>
              <div>
                <p class="font-semibold text-[14px] text-ink m-0">Messages</p>
                <p class="text-[12px] text-muted m-0">parent notifications</p>
              </div>
            </div>
            <i class="pi pi-chevron-right text-muted text-xs" />
          </NuxtLink>
        </div>
      </div>

      <DashboardUpcomingHolidays />
    </div>
  </div>
</template>
