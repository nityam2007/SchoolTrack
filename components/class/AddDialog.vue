<script setup lang="ts">
import type { Class } from '~/types/database'

const props = defineProps<{ visible: boolean; schoolId: string | null }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const db = useDbStore()
const toast = useToast()
const submitting = ref(false)

const form = reactive({ name: '', grade: 1, section: 'A' })

const reset = () => Object.assign(form, { name: '', grade: 1, section: 'A' })

const submit = async () => {
  if (!props.schoolId || !form.name.trim()) {
    toast.add({ severity: 'warn', summary: 'Name is required', life: 3000 })
    return
  }
  submitting.value = true
  try {
    const c: Class = {
      id: makeId('CLS'),
      school_id: props.schoolId,
      name: form.name.trim(),
      grade: Number(form.grade) || 0,
      section: form.section.trim() || 'A',
    }
    await db.addClass(c)
    toastOk(toast, 'Class added')
    emit('update:visible', false)
    reset()
  } catch (e) {
    toastError(toast, e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :visible="visible" modal header="Add Class" :style="{ width: '440px' }" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-3">
      <InputText v-model="form.name" placeholder="Class Name * (e.g. Grade 5-A)" />
      <div class="grid grid-cols-2 gap-3">
        <InputNumber v-model="form.grade" placeholder="Grade" :min="1" :max="12" />
        <InputText v-model="form.section" placeholder="Section" />
      </div>
      <Button label="Create class" icon="pi pi-plus" :loading="submitting" @click="submit" />
    </div>
  </Dialog>
</template>
