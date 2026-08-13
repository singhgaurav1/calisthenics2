export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = Math.round(total % 60)
  if (m === 0) return `${s}s`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Night owl mode'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

/** Last 7 days as ISO dates, oldest first. */
export function lastNDays(n: number): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return out
}
