<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })

const db = useDbStore()
const toast = useToast()

onMounted(() => db.loadCreditRequests())

const pendingReqs = computed(() => db.creditRequests.filter((r) => r.status === 'pending'))
const schoolName = (id: string) => db.schools.find((s) => s.id === id)?.name ?? id
const resolving = ref<string | null>(null)
const resolve = async (id: string, approve: boolean) => {
  resolving.value = id
  try {
    await db.resolveCreditRequest(id, approve)
    toastOk(toast, approve ? 'Approved & credited' : 'Request rejected')
  } catch (e) { toastError(toast, e) }
  finally { resolving.value = null }
}

const selected = ref<string | null>(null)
const amount = ref(100)

const q = ref('')
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  const list = term
    ? db.schools.filter((s) => `${s.name} ${s.city}`.toLowerCase().includes(term))
    : db.schools
  // Surface low-balance schools first so they're easy to spot.
  return [...list].sort((a, b) => a.credits - b.credits)
})

const submit = async () => {
  if (!selected.value) return
  try {
    await db.topUpCredits(selected.value, Number(amount.value))
    toastOk(toast, 'Credits added')
    selected.value = null
    amount.value = 100
  } catch (e) {
    toastError(toast, e)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="st-h2 m-0">Credit Management</h2>
        <p class="text-muted text-sm mt-1">{{ db.schools.filter((s) => s.credits < 100).length }} school(s) below 100 credits</p>
      </div>
      <span class="relative">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
        <input
          v-model="q"
          type="text"
          placeholder="Search schools…"
          class="h-10 w-56 pl-10 pr-3 rounded-ctl bg-surface border border-line text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accentSoft transition"
        >
      </span>
    </div>
    <!-- Pending credit requests from principals -->
    <div v-if="pendingReqs.length" class="st-card !p-5 border-warn/40 bg-warn/5">
      <p class="st-h3 mb-3 flex items-center gap-2"><i class="pi pi-inbox text-warn" /> Pending credit requests ({{ pendingReqs.length }})</p>
      <div class="flex flex-col gap-2">
        <div v-for="r in pendingReqs" :key="r.id" class="flex items-center justify-between gap-3 bg-surface border border-line rounded-ctl px-4 py-3 flex-wrap">
          <div class="min-w-0">
            <p class="font-semibold text-sm m-0">{{ schoolName(r.school_id) }} · <span class="text-accent">+{{ r.amount }}</span></p>
            <p class="text-muted text-xs m-0">{{ r.requested_by }}<span v-if="r.note"> — {{ r.note }}</span></p>
          </div>
          <div class="flex gap-2">
            <Button label="Approve" icon="pi pi-check" size="small" :loading="resolving === r.id" @click="resolve(r.id, true)" />
            <Button label="Reject" icon="pi pi-times" size="small" severity="danger" outlined :disabled="resolving === r.id" @click="resolve(r.id, false)" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="s in filtered" :key="s.id" class="st-card flex flex-col gap-3">
        <div>
          <p class="font-bold m-0">{{ s.name }}</p>
          <p class="text-muted text-xs m-0">{{ s.city }}</p>
        </div>
        <div>
          <p class="text-muted text-xs m-0">Balance</p>
          <p class="text-3xl font-extrabold m-0" :class="s.credits < 100 ? 'text-danger' : 'text-ok'">
            {{ s.credits }}
          </p>
        </div>
        <ProgressBar :value="Math.min((s.credits / 500) * 100, 100)" :show-value="false" class="h-1.5" />
        <Button label="Top Up" icon="pi pi-plus" @click="selected = s.id" />
      </div>
    </div>

    <Dialog
      :visible="!!selected"
      modal
      header="Add Credits"
      :style="{ width: '420px' }"
      @update:visible="(v) => { if (!v) selected = null }"
    >
      <div class="flex flex-col gap-3">
        <p class="text-muted m-0">
          School: <strong class="text-ink">{{ db.schools.find((s) => s.id === selected)?.name }}</strong>
        </p>
        <InputNumber v-model="amount" placeholder="Credits to add" :min="1" />
        <Button :label="`Add ${amount} Credits`" @click="submit" />
      </div>
    </Dialog>
  </div>
</template>
