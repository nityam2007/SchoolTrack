<script setup lang="ts">
// Live webcam capture (getUserMedia). Emits a JPEG blob + a preview data URL.
// Requires HTTPS or localhost (browser security). Degrades with a clear message.
const emit = defineEmits<{ captured: [blob: Blob, dataUrl: string]; cleared: [] }>()

const video = ref<HTMLVideoElement>()
const canvas = ref<HTMLCanvasElement>()
const stream = ref<MediaStream | null>(null)
const active = ref(false)
const error = ref('')
const preview = ref<string | null>(null)

const start = async () => {
  error.value = ''
  if (!navigator.mediaDevices?.getUserMedia) {
    error.value = 'Camera not supported in this browser.'
    return
  }
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    active.value = true
    await nextTick()
    if (video.value) { video.value.srcObject = stream.value; await video.value.play() }
  } catch {
    error.value = 'Camera blocked or unavailable. Allow camera access (and use HTTPS).'
    active.value = false
  }
}
const stop = () => {
  stream.value?.getTracks().forEach((t) => t.stop())
  stream.value = null
  active.value = false
}
const capture = () => {
  if (!video.value || !canvas.value) return
  const v = video.value, c = canvas.value
  c.width = v.videoWidth || 640
  c.height = v.videoHeight || 480
  const ctx = c.getContext('2d')
  if (!ctx) return
  ctx.drawImage(v, 0, 0, c.width, c.height)
  preview.value = c.toDataURL('image/jpeg', 0.78)
  c.toBlob((blob) => { if (blob && preview.value) emit('captured', blob, preview.value) }, 'image/jpeg', 0.78)
  stop()
}
const retake = () => { preview.value = null; emit('cleared'); start() }
onBeforeUnmount(stop)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="rounded-card border border-line overflow-hidden bg-surface2 aspect-video flex items-center justify-center relative">
      <img v-if="preview" :src="preview" alt="captured" class="w-full h-full object-cover">
      <video v-show="active && !preview" ref="video" class="w-full h-full object-cover" playsinline muted />
      <div v-if="!active && !preview" class="text-center text-muted p-6">
        <i class="pi pi-camera text-3xl block mb-2" />
        <p class="text-sm m-0">{{ error || 'Capture a classroom photo as attendance proof.' }}</p>
      </div>
      <canvas ref="canvas" class="hidden" />
    </div>

    <div class="flex gap-2">
      <Button v-if="!active && !preview" label="Open camera" icon="pi pi-camera" @click="start" />
      <template v-if="active && !preview">
        <Button label="Capture" icon="pi pi-circle-fill" severity="success" @click="capture" />
        <Button label="Cancel" severity="secondary" text @click="stop" />
      </template>
      <template v-if="preview">
        <span class="st-chip bg-ok/10 text-ok self-center"><span class="st-chip-dot bg-ok" />Photo captured</span>
        <Button label="Retake" icon="pi pi-refresh" severity="secondary" outlined size="small" class="ml-auto" @click="retake" />
      </template>
    </div>
  </div>
</template>
