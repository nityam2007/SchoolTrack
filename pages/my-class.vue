<script setup lang="ts">
import type { Message, Student } from '~/types/database'

definePageMeta({ middleware: ['teacher-only'] })

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()
const { log } = useAudit()

const today = todayLocal()
const classId = computed(() => auth.user?.classId ?? null)
const cls = computed(() => (classId.value ? db.classes.find((c) => c.id === classId.value) ?? null : null))
const school = computed(() => db.schools.find((s) => s.id === auth.schoolId) ?? null)
const credits = computed(() => school.value?.credits ?? 0)

const q = ref('')
const roster = computed(() => {
  if (!classId.value) return []
  const t = q.value.trim().toLowerCase()
  return db.studentsForClass(classId.value)
    .filter((s) => !t || `${s.name} ${s.roll}`.toLowerCase().includes(t))
    .map((s) => ({ ...s, today_status: db.attendance.find((a) => a.student_id === s.id && a.date === today)?.status ?? null }))
})
const stats = computed(() => {
  const all = classId.value ? db.studentsForClass(classId.value) : []
  const present = all.filter((s) => db.attendance.some((a) => a.student_id === s.id && a.date === today && a.status === 'present')).length
  const absent = all.filter((s) => db.attendance.some((a) => a.student_id === s.id && a.date === today && a.status === 'absent')).length
  return { total: all.length, present, absent }
})

// ── Student info ─────────────────────────────────────────────────────────────
const info = ref<Student | null>(null)
const showInfo = ref(false)
const openInfo = (s: Student) => { info.value = s; showInfo.value = true }
const infoAtt = computed(() => {
  if (!info.value) return { present: 0, absent: 0, total: 0, rate: 0 }
  const att = db.attendance.filter((a) => a.student_id === info.value!.id)
  const present = att.filter((a) => a.status === 'present').length
  return { present, absent: att.length - present, total: att.length, rate: att.length ? Math.round((present / att.length) * 100) : 0 }
})

// ── Messaging ────────────────────────────────────────────────────────────────
const showMsg = ref(false)
const msgTarget = ref<Student | 'class' | null>(null)
const msgBody = ref('')
const sending = ref(false)
const openMsg = (target: Student | 'class') => { msgTarget.value = target; msgBody.value = ''; showMsg.value = true }
const msgRecipients = computed(() => {
  if (msgTarget.value === 'class') return (classId.value ? db.studentsForClass(classId.value) : []).filter((s) => s.parent_phone)
  return msgTarget.value && msgTarget.value.parent_phone ? [msgTarget.value] : []
})
const sendMsg = async () => {
  if (!auth.schoolId || !msgBody.value.trim() || !msgRecipients.value.length || sending.value) return
  if (credits.value < msgRecipients.value.length) { toast.add({ severity: 'warn', summary: 'Insufficient credits', life: 3000 }); return }
  sending.value = true
  const now = new Date().toISOString()
  const msgs: Message[] = msgRecipients.value.map((s) => ({
    id: makeId('M', s.id), school_id: auth.schoolId!, student_name: s.name, parent_phone: s.parent_phone,
    date: now, status: 'delivered', body: msgBody.value.trim(), recipient_type: msgTarget.value === 'class' ? 'class' : 'student',
  }))
  try {
    await db.addMessages(msgs)
    const { data: fresh } = await useSb().from('schools').select('credits').eq('id', auth.schoolId).single<{ credits: number }>()
    if (school.value && typeof fresh?.credits === 'number') school.value.credits = fresh.credits
    await log('message', { entity: 'message', schoolId: auth.schoolId, detail: { count: msgs.length, scope: msgTarget.value === 'class' ? 'class' : 'student' } })
    toastOk(toast, `Sent to ${msgs.length} parent(s)`)
    showMsg.value = false
  } catch (e) { toastError(toast, e) }
  finally { sending.value = false }
}

