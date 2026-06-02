<script setup lang="ts">
const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const db = useDbStore()
const toast = useToast()
const { log } = useAudit()

const sid = computed(() => db.activeSchoolId)
const classes = computed(() => (sid.value ? db.classesForSchool(sid.value) : []))

const fromClass = ref('')
const toClass = ref('')
const selected = ref<Record<string, boolean>>({})
const busy = ref(false)

watch(() => props.visible, (v) => { if (v) { fromClass.value = ''; toClass.value = ''; selected.value = {} } })

const roster = computed(() => (fromClass.value ? db.studentsForClass(fromClass.value) : []))
watch(roster, (list) => { selected.value = Object.fromEntries(list.map((s) => [s.id, true])) })
const chosen = computed(() => roster.value.filter((s) => selected.value[s.id]).map((s) => s.id))

const promote = async () => {
  if (!toClass.value || !chosen.value.length || fromClass.value === toClass.value || busy.value) return
  busy.value = true
  try {
    await db.promoteStudents(chosen.value, toClass.value)
    await log('promote', {
      entity: 'student', schoolId: sid.value,
      detail: { from: fromClass.value, to: toClass.value, count: chosen.value.length },
    })
    toastOk(toast, `Promoted ${chosen.value.length} student(s)`)
    emit('update:visible', false)
  } catch (e) { toastError(toast, e) }
  finally { busy.value = false }
}
const clsName = (id: string) => classes.value.find((c) => c.id === id)?.name ?? '—'
</script>

<template>
  <Dialog :visible="visible" modal header="Promote students" :style="{ width: '560px' }" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-4">
      <p class="text-muted text-sm m-0">
        Move students to their next class. Their current class is saved as
        <strong class="text-ink">previous class</strong>, and all past attendance &amp; marks stay linked to the old class.
      </p>
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="st-label">From class</label>
          <Dropdown v-model="fromClass" :options="classes" option-value="id" option-label="name" placeholder="Source" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="st-label">To class</label>
          <Dropdown v-model="toClass" :options="classes.filter((c) => c.id !== fromClass)" option-value="id" option-label="name" placeholder="Target" class="w-full" />
        </div>
      </div>

      <div v-if="fromClass" class="border border-line rounded-ctl">
        <div class="flex items-center justify-between px-3 py-2 border-b border-line">
          <span class="text-sm font-semibold">{{ chosen.length }} / {{ roster.length }} selected</span>
          <div class="flex gap-2">
            <Button label="All" text size="small" @click="roster.forEach((s) => (selected[s.id] = true))" />
            <Button label="None" text size="small" @click="roster.forEach((s) => (selected[s.id] = false))" />
          </div>
        </div>
        <div class="max-h-60 overflow-y-auto p-1">
          <label v-for="s in roster" :key="s.id" class="flex items-center gap-3 px-2 py-1.5 rounded-ctl hover:bg-surface2 cursor-pointer">
            <Checkbox v-model="selected[s.id]" :binary="true" />
            <span class="text-sm font-medium">{{ s.roll }} · {{ s.name }}</span>
          </label>
          <p v-if="!roster.length" class="text-muted text-sm text-center py-4">No students in the source class.</p>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2">
        <span v-if="fromClass && toClass" class="text-muted text-xs">{{ clsName(fromClass) }} → {{ clsName(toClass) }}</span>
        <div class="ml-auto flex gap-2">
          <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
          <Button label="Promote" icon="pi pi-arrow-up" :loading="busy" :disabled="!toClass || !chosen.length" @click="promote" />
        </div>
      </div>
    </div>
  </Dialog>
</template>
