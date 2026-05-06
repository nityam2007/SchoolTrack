<script setup lang="ts">
import type { Class } from '~/types/database'
defineProps<{
  visible: boolean
  cls: Class | null
  options: Class[]
  modelValue: string | null
  submitting: boolean
}>()
const emit = defineEmits<{
  'update:visible': [v: boolean]
  'update:modelValue': [v: string | null]
  submit: []
}>()
</script>

<template>
  <Dialog :visible="visible" modal header="Reassign class" :style="{ width: '420px' }" @update:visible="emit('update:visible', $event)">
    <div class="flex flex-col gap-3">
      <p class="text-muted m-0">
        Currently assigned to <strong class="text-ink">{{ cls?.name ?? 'Unassigned' }}</strong>.
      </p>
      <Dropdown
        :model-value="modelValue"
        :options="options"
        option-value="id"
        option-label="name"
        placeholder="Pick a class"
        show-clear
        @update:model-value="emit('update:modelValue', $event)"
      />
      <Button label="Save" icon="pi pi-save" :loading="submitting" @click="emit('submit')" />
    </div>
  </Dialog>
</template>
