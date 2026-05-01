<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const auth = useAuthStore()

const email = ref('')
const password = ref('')

interface DemoAcct {
  email: string
  password: string
  label: string
  group: 'Super Admin' | 'Principal' | 'Teacher'
}

const DEMO: DemoAcct[] = [
  { group: 'Super Admin', label: 'Platform Admin',                 email: 'admin@schooltrack.in',     password: 'admin123' },
  { group: 'Principal',   label: 'Greenwood Academy',              email: 'principal@greenwood.edu',  password: 'school123' },
  { group: 'Principal',   label: 'Sunrise Public School',          email: 'principal@sunrise.edu',    password: 'sunrise123' },
  { group: 'Principal',   label: 'Blue Ridge International',       email: 'principal@blueridge.edu',  password: 'blueridge123' },
  { group: 'Teacher',     label: 'Ms. Priya Sharma (Grade 5A)',    email: 'priya@greenwood.edu',      password: 'teacher123' },
  { group: 'Teacher',     label: 'Mr. Rahul Mehta (Grade 5B)',     email: 'rahul@greenwood.edu',      password: 'rahul123' },
  { group: 'Teacher',     label: 'Ms. Anita Roy (Grade 6A)',       email: 'anita@greenwood.edu',      password: 'anita123' },
]

const fill = (a: DemoAcct) => {
  email.value = a.email
  password.value = a.password
  auth.error = ''
}

const submit = async () => {
  const ok = await auth.login(email.value.trim(), password.value)
  if (ok) navigateTo('/dashboard')
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
      <p class="text-muted text-base m-0">Attendance & report cards, reimagined</p>
    </div>

    <div class="st-card flex flex-col gap-5">
      <div class="bg-surface rounded-ctl p-3">
        <p class="text-[11px] text-warn font-bold uppercase tracking-wider m-0 mb-2">
          Demo accounts — click to fill
        </p>
        <div class="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
          <button
            v-for="a in DEMO"
            :key="a.email"
            type="button"
            class="bg-card border border-line rounded-lg px-3 py-2 text-left hover:border-accent/50 transition-colors flex items-center justify-between gap-2"
            @click="fill(a)"
          >
            <div class="min-w-0">
              <p class="text-sm font-semibold truncate m-0">{{ a.label }}</p>
              <p class="text-muted text-xs truncate m-0">{{ a.email }}</p>
            </div>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
              :class="{
                'bg-violet/20 text-violet': a.group === 'Super Admin',
                'bg-accent/20 text-accent': a.group === 'Principal',
                'bg-ok/20 text-ok': a.group === 'Teacher',
              }"
            >
              {{ a.group }}
            </span>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <InputText v-model="email" placeholder="Email address" class="!bg-surface !border-line" />
        <Password
          v-model="password"
          placeholder="Password"
          :feedback="false"
          toggle-mask
          input-class="!bg-surface !border-line w-full"
          class="w-full"
          @keydown.enter="submit"
        />
      </div>

      <Message v-if="auth.error" severity="error" :closable="false">{{ auth.error }}</Message>

      <Button
        label="Sign In"
        icon="pi pi-arrow-right"
        icon-pos="right"
        class="w-full"
        :loading="auth.loading"
        @click="submit"
      />
    </div>
  </div>
</template>
