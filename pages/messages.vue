<script setup lang="ts">
import type { Message, MessageStatus } from '~/types/database'

definePageMeta({ middleware: ['principal-only'] })

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

const classes = computed(() => (db.activeSchoolId ? db.classesForSchool(db.activeSchoolId) : []))

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
  db.activeSchoolId ? db.messagesForSchool(db.activeSchoolId) : [],
)

const sending = ref(false)
const send = async () => {
  if (sending.value) return
  if (!db.activeSchool || !db.activeSchoolId) return
  const targets = absentees.value
  if (!targets.length) return
  if (db.activeSchool.credits < targets.length) {
    toast.add({ severity: 'warn', summary: 'Insufficient credits', life: 3000 })
    return
  }
  sending.value = true
  const sid = db.activeSchoolId
  const now = new Date()
  const newMsgs: Message[] = targets.map((s) => ({
    id: makeId('M', s.student_id),
    school_id: sid,
    student_name: s.student_name,
    parent_phone: s.parent_phone,
    date: now.toISOString(),
    status: 'delivered',
  }))
  try {
    // Credits are decremented server-side via the
    // `decrement_school_credits_on_message` trigger (SECURITY DEFINER) —
    // principals have no direct UPDATE on schools under RLS.
    await db.addMessages(newMsgs)
    // Re-read credits so the topbar chip reflects the trigger's decrement.
    const { data: fresh } = await useSb()
      .from('schools').select('credits').eq('id', sid).single<{ credits: number }>()
    if (db.activeSchool && typeof fresh?.credits === 'number') {
      db.activeSchool.credits = fresh.credits
    }
    toastOk(toast, `Sent to ${newMsgs.length} parent(s)`, 2500)
  } catch (e) {
    toastError(toast, e)
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
          <template v-if="absentees.length">
            "Dear Parent, your child
            <em class="not-italic font-semibold text-ink">{{ absentees[0].student_name }}</em>
            from class
            <em class="not-italic font-semibold text-ink">{{ absentees[0].class_name }}</em>
            was absent today. Please contact the school if this was unexpected."
          </template>
          <template v-else>
            "Dear Parent, your child <em class="not-italic">[Student]</em> from class <em class="not-italic">[Class]</em> was absent today. Please contact the school if this was unexpected."
          </template>
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
