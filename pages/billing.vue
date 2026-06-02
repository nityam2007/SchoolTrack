<script setup lang="ts">
definePageMeta({ middleware: ['principal-only'] })

const db = useDbStore()
const toast = useToast()
const { log } = useAudit()

const school = computed(() => db.activeSchool)
const sid = computed(() => db.activeSchoolId)

onMounted(() => {
  if (sid.value) { db.loadCreditTxns(sid.value); db.loadCreditRequests() }
})
watch(sid, (id) => { if (id) { db.loadCreditTxns(id); db.loadCreditRequests() } })

const txns = computed(() => db.creditTxns)
const requests = computed(() => db.creditRequests.filter((r) => r.school_id === sid.value))

// Request more credits
const amount = ref(500)
const note = ref('')
const busy = ref(false)
const requestCredits = async () => {
  if (!sid.value || amount.value <= 0 || busy.value) return
  busy.value = true
  try {
    await db.addCreditRequest(sid.value, Number(amount.value), note.value.trim())
    await log('credit', { entity: 'credit_request', schoolId: sid.value, detail: { amount: amount.value } })
    toastOk(toast, 'Credit request sent to the platform admin')
    amount.value = 500; note.value = ''
  } catch (e) { toastError(toast, e) }
  finally { busy.value = false }
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const statusChip = (s: string) =>
  s === 'approved' ? 'bg-ok/10 text-ok' : s === 'rejected' ? 'bg-danger/10 text-danger' : 'bg-warn/10 text-warn'
const lowBalance = computed(() => (school.value?.credits ?? 0) < 100)
</script>

<template>
  <div v-if="school" class="flex flex-col gap-5">
    <div>
      <h2 class="st-h2 m-0">Billing</h2>
      <p class="text-muted text-sm mt-1">Credits power parent WhatsApp notifications — one credit per message.</p>
    </div>

    <!-- Balance + request -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="st-card flex flex-col justify-between lg:col-span-1">
        <div>
          <p class="st-label">Current balance</p>
          <p class="text-[44px] leading-none font-bold font-display mt-2" :class="lowBalance ? 'text-danger' : 'text-ink'">
            {{ school.credits }}
          </p>
          <p class="text-muted text-sm mt-2">{{ lowBalance ? 'Low balance — request a top-up.' : 'Healthy balance.' }}</p>
        </div>
        <ProgressBar :value="Math.min((school.credits / 1000) * 100, 100)" :show-value="false" class="h-1.5 mt-4" />
      </div>

      <div class="st-card lg:col-span-2">
        <p class="st-h3 mb-1">Request more credits</p>
        <p class="text-muted text-xs mb-4">The platform admin reviews and approves requests. (No online payment.)</p>
        <div class="flex flex-wrap items-end gap-3">
          <div class="flex flex-col gap-1">
            <label class="st-label">Amount</label>
            <InputNumber v-model="amount" :min="1" :step="100" class="w-40" />
          </div>
          <div class="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label class="st-label">Note (optional)</label>
            <InputText v-model="note" placeholder="e.g. exam season — high message volume" />
          </div>
          <Button label="Send request" icon="pi pi-send" :loading="busy" @click="requestCredits" />
        </div>
      </div>
    </div>

    <!-- Requests -->
    <div class="st-card">
      <p class="st-h3 mb-3">Your requests</p>
      <div v-if="!requests.length" class="text-muted text-sm py-6 text-center">No credit requests yet.</div>
      <DataTable v-else :value="requests" paginator :rows="5" class="!text-sm" striped-rows>
        <Column header="Date"><template #body="{ data }"><span class="text-light text-xs">{{ fmtDate(data.created_at) }}</span></template></Column>
        <Column header="Amount"><template #body="{ data }"><span class="font-bold tabular-nums">+{{ data.amount }}</span></template></Column>
        <Column field="note" header="Note"><template #body="{ data }"><span class="text-light">{{ data.note || '—' }}</span></template></Column>
        <Column header="Status"><template #body="{ data }"><span class="st-chip" :class="statusChip(data.status)">{{ data.status }}</span></template></Column>
      </DataTable>
    </div>

    <!-- Ledger -->
    <div class="st-card">
      <p class="st-h3 mb-3">Transaction history</p>
      <div v-if="!txns.length" class="text-muted text-sm py-6 text-center">No transactions yet.</div>
      <DataTable v-else :value="txns" paginator :rows="8" class="!text-sm" striped-rows>
        <Column header="Date"><template #body="{ data }"><span class="text-light text-xs">{{ fmtDate(data.created_at) }}</span></template></Column>
        <Column header="Amount">
          <template #body="{ data }">
            <span class="font-bold tabular-nums" :class="data.amount >= 0 ? 'text-ok' : 'text-danger'">{{ data.amount >= 0 ? '+' : '' }}{{ data.amount }}</span>
          </template>
        </Column>
        <Column header="Balance"><template #body="{ data }"><span class="tabular-nums text-light">{{ data.balance_after ?? '—' }}</span></template></Column>
        <Column field="note" header="Note"><template #body="{ data }"><span class="text-light">{{ data.note || '—' }}</span></template></Column>
      </DataTable>
    </div>
  </div>
  <EmptyState v-else icon="pi pi-wallet" title="No school assigned" description="Your account isn't linked to a school yet." />
</template>
