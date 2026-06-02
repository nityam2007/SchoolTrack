<script setup lang="ts">
import type { Message } from '~/types/database'

definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()
const toast = useToast()
const confirm = useConfirm()
const { log } = useAudit()

const fmtDate = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
const fmtWeekday = new Intl.DateTimeFormat('en', { weekday: 'long' })

const form = reactive({ date: '', title: '', notify: false })
const q = ref('')
const today = todayLocal()

const holidays = computed(() => {
  const all = db.activeSchoolId
    ? [...db.holidaysForSchool(db.activeSchoolId)].sort((a, b) => a.date.localeCompare(b.date))
    : []
  const t = q.value.trim().toLowerCase()
  return t ? all.filter((h) => `${h.title} ${h.date}`.toLowerCase().includes(t)) : all
})

const notifyParents = async (title: string, date: string) => {
  const sid = db.activeSchoolId
  if (!sid) return
  const parents = db.studentsForSchool(sid).filter((s) => s.parent_phone)
  if (!parents.length) return
  if ((db.activeSchool?.credits ?? 0) < parents.length) {
    toast.add({ severity: 'warn', summary: 'Holiday saved, but parents not notified', detail: 'Insufficient credits.', life: 4000 })
    return
  }
  const now = new Date().toISOString()
  const body = `School holiday on ${date} — ${title}. No classes will be held. — ${db.activeSchool?.name ?? 'School'}`
  const msgs: Message[] = parents.map((s) => ({
    id: makeId('M', s.id), school_id: sid, student_name: s.name, parent_phone: s.parent_phone,
    date: now, status: 'delivered', body, recipient_type: 'school',
  }))
  await db.addMessages(msgs)
  const { data: fresh } = await useSb().from('schools').select('credits').eq('id', sid).single<{ credits: number }>()
  if (db.activeSchool && typeof fresh?.credits === 'number') db.activeSchool.credits = fresh.credits
  await log('message', { entity: 'holiday_notice', schoolId: sid, detail: { count: msgs.length } })
  toastOk(toast, `Notified ${msgs.length} parent(s)`)
}

const add = async () => {
  if (!db.activeSchoolId || !form.date || !form.title) {
    toast.add({ severity: 'warn', summary: 'Date and title are required', life: 3000 })
    return
  }
  try {
    await db.addHoliday({ id: makeId('H'), school_id: db.activeSchoolId, date: form.date, title: form.title })
    await log('create', { entity: 'holiday', schoolId: db.activeSchoolId, detail: { date: form.date, title: form.title } })
    if (form.notify) await notifyParents(form.title, form.date)
    else toastOk(toast, 'Holiday added')
    form.date = ''; form.title = ''; form.notify = false
  } catch (e) { toastError(toast, e) }
}

const remove = (id: string) => {
  const h = db.holidays.find((x) => x.id === id)
  confirm.require({
    message: h ? `Remove "${h.title}" on ${h.date}?` : 'Remove this holiday?',
    header: 'Confirm removal', icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Remove', rejectLabel: 'Cancel', acceptClass: 'p-button-danger',
    accept: async () => {
      try { await db.removeHoliday(id); await log('delete', { entity: 'holiday', entityId: id }); toastOk(toast, 'Holiday removed') }
      catch (e) { toastError(toast, e) }
    },
  })
}
const parentCount = computed(() => (db.activeSchoolId ? db.studentsForSchool(db.activeSchoolId).filter((s) => s.parent_phone).length : 0))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="st-h2 m-0">Holidays</h2>
        <p class="text-muted text-sm mt-1">Holidays pause attendance automatically and can notify parents.</p>
      </div>
      <span class="relative">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
        <input v-model="q" type="text" placeholder="Search holidays…" class="h-10 w-52 pl-10 pr-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accentSoft transition">
      </span>
    </div>

    <div class="st-card">
      <p class="font-semibold mb-3">Add Holiday</p>
      <div class="flex flex-wrap gap-3 items-center">
        <InputText v-model="form.date" type="date" class="w-44" />
        <InputText v-model="form.title" placeholder="Holiday Title" class="flex-1 min-w-[200px]" />
        <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
          <Checkbox v-model="form.notify" :binary="true" />
          Notify parents <span class="text-muted text-xs">({{ parentCount }} · {{ parentCount }} credits)</span>
        </label>
        <Button label="Add" icon="pi pi-plus" @click="add" />
      </div>
    </div>

    <EmptyState
      v-if="!holidays.length"
      icon="pi pi-calendar"
      :title="q ? 'No holidays match' : 'No holidays scheduled'"
      description="Add public holidays so attendance is automatically paused on those days."
    />
    <div v-else class="st-card !p-0 overflow-hidden">
      <DataTable :value="holidays" responsive-layout="scroll" striped-rows paginator :rows="12">
        <Column field="date" header="Date" sortable>
          <template #body="{ data }">
            <span class="font-semibold tabular-nums">{{ fmtDate.format(new Date(data.date)) }}</span>
            <span v-if="data.date === today" class="st-chip bg-warn/10 text-warn ml-2">Today</span>
          </template>
        </Column>
        <Column field="title" header="Title" sortable />
        <Column header="Day">
          <template #body="{ data }"><span class="st-chip bg-violet/10 text-violet">{{ fmtWeekday.format(new Date(data.date)) }}</span></template>
        </Column>
        <Column header="Actions" :style="{ width: '80px' }">
          <template #body="{ data }"><Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="remove(data.id)" /></template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
