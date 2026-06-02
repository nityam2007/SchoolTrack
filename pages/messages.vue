<script setup lang="ts">
import type { Message, MessageStatus } from '~/types/database'

definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()
const toast = useToast()
const { log } = useAudit()

const STATUS_TONE: Record<MessageStatus, { chip: string; dot: string }> = {
  delivered: { chip: 'bg-ok/10 text-ok',         dot: 'bg-ok' },
  failed:    { chip: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  queued:    { chip: 'bg-warn/10 text-warn',     dot: 'bg-warn' },
}
const fmtSentAt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const tab = ref<'absence' | 'custom' | 'staff'>('absence')
const sid = computed(() => db.activeSchoolId)
const classes = computed(() => (sid.value ? db.classesForSchool(sid.value) : []))
const students = computed(() => (sid.value ? db.studentsForSchool(sid.value) : []))
const teachers = computed(() => (sid.value ? db.teachersForSchool(sid.value) : []))
const credits = computed(() => db.activeSchool?.credits ?? 0)

onMounted(() => db.loadStaffMessages())

// ── Shared: send WhatsApp messages to a set of students ────────────────────
const sending = ref(false)
const sendToStudents = async (
  targets: { student_id?: string; name: string; phone: string; class_id?: string }[],
  body: string,
  recipient_type: 'student' | 'class' | 'school',
  attachment_url: string | null,
) => {
  if (!sid.value || !targets.length) return false
  const valid = targets.filter((t) => t.phone)
  if (!valid.length) { toast.add({ severity: 'warn', summary: 'No parent phone numbers', life: 3000 }); return false }
  if (credits.value < valid.length) { toast.add({ severity: 'warn', summary: 'Insufficient credits', detail: `${valid.length} needed, ${credits.value} available`, life: 3500 }); return false }
  sending.value = true
  const now = new Date().toISOString()
  const msgs: Message[] = valid.map((t) => ({
    id: makeId('M', t.student_id ?? t.name),
    school_id: sid.value!,
    student_name: t.name,
    parent_phone: t.phone,
    date: now,
    status: 'delivered',
    body,
    attachment_url,
    recipient_type,
  }))
  try {
    await db.addMessages(msgs)
    const { data: fresh } = await useSb().from('schools').select('credits').eq('id', sid.value).single<{ credits: number }>()
    if (db.activeSchool && typeof fresh?.credits === 'number') db.activeSchool.credits = fresh.credits
    await log('message', { entity: 'message', schoolId: sid.value, detail: { count: msgs.length, recipient_type } })
    toastOk(toast, `Sent to ${msgs.length} parent(s)`, 2500)
    return true
  } catch (e) { toastError(toast, e); return false }
  finally { sending.value = false }
}

// ── Absence alerts ─────────────────────────────────────────────────────────
const absFilter = ref<'class' | 'school'>('class')
const absClass = ref<string>('')
watchEffect(() => { if (!absClass.value && classes.value.length) absClass.value = classes.value[0].id })
const absentees = computed(() => {
  const all = db.absenteesToday
  return absFilter.value === 'school' ? all : all.filter((s) => db.studentMap.get(s.student_id)?.class_id === absClass.value)
})
const sendAbsence = async () => {
  const ok = await sendToStudents(
    absentees.value.map((a) => ({ student_id: a.student_id, name: a.student_name, phone: a.parent_phone, class_id: undefined })),
    'Dear Parent, your child was absent today. Please contact the school if this was unexpected.',
    absFilter.value === 'school' ? 'school' : 'class',
    null,
  )
  if (ok) { /* list refreshes via store */ }
}

// ── Custom message ─────────────────────────────────────────────────────────
const cTo = ref<'student' | 'class' | 'school'>('class')
const cStudent = ref<string>('')
const cClass = ref<string>('')
const cBody = ref('')
const cFile = ref<HTMLInputElement | null>(null)
const cAttachUrl = ref<string | null>(null)
const cAttachName = ref('')
const uploading = ref(false)
watchEffect(() => { if (!cClass.value && classes.value.length) cClass.value = classes.value[0].id })

const customTargets = computed(() => {
  if (cTo.value === 'student') {
    const s = students.value.find((x) => x.id === cStudent.value)
    return s ? [{ student_id: s.id, name: s.name, phone: s.parent_phone }] : []
  }
  if (cTo.value === 'class') return db.studentsForClass(cClass.value).map((s) => ({ student_id: s.id, name: s.name, phone: s.parent_phone }))
  return students.value.map((s) => ({ student_id: s.id, name: s.name, phone: s.parent_phone }))
})

const pickAttach = () => cFile.value?.click()
const onAttach = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !sid.value) return
  uploading.value = true
  try {
    const supabase = useSb()
    const path = `${sid.value}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('message-attachments').upload(path, file, { upsert: true })
    if (error) throw error
    cAttachUrl.value = supabase.storage.from('message-attachments').getPublicUrl(path).data.publicUrl
    cAttachName.value = file.name
    toastOk(toast, 'Attachment uploaded')
  } catch (err) { toastError(toast, err, 'Upload failed — is the message-attachments bucket created? (migration 0006)') }
  finally { uploading.value = false; if (cFile.value) cFile.value.value = '' }
}
const sendCustom = async () => {
  if (!cBody.value.trim()) { toast.add({ severity: 'warn', summary: 'Message body is empty', life: 3000 }); return }
  const ok = await sendToStudents(customTargets.value, cBody.value.trim(), cTo.value, cAttachUrl.value)
  if (ok) { cBody.value = ''; cAttachUrl.value = null; cAttachName.value = '' }
}

// ── Staff messages (to teachers) ───────────────────────────────────────────
const sTeacher = ref<string>('')   // '' = all teachers
const sSubject = ref('')
const sBody = ref('')
const sSending = ref(false)
const staffMsgs = computed(() => db.staffMessages.filter((m) => m.school_id === sid.value))
const sendStaff = async () => {
  if (!sid.value || !sBody.value.trim()) { toast.add({ severity: 'warn', summary: 'Message body is empty', life: 3000 }); return }
  sSending.value = true
  try {
    await db.addStaffMessage({ school_id: sid.value, to_teacher_id: sTeacher.value || null, subject: sSubject.value.trim(), body: sBody.value.trim() })
    await log('message', { entity: 'staff_message', schoolId: sid.value, detail: { to: sTeacher.value || 'all' } })
    toastOk(toast, 'Notice sent to teacher(s)')
    sSubject.value = ''; sBody.value = ''
  } catch (e) { toastError(toast, e) }
  finally { sSending.value = false }
}
const teacherName = (id: string | null) => id ? (teachers.value.find((t) => t.id === id)?.name ?? id) : 'All teachers'

const messages = computed(() => (sid.value ? db.messagesForSchool(sid.value) : []))
const TABS = [{ k: 'absence', l: 'Absence alerts', i: 'pi pi-bell' }, { k: 'custom', l: 'Custom message', i: 'pi pi-pencil' }, { k: 'staff', l: 'To teachers', i: 'pi pi-id-card' }] as const
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="st-h2 m-0">Messages</h2>
        <p class="text-muted text-sm mt-1">Parent WhatsApp alerts &amp; staff notices · <span class="text-ok font-semibold">{{ credits }} credits</span></p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-line">
      <button v-for="t in TABS" :key="t.k" type="button"
        class="px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2"
        :class="tab === t.k ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'"
        @click="tab = t.k as typeof tab">
        <i :class="t.i" class="text-xs" />{{ t.l }}
      </button>
    </div>

    <!-- Absence alerts -->
    <div v-show="tab === 'absence'" class="st-card">
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <SelectButton v-model="absFilter" :options="[{ l: 'By Class', v: 'class' }, { l: 'Entire School', v: 'school' }]" option-label="l" option-value="v" :allow-empty="false" />
        <Dropdown v-if="absFilter === 'class'" v-model="absClass" :options="classes" option-value="id" option-label="name" class="w-48" />
      </div>
      <div class="bg-surface2 rounded-ctl p-4 mb-4 text-sm">
        <p class="text-muted m-0 mb-1 text-xs">Preview</p>
        <p class="m-0">"Dear Parent, your child was absent today. Please contact the school if this was unexpected."</p>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-muted text-sm">{{ absentees.length }} absentee(s) · {{ absentees.length }} credit(s)</span>
        <Button :label="`Send to ${absentees.length} parent(s)`" icon="pi pi-send" :disabled="!absentees.length" :loading="sending" @click="sendAbsence" />
      </div>
    </div>

    <!-- Custom message -->
    <div v-show="tab === 'custom'" class="st-card flex flex-col gap-4">
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1">
          <label class="st-label">Send to</label>
          <SelectButton v-model="cTo" :options="[{ l: 'A student', v: 'student' }, { l: 'A class', v: 'class' }, { l: 'Whole school', v: 'school' }]" option-label="l" option-value="v" :allow-empty="false" />
        </div>
        <Dropdown v-if="cTo === 'student'" v-model="cStudent" :options="students" option-value="id" option-label="name" filter placeholder="Select student" class="w-56" />
        <Dropdown v-if="cTo === 'class'" v-model="cClass" :options="classes" option-value="id" option-label="name" class="w-48" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">Message</label>
        <Textarea v-model="cBody" rows="4" auto-resize placeholder="Type your message to parents…" />
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <Button :label="cAttachName || 'Attach PDF / file'" :icon="cAttachName ? 'pi pi-paperclip' : 'pi pi-upload'" severity="secondary" outlined size="small" :loading="uploading" @click="pickAttach" />
        <Button v-if="cAttachName" icon="pi pi-times" text size="small" severity="danger" aria-label="Remove attachment" @click="cAttachUrl = null; cAttachName = ''" />
        <input ref="cFile" type="file" class="hidden" @change="onAttach">
        <span class="text-muted text-xs">{{ customTargets.filter((t) => t.phone).length }} recipient(s) · {{ customTargets.filter((t) => t.phone).length }} credit(s)</span>
        <Button class="ml-auto" :label="`Send to ${customTargets.filter((t) => t.phone).length}`" icon="pi pi-send" :loading="sending" :disabled="!customTargets.length" @click="sendCustom" />
      </div>
    </div>

    <!-- Staff messages -->
    <div v-show="tab === 'staff'" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="st-card flex flex-col gap-4">
        <p class="st-h3 m-0">New notice to teachers</p>
        <div class="flex flex-col gap-1">
          <label class="st-label">Recipient</label>
          <Dropdown v-model="sTeacher" :options="[{ id: '', name: 'All teachers' }, ...teachers]" option-value="id" option-label="name" class="w-full" />
        </div>
        <InputText v-model="sSubject" placeholder="Subject" />
        <Textarea v-model="sBody" rows="4" auto-resize placeholder="Notice to staff…" />
        <Button label="Send notice" icon="pi pi-send" :loading="sSending" class="self-start" @click="sendStaff" />
      </div>
      <div class="st-card">
        <p class="st-h3 mb-3">Sent notices</p>
        <div v-if="!staffMsgs.length" class="text-muted text-sm py-6 text-center">No staff notices yet.</div>
        <div v-else class="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
          <div v-for="m in staffMsgs" :key="m.id" class="border border-line rounded-ctl p-3">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-sm">{{ teacherName(m.to_teacher_id) }}</span>
              <span class="text-muted text-[11px]">{{ fmtSentAt.format(new Date(m.created_at)) }}</span>
            </div>
            <p v-if="m.subject" class="text-sm font-medium m-0 mt-1">{{ m.subject }}</p>
            <p class="text-light text-sm m-0 mt-0.5">{{ m.body }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Message log -->
    <div>
      <p class="font-bold mb-3 px-1">Parent message log</p>
      <EmptyState v-if="!messages.length" icon="pi pi-comments" title="No messages yet" description="Sent parent notifications appear here." />
      <div v-else class="st-card !p-0 overflow-hidden">
        <DataTable :value="messages" responsive-layout="scroll" striped-rows paginator :rows="10">
          <Column field="student_name" header="Student" sortable><template #body="{ data }"><span class="font-semibold">{{ data.student_name }}</span></template></Column>
          <Column header="Message"><template #body="{ data }"><span class="text-light text-sm">{{ data.body || 'Absence alert' }}</span><i v-if="data.attachment_url" class="pi pi-paperclip text-muted text-xs ml-1.5" /></template></Column>
          <Column field="parent_phone" header="Phone"><template #body="{ data }"><span class="font-mono text-xs text-light">{{ data.parent_phone }}</span></template></Column>
          <Column field="date" header="Sent At" sortable><template #body="{ data }"><span class="text-xs text-light tabular-nums">{{ fmtSentAt.format(new Date(data.date)) }}</span></template></Column>
          <Column header="Status"><template #body="{ data }"><span class="st-chip" :class="STATUS_TONE[data.status as MessageStatus].chip"><span class="st-chip-dot" :class="STATUS_TONE[data.status as MessageStatus].dot" />{{ data.status }}</span></template></Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
