import type { Role } from '~/types/database'

export const ROLE_META: Record<Role, { label: string; tone: string; chipTone: string }> = {
  superadmin:  { label: 'Super Admin', tone: 'text-violet bg-violet/10 ring-violet/20',  chipTone: 'bg-violet/10 text-violet' },
  schooladmin: { label: 'Principal',   tone: 'text-accent bg-accentSoft ring-accent/25', chipTone: 'bg-accentSoft text-accent' },
  teacher:     { label: 'Teacher',     tone: 'text-ok bg-ok/10 ring-ok/25',              chipTone: 'bg-ok/10 text-ok' },
}

const NAME_PREFIX = /^(Principal — |Mr\.|Ms\.|Mrs\.) ?/

export const toInitials = (name: string | null | undefined): string =>
  (name ?? '')
    .replace(NAME_PREFIX, '')
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const toFirstName = (name: string | null | undefined): string => {
  const cleaned = (name ?? '').replace(/^Principal — /, '')
  const parts = cleaned.split(/\s+/).filter(Boolean)
  // For "Ms. Priya Sharma" → "Priya"; for "Platform Admin" → "Platform".
  return parts[1] && /^(Mr\.|Ms\.|Mrs\.)$/.test(parts[0]) ? parts[1] : parts[0] ?? ''
}

const greetingFor = (h: number) =>
  h < 5  ? 'Good evening'
  : h < 12 ? 'Good morning'
  : h < 17 ? 'Good afternoon'
  : 'Good evening'

export const useUserDisplay = () => {
  const auth = useAuthStore()
  const initials = computed(() => toInitials(auth.user?.name))
  const firstName = computed(() => toFirstName(auth.user?.name))
  const greeting = computed(() => greetingFor(new Date().getHours()))
  const roleMeta = computed(() =>
    auth.user?.role ? ROLE_META[auth.user.role] : { label: '', tone: '', chipTone: '' },
  )
  return { initials, firstName, greeting, roleMeta }
}
