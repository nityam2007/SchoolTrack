<script setup lang="ts">
const db = useDbStore()
const auth = useAuthStore()

onMounted(() => db.loadAuditLogs())

const q = ref('')
const action = ref<string>('')
const fromDate = ref('')
const toDate = ref('')

const actions = computed(() => ['', ...Array.from(new Set(db.auditLogs.map((l) => l.action))).sort()])

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  return db.auditLogs.filter((l) => {
    if (action.value && l.action !== action.value) return false
    if (fromDate.value && l.created_at < fromDate.value) return false
    if (toDate.value && l.created_at > `${toDate.value}T23:59:59`) return false
    if (term && !`${l.actor_email} ${l.action} ${l.entity} ${l.entity_id ?? ''} ${l.path ?? ''} ${l.ip ?? ''}`.toLowerCase().includes(term)) return false
    return true
  })
})

const fmt = (s: string) =>
  new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })

const actionChip = (a: string) =>
  ({
    login: 'bg-ok/10 text-ok', logout: 'bg-muted/10 text-muted',
    create: 'bg-accentSoft text-accent', update: 'bg-warn/10 text-warn',
    delete: 'bg-danger/10 text-danger', message: 'bg-violet/10 text-violet',
    page_view: 'bg-surface2 text-muted', export: 'bg-ok/10 text-ok',
    import: 'bg-accentSoft text-accent', promote: 'bg-violet/10 text-violet',
    credit: 'bg-warn/10 text-warn',
  } as Record<string, string>)[a] ?? 'bg-surface2 text-light'

const exportCsv = () => {
  downloadFile(
    toCsv(filtered.value.map((l) => ({
      time: l.created_at, actor: l.actor_email, role: l.role, action: l.action,
      entity: l.entity, entity_id: l.entity_id ?? '', path: l.path ?? '', ip: l.ip ?? '',
    })), ['time', 'actor', 'role', 'action', 'entity', 'entity_id', 'path', 'ip']),
    'activity-logs.csv',
  )
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="st-h2 m-0">Activity Logs</h2>
        <p class="text-muted text-sm mt-1">
          {{ auth.role === 'superadmin' ? 'Platform-wide activity' : auth.role === 'schooladmin' ? 'Activity in your school' : 'Your activity' }}
          · {{ filtered.length }} event(s)
        </p>
      </div>
      <Button label="Export" icon="pi pi-download" severity="secondary" outlined @click="exportCsv" />
    </div>

    <!-- Filters -->
    <div class="st-card !p-4 flex flex-wrap items-end gap-3">
      <span class="relative">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
        <input v-model="q" type="text" placeholder="Search user, action, path, IP…"
          class="h-10 w-64 pl-10 pr-3 rounded-ctl bg-surface border border-line text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accentSoft transition">
      </span>
      <div class="flex flex-col gap-1">
        <label class="st-label">Action</label>
        <select v-model="action" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
          <option v-for="a in actions" :key="a" :value="a">{{ a || 'All actions' }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">From</label>
        <input v-model="fromDate" type="date" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">To</label>
        <input v-model="toDate" type="date" class="h-10 px-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent">
      </div>
    </div>

    <div v-if="!filtered.length" class="st-card text-center py-12 text-muted text-sm">
      <i class="pi pi-history text-2xl block mb-2" />
      No activity recorded yet. (Apply migration 0006 to enable logging.)
    </div>
    <div v-else class="st-card !p-0 overflow-hidden">
      <DataTable :value="filtered" paginator :rows="20" responsive-layout="scroll" striped-rows class="!text-sm">
        <Column header="Time">
          <template #body="{ data }"><span class="text-light text-xs whitespace-nowrap">{{ fmt(data.created_at) }}</span></template>
        </Column>
        <Column header="User">
          <template #body="{ data }">
            <div class="leading-tight">
              <p class="font-semibold m-0">{{ data.actor_email || '—' }}</p>
              <p class="text-muted text-[11px] m-0">{{ data.role }}</p>
            </div>
          </template>
        </Column>
        <Column header="Action">
          <template #body="{ data }"><span class="st-chip" :class="actionChip(data.action)">{{ data.action }}</span></template>
        </Column>
        <Column header="Target">
          <template #body="{ data }">
            <span class="text-light">{{ data.entity }}<span v-if="data.entity_id" class="text-muted"> · {{ data.entity_id }}</span></span>
          </template>
        </Column>
        <Column field="path" header="Path">
          <template #body="{ data }"><code class="text-[11px] text-muted">{{ data.path || '—' }}</code></template>
        </Column>
        <Column field="ip" header="IP">
          <template #body="{ data }"><span class="font-mono text-[11px] text-muted">{{ data.ip || '—' }}</span></template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
