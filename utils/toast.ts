import type { ToastServiceMethods } from 'primevue/toastservice'

export const toastError = (
  toast: ToastServiceMethods,
  e: unknown,
  summary = 'Failed',
) => toast.add({ severity: 'error', summary, detail: (e as Error).message, life: 4000 })

export const toastOk = (
  toast: ToastServiceMethods,
  summary: string,
  life = 2000,
) => toast.add({ severity: 'success', summary, life })
