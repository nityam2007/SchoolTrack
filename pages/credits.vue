<script setup lang="ts">
definePageMeta({ middleware: ['super-admin-only'] })

const db = useDbStore()
const toast = useToast()

const selected = ref<string | null>(null)
const amount = ref(100)

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
    <h2 class="st-h2 m-0">Credit Management</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="s in db.schools" :key="s.id" class="st-card flex flex-col gap-3">
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
