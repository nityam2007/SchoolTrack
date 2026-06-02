<script setup lang="ts">
import type { Student } from '~/types/database'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [v: boolean]; imported: [n: number] }>()

const db = useDbStore()
const toast = useToast()

const classes = computed(() => (db.activeSchoolId ? db.classesForSchool(db.activeSchoolId) : []))
const fileInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)

interface PreviewRow {
  name: string; roll: string; class_id: string; class_label: string
  parent_phone: string; dob: string | null
  gender: 'Male' | 'Female' | 'Other' | null
  father_name: string; mother_name: string
  ok: boolean; error: string
}
const rows = ref<PreviewRow[]>([])
const parsed = ref(false)
const validRows = computed(() => rows.value.filter((r) => r.ok))

const resolveClass = (val: string) => {
  const v = val.trim().toLowerCase()
  return classes.value.find((c) => c.id.toLowerCase() === v || c.name.toLowerCase() === v) ?? null
}

const pick = () => fileInput.value?.click()

const onFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const objs = parseCsvObjects(text)
    if (!objs.length) { toast.add({ severity: 'warn', summary: 'Empty or invalid CSV', life: 3000 }); return }
    const seenRolls = new Set<string>()
    rows.value = objs.map((o) => {
      const name = o.name ?? ''
      const roll = o.roll ?? o.roll_no ?? o.roll_number ?? ''
      const classRaw = o.class ?? o.class_name ?? o.class_id ?? ''
      const cls = resolveClass(classRaw)
      const g = (o.gender ?? '').trim().toLowerCase()
      const gender = g === 'male' ? 'Male' : g === 'female' ? 'Female' : g === 'other' ? 'Other' : null
      let error = ''
      if (!name) error = 'Missing name'
      else if (!roll) error = 'Missing roll'
      else if (!cls) error = `Unknown class "${classRaw}"`
      else if (cls && seenRolls.has(`${cls.id}|${roll}`)) error = 'Duplicate roll in file'
      if (cls && roll && !error) seenRolls.add(`${cls.id}|${roll}`)
      return {
        name, roll,
        class_id: cls?.id ?? '', class_label: cls?.name ?? classRaw,
        parent_phone: o.parent_phone ?? o.phone ?? '',
        dob: o.dob || null,
        gender,
        father_name: o.father_name ?? '', mother_name: o.mother_name ?? '',
        ok: !error, error,
      }
    })
    parsed.value = true
  } catch (err) {
    toastError(toast, err, 'Could not read the file')
  } finally {
    if (fileInput.value) fileInput.value.value = ''
  }
}

const doImport = async () => {
  if (!db.activeSchoolId || !validRows.value.length || importing.value) return
  importing.value = true
  try {
    const sid = db.activeSchoolId
    const students: Student[] = validRows.value.map((r) => ({
      id: makeId('S'),
      school_id: sid,
      class_id: r.class_id,
      name: r.name,
      roll: r.roll,
      parent_phone: r.parent_phone,
      dob: r.dob,
      gender: r.gender,
      father_name: r.father_name || null,
      mother_name: r.mother_name || null,
      attendance_pct: 0,
    }))
    await db.addStudents(students)
    toastOk(toast, `Imported ${students.length} student(s)`)
    emit('imported', students.length)
    reset()
    emit('update:visible', false)
  } catch (e) {
    toastError(toast, e, 'Import failed (duplicate roll numbers?)')
  } finally {
    importing.value = false
  }
}

const reset = () => { rows.value = []; parsed.value = false }

const template = () => {
  downloadFile(
    'name,roll,class,parent_phone,dob,gender,father_name,mother_name\nAarav Sharma,12,Grade 5A,+919900000000,2015-04-01,Male,Rahul Sharma,Priya Sharma\n',
    'students-template.csv',
  )
}

watch(() => props.visible, (v) => { if (!v) reset() })
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Import students from CSV"
    :style="{ width: '720px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2 flex-wrap">
        <Button label="Choose CSV file" icon="pi pi-upload" @click="pick" />
        <Button label="Download template" icon="pi pi-download" severity="secondary" outlined @click="template" />
        <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="onFile">
      </div>
      <Message severity="info" :closable="false" class="!my-0">
        Columns: <code>name, roll, class, parent_phone, dob, gender, father_name, mother_name</code>.
        <code>class</code> matches a class name or id in this school.
      </Message>

      <div v-if="parsed">
        <div class="flex items-center gap-3 mb-2 text-sm">
          <span class="st-chip bg-ok/10 text-ok">{{ validRows.length }} ready</span>
          <span v-if="rows.length - validRows.length" class="st-chip bg-danger/10 text-danger">
            {{ rows.length - validRows.length }} with errors
          </span>
        </div>
        <div class="border border-line rounded-card overflow-hidden">
          <DataTable :value="rows" scrollable scroll-height="320px" class="!text-sm" striped-rows>
            <Column header="">
              <template #body="{ data }">
                <i :class="data.ok ? 'pi pi-check-circle text-ok' : 'pi pi-times-circle text-danger'" />
              </template>
            </Column>
            <Column field="name" header="Name" />
            <Column field="roll" header="Roll" />
            <Column field="class_label" header="Class" />
            <Column field="parent_phone" header="Phone" />
            <Column header="Note">
              <template #body="{ data }"><span class="text-danger text-xs">{{ data.error }}</span></template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" text @click="emit('update:visible', false)" />
        <Button
          :label="`Import ${validRows.length} student(s)`"
          icon="pi pi-check"
          :disabled="!validRows.length"
          :loading="importing"
          @click="doImport"
        />
      </div>
    </div>
  </Dialog>
</template>
