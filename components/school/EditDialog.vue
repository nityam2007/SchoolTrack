<script setup lang="ts">
import type { School } from '~/types/database'

const props = defineProps<{ visible: boolean; school: School }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const db = useDbStore()
const toast = useToast()

const form = reactive({ name: '', city: '' })
const saving = ref(false)
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Re-seed the form whenever the dialog opens for a (possibly different) school.
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

const pickLogo = () => fileInput.value?.click()

const onLogo = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { toast.add({ severity: 'warn', summary: 'Pick an image file', life: 3000 }); return }
  uploading.value = true
  try {
    const supabase = useSb()
    const ext = file.name.split('.').pop() || 'png'
    const path = `${props.school.id}/logo-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('school-logos').upload(path, file, { upsert: true })
    if (upErr) throw upErr
    const { data } = supabase.storage.from('school-logos').getPublicUrl(path)
    await db.updateSchool(props.school.id, { logo_url: data.publicUrl })
    toastOk(toast, 'Logo updated')
  } catch (err) {
    toastError(toast, err, 'Logo upload failed — is the school-logos bucket created? (migration 0005)')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
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
      <!-- Logo -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-card border border-line bg-surface2 overflow-hidden flex items-center justify-center shrink-0">
          <img v-if="school.logo_url" :src="school.logo_url" alt="logo" class="w-full h-full object-cover">
          <i v-else class="pi pi-building text-muted text-2xl" />
        </div>
        <div>
          <Button
            :label="school.logo_url ? 'Replace logo' : 'Upload logo'"
            icon="pi pi-upload"
            severity="secondary"
            outlined
            size="small"
            :loading="uploading"
            @click="pickLogo"
          />
          <p class="text-muted text-[11px] mt-1.5">PNG/JPG · square works best</p>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onLogo">
        </div>
      </div>

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
