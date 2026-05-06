// Date helpers. We use the *local* date for "today" so that attendance
// recorded around midnight in IST does not bleed into the previous UTC day.
// `Date.toISOString().slice(0,10)` would do the wrong thing in IST after 18:30.

export const todayLocal = (d = new Date()): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
