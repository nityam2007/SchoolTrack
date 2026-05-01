import { defineStore } from 'pinia'
import type { Db, School, Class, Teacher, Student, Attendance, Holiday, Message } from '~/types/database'

const SEED: Db = {
  schools: [
    { id: 'SCH001', name: 'Greenwood Academy', city: 'Mumbai', credits: 420, students: 312, active: true, adminEmail: 'principal@greenwood.edu', adminPass: 'school123' },
    { id: 'SCH002', name: 'Sunrise Public School', city: 'Delhi', credits: 88, students: 198, active: true, adminEmail: 'principal@sunrise.edu', adminPass: 'sunrise123' },
    { id: 'SCH003', name: 'Blue Ridge International', city: 'Bangalore', credits: 650, students: 445, active: true, adminEmail: 'principal@blueridge.edu', adminPass: 'blueridge123' },
  ],
  classes: [
    { id: 'CLS001', schoolId: 'SCH001', name: 'Grade 5A', section: 'A', grade: 5 },
    { id: 'CLS002', schoolId: 'SCH001', name: 'Grade 5B', section: 'B', grade: 5 },
    { id: 'CLS003', schoolId: 'SCH001', name: 'Grade 6A', section: 'A', grade: 6 },
  ],
  teachers: [
    { id: 'T001', schoolId: 'SCH001', name: 'Ms. Priya Sharma', email: 'priya@greenwood.edu', pass: 'teacher123', classId: 'CLS001', phone: '+919876543210' },
    { id: 'T002', schoolId: 'SCH001', name: 'Mr. Rahul Mehta', email: 'rahul@greenwood.edu', pass: 'rahul123', classId: 'CLS002', phone: '+919876543211' },
    { id: 'T003', schoolId: 'SCH001', name: 'Ms. Anita Roy', email: 'anita@greenwood.edu', pass: 'anita123', classId: 'CLS003', phone: '+919876543212' },
  ],
  students: [
    { id: 'S001', schoolId: 'SCH001', classId: 'CLS001', name: 'Aarav Patel', roll: '01', parentPhone: '+919800001111' },
    { id: 'S002', schoolId: 'SCH001', classId: 'CLS001', name: 'Diya Singh', roll: '02', parentPhone: '+919800001112' },
    { id: 'S003', schoolId: 'SCH001', classId: 'CLS001', name: 'Kabir Sharma', roll: '03', parentPhone: '+919800001113' },
    { id: 'S004', schoolId: 'SCH001', classId: 'CLS001', name: 'Meera Joshi', roll: '04', parentPhone: '+919800001114' },
    { id: 'S005', schoolId: 'SCH001', classId: 'CLS001', name: 'Rohan Gupta', roll: '05', parentPhone: '+919800001115' },
    { id: 'S006', schoolId: 'SCH001', classId: 'CLS001', name: 'Sia Kumar', roll: '06', parentPhone: '+919800001116' },
    { id: 'S007', schoolId: 'SCH001', classId: 'CLS002', name: 'Aditya Nair', roll: '01', parentPhone: '+919800002221' },
    { id: 'S008', schoolId: 'SCH001', classId: 'CLS002', name: 'Pooja Iyer', roll: '02', parentPhone: '+919800002222' },
    { id: 'S009', schoolId: 'SCH001', classId: 'CLS002', name: 'Vikram Das', roll: '03', parentPhone: '+919800002223' },
    { id: 'S010', schoolId: 'SCH001', classId: 'CLS003', name: 'Nisha Verma', roll: '01', parentPhone: '+919800003331' },
    { id: 'S011', schoolId: 'SCH001', classId: 'CLS003', name: 'Arjun Bose', roll: '02', parentPhone: '+919800003332' },
  ],
  attendance: [
    { id: 'A001', schoolId: 'SCH001', classId: 'CLS001', studentId: 'S001', date: '2026-03-04', status: 'present', teacherId: 'T001', photo: true },
    { id: 'A002', schoolId: 'SCH001', classId: 'CLS001', studentId: 'S002', date: '2026-03-04', status: 'absent', teacherId: 'T001', photo: true },
    { id: 'A003', schoolId: 'SCH001', classId: 'CLS001', studentId: 'S003', date: '2026-03-04', status: 'present', teacherId: 'T001', photo: true },
    { id: 'A004', schoolId: 'SCH001', classId: 'CLS001', studentId: 'S004', date: '2026-03-04', status: 'present', teacherId: 'T001', photo: true },
    { id: 'A005', schoolId: 'SCH001', classId: 'CLS001', studentId: 'S005', date: '2026-03-04', status: 'absent', teacherId: 'T001', photo: true },
    { id: 'A006', schoolId: 'SCH001', classId: 'CLS001', studentId: 'S006', date: '2026-03-04', status: 'present', teacherId: 'T001', photo: true },
  ],
  holidays: [
    { id: 'H001', schoolId: 'SCH001', date: '2026-03-25', title: 'Holi' },
    { id: 'H002', schoolId: 'SCH001', date: '2026-04-14', title: 'Dr. Ambedkar Jayanti' },
  ],
  messages: [
    { id: 'M001', schoolId: 'SCH001', studentName: 'Diya Singh', parentPhone: '+919800001112', date: '2026-03-04 09:15', status: 'delivered' },
    { id: 'M002', schoolId: 'SCH001', studentName: 'Rohan Gupta', parentPhone: '+919800001115', date: '2026-03-04 09:16', status: 'delivered' },
  ],
}

