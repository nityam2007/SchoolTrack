<script setup lang="ts">
const auth = useAuthStore()
const toast = useToast()
const exiting = ref(false)

const roleLabel = computed(() =>
  auth.user?.role === 'schooladmin' ? 'Principal' : auth.user?.role === 'teacher' ? 'Teacher' : (auth.user?.role ?? ''),
)

const exit = async () => {
  if (exiting.value) return
  exiting.value = true
  try {
    await auth.exitImpersonation()
    toastOk(toast, 'Restored superadmin session')
    navigateTo('/dashboard')
  } catch (e) {
    toastError(toast, e, 'Failed to restore session')
  } finally {
    exiting.value = false
  }
}
</script>

<template>
  <div
    v-if="auth.isImpersonating && auth.user"
    class="bg-warn/12 border-b border-warn/30 text-ink flex items-center justify-between gap-3 px-5 lg:px-8 py-2 text-sm"
  >
    <div class="flex items-center gap-2.5 min-w-0">
      <span class="w-6 h-6 rounded-full bg-warn/20 flex items-center justify-center shrink-0"><i class="pi pi-eye text-warn text-[11px]" /></span>
      <span class="truncate">
        Viewing as <strong>{{ auth.user.name || auth.user.email }}</strong>
        <span class="st-chip bg-warn/15 text-warn ml-1 align-middle">{{ roleLabel }}</span>
        <span v-if="auth.realUser" class="text-muted ml-1 hidden md:inline">· you are {{ auth.realUser.email }}</span>
      </span>
    </div>
    <button
      type="button"
      class="bg-warn hover:brightness-95 text-white disabled:opacity-50 rounded-ctl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
      :disabled="exiting"
      @click="exit"
    >
      <i :class="exiting ? 'pi pi-spin pi-spinner text-[10px]' : 'pi pi-times text-[10px]'" />
      {{ exiting ? 'Restoring…' : 'Exit view' }}
    </button>
  </div>
</template>
