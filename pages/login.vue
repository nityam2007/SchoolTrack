<script setup lang="ts">
import type { Role } from '~/types/database'

definePageMeta({ layout: 'auth' })

const auth = useAuthStore()
const db = useDbStore()

const role = ref<Role>('superadmin')
const email = ref('')
const pass = ref('')
const showPass = ref(false)

const roles: { key: Role; label: string; icon: string }[] = [
  { key: 'superadmin', label: 'Super Admin', icon: 'pi pi-key' },
  { key: 'schooladmin', label: 'Principal', icon: 'pi pi-building' },
  { key: 'teacher', label: 'Teacher', icon: 'pi pi-user' },
]

const hints = computed(() => {
  if (role.value === 'superadmin') {
    return [{ email: 'admin@schooltrack.in', pass: 'admin123', label: 'Platform Admin' }]
  }
  if (role.value === 'schooladmin') {
    return db.schools.map((s) => ({ email: s.adminEmail, pass: s.adminPass, label: s.name }))
  }
  return db.teachers.map((t) => ({ email: t.email, pass: t.pass, label: t.name }))
})

const fillHint = (h: { email: string; pass: string }) => {
  email.value = h.email
  pass.value = h.pass
  auth.error = ''
}

const onRoleChange = (r: Role) => {
  role.value = r
  email.value = ''
  pass.value = ''
  auth.error = ''
}

const submit = () => {
  if (auth.login(role.value, email.value, pass.value)) {
    navigateTo('/dashboard')
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="text-center mb-10">
      <div class="inline-flex items-center gap-2.5 mb-3">
        <div class="w-11 h-11 bg-accent rounded-xl flex items-center justify-center">
          <i class="pi pi-building text-2xl text-white" />
        </div>
        <span class="text-3xl font-extrabold font-display tracking-tight">SchoolTrack</span>
      </div>
      <p class="text-muted text-base m-0">Attendance management, reimagined</p>
    </div>

    <div class="st-card flex flex-col gap-5">
      <div>
        <p class="st-label mb-2">Login As</p>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="r in roles"
            :key="r.key"
            type="button"
            class="px-3.5 py-1.5 rounded-lg border text-sm transition-colors flex items-center gap-2"
            :class="
              role === r.key
                ? 'bg-accent border-accent text-white font-bold'
                : 'bg-surface border-line text-muted hover:text-ink'
            "
            @click="onRoleChange(r.key)"
          >
            <i :class="r.icon" />
            {{ r.label }}
          </button>
        </div>
      </div>

      <div class="bg-surface rounded-ctl p-3">
        <p class="text-[11px] text-warn font-bold uppercase tracking-wider m-0 mb-2">
          Demo Accounts — click to fill
        </p>
        <div class="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
          <button
            v-for="(h, i) in hints"
            :key="i"
            type="button"
            class="bg-card border border-line rounded-lg px-3 py-2 text-left text-ink hover:border-accent/50 transition-colors"
            @click="fillHint(h)"
          >
            <span class="text-sm font-semibold">{{ h.label }}</span>
            <span class="text-muted text-xs ml-2">{{ h.email }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <InputText v-model="email" placeholder="Email address" class="!bg-surface !border-line" />
        <Password
          v-model="pass"
          placeholder="Password"
          :feedback="false"
          toggle-mask
          input-class="!bg-surface !border-line w-full"
          class="w-full"
          @keydown.enter="submit"
        />
      </div>

      <Message v-if="auth.error" severity="error" :closable="false">{{ auth.error }}</Message>

      <Button label="Sign In" icon="pi pi-arrow-right" icon-pos="right" class="w-full" @click="submit" />
    </div>
  </div>
</template>
