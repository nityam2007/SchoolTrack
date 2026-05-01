// Grading scale (CBSE-style 0-100 → letter+grade-points).
// Used by report card view, marks entry, and grade distribution.

export interface GradeInfo {
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  gp: number
  color: string
}

export const getGrade = (pct: number): GradeInfo => {
  if (pct >= 90) return { grade: 'A+', gp: 10, color: '#10B981' }
  if (pct >= 80) return { grade: 'A',  gp: 9,  color: '#10B981' }
  if (pct >= 70) return { grade: 'B+', gp: 8,  color: '#3B82F6' }
  if (pct >= 60) return { grade: 'B',  gp: 7,  color: '#3B82F6' }
  if (pct >= 50) return { grade: 'C+', gp: 6,  color: '#F59E0B' }
  if (pct >= 40) return { grade: 'C',  gp: 5,  color: '#F59E0B' }
  if (pct >= 33) return { grade: 'D',  gp: 4,  color: '#F97316' }
  return { grade: 'F', gp: 0, color: '#EF4444' }
}

export interface SubjectMarkRow {
  subject_id: string
  subject_name: string
  theory: number
  practical: number
  obtained: number
  max: number
  pct: number
  grade: GradeInfo['grade']
  gp: number
  color: string
  passed: boolean
}

export interface ReportStats {
  rows: SubjectMarkRow[]
  total_obtained: number
  total_max: number
  overall_pct: number
  overall_grade: GradeInfo['grade']
  cgpa: string
  passed: boolean
}
