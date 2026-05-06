<script setup lang="ts">
import type { Subject } from '~/types/database'

const props = defineProps<{ visible: boolean; schoolId: string | null }>()
const emit = defineEmits<{ 'update:visible': [v: boolean]; created: [subject: Subject] }>()

const db = useDbStore()
const toast = useToast()
const submitting = ref(false)
const form = reactive({
  name: '',
  has_theory: true,
  has_practical: false,
  theory_max: 100,
  practical_max: 0,
  passing_marks: 33,
})

const reset = () => Object.assign(form, {
  name: '', has_theory: true, has_practical: false,
  theory_max: 100, practical_max: 0, passing_marks: 33,
})

const submit = async () => {
  if (!props.schoolId || !form.name.trim()) {
    toast.add({ severity: 'warn', summary: 'Name is required', life: 3000 })
    return
  }
  submitting.value = true
  try {
    const subject: Subject = {
      id: makeId('SUB'),
      school_id: props.schoolId,
      name: form.name.trim(),
      has_theory: form.has_theory,
      has_practical: form.has_practical,
      theory_max: form.has_theory ? Number(form.theory_max) : 0,
      practical_max: form.has_practical ? Number(form.practical_max) : 0,
      passing_marks: Number(form.passing_marks),
    }
    await db.addSubject(subject)
    toastOk(toast, 'Subject added')
    emit('created', subject)
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
  <Dialog :visible="visible" modal header="Add Subject" :style="{ width: '480px' }" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-3">
      <InputText v-model="form.name" placeholder="Subject Name *" />
      <div class="grid grid-cols-2 gap-3">
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.has_theory" :binary="true" input-id="t" />
          <label for="t" class="text-sm">Has Theory</label>
        </div>
        <InputNumber v-if="form.has_theory" v-model="form.theory_max" placeholder="Theory max" :min="0" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="flex items-center gap-2">
          <Checkbox v-model="form.has_practical" :binary="true" input-id="p" />
          <label for="p" class="text-sm">Has Practical</label>
        </div>
        <InputNumber v-if="form.has_practical" v-model="form.practical_max" placeholder="Practical max" :min="0" />
      </div>
      <InputNumber v-model="form.passing_marks" placeholder="Passing marks" :min="0" />
      <Button label="Add Subject" icon="pi pi-plus" :loading="submitting" @click="submit" />
    </div>
  </Dialog>
</template>
