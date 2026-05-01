<script setup lang="ts">
import type { Role } from '~/types/database'
import { ROLE_META, toInitials } from '~/composables/useUserDisplay'

definePageMeta({ layout: 'auth' })

const auth = useAuthStore()

const email = ref('')
const password = ref('')

interface DemoAcct { email: string; password: string; label: string; sub: string; role: Role }

const DEMO: DemoAcct[] = [
  { role: 'superadmin',  label: 'Platform Admin',           sub: 'all schools',              email: 'admin@schooltrack.in',     password: 'admin123' },
  { role: 'schooladmin', label: 'Greenwood Academy',        sub: 'Mumbai · 312 students',    email: 'principal@greenwood.edu',  password: 'school123' },
  { role: 'schooladmin', label: 'Sunrise Public School',    sub: 'Delhi · 198 students',     email: 'principal@sunrise.edu',    password: 'sunrise123' },
  { role: 'schooladmin', label: 'Blue Ridge International', sub: 'Bangalore · 445 students', email: 'principal@blueridge.edu',  password: 'blueridge123' },
  { role: 'teacher',     label: 'Ms. Priya Sharma',         sub: 'Greenwood · Grade 5A',     email: 'priya@greenwood.edu',      password: 'teacher123' },
  { role: 'teacher',     label: 'Mr. Rahul Mehta',          sub: 'Greenwood · Grade 5B',     email: 'rahul@greenwood.edu',      password: 'rahul123' },
  { role: 'teacher',     label: 'Ms. Anita Roy',            sub: 'Greenwood · Grade 6A',     email: 'anita@greenwood.edu',      password: 'anita123' },
]

const ROLE_ORDER: Role[] = ['superadmin', 'schooladmin', 'teacher']
const grouped = computed(() =>
  ROLE_ORDER.map((r) => ({ role: r, label: ROLE_META[r].label, items: DEMO.filter((d) => d.role === r) }))
    .filter((g) => g.items.length),
)

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
  <div class="grid lg:grid-cols-[1.1fr_1fr] min-h-screen w-full">
    <!-- Brand panel (hidden on mobile) -->
    <section class="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[#0d1530] via-[#0a1024] to-[#0a0e1a]">
      <div
        class="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full blur-3xl opacity-30"
        style="background: radial-gradient(closest-side, #3B82F6, transparent);"
      />
      <div
        class="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-25"
        style="background: radial-gradient(closest-side, #8B5CF6, transparent);"
      />

      <div class="relative z-10 flex items-center gap-3">
        <div class="w-11 h-11 bg-accent rounded-xl flex items-center justify-center shadow-glow">
          <i class="pi pi-building text-white text-xl" />
        </div>
        <span class="text-2xl font-extrabold font-display tracking-tight">SchoolTrack</span>
      </div>

      <div class="relative z-10 max-w-lg">
        <h1 class="text-5xl font-extrabold font-display tracking-tight leading-[1.05] mb-6">
          Attendance &
          <span class="text-accent">report cards</span>,
          reimagined.
        </h1>
        <p class="text-light text-lg leading-relaxed">
          One platform for super admins, principals, and teachers — with photo-proof attendance,
          WhatsApp parent alerts, and CBSE-style report cards.
        </p>
        <div class="mt-10 grid grid-cols-3 gap-3">
          <div v-for="f in [
            { icon: 'pi pi-check-square', label: 'Photo-proof attendance' },
            { icon: 'pi pi-comments',     label: 'WhatsApp alerts' },
            { icon: 'pi pi-file',         label: 'Printable report cards' },
          ]" :key="f.label"
            class="rounded-card border border-line bg-card/60 backdrop-blur p-4 flex flex-col gap-2">
            <i :class="f.icon" class="text-accent text-base" />
            <span class="text-sm font-semibold leading-tight">{{ f.label }}</span>
          </div>
        </div>
      </div>

      <div class="relative z-10 text-muted text-xs">
        © 2026 SchoolTrack — Multi-tenant school SaaS
      </div>
    </section>

    <!-- Login form -->
    <section class="flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md animate-rise">
        <!-- Brand mark for mobile (hidden on lg) -->
        <div class="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
          <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <i class="pi pi-building text-white text-lg" />
          </div>
          <span class="text-xl font-extrabold font-display tracking-tight">SchoolTrack</span>
        </div>

        <h2 class="st-h1 mb-1">Welcome back</h2>
        <p class="text-muted text-sm mb-8">Sign in to continue to your dashboard.</p>

        <form class="flex flex-col gap-3" @submit.prevent="submit">
          <div>
            <label class="st-label block mb-1.5">Email</label>
            <IconField>
              <InputIcon class="pi pi-envelope" />
              <InputText v-model="email" placeholder="you@school.edu" class="w-full" autocomplete="email" />
            </IconField>
          </div>
          <div>
            <label class="st-label block mb-1.5">Password</label>
            <Password
              v-model="password"
              placeholder="••••••••"
              :feedback="false"
              toggle-mask
              input-class="w-full"
              class="w-full"
              autocomplete="current-password"
              @keydown.enter="submit"
            />
          </div>

          <Message v-if="auth.error" severity="error" :closable="false" class="!my-1">
            {{ auth.error }}
          </Message>

          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-arrow-right"
            icon-pos="right"
            class="w-full !py-2.5"
            :loading="auth.loading"
          />
        </form>

        <Divider align="center" class="!my-6">
          <span class="text-muted text-[11px] uppercase tracking-wider">or try a demo</span>
        </Divider>

        <div class="space-y-3">
          <div v-for="g in grouped" :key="g.role">
            <p class="st-label mb-1.5">{{ g.label }}</p>
            <div class="grid gap-1.5">
              <button
                v-for="a in g.items"
                :key="a.email"
                type="button"
                class="group bg-surface hover:bg-surface2 border border-line hover:border-accent/40 rounded-ctl px-3 py-2.5 text-left transition-all flex items-center gap-3"
                @click="fill(a)"
              >
                <div
                  class="w-8 h-8 rounded-ctl ring-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider shrink-0"
                  :class="ROLE_META[a.role].tone"
                >
                  {{ toInitials(a.label) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-ink truncate m-0">{{ a.label }}</p>
                  <p class="text-[11px] text-muted truncate m-0">{{ a.sub }}</p>
                </div>
                <i class="pi pi-arrow-right text-muted text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
