<script setup lang="ts">
const auth = useAuthStore()
const toast = useToast()
const exiting = ref(false)

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
    class="bg-warn text-bg flex items-center justify-between gap-3 px-4 py-1.5 text-sm font-semibold"
  >
    <div class="flex items-center gap-2 min-w-0">
      <i class="pi pi-sign-in" />
      <span class="truncate">
        Signed in as <strong>{{ auth.user.name || auth.user.email }}</strong>
        ({{ auth.user.role === 'schooladmin' ? 'Principal' : auth.user.role === 'teacher' ? 'Teacher' : auth.user.role }}) ·
        DB writes attributed to them
        <span v-if="auth.realUser" class="opacity-70">· real: {{ auth.realUser.email }}</span>
      </span>
    </div>
    <button
      type="button"
      class="bg-bg/20 hover:bg-bg/30 disabled:opacity-50 rounded-ctl px-3 py-1 text-xs font-bold flex items-center gap-1.5 shrink-0"
      :disabled="exiting"
      @click="exit"
    >
      <i :class="exiting ? 'pi pi-spin pi-spinner text-[10px]' : 'pi pi-times text-[10px]'" />
      {{ exiting ? 'Restoring…' : 'Exit impersonation' }}
    </button>
  </div>
</template>
