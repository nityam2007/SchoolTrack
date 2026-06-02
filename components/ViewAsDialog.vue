<script setup lang="ts">
import type { Role } from '~/types/database'
import { avatarGradient, initialsOf } from '~/composables/useAvatar'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [v: boolean] }>()

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()

interface UserRow {
  id: string
  email: string
  full_name: string | null
  role: Role
  school_id: string | null
  class_id: string | null
}

const users = ref<UserRow[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

const filterRole = ref<Role | 'all'>('all')
const filterSchool = ref<string | null>(null)
const search = ref('')

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  try {
    users.value = await $fetch<UserRow[]>('/api/admin/users')
  } catch (e) {
    error.value = (e as Error).message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (v) => {
  if (v) {
    filterRole.value = 'all'
    filterSchool.value = null
    search.value = ''
    fetchUsers()
  }
})

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return users.value.filter((u) => {
    if (filterRole.value !== 'all' && u.role !== filterRole.value) return false
    if (filterSchool.value && u.school_id !== filterSchool.value) return false
    if (q && !((u.full_name ?? '') + ' ' + u.email).toLowerCase().includes(q)) return false
    return true
  })
})

const ROLE_OPTIONS: Array<{ label: string; value: Role | 'all' }> = [
  { label: 'All',       value: 'all' },
  { label: 'Principal', value: 'schooladmin' },
  { label: 'Teacher',   value: 'teacher' },
]

const schoolName = (id: string | null) =>
  id ? db.schools.find((s) => s.id === id)?.name ?? id : '—'
const schoolLogo = (id: string | null) =>
  (id ? db.schools.find((s) => s.id === id)?.logo_url : null) ?? null

const impersonate = async (u: UserRow) => {
  if (submitting.value) return
  submitting.value = true
  try {
    await auth.impersonate(u.id)
    if (u.school_id) db.setSelectedSchool(u.school_id)
    toastOk(toast, `Now signed in as ${u.full_name || u.email}`)
    emit('update:visible', false)
    navigateTo('/dashboard')
  } catch (e) {
    toastError(toast, e, 'Impersonation failed')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Impersonate user"
    :style="{ width: '720px' }"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-3">
      <Message severity="warn" :closable="false">
        <strong>Real session swap.</strong> You will be signed in as the target user. Any DB
        actions you perform are attributed to them. Use the banner's
        <em>Exit</em> button to restore your superadmin session.
      </Message>

      <div class="flex flex-wrap gap-2 items-center">
        <SelectButton v-model="filterRole" :options="ROLE_OPTIONS" option-value="value" option-label="label" />
        <Dropdown
          v-model="filterSchool"
          :options="db.schools"
          option-value="id"
          option-label="name"
          placeholder="All schools"
          show-clear
          class="!text-sm"
        />
        <IconField class="flex-1 min-w-[200px]">
          <InputIcon class="pi pi-search" />
          <InputText v-model="search" placeholder="Search name or email..." class="w-full" />
        </IconField>
      </div>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

      <TableSkeleton v-if="loading" :rows="5" :cols="4" />
      <EmptyState
        v-else-if="!filtered.length"
        icon="pi pi-users"
        title="No matching users"
        description="Try clearing filters or check that profiles are populated."
      />
      <div v-else class="st-card !p-0 overflow-hidden">
        <DataTable :value="filtered" responsive-layout="scroll" striped-rows paginator :rows="8">
          <Column header="Name">
            <template #body="{ data }">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[11px] font-semibold shrink-0" :class="avatarGradient(data.full_name || data.email)">
                  {{ initialsOf(data.full_name || data.email) }}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold m-0 truncate">{{ data.full_name || '(no name)' }}</p>
                  <p class="text-muted text-xs m-0 font-mono truncate">{{ data.email }}</p>
                </div>
              </div>
            </template>
          </Column>
          <Column header="Role">
            <template #body="{ data }">
              <Tag :value="data.role === 'schooladmin' ? 'Principal' : 'Teacher'"
                   :severity="data.role === 'schooladmin' ? 'info' : 'success'" />
            </template>
          </Column>
          <Column header="School">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-md border border-line bg-surface2 overflow-hidden flex items-center justify-center shrink-0">
                  <img v-if="schoolLogo(data.school_id)" :src="schoolLogo(data.school_id)!" alt="" class="w-full h-full object-cover">
                  <i v-else class="pi pi-building text-muted text-[10px]" />
                </div>
                <span class="text-xs truncate">{{ schoolName(data.school_id) }}</span>
              </div>
            </template>
          </Column>
          <Column header="" :style="{ width: '140px' }">
            <template #body="{ data }">
              <Button
                label="Impersonate"
                icon="pi pi-sign-in"
                size="small"
                outlined
                :loading="submitting"
                @click="impersonate(data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </Dialog>
</template>