export const useDbStore = defineStore('db', {
  state: (): Db => ({ ...SEED }),

  getters: {
    schoolsForUser: (state) => (schoolId: string | null) =>
      schoolId ? state.schools.filter((s) => s.id === schoolId) : state.schools,
    classesForSchool: (state) => (schoolId: string) =>
      state.classes.filter((c) => c.schoolId === schoolId),
    teachersForSchool: (state) => (schoolId: string) =>
      state.teachers.filter((t) => t.schoolId === schoolId),
    studentsForSchool: (state) => (schoolId: string) =>
      state.students.filter((s) => s.schoolId === schoolId),
    studentsForClass: (state) => (classId: string) =>
      state.students.filter((s) => s.classId === classId),
    attendanceForSchool: (state) => (schoolId: string) =>
      state.attendance.filter((a) => a.schoolId === schoolId),
    holidaysForSchool: (state) => (schoolId: string) =>
      state.holidays.filter((h) => h.schoolId === schoolId),
    messagesForSchool: (state) => (schoolId: string) =>
      state.messages.filter((m) => m.schoolId === schoolId),
  },

  actions: {
    addSchool(school: School) {
      this.schools.push(school)
    },
    updateSchool(id: string, patch: Partial<School>) {
      const i = this.schools.findIndex((s) => s.id === id)
      if (i >= 0) this.schools[i] = { ...this.schools[i], ...patch }
    },
    addStudent(student: Student) {
      this.students.push(student)
    },
    removeStudent(id: string) {
      this.students = this.students.filter((s) => s.id !== id)
    },
    addTeacher(teacher: Teacher) {
      this.teachers.push(teacher)
    },
    addClass(c: Class) {
      this.classes.push(c)
    },
    addHoliday(h: Holiday) {
      this.holidays.push(h)
    },
    removeHoliday(id: string) {
      this.holidays = this.holidays.filter((h) => h.id !== id)
    },
    upsertAttendance(record: Attendance) {
      const i = this.attendance.findIndex(
        (a) => a.studentId === record.studentId && a.date === record.date,
      )
      if (i >= 0) this.attendance[i] = record
      else this.attendance.push(record)
    },
    addMessage(m: Message) {
      this.messages.push(m)
    },
    deductCredits(schoolId: string, amount: number) {
      const s = this.schools.find((x) => x.id === schoolId)
      if (s) s.credits = Math.max(0, s.credits - amount)
    },
    topUpCredits(schoolId: string, amount: number) {
      const s = this.schools.find((x) => x.id === schoolId)
      if (s) s.credits += amount
    },
  },
})
