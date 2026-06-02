<script setup lang="ts">
import type { School } from '~/types/database'

const props = defineProps<{ visible: boolean; school: School }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const db = useDbStore()
const toast = useToast()

const form = reactive({ name: '', city: '' })
const saving = ref(false)

watch(
  () => [props.visible, props.school?.id],
  () => { if (props.visible) { form.name = props.school.name; form.city = props.school.city } },
  { immediate: true },
)

const close = () => emit('update:visible', false)

const save = async () => {
  if (!form.name.trim()) { toast.add({ severity: 'warn', summary: 'Name is required', life: 3000 }); return }
  saving.value = true
  try {
    await db.updateSchool(props.school.id, { name: form.name.trim(), city: form.city.trim() })
    toastOk(toast, 'School updated')
    close()
  } catch (e) { toastError(toast, e) }
  finally { saving.value = false }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Edit school"
    :style="{ width: '460px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <SchoolLogoUpload :school-id="school.id" />

      <div class="flex flex-col gap-1">
        <label class="st-label">School name</label>
        <InputText v-model="form.name" placeholder="School name" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="st-label">City</label>
        <InputText v-model="form.city" placeholder="City" />
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <Button label="Cancel" severity="secondary" text @click="close" />
        <Button label="Save changes" icon="pi pi-check" :loading="saving" @click="save" />
      </div>
    </div>
  </Dialog>
</template>
