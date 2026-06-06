<script setup lang="ts">
useHead({ title: 'Settings' })

const auth = useAuthStore()
const db = useDbStore()
const toast = useToast()
const { initials, roleMeta } = useUserDisplay()
const { log } = useAudit()

const fullName = ref(auth.user?.name ?? '')
watch(() => auth.user?.name, (n) => { if (n && !dirty.value) fullName.value = n })
const dirty = computed(() => fullName.value.trim() !== (auth.user?.name ?? ''))
const savingName = ref(false)

const saveName = async () => {
  if (!dirty.value || !fullName.value.trim()) return
  savingName.value = true
  try {
    const { error } = await useSupabaseClient().auth.updateUser({ data: { full_name: fullName.value.trim() } })
    if (error) throw error
    await auth.refresh()
    await log('update', { entity: 'profile', detail: { full_name: true } })
    toastOk(toast, 'Name updated')
  } catch (e) { toastError(toast, e) }
  finally { savingName.value = false }
}

const reloading = ref(false)
const reload = async () => { reloading.value = true; try { await db.reload(); toastOk(toast, 'Data reloaded') } finally { reloading.value = false } }

const onLogout = async () => { await auth.logout(); navigateTo('/login') }
const exitImpersonation = async () => { await auth.exitImpersonation(); navigateTo('/dashboard') }

const school = computed(() => db.activeSchool)
const platformStats = computed(() => ({
  schools: db.schools.length, students: db.students.length, teachers: db.teachers.length,
}))
const teacherClass = computed(() => (auth.user?.classId ? db.classMap.get(auth.user.classId) ?? null : null))
</script>

<template>
  <div class="flex flex-col gap-5 max-w-3xl">
    <div>
      <h2 class="st-h2 m-0">Settings</h2>
      <p class="text-muted text-sm mt-1">Manage your account and workspace.</p>
    </div>

    <!-- Account -->
    <div class="st-card">
      <p class="st-h3 mb-4">Account</p>
      <div class="flex items-center gap-4 mb-5">
        <div class="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-white text-lg shrink-0" :class="roleMeta.avatar">
          {{ initials }}
        </div>
        <div>
          <p class="font-semibold text-ink m-0">{{ auth.user?.email }}</p>
          <span class="st-chip mt-1 inline-flex" :class="roleMeta.chipTone">{{ roleMeta.label }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1 flex-1 min-w-[220px]">
          <label class="st-label">Display name</label>
          <InputText v-model="fullName" placeholder="Your name" />
        </div>
        <Button label="Save" icon="pi pi-check" :disabled="!dirty" :loading="savingName" @click="saveName" />
      </div>
    </div>

    <!-- School (principal) -->
    <div v-if="auth.role === 'schooladmin' && school" class="st-card">
      <p class="st-h3 mb-1">School</p>
      <p class="text-muted text-sm mb-4">{{ school.name }} · {{ school.city }} · <NuxtLink to="/billing" class="text-accent">{{ school.credits }} credits</NuxtLink></p>
      <SchoolLogoUpload :school-id="school.id" :size="56" />
    </div>

    <!-- Platform (super admin) -->
    <div v-else-if="auth.role === 'superadmin'" class="st-card">
      <p class="st-h3 mb-3">Platform</p>
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-surface2 rounded-ctl p-3 text-center"><p class="text-2xl font-bold m-0">{{ platformStats.schools }}</p><p class="text-muted text-xs m-0">Schools</p></div>
        <div class="bg-surface2 rounded-ctl p-3 text-center"><p class="text-2xl font-bold m-0">{{ platformStats.students }}</p><p class="text-muted text-xs m-0">Students</p></div>
        <div class="bg-surface2 rounded-ctl p-3 text-center"><p class="text-2xl font-bold m-0">{{ platformStats.teachers }}</p><p class="text-muted text-xs m-0">Teachers</p></div>
      </div>
      <div class="flex gap-2 mt-4">
        <NuxtLink to="/schools"><Button label="Manage schools" icon="pi pi-building" severity="secondary" outlined size="small" /></NuxtLink>
        <NuxtLink to="/logs"><Button label="Activity logs" icon="pi pi-history" severity="secondary" outlined size="small" /></NuxtLink>
      </div>
    </div>

    <!-- Class (teacher) -->
    <div v-else-if="auth.role === 'teacher'" class="st-card">
      <p class="st-h3 mb-1">My class</p>
      <p class="text-muted text-sm">{{ teacherClass?.name ?? 'No class assigned' }} · <NuxtLink to="/my-class" class="text-accent">open class</NuxtLink></p>
    </div>

    <!-- Workspace -->
    <div class="st-card">
      <p class="st-h3 mb-3">Workspace</p>
      <div class="flex flex-wrap items-center gap-3">
        <Button label="Reload data" icon="pi pi-refresh" severity="secondary" outlined :loading="reloading" @click="reload" />
        <span class="text-muted text-xs">Re-fetch everything from the server.</span>
      </div>
    </div>

    <!-- Session -->
    <div class="st-card">
      <p class="st-h3 mb-3">Session</p>
      <div class="flex flex-wrap gap-2">
        <Button v-if="auth.isImpersonating" label="Exit impersonation" icon="pi pi-arrow-left" severity="warn" outlined @click="exitImpersonation" />
        <Button label="Sign out" icon="pi pi-sign-out" severity="danger" outlined @click="onLogout" />
      </div>
    </div>
  </div>
</template>
