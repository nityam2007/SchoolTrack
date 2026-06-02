// Tiny dependency-free CSV helpers used for import/export across the app.

/** Parse CSV text into rows of string cells. Handles quoted fields, escaped
 *  quotes (""), commas and newlines inside quotes, and CRLF line endings. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const s = text.replace(/\r\n?/g, '\n')

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++ }
        else inQuotes = false
      } else cell += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(cell); cell = ''
    } else if (c === '\n') {
      row.push(cell); rows.push(row); row = []; cell = ''
    } else {
      cell += c
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row) }
  // Drop fully-empty trailing rows.
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/** Parse CSV into objects keyed by a normalised header (lowercased, spaces→_). */
export function parseCsvObjects(text: string): Record<string, string>[] {
  const rows = parseCsv(text)
  if (rows.length < 2) return []
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = (r[i] ?? '').trim() })
    return obj
  })
}

/** Serialise rows of objects to a CSV string. `columns` fixes the order. */
export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length && !columns) return ''
  const cols = columns ?? Object.keys(rows[0] ?? {})
  const esc = (v: unknown) => {
    const str = v == null ? '' : String(v)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const head = cols.join(',')
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n')
  return `${head}\n${body}`
}

/** Trigger a browser download of `content` as a file (client only). */
export function downloadFile(content: string, filename: string, type = 'text/csv;charset=utf-8') {
  if (!import.meta.client) return
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
