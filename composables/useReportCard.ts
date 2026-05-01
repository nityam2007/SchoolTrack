import { getGrade, type ReportStats, type SubjectMarkRow } from './useGrade'
import type { Marks, Subject } from '~/types/database'

export const calcReportStats = (
  subjects: Subject[],
  marks: Marks[],
): ReportStats => {
  const rows: SubjectMarkRow[] = subjects.map((sub) => {
    const m = marks.find((x) => x.subject_id === sub.id)
    const theory = m?.theory ?? 0
    const practical = m?.practical ?? 0
    const obtained = theory + practical
    const max = sub.theory_max + sub.practical_max
    const pct = max ? Math.round((obtained / max) * 100) : 0
    const g = getGrade(pct)
    return {
      subject_id: sub.id,
      subject_name: sub.name,
      theory,
      practical,
      obtained,
      max,
      pct,
      grade: g.grade,
      gp: g.gp,
      color: g.color,
      passed: obtained >= sub.passing_marks,
    }
  })
  const total_obtained = rows.reduce((a, r) => a + r.obtained, 0)
  const total_max = rows.reduce((a, r) => a + r.max, 0)
  const overall_pct = total_max ? Math.round((total_obtained / total_max) * 100) : 0
  const overall = getGrade(overall_pct)
  const cgpa = (rows.reduce((a, r) => a + r.gp, 0) / Math.max(rows.length, 1)).toFixed(1)
  return {
    rows,
    total_obtained,
    total_max,
    overall_pct,
    overall_grade: overall.grade,
    cgpa,
    passed: rows.length > 0 && rows.every((r) => r.passed),
  }
}
