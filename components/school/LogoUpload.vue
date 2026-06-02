<script setup lang="ts">
// Reusable school-logo uploader. Works for super admins and principals:
// the image goes to the school-logos bucket (RLS scopes the folder), then the
// logo_url is set via the /api/school-logo server route (service-role, authorised).
const props = withDefaults(defineProps<{ schoolId: string; size?: number }>(), { size: 64 })
const emit = defineEmits<{ updated: [url: string] }>()

const db = useDbStore()
const toast = useToast()
const { log } = useAudit()

const school = computed(() => db.schools.find((s) => s.id === props.schoolId) ?? null)
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const pick = () => fileInput.value?.click()

const onFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { toast.add({ severity: 'warn', summary: 'Pick an image file', life: 3000 }); return }
  uploading.value = true
  try {
    const supabase = useSb()
    const ext = file.name.split('.').pop() || 'png'
    const path = `${props.schoolId}/logo-${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('school-logos').upload(path, file, { upsert: true })
    if (upErr) throw upErr
    const url = supabase.storage.from('school-logos').getPublicUrl(path).data.publicUrl
    // RLS blocks principals from updating `schools` directly — go via the route.
    await $fetch('/api/school-logo', { method: 'POST', body: { school_id: props.schoolId, logo_url: url } })
    db.setSchoolLogoLocal(props.schoolId, url)
    await log('update', { entity: 'school', entityId: props.schoolId, schoolId: props.schoolId, detail: { logo: true } })
    emit('updated', url)
    toastOk(toast, 'Logo updated')
  } catch (err) {
    toastError(toast, err, 'Logo upload failed')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="flex items-center gap-4">
    <div
      class="rounded-card border border-line bg-surface2 overflow-hidden flex items-center justify-center shrink-0"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <img v-if="school?.logo_url" :src="school.logo_url" alt="logo" class="w-full h-full object-cover">
      <i v-else class="pi pi-building text-muted text-2xl" />
    </div>
    <div>
      <Button
        :label="school?.logo_url ? 'Replace logo' : 'Upload logo'"
        icon="pi pi-upload"
        severity="secondary"
        outlined
        size="small"
        :loading="uploading"
        @click="pick"
      />
      <p class="text-muted text-[11px] mt-1.5">PNG/JPG · square works best</p>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFile">
    </div>
  </div>
</template>
