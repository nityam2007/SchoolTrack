<script setup lang="ts">
import type { Message, MessageStatus } from '~/types/database'

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()

const STATUS_TONE: Record<MessageStatus, { chip: string; dot: string }> = {
  delivered: { chip: 'bg-ok/10 text-ok',         dot: 'bg-ok' },
  failed:    { chip: 'bg-danger/10 text-danger', dot: 'bg-danger' },
  queued:    { chip: 'bg-warn/10 text-warn',     dot: 'bg-warn' },
}
const fmtSentAt = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

const filter = ref<'class' | 'school'>('class')
const selClass = ref<string>('')

const classes = computed(() => (auth.schoolId ? db.classesForSchool(auth.schoolId) : []))

watchEffect(() => {
  if (!selClass.value && classes.value.length) selClass.value = classes.value[0].id
})

// Today's absent students, optionally filtered to one class.
const absentees = computed(() => {
  const all = db.absenteesToday
  return filter.value === 'school'
    ? all
    : all.filter((s) => db.studentMap.get(s.student_id)?.class_id === selClass.value)
})

const messages = computed(() =>
  auth.schoolId ? db.messagesForSchool(auth.schoolId) : [],
)

const sending = ref(false)
const send = async () => {
  if (!db.activeSchool || !auth.schoolId) return
  if (db.activeSchool.credits < absentees.value.length) {
    toast.add({ severity: 'warn', summary: 'Insufficient credits', life: 3000 })
    return
  }
  sending.value = true
  const sid = auth.schoolId
  const now = new Date()
  const newMsgs: Message[] = absentees.value.map((s) => ({
    id: `M${Date.now().toString(36).toUpperCase()}-${s.student_id}`,
    school_id: sid,
    student_name: s.student_name,
    parent_phone: s.parent_phone,
    date: now.toISOString(),
    status: 'delivered',
  }))
  try {
    await Promise.all([
      db.addMessages(newMsgs),
      db.updateSchool(sid, { credits: db.activeSchool.credits - newMsgs.length }),
    ])
    toast.add({ severity: 'success', summary: `Sent to ${newMsgs.length} parent(s)`, life: 2500 })
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Failed', detail: (e as Error).message, life: 4000 })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="st-h2 m-0">WhatsApp Notifications</h2>

    <div class="st-card">
      <div class="flex justify-between items-center mb-4">
        <span class="font-bold">Send Absence Notifications</span>
        <span class="text-sm">
          <span class="text-muted">Credits: </span>
          <span class="text-ok font-bold">{{ db.activeSchool?.credits ?? 0 }}</span>
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-2 mb-4">
        <SelectButton v-model="filter" :options="[{ l: 'By Class', v: 'class' }, { l: 'Entire School', v: 'school' }]" option-label="l" option-value="v" :allow-empty="false" />
        <Dropdown
          v-if="filter === 'class'"
          v-model="selClass"
          :options="classes"
          option-value="id"
          option-label="name"
          class="w-48"
        />
      </div>

      <div class="bg-surface rounded-ctl p-4 mb-4 text-sm leading-6">
        <p class="text-muted m-0 mb-1 text-xs">Message preview</p>
        <p class="m-0">
          "Dear Parent, your child <em>[Student]</em> from class <em>[Class]</em> was absent today. Please contact the school if this was unexpected."
        </p>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-muted text-sm">
          {{ absentees.length }} parent(s) · {{ absentees.length }} credit(s)
        </span>
        <Button
          :label="`Send to ${absentees.length} Parent(s)`"
          icon="pi pi-send"
          :disabled="absentees.length === 0"
          :loading="sending"
          @click="send"
        />
      </div>
    </div>

    <div>
      <p class="font-bold mb-3 px-1">Message log</p>
      <EmptyState
        v-if="!messages.length"
        icon="pi pi-comments"
        title="No messages yet"
        description="When you send absence notifications, the delivery log will appear here."
      />
      <div v-else class="st-card !p-0 overflow-hidden">
        <DataTable :value="messages" responsive-layout="scroll" striped-rows paginator :rows="10">
          <Column field="student_name" header="Student" sortable>
            <template #body="{ data }">
              <span class="font-semibold">{{ data.student_name }}</span>
            </template>
          </Column>
          <Column field="parent_phone" header="Parent Phone">
            <template #body="{ data }">
              <span class="font-mono text-xs text-light">{{ data.parent_phone }}</span>
            </template>
          </Column>
          <Column field="date" header="Sent At" sortable>
            <template #body="{ data }">
              <span class="text-xs text-light tabular-nums">{{ fmtSentAt.format(new Date(data.date)) }}</span>
            </template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              <span class="st-chip" :class="STATUS_TONE[data.status as MessageStatus].chip">
                <span class="st-chip-dot" :class="STATUS_TONE[data.status as MessageStatus].dot" />
                {{ data.status }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
