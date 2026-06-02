// Report-card template selection, persisted per browser.
export const REPORT_TEMPLATES = [
  { id: 'classic', label: 'Classic Blue' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'slate', label: 'Minimal Slate' },
] as const

export type ReportTemplateId = (typeof REPORT_TEMPLATES)[number]['id']

export const useReportTemplate = () => {
  const template = useState<ReportTemplateId>('reportTemplate', () => 'classic')
  onMounted(() => {
    const v = localStorage.getItem('st:reportTemplate') as ReportTemplateId | null
    if (v && REPORT_TEMPLATES.some((t) => t.id === v)) template.value = v
  })
  const setTemplate = (id: ReportTemplateId) => {
    template.value = id
    if (import.meta.client) localStorage.setItem('st:reportTemplate', id)
  }
  return { template, setTemplate }
}
