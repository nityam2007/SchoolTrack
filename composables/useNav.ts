import type { Role } from '~/types/database'

export interface NavItem {
  key: string
  label: string
  icon: string // PrimeIcons class, e.g. 'pi pi-home'
  to: string
}

const SECTIONS = {
  dashboard:     { key: 'dashboard',     label: 'Dashboard',       icon: 'pi pi-home',         to: '/dashboard' },
  schools:       { key: 'schools',       label: 'Schools',         icon: 'pi pi-building',     to: '/schools' },
  credits:       { key: 'credits',       label: 'Credits',         icon: 'pi pi-credit-card',  to: '/credits' },
  analytics:     { key: 'analytics',     label: 'Analytics',       icon: 'pi pi-chart-bar',    to: '/analytics' },
  attendance:    { key: 'attendance',    label: 'Attendance',      icon: 'pi pi-list',         to: '/attendance' },
  classes:       { key: 'classes',       label: 'Classes',         icon: 'pi pi-th-large',     to: '/classes' },
  teachers:      { key: 'teachers',      label: 'Teachers',        icon: 'pi pi-id-card',      to: '/teachers' },
  students:      { key: 'students',      label: 'Students',        icon: 'pi pi-users',        to: '/students' },
  subjects:      { key: 'subjects',      label: 'Subjects',        icon: 'pi pi-book',         to: '/subjects' },
  holidays:      { key: 'holidays',      label: 'Holidays',        icon: 'pi pi-calendar',     to: '/holidays' },
  messages:      { key: 'messages',      label: 'Messages',        icon: 'pi pi-comments',     to: '/messages' },
  reports:       { key: 'reports',       label: 'Reports',         icon: 'pi pi-chart-line',   to: '/reports' },
  reportcards:   { key: 'reportcards',   label: 'Report Cards',    icon: 'pi pi-file',         to: '/report-cards' },
  markattendance:{ key: 'markattendance',label: 'Mark Attendance', icon: 'pi pi-check-square', to: '/mark-attendance' },
  myclass:       { key: 'myclass',       label: 'My Class',        icon: 'pi pi-list',         to: '/my-class' },
} as const

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  superadmin: [
    SECTIONS.dashboard,
    SECTIONS.schools, SECTIONS.credits, SECTIONS.analytics,
    SECTIONS.classes, SECTIONS.attendance, SECTIONS.teachers, SECTIONS.students,
    SECTIONS.subjects, SECTIONS.holidays, SECTIONS.messages,
    SECTIONS.reports, SECTIONS.reportcards,
  ],
  schooladmin: [
    SECTIONS.dashboard,
    SECTIONS.classes, SECTIONS.attendance, SECTIONS.teachers, SECTIONS.students,
    SECTIONS.subjects, SECTIONS.holidays, SECTIONS.messages,
    SECTIONS.reports, SECTIONS.reportcards,
  ],
  teacher: [
    SECTIONS.dashboard,
    SECTIONS.markattendance, SECTIONS.myclass, SECTIONS.reportcards,
  ],
}

export const useNav = () => {
  const auth = useAuthStore()
  const items = computed<NavItem[]>(() => {
    const role = auth.user?.role
    return role ? NAV_BY_ROLE[role] : []
  })
  return { items }
}
