// SchoolTrack — TypeScript interfaces matching supabase/migrations/0001_init.sql.
// All snake_case fields use the Supabase column names verbatim — keep aligned.

export type Role = 'superadmin' | 'schooladmin' | 'teacher'
export type AttendanceStatus = 'present' | 'absent'
export type MessageStatus = 'queued' | 'delivered' | 'failed'
export type ExamStatus = 'upcoming' | 'open' | 'closed'

export interface School {
  id: string
  name: string
  city: string
  credits: number
  active: boolean
  created_at?: string
}

export interface Class {
  id: string
  school_id: string
  name: string
  section: string
  grade: number
}

export interface Teacher {
  id: string
  school_id: string
  class_id: string | null
  name: string
  email: string
  phone: string
}

export interface Student {
  id: string
  school_id: string
  class_id: string
  name: string
  roll: string
  parent_phone: string
  dob: string | null
  gender: 'Male' | 'Female' | 'Other' | null
  father_name: string | null
  mother_name: string | null
  attendance_pct: number
}

export interface Attendance {
  id: string
  school_id: string
  class_id: string
  student_id: string
  date: string
  status: AttendanceStatus
  teacher_id: string | null
  photo: boolean
  timestamp?: string
}

export interface Holiday {
  id: string
  school_id: string
  date: string
  title: string
}

export interface Message {
  id: string
  school_id: string
  student_name: string
  parent_phone: string
  date: string
  status: MessageStatus
}

export interface Subject {
  id: string
  school_id: string
  name: string
  has_theory: boolean
  has_practical: boolean
  theory_max: number
  practical_max: number
  passing_marks: number
}

export interface Exam {
  id: string
  school_id: string
  class_id: string
  name: string
  date_label: string
  session: string
  max_marks: number
  status: ExamStatus
}

export interface Marks {
  id: string
  school_id: string
  exam_id: string
  student_id: string
  subject_id: string
  theory: number
  practical: number
  updated_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: Role
  school_id: string | null
  teacher_id: string | null
  class_id: string | null
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  schoolId: string | null
  teacherId: string | null
  classId: string | null
}
