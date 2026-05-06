export const useSchoolDetail = () => {
  const route = useRoute()
  const db = useDbStore()
  const id = computed(() => route.params.id as string)
  const school = computed(() => db.schools.find((s) => s.id === id.value) ?? null)
  const classes  = computed(() => db.classesForSchool(id.value))
  const teachers = computed(() => db.teachersForSchool(id.value))
  const students = computed(() => db.studentsForSchool(id.value))
  const messages = computed(() => db.messagesForSchool(id.value))
  const attendance = computed(() => db.attendanceForSchool(id.value))

  const presentRate = computed(() => {
    const att = attendance.value
    if (!att.length) return 0
    return Math.round((att.filter((a) => a.status === 'present').length / att.length) * 100)
  })

  const absentees7d = computed(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return attendance.value.filter((a) => a.status === 'absent' && new Date(a.date) >= cutoff).length
  })

  return { id, school, classes, teachers, students, messages, attendance, presentRate, absentees7d }
}
