// Trigger the browser print dialog (→ "Save as PDF"). Client-only.
export const printPage = () => {
  if (import.meta.client) window.print()
}
