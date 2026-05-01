// SchoolTrack — TypeScript interfaces for the multi-tenant data model.
// These mirror the seed/in-memory shape used by the React TEMPLATE/SchoolTrack.jsx
// and will map 1:1 to Supabase tables (snake_case columns expected on backend).

export type Role = 'superadmin' | 'schooladmin' | 'teacher'

export interface School {
  id: string
  name: string
  city: string
  credits: number
  students: number
  active: boolean
  adminEmail: string
  adminPass: string
}

export interface Class {
  id: string
  schoolId: string
  name: string
  section: string
  grade: number
}

export interface Teacher {
  id: string
  schoolId: string
  name: string
  email: string
  pass: string
  classId: string
  phone: string
}

export interface Student {
  id: string
  schoolId: string
  classId: string
  name: string
  roll: string
  parentPhone: string
}

export type AttendanceStatus = 'present' | 'absent'

export interface Attendance {
  id: string
  schoolId: string
  classId: string
  studentId: string
  date: string // YYYY-MM-DD
  status: AttendanceStatus
  teacherId: string
  photo: boolean
  timestamp?: string
}

export interface Holiday {
  id: string
  schoolId: string
  date: string // YYYY-MM-DD
  title: string
}

export type MessageStatus = 'queued' | 'delivered' | 'failed'

export interface Message {
  id: string
  schoolId: string
  studentName: string
  parentPhone: string
  date: string // YYYY-MM-DD HH:MM
  status: MessageStatus
}

export interface AuthUser {
  role: Role
  email: string
  name: string
  schoolId: string | null
  teacherId?: string
  classId?: string
}

export interface Db {
  schools: School[]
  classes: Class[]
  teachers: Teacher[]
  students: Student[]
  attendance: Attendance[]
  holidays: Holiday[]
  messages: Message[]
}
