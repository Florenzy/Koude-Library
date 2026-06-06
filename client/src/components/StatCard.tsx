import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  value: string | number
  note: string
  icon: LucideIcon
}

export function StatCard({ label, value, note, icon: Icon }: Props) {
  return (
    <article className="stat-card">
      <div className="stat-card-top"><span>{label}</span><Icon size={15} /></div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}
