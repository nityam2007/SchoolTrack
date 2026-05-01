<script setup lang="ts">
import type { Message } from '~/types/database'

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()

const filter = ref<'class' | 'school'>('class')
const selClass = ref<string>('')

const school = computed(() =>
  auth.schoolId ? db.schools.find((s) => s.id === auth.schoolId) : null,
)
const classes = computed(() => (auth.schoolId ? db.classesForSchool(auth.schoolId) : []))

watchEffect(() => {
  if (!selClass.value && classes.value.length) selClass.value = classes.value[0].id
})

// Today's absent students for the school.
const absentees = computed(() => {
  if (!auth.schoolId) return []
  const today = new Date().toISOString().split('T')[0]
  const absentRecords = db.attendance.filter(
    (a) => a.school_id === auth.schoolId && a.date === today && a.status === 'absent',
  )
  const candidates = absentRecords.map((a) => db.students.find((s) => s.id === a.student_id)).filter(Boolean) as NonNullable<ReturnType<typeof db.students.find>>[]
  return filter.value === 'school'
    ? candidates
    : candidates.filter((s) => s.class_id === selClass.value)
})

const messages = computed(() =>
  auth.schoolId ? db.messagesForSchool(auth.schoolId) : [],
)

const sending = ref(false)
const send = async () => {
  if (!school.value || !auth.schoolId) return
  if (school.value.credits < absentees.value.length) {
    toast.add({ severity: 'warn', summary: 'Insufficient credits', life: 3000 })
    return
  }
  sending.value = true
  const sid = auth.schoolId
  const now = new Date()
  const newMsgs: Message[] = absentees.value.map((s) => ({
    id: `M${Date.now().toString(36).toUpperCase()}-${s.id}`,
    school_id: sid,
    student_name: s.name,
    parent_phone: s.parent_phone,
    date: now.toISOString(),
    status: 'delivered',
  }))
  try {
    await db.addMessages(newMsgs)
    await db.updateSchool(sid, { credits: school.value.credits - newMsgs.length })
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
          <span class="text-ok font-bold">{{ school?.credits ?? 0 }}</span>
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

    <div class="st-card">
      <p class="font-bold mb-3">Message Log</p>
      <DataTable :value="messages" responsive-layout="scroll" striped-rows paginator :rows="10">
        <Column field="student_name" header="Student" sortable />
        <Column field="parent_phone" header="Parent Phone" />
        <Column field="date" header="Sent At" sortable />
        <Column header="Status">
          <template #body="{ data }">
            <Tag
              :value="data.status"
              :severity="data.status === 'delivered' ? 'success' : data.status === 'failed' ? 'danger' : 'warn'"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
