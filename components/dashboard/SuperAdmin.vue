<script setup lang="ts">
const db = useDbStore()

const stats = computed(() => ({
  totalSchools:  db.schools.length,
  activeSchools: db.schools.filter((s) => s.active).length,
  totalStudents: db.students.length,
  totalCredits:  db.schools.reduce((acc, s) => acc + s.credits, 0),
  totalMessages: db.messages.length,
  lowCredit:     db.schools.filter((s) => s.credits < 100).length,
}))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Schools"  :value="stats.totalSchools"  :sub="`${stats.activeSchools} active`" tone="accent" icon="pi pi-building" />
      <StatCard label="Students" :value="stats.totalStudents" sub="across the platform" tone="violet" icon="pi pi-users" />
      <StatCard label="Credits"  :value="stats.totalCredits"  :sub="stats.lowCredit ? `${stats.lowCredit} school(s) low` : 'all healthy'" :tone="stats.lowCredit ? 'warn' : 'ok'" icon="pi pi-credit-card" />
      <StatCard label="Messages" :value="stats.totalMessages" sub="lifetime sent" tone="warn" icon="pi pi-comments" />
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
                <NuxtLink :to="`/schools/${data.id}`" class="font-semibold m-0 hover:text-accent">{{ data.name }}</NuxtLink>
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
          <NuxtLink to="/credits" class="flex items-center justify-between bg-surface hover:bg-surface2 border border-line hover:border-accent/30 rounded-ctl px-3 py-3 transition-colors">
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
          <NuxtLink to="/analytics" class="flex items-center justify-between bg-surface hover:bg-surface2 border border-line hover:border-accent/30 rounded-ctl px-3 py-3 transition-colors">
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DashboardUpcomingHolidays />
    </div>
  </div>
</template>
