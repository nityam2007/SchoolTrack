export const useTeacherDetail = () => {
  const route = useRoute()
  const db = useDbStore()
  const id = computed(() => route.params.id as string)
  const teacher = computed(() => db.teachers.find((t) => t.id === id.value) ?? null)
  const cls = computed(() => teacher.value?.class_id ? db.classMap.get(teacher.value.class_id) ?? null : null)
  const roster = computed(() => cls.value ? db.studentsForClass(cls.value.id) : [])

  const today = todayLocal()
  const todayAttendance = computed(() => {
    if (!cls.value) return null
    const all = db.attendance.filter((a) => a.class_id === cls.value!.id && a.date === today)
    if (!all.length) return null
    const present = all.filter((a) => a.status === 'present').length
    return { present, absent: all.length - present, total: all.length }
  })

  const last30 = computed(() => {
    if (!cls.value) return { rate: 0, total: 0 }
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const all = db.attendance.filter((a) =>
      a.class_id === cls.value!.id && new Date(a.date) >= cutoff,
    )
    if (!all.length) return { rate: 0, total: 0 }
    const present = all.filter((a) => a.status === 'present').length
    return { rate: Math.round((present / all.length) * 100), total: all.length }
  })

  const otherClasses = computed(() => teacher.value
    ? db.classesForSchool(teacher.value.school_id).filter((c) => c.id !== teacher.value!.class_id)
    : [])

  return { id, teacher, cls, roster, todayAttendance, last30, otherClasses }
}
