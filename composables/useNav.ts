import type { Role } from '~/types/database'

export interface NavItem {
  key: string
  label: string
  icon: string // PrimeIcons class, e.g. 'pi pi-home'
  to: string
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  superadmin: [
    { key: 'dashboard', label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' },
    { key: 'schools', label: 'Schools', icon: 'pi pi-building', to: '/schools' },
    { key: 'credits', label: 'Credits', icon: 'pi pi-credit-card', to: '/credits' },
    { key: 'analytics', label: 'Analytics', icon: 'pi pi-chart-bar', to: '/analytics' },
  ],
  schooladmin: [
    { key: 'dashboard', label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' },
    { key: 'attendance', label: 'Attendance', icon: 'pi pi-list', to: '/attendance' },
    { key: 'teachers', label: 'Teachers', icon: 'pi pi-id-card', to: '/teachers' },
    { key: 'students', label: 'Students', icon: 'pi pi-users', to: '/students' },
    { key: 'holidays', label: 'Holidays', icon: 'pi pi-calendar', to: '/holidays' },
    { key: 'messages', label: 'Messages', icon: 'pi pi-comments', to: '/messages' },
    { key: 'reports', label: 'Reports', icon: 'pi pi-chart-line', to: '/reports' },
    { key: 'reportcards', label: 'Report Cards', icon: 'pi pi-file', to: '/report-cards' },
  ],
  teacher: [
    { key: 'dashboard', label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard' },
    { key: 'markattendance', label: 'Mark Attendance', icon: 'pi pi-check-square', to: '/mark-attendance' },
    { key: 'myclass', label: 'My Class', icon: 'pi pi-list', to: '/my-class' },
    { key: 'reportcards', label: 'Report Cards', icon: 'pi pi-file', to: '/report-cards' },
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
