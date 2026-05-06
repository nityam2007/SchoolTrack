<script setup lang="ts">
import type { Class } from '~/types/database'

const props = defineProps<{ visible: boolean; cls: Class | null }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const db = useDbStore()
const toast = useToast()
const submitting = ref(false)
const form = reactive({ name: '', grade: 1, section: 'A' })

watch(() => props.cls, (c) => {
  if (c) Object.assign(form, { name: c.name, grade: c.grade, section: c.section })
}, { immediate: true })

const submit = async () => {
  if (!props.cls) return
  submitting.value = true
  try {
    await db.updateClass(props.cls.id, {
      name: form.name.trim(),
      grade: Number(form.grade) || 0,
      section: form.section.trim() || 'A',
    })
    toastOk(toast, 'Class updated')
    emit('update:visible', false)
  } catch (e) {
    toastError(toast, e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :visible="visible" modal header="Rename class" :style="{ width: '440px' }" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-3">
      <InputText v-model="form.name" placeholder="Class Name" />
      <div class="grid grid-cols-2 gap-3">
        <InputNumber v-model="form.grade" placeholder="Grade" :min="1" :max="12" />
        <InputText v-model="form.section" placeholder="Section" />
      </div>
      <Button label="Save" icon="pi pi-save" :loading="submitting" @click="submit" />
    </div>
  </Dialog>
</template>
