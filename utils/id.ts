// Time-based ID with a short alpha prefix. Sufficient for client-generated rows
// (collisions are vanishingly unlikely at single-user write rates).
export const makeId = (prefix: string, suffix?: string): string => {
  const base = `${prefix}${Date.now().toString(36).toUpperCase()}`
  return suffix ? `${base}-${suffix}` : base
}