const exportCsv = () => {
  downloadFile(
    toCsv(roster.value.map((s) => ({ roll: s.roll, name: s.name, parent_phone: s.parent_phone, today: s.today_status ?? 'not marked' })),
      ['roll', 'name', 'parent_phone', 'today']),
    'my-class.csv',
  )
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="st-h2 m-0">{{ cls?.name ?? 'My Class' }}</h2>
        <p class="text-muted text-sm mt-1">{{ stats.total }} students · <span class="text-ok">{{ credits }} message credits</span></p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="relative">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
          <input v-model="q" type="text" placeholder="Search student…" class="h-10 w-48 pl-10 pr-3 rounded-ctl bg-surface border border-line text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accentSoft transition">
        </span>
        <Button label="Export" icon="pi pi-download" severity="secondary" outlined @click="exportCsv" />
        <Button label="Message class" icon="pi pi-send" @click="openMsg('class')" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard label="Total Students" :value="stats.total" tone="accent" icon="pi pi-users" />
      <StatCard label="Present Today" :value="stats.present" tone="ok" icon="pi pi-check" />
      <StatCard label="Absent Today" :value="stats.absent" tone="danger" icon="pi pi-times" />
    </div>

    <div class="st-card !p-0 overflow-hidden">
      <DataTable :value="roster" responsive-layout="scroll" striped-rows paginator :rows="15">
        <Column field="roll" header="Roll" sortable />
        <Column field="name" header="Name" sortable><template #body="{ data }"><span class="font-semibold">{{ data.name }}</span></template></Column>
        <Column field="parent_phone" header="Parent Phone"><template #body="{ data }"><span class="font-mono text-xs text-light">{{ data.parent_phone || '—' }}</span></template></Column>
        <Column header="Today">
          <template #body="{ data }">
            <Tag v-if="data.today_status" :value="data.today_status" :severity="data.today_status === 'present' ? 'success' : 'danger'" />
            <span v-else class="text-muted">Not marked</span>
          </template>
        </Column>
        <Column header="Actions" :style="{ width: '120px' }">
          <template #body="{ data }">
            <div class="flex gap-1.5">
              <Button icon="pi pi-info-circle" severity="secondary" outlined size="small" aria-label="Info" @click="openInfo(data)" />
              <Button icon="pi pi-send" severity="secondary" outlined size="small" aria-label="Message" :disabled="!data.parent_phone" @click="openMsg(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Student info -->
    <Dialog v-model:visible="showInfo" modal :header="info?.name ?? 'Student'" :style="{ width: '460px' }">
      <div v-if="info" class="flex flex-col gap-3">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div><p class="st-label">Roll</p><p class="font-semibold m-0">{{ info.roll }}</p></div>
          <div><p class="st-label">Class</p><p class="font-semibold m-0">{{ cls?.name }}</p></div>
          <div><p class="st-label">Parent phone</p><p class="font-mono m-0">{{ info.parent_phone || '—' }}</p></div>
          <div><p class="st-label">Gender</p><p class="m-0">{{ info.gender ?? '—' }}</p></div>
          <div><p class="st-label">Father</p><p class="m-0">{{ info.father_name ?? '—' }}</p></div>
          <div><p class="st-label">Mother</p><p class="m-0">{{ info.mother_name ?? '—' }}</p></div>
        </div>
        <div class="grid grid-cols-3 gap-2 mt-1">
          <div class="bg-ok/10 rounded-ctl p-3 text-center"><p class="text-ok text-2xl font-bold m-0">{{ infoAtt.present }}</p><p class="text-muted text-xs m-0">Present</p></div>
          <div class="bg-danger/10 rounded-ctl p-3 text-center"><p class="text-danger text-2xl font-bold m-0">{{ infoAtt.absent }}</p><p class="text-muted text-xs m-0">Absent</p></div>
          <div class="bg-accentSoft rounded-ctl p-3 text-center"><p class="text-accent text-2xl font-bold m-0">{{ infoAtt.rate }}%</p><p class="text-muted text-xs m-0">Rate</p></div>
        </div>
        <Button label="Message parent" icon="pi pi-send" :disabled="!info.parent_phone" @click="showInfo = false; openMsg(info)" />
      </div>
    </Dialog>

    <!-- Message -->
    <Dialog v-model:visible="showMsg" modal :header="msgTarget === 'class' ? 'Message whole class' : `Message ${(msgTarget as Student)?.name ?? ''}`" :style="{ width: '480px' }">
      <div class="flex flex-col gap-3">
        <p class="text-muted text-sm m-0">{{ msgRecipients.length }} parent(s) · {{ msgRecipients.length }} credit(s) · {{ credits }} available</p>
        <Textarea v-model="msgBody" rows="4" auto-resize placeholder="Message to parent(s)…" />
        <Button :label="`Send to ${msgRecipients.length}`" icon="pi pi-send" :loading="sending" :disabled="!msgRecipients.length" @click="sendMsg" />
      </div>
    </Dialog>
  </div>
</template>
