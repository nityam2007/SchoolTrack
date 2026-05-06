<script setup lang="ts">
const auth = useAuthStore()
const db = useDbStore()

const visible = computed(() => auth.role === 'superadmin' && db.schools.length > 0)
const value = computed({
  get: () => db.activeSchoolId,
  set: (v) => db.setSelectedSchool(v),
})
</script>

<template>
  <Dropdown
    v-if="visible"
    v-model="value"
    :options="db.schools"
    option-value="id"
    option-label="name"
    placeholder="Pick school"
    class="!text-sm"
    pt:root:class="!min-w-[200px]"
  >
    <template #value="{ value: v }">
      <span v-if="v" class="flex items-center gap-2">
        <i class="pi pi-building text-accent text-[11px]" />
        <span class="font-semibold truncate">
          {{ db.schools.find((s) => s.id === v)?.name ?? v }}
        </span>
      </span>
      <span v-else class="text-muted">Pick school</span>
    </template>
  </Dropdown>
</template>
