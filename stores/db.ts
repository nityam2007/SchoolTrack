import { defineStore } from 'pinia'
import type {
  Attendance, AttendancePhoto, AuditLog, Class, CreditRequest, CreditTxn, Exam, Holiday, Marks,
  Message, School, StaffMessage, Student, Subject, Teacher,
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
  creditTxns: CreditTxn[]      // ledger for the school currently being viewed
  creditRequests: CreditRequest[]
  staffMessages: StaffMessage[]
  auditLogs: AuditLog[]        // loaded on demand for the Logs page
  attendancePhotos: AttendancePhoto[]
  loaded: boolean          // phase-1 (core) tables ready — UI can paint
  loading: boolean
  activityLoaded: boolean  // phase-2 (attendance, messages) ready
  activityLoading: boolean
  marksLoaded: boolean     // marks lazily loaded (report cards only)
  marksLoading: boolean
  error: string
  // Superadmin-only: which school is being viewed via principal-scoped pages.
  // Persisted to localStorage so it survives reloads.
  selectedSchoolId: string | null
}

const blankState = (): DbState => ({
  schools: [], classes: [], teachers: [], students: [],
  attendance: [], holidays: [], messages: [],
  subjects: [], exams: [], marks: [], creditTxns: [],
  creditRequests: [], staffMessages: [], auditLogs: [], attendancePhotos: [],
  loaded: false, loading: false,
  activityLoaded: false, activityLoading: false,
  marksLoaded: false, marksLoading: false,
  error: '',
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
    // Internal: fetch a set of tables in parallel and assign onto state.
    async _fetchTables(tables: readonly string[]) {
      const supabase = useSb()
      const results = await Promise.all(
        tables.map((t) => supabase.from(t).select('*').then((r) => ({ t, r }))),
      )
      for (const { t, r } of results) {
        if (r.error) throw new Error(`${t}: ${r.error.message}`)
        ;(this as unknown as Record<string, unknown[]>)[t] = (r.data ?? []) as unknown[]
      }
    },

    /**
     * Hydrate the store for the signed-in user (RLS enforced).
     *
     * Two phases so first paint is fast:
     *  1. Core tables (bounded by school structure) — awaited; flips `loaded`
     *     so the shell + dashboards can render immediately.
     *  2. Activity tables (attendance, messages — grow daily) — loaded in the
     *     background via `loadActivity()`; pages read them reactively.
     *
     * `marks` (the largest table, used only by report cards) is NOT loaded here
     * — it is fetched on demand by `ensureMarks()`.
     */
    async loadAll() {
      if (this.loading || this.loaded) return
      this.loading = true
      this.error = ''
      try {
        await this._fetchTables([
          'schools', 'classes', 'teachers', 'students',
          'subjects', 'exams', 'holidays',
        ])
        this.loaded = true
      } catch (e) {
        this.error = (e as Error).message
      } finally {
        this.loading = false
      }
      // Kick off the background phase without blocking first paint.
      if (this.loaded) this.loadActivity()
    },

    /** Phase 2 — daily-growth tables, loaded in the background. Non-fatal. */
    async loadActivity() {
      if (this.activityLoading || this.activityLoaded) return
      this.activityLoading = true
      try {
        await this._fetchTables(['attendance', 'messages'])
        this.activityLoaded = true
      } catch (e) {
        if (!this.error) this.error = (e as Error).message
      } finally {
        this.activityLoading = false
      }
    },

    /** Lazily load `marks` the first time a report-card / exam view needs it. */
    async ensureMarks() {
      if (this.marksLoaded || this.marksLoading) return
      this.marksLoading = true
      try {
        await this._fetchTables(['marks'])
        this.marksLoaded = true
      } catch (e) {
        if (!this.error) this.error = (e as Error).message
      } finally {
        this.marksLoading = false
      }
    },

    /** Force a full re-fetch (e.g. the "Reload data" menu action). */
    async reload() {
      const hadMarks = this.marksLoaded
      this.loaded = false
      this.activityLoaded = false
      this.marksLoaded = false
      await this.loadAll()
      if (hadMarks) await this.ensureMarks()
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
    async topUpCredits(school_id: string, amount: number, note = '') {
      const s = this.schools.find((x) => x.id === school_id)
      if (!s || amount <= 0) return
      const balanceAfter = s.credits + amount
      await this.updateSchool(school_id, { credits: balanceAfter })
      await this.logCreditTxn(school_id, 'recharge', amount, balanceAfter, note)
    },

    /** Remove credits (super-admin correction). Clamps the balance at zero. */
    async removeCredits(school_id: string, amount: number, note = '') {
      const s = this.schools.find((x) => x.id === school_id)
      if (!s || amount <= 0) return
      const delta = Math.min(amount, s.credits)
      const balanceAfter = s.credits - delta
      await this.updateSchool(school_id, { credits: balanceAfter })
      await this.logCreditTxn(school_id, 'adjustment', -delta, balanceAfter, note)
    },

    /** Append a ledger row. Best-effort: ignored if the table isn't present. */
    async logCreditTxn(
      school_id: string,
      kind: CreditTxn['kind'],
      amount: number,
      balance_after: number,
      note = '',
    ) {
      const supabase = useSb()
      const auth = useAuthStore()
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert({ school_id, kind, amount, balance_after, note, actor_email: auth.user?.email ?? '' })
        .select()
      if (error) return // ledger table may not be migrated yet — non-fatal
      const row = (data?.[0] ?? null) as CreditTxn | null
      if (row && this.creditTxns[0]?.school_id === school_id) this.creditTxns.unshift(row)
    },

    /** Load the credit ledger for one school (recharge + deduction history). */
    async loadCreditTxns(school_id: string) {
      const supabase = useSb()
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('school_id', school_id)
        .order('created_at', { ascending: false })
      this.creditTxns = error ? [] : ((data ?? []) as CreditTxn[])
    },

    // ── Credit requests (principal asks; superadmin approves) ───────────────
    async loadCreditRequests() {
      const supabase = useSb()
      const { data, error } = await supabase
        .from('credit_requests').select('*').order('created_at', { ascending: false })
      this.creditRequests = error ? [] : ((data ?? []) as CreditRequest[])
    },
    async addCreditRequest(school_id: string, amount: number, note = '') {
      const supabase = useSb()
      const auth = useAuthStore()
      const { data, error } = await supabase.from('credit_requests')
        .insert({ school_id, amount, note, requested_by: auth.user?.email ?? '' }).select()
      if (error) throw error
      const row = data?.[0] as CreditRequest | undefined
      if (row) this.creditRequests.unshift(row)
    },
    async resolveCreditRequest(id: string, approve: boolean) {
      const supabase = useSb()
      const auth = useAuthStore()
      const req = this.creditRequests.find((r) => r.id === id)
      if (!req) return
      const status: CreditRequest['status'] = approve ? 'approved' : 'rejected'
      const { error } = await supabase.from('credit_requests')
        .update({ status, resolved_by: auth.user?.email ?? '', resolved_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      if (approve) await this.topUpCredits(req.school_id, req.amount, `Approved request · ${req.requested_by}`)
      req.status = status
    },

    // ── Staff messages (principal → teachers) ───────────────────────────────
    async loadStaffMessages() {
      const supabase = useSb()
      const { data, error } = await supabase
        .from('staff_messages').select('*').order('created_at', { ascending: false })
      this.staffMessages = error ? [] : ((data ?? []) as StaffMessage[])
    },
    async addStaffMessage(msg: { school_id: string; to_teacher_id: string | null; subject: string; body: string }) {
      const supabase = useSb()
      const auth = useAuthStore()
      const { data, error } = await supabase.from('staff_messages')
        .insert({ ...msg, from_email: auth.user?.email ?? '' }).select()
      if (error) throw error
      const row = data?.[0] as StaffMessage | undefined
      if (row) this.staffMessages.unshift(row)
    },

    // ── Audit logs (Logs page) ──────────────────────────────────────────────
    async loadAuditLogs(limit = 1000) {
      const supabase = useSb()
      const { data, error } = await supabase
        .from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit)
      this.auditLogs = error ? [] : ((data ?? []) as AuditLog[])
    },

    // ── Attendance classroom photos (private bucket) ────────────────────────
    async addAttendancePhoto(row: Omit<AttendancePhoto, 'id' | 'created_at'>) {
      const supabase = useSb()
      const { data, error } = await supabase
        .from('attendance_photos').upsert({ ...row }, { onConflict: 'class_id,date' }).select()
      if (error) return // table may not be migrated yet — non-fatal
      const r = data?.[0] as AttendancePhoto | undefined
      if (r) {
        const i = this.attendancePhotos.findIndex((p) => p.class_id === r.class_id && p.date === r.date)
        if (i >= 0) this.attendancePhotos[i] = r
        else this.attendancePhotos.unshift(r)
      }
    },
    async loadAttendancePhotos(school_id: string) {
      const supabase = useSb()
      const { data, error } = await supabase
        .from('attendance_photos').select('*').eq('school_id', school_id)
        .order('date', { ascending: false }).limit(200)
      this.attendancePhotos = error ? [] : ((data ?? []) as AttendancePhoto[])
    },

    // ── Student promotion (class upgrade, keeps old class as history) ───────
    async promoteStudents(ids: string[], targetClassId: string) {
      if (!ids.length) return
      const supabase = useSb()
      for (const id of ids) {
        const s = this.students.find((x) => x.id === id)
        if (!s) continue
        const { error } = await supabase.from('students')
          .update({ previous_class_id: s.class_id, class_id: targetClassId }).eq('id', id)
        if (error) throw error
        s.previous_class_id = s.class_id
        s.class_id = targetClassId
      }
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
    /** Bulk insert (CSV import). Returns the inserted rows. */
    async addStudents(students: Student[]) {
      if (!students.length) return
      const supabase = useSb()
      const { error } = await supabase.from('students').insert(students)
      if (error) throw error
      this.students.push(...students)
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
