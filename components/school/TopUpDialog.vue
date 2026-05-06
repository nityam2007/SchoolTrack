<script setup lang="ts">
import type { School } from '~/types/database'
const props = defineProps<{ visible: boolean; school: School }>()
const emit = defineEmits<{
  'update:visible': [v: boolean]
  submit: [amount: number]
}>()

const amount = ref(100)
const submitting = ref(false)

const submit = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    await Promise.resolve(emit('submit', Number(amount.value)))
    amount.value = 100
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog :visible="visible" modal header="Top up credits" :style="{ width: '420px' }" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-3">
      <p class="text-muted m-0">
        Adding credits to <strong class="text-ink">{{ school.name }}</strong>.
        Current balance: <strong class="text-ink tabular-nums">{{ school.credits }}</strong>
      </p>
      <InputNumber v-model="amount" placeholder="Credits to add" :min="1" />
      <Button :label="`Add ${amount} credits`" icon="pi pi-plus" :loading="submitting" @click="submit" />
    </div>
  </Dialog>
</template>
