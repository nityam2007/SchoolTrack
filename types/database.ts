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
  logo_url?: string | null
  created_at?: string
}

export type CreditTxnKind = 'recharge' | 'deduction' | 'adjustment'

export interface CreditTxn {
  id: string
  school_id: string
  kind: CreditTxnKind
  amount: number          // signed: +recharge / -deduction
  balance_after: number | null
  note: string
  actor_email: string
  created_at: string
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
  previous_class_id?: string | null
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
  body?: string
  attachment_url?: string | null
  recipient_type?: 'student' | 'class' | 'school'
}

export interface StaffMessage {
  id: string
  school_id: string
  from_email: string
  to_teacher_id: string | null   // null = all teachers
  subject: string
  body: string
  created_at: string
}

export type AuditAction =
  | 'create' | 'update' | 'delete' | 'login' | 'logout'
  | 'page_view' | 'message' | 'export' | 'import' | 'promote' | 'credit'

export interface AuditLog {
  id: string
  actor_id: string | null
  actor_email: string
  role: string
  action: AuditAction | string
  entity: string
  entity_id: string | null
  school_id: string | null
  path: string | null
  ip: string | null
  detail: Record<string, unknown> | null
  created_at: string
}

export interface CreditRequest {
  id: string
  school_id: string
  amount: number
  note: string
  status: 'pending' | 'approved' | 'rejected'
  requested_by: string
  resolved_by: string | null
  created_at: string
  resolved_at: string | null
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
