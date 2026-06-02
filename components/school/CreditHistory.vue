<script setup lang="ts">
import type { School } from '~/types/database'

const props = defineProps<{ school: School }>()
const db = useDbStore()
const toast = useToast()

onMounted(() => db.loadCreditTxns(props.school.id))
watch(() => props.school.id, (id) => db.loadCreditTxns(id))

const txns = computed(() => db.creditTxns)
const recharged = computed(() => txns.value.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0))
const deducted = computed(() => txns.value.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0))

// Add / remove dialog.
const showAdjust = ref(false)
const mode = ref<'add' | 'remove'>('add')
const amount = ref(100)
const note = ref('')
const busy = ref(false)

const openAdjust = (m: 'add' | 'remove') => { mode.value = m; amount.value = 100; note.value = ''; showAdjust.value = true }

const submit = async () => {
  if (busy.value || amount.value <= 0) return
  busy.value = true
  try {
    if (mode.value === 'add') await db.topUpCredits(props.school.id, Number(amount.value), note.value.trim())
    else await db.removeCredits(props.school.id, Number(amount.value), note.value.trim())
    await db.loadCreditTxns(props.school.id)
    toastOk(toast, mode.value === 'add' ? 'Credits added' : 'Credits removed')
    showAdjust.value = false
  } catch (e) { toastError(toast, e) }
  finally { busy.value = false }
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const kindMeta = (k: string) =>
  k === 'recharge' ? { label: 'Recharge', chip: 'bg-ok/10 text-ok' }
  : k === 'deduction' ? { label: 'Deduction', chip: 'bg-danger/10 text-danger' }
  : { label: 'Adjustment', chip: 'bg-warn/10 text-warn' }
</script>

<template>
  <div class="st-card">
    <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
      <div>
        <p class="st-h3 m-0">Credit history</p>
        <p class="text-muted text-xs mt-1">
          Balance <span class="font-bold text-ink tabular-nums">{{ school.credits }}</span>
          · <span class="text-ok">+{{ recharged }}</span> recharged
          · <span class="text-danger">−{{ deducted }}</span> used
        </p>
      </div>
      <div class="flex gap-2">
        <Button label="Add" icon="pi pi-plus" size="small" @click="openAdjust('add')" />
        <Button label="Remove" icon="pi pi-minus" size="small" severity="danger" outlined @click="openAdjust('remove')" />
      </div>
    </div>

    <div v-if="!txns.length" class="text-muted text-sm py-8 text-center">
      <i class="pi pi-receipt text-muted text-xl block mb-2" />
      No credit activity yet. Recharges and message deductions will appear here.
    </div>
    <DataTable v-else :value="txns" responsive-layout="scroll" paginator :rows="8" striped-rows class="!text-sm">
      <Column header="Date">
        <template #body="{ data }"><span class="text-light text-xs whitespace-nowrap">{{ fmtDate(data.created_at) }}</span></template>
      </Column>
      <Column header="Type">
        <template #body="{ data }">
          <span class="st-chip" :class="kindMeta(data.kind).chip">{{ kindMeta(data.kind).label }}</span>
        </template>
      </Column>
      <Column header="Amount">
        <template #body="{ data }">
          <span class="font-bold tabular-nums" :class="data.amount >= 0 ? 'text-ok' : 'text-danger'">
            {{ data.amount >= 0 ? '+' : '' }}{{ data.amount }}
          </span>
        </template>
      </Column>
      <Column header="Balance">
        <template #body="{ data }"><span class="tabular-nums text-light">{{ data.balance_after ?? '—' }}</span></template>
      </Column>
      <Column field="note" header="Note">
        <template #body="{ data }"><span class="text-light">{{ data.note || '—' }}</span></template>
      </Column>
      <Column header="By">
        <template #body="{ data }"><span class="text-muted text-xs">{{ data.actor_email || 'system' }}</span></template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showAdjust" modal :header="mode === 'add' ? 'Add credits' : 'Remove credits'" :style="{ width: '420px' }">
      <div class="flex flex-col gap-3">
        <p class="text-muted m-0 text-sm">
          {{ mode === 'add' ? 'Adding to' : 'Removing from' }}
          <strong class="text-ink">{{ school.name }}</strong> · balance
          <strong class="text-ink tabular-nums">{{ school.credits }}</strong>
        </p>
        <InputNumber v-model="amount" :min="1" placeholder="Amount" />
        <InputText v-model="note" placeholder="Note (optional)" />
        <Button
          :label="mode === 'add' ? `Add ${amount} credits` : `Remove ${amount} credits`"
          :icon="mode === 'add' ? 'pi pi-plus' : 'pi pi-minus'"
          :severity="mode === 'add' ? 'primary' : 'danger'"
          :loading="busy"
          @click="submit"
        />
      </div>
    </Dialog>
  </div>
</template>
