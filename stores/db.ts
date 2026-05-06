import { defineStore } from 'pinia'
import type {
  Attendance, Class, Exam, Holiday, Marks, Message, School, Student, Subject, Teacher,
} from '~/types/database'

interface DbState {
  schools: School[]
  classes: Class[]
  teachers: Teacher[]
  students: Student[]
  attendance: Attendance[]
  holidays: Holiday[]
  messages: Message[]
  subjects: Subject[]
  exams: Exam[]
  marks: Marks[]
  loaded: boolean
  loading: boolean
  error: string
  // Superadmin-only: which school is being viewed via principal-scoped pages.
  // Persisted to localStorage so it survives reloads.
  selectedSchoolId: string | null
}

const blankState = (): DbState => ({
  schools: [], classes: [], teachers: [], students: [],
  attendance: [], holidays: [], messages: [],
  subjects: [], exams: [], marks: [],
  loaded: false, loading: false, error: '',
  selectedSchoolId: null,
})

export const useDbStore = defineStore('db', {
  state: blankState,

  getters: {
    classesForSchool: (s) => (id: string) => s.classes.filter((c) => c.school_id === id),
    teachersForSchool: (s) => (id: string) => s.teachers.filter((t) => t.school_id === id),
    studentsForSchool: (s) => (id: string) => s.students.filter((x) => x.school_id === id),
    studentsForClass:  (s) => (cid: string) => s.students.filter((x) => x.class_id === cid),
    attendanceForSchool: (s) => (id: string) => s.attendance.filter((a) => a.school_id === id),
    holidaysForSchool: (s) => (id: string) => s.holidays.filter((h) => h.school_id === id),
    messagesForSchool: (s) => (id: string) => s.messages.filter((m) => m.school_id === id),
    subjectsForSchool: (s) => (id: string) => s.subjects.filter((x) => x.school_id === id),
    examsForSchool:    (s) => (id: string) => s.exams.filter((e) => e.school_id === id),
    examsForClass:     (s) => (cid: string) => s.exams.filter((e) => e.class_id === cid),
    marksForExam:      (s) => (eid: string) => s.marks.filter((m) => m.exam_id === eid),
    marksForExamStudent: (s) => (eid: string, sid: string) =>
      s.marks.filter((m) => m.exam_id === eid && m.student_id === sid),
    // Lookup maps — built once, used to avoid N+1 .find() calls in templates.
    studentMap: (s) => new Map(s.students.map((x) => [x.id, x])),
    classMap:   (s) => new Map(s.classes.map((c) => [c.id, c])),
    schoolMap:  (s) => new Map(s.schools.map((x) => [x.id, x])),
    // Effective school id for principal-scoped views: own school for principals,
    // explicitly selected (or first) school for superadmins, null otherwise.
    activeSchoolId(state): string | null {
      const auth = useAuthStore()
      if (auth.role === 'superadmin') {
        if (state.selectedSchoolId && state.schools.some((s) => s.id === state.selectedSchoolId)) {
          return state.selectedSchoolId
        }
        return state.schools[0]?.id ?? null
      }
      return auth.schoolId
    },
    activeSchool(): School | null {
      const id = this.activeSchoolId
      return id ? this.schools.find((s) => s.id === id) ?? null : null
    },
    absenteesToday(state): Array<{ student_id: string; student_name: string; class_name: string; roll: string; parent_phone: string }> {
      const sid = this.activeSchoolId
      if (!sid) return []
      const today = todayLocal()
      const sm = new Map(state.students.map((x) => [x.id, x]))
      const cm = new Map(state.classes.map((c) => [c.id, c]))
      return state.attendance
        .filter((a) => a.school_id === sid && a.date === today && a.status === 'absent')
        .map((a) => {
          const s = sm.get(a.student_id)
          return {
            student_id: a.student_id,
            student_name: s?.name ?? '—',
            class_name: cm.get(a.class_id)?.name ?? '—',
            roll: s?.roll ?? '',
            parent_phone: s?.parent_phone ?? '',
          }
        })
    },
  },

  actions: {
    /** Load every collection visible to the current user (RLS enforced). */
    async loadAll() {
      if (this.loading) return
      this.loading = true
      this.error = ''
      const supabase = useSb()
      const tables = [
        'schools', 'classes', 'teachers', 'students',
        'attendance', 'holidays', 'messages',
        'subjects', 'exams', 'marks',
      ] as const
      try {
        const results = await Promise.all(
          tables.map((t) => supabase.from(t).select('*').then((r) => ({ t, r }))),
        )
        for (const { t, r } of results) {
          if (r.error) throw new Error(`${t}: ${r.error.message}`)
          ;(this as unknown as Record<string, unknown[]>)[t] = (r.data ?? []) as unknown[]
        }
        this.loaded = true
      } catch (e) {
        this.error = (e as Error).message
      } finally {
        this.loading = false
      }
    },

    reset() { Object.assign(this, blankState()) },

    // Superadmin school switcher.
    setSelectedSchool(id: string | null) {
      this.selectedSchoolId = id
      if (import.meta.client) {
        if (id) localStorage.setItem('st:selectedSchoolId', id)
        else localStorage.removeItem('st:selectedSchoolId')
      }
    },
    hydrateSelectedSchool() {
      if (import.meta.client && !this.selectedSchoolId) {
        this.selectedSchoolId = localStorage.getItem('st:selectedSchoolId')
      }
    },

    // ── Classes ────────────────────────────────────────────────────────────
    async addClass(c: Class) {
      const supabase = useSb()
      const { error } = await supabase.from('classes').insert(c)
      if (error) throw error
      this.classes.push(c)
    },
    async updateClass(id: string, patch: Partial<Class>) {
      const supabase = useSb()
      const { error } = await supabase.from('classes').update(patch).eq('id', id)
      if (error) throw error
      const i = this.classes.findIndex((x) => x.id === id)
      if (i >= 0) this.classes[i] = { ...this.classes[i], ...patch }
    },
    async removeClass(id: string) {
      const supabase = useSb()
      const { error } = await supabase.from('classes').delete().eq('id', id)
      if (error) throw error
      this.classes = this.classes.filter((c) => c.id !== id)
    },

    // ── Schools ────────────────────────────────────────────────────────────
    async addSchool(school: Omit<School, 'created_at'>) {
      const supabase = useSb()
      const { error } = await supabase.from('schools').insert(school)
      if (error) throw error
      this.schools.push(school as School)
    },
    async updateSchool(id: string, patch: Partial<School>) {
      const supabase = useSb()
      const { error } = await supabase.from('schools').update(patch).eq('id', id)
      if (error) throw error
      const i = this.schools.findIndex((s) => s.id === id)
      if (i >= 0) this.schools[i] = { ...this.schools[i], ...patch }
    },
    async topUpCredits(school_id: string, amount: number) {
      const s = this.schools.find((x) => x.id === school_id)
      if (!s) return
      await this.updateSchool(school_id, { credits: s.credits + amount })
    },

    // ── Students ───────────────────────────────────────────────────────────
    async addStudent(student: Student) {
      const supabase = useSb()
      const { error } = await supabase.from('students').insert(student)
      if (error) throw error
      this.students.push(student)
    },
    async removeStudent(id: string) {
      const supabase = useSb()
      const { error } = await supabase.from('students').delete().eq('id', id)
      if (error) throw error
      this.students = this.students.filter((s) => s.id !== id)
    },

    // ── Teachers ───────────────────────────────────────────────────────────
    async addTeacher(teacher: Teacher) {
      const supabase = useSb()
      const { error } = await supabase.from('teachers').insert(teacher)
      if (error) throw error
      this.teachers.push(teacher)
    },

    // ── Holidays ───────────────────────────────────────────────────────────
    async addHoliday(h: Holiday) {
      const supabase = useSb()
      const { error } = await supabase.from('holidays').insert(h)
      if (error) throw error
      this.holidays.push(h)
    },
    async removeHoliday(id: string) {
      const supabase = useSb()
      const { error } = await supabase.from('holidays').delete().eq('id', id)
      if (error) throw error
      this.holidays = this.holidays.filter((h) => h.id !== id)
    },

    // ── Attendance ─────────────────────────────────────────────────────────
    async upsertAttendanceBatch(records: Attendance[]) {
      if (!records.length) return
      const supabase = useSb()
      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,date' })
      if (error) throw error
      for (const r of records) {
        const i = this.attendance.findIndex(
          (a) => a.student_id === r.student_id && a.date === r.date,
        )
        if (i >= 0) this.attendance[i] = r
        else this.attendance.push(r)
      }
    },

    // ── Messages ───────────────────────────────────────────────────────────
    async addMessages(msgs: Message[]) {
      if (!msgs.length) return
      const supabase = useSb()
      const { error } = await supabase.from('messages').insert(msgs)
      if (error) throw error
      this.messages.push(...msgs)
    },

    // ── Subjects ───────────────────────────────────────────────────────────
    async addSubject(subject: Subject) {
      const supabase = useSb()
      const { error } = await supabase.from('subjects').insert(subject)
      if (error) throw error
      this.subjects.push(subject)
    },
    async updateSubject(id: string, patch: Partial<Subject>) {
      const supabase = useSb()
      const { error } = await supabase.from('subjects').update(patch).eq('id', id)
      if (error) throw error
      const i = this.subjects.findIndex((x) => x.id === id)
      if (i >= 0) this.subjects[i] = { ...this.subjects[i], ...patch }
    },
    async removeSubject(id: string) {
      const supabase = useSb()
      const { error } = await supabase.from('subjects').delete().eq('id', id)
      if (error) throw error
      this.subjects = this.subjects.filter((x) => x.id !== id)
    },

    // ── Exams / Marks ──────────────────────────────────────────────────────
    async addExam(exam: Exam) {
      const supabase = useSb()
      const { error } = await supabase.from('exams').insert(exam)
      if (error) throw error
      this.exams.push(exam)
    },
    async updateExam(id: string, patch: Partial<Exam>) {
      const supabase = useSb()
      const { error } = await supabase.from('exams').update(patch).eq('id', id)
      if (error) throw error
      const i = this.exams.findIndex((e) => e.id === id)
      if (i >= 0) this.exams[i] = { ...this.exams[i], ...patch }
    },
    async removeExam(id: string) {
      const supabase = useSb()
      const { error } = await supabase.from('exams').delete().eq('id', id)
      if (error) throw error
      this.exams = this.exams.filter((e) => e.id !== id)
      this.marks = this.marks.filter((m) => m.exam_id !== id)
    },
    async upsertMarks(rows: Omit<Marks, 'id' | 'updated_at'>[]) {
      if (!rows.length) return
      const supabase = useSb()
      const { error, data } = await supabase
        .from('marks')
        .upsert(rows, { onConflict: 'exam_id,student_id,subject_id' })
        .select()
      if (error) throw error
      for (const r of (data ?? []) as Marks[]) {
        const i = this.marks.findIndex(
          (m) => m.exam_id === r.exam_id && m.student_id === r.student_id && m.subject_id === r.subject_id,
        )
        if (i >= 0) this.marks[i] = r
        else this.marks.push(r)
      }
    },
  },
})
