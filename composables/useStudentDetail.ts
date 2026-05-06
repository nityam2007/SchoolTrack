export const useStudentDetail = () => {
  const route = useRoute()
  const db = useDbStore()
  const id = computed(() => route.params.id as string)
  const student = computed(() => db.students.find((s) => s.id === id.value) ?? null)
  const cls = computed(() => student.value ? db.classMap.get(student.value.class_id) ?? null : null)

  const attendance = computed(() => {
    if (!student.value) return []
    return db.attendance
      .filter((a) => a.student_id === student.value!.id)
      .sort((a, b) => b.date.localeCompare(a.date))
  })

  const stats = computed(() => {
    const all = attendance.value
    const present = all.filter((a) => a.status === 'present').length
    const absent = all.filter((a) => a.status === 'absent').length
    const total = all.length
    return { present, absent, total, rate: total ? Math.round((present / total) * 100) : 0 }
  })

  const last30 = computed(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    return attendance.value.filter((a) => new Date(a.date) >= cutoff)
  })

  const examRows = computed(() => {
    if (!student.value) return []
    const subjects = db.subjectsForSchool(student.value.school_id)
    return db.examsForClass(student.value.class_id).map((ex) => {
      const marks = db.marksForExamStudent(ex.id, student.value!.id)
      const s = marks.length ? calcReportStats(subjects, marks) : null
      return { exam: ex, stats: s }
    })
  })

  return { id, student, cls, attendance, stats, last30, examRows }
}
