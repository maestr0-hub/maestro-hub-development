import Link from 'next/link'
import { CalendarClock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatMoney } from '@/lib/format'
import type { Tuition } from '@/lib/types'

export function TuitionCard({ tuition }: { tuition: Tuition }) {
  return (
    <Link
      href={`/tuitions/${tuition.id}`}
      className="group flex h-full flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{tuition.subject}</Badge>
          <Badge variant="outline">{tuition.class}</Badge>
        </div>
        {tuition.status === 'closed' && <Badge variant="destructive">Closed</Badge>}
      </div>
      <h3 className="text-balance font-heading text-lg font-semibold leading-snug group-hover:text-primary">
        {tuition.title}
      </h3>
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{tuition.location}</span>
        </li>
        <li className="flex items-center gap-2">
          <CalendarClock className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{tuition.schedule}</span>
        </li>
      </ul>
      <div className="mt-auto flex items-end justify-between border-t pt-4">
        <p>
          <span className="font-heading text-xl font-semibold">{formatMoney(tuition.salary)}</span>
          <span className="text-sm text-muted-foreground">{' / month'}</span>
        </p>
        <span className="text-xs text-muted-foreground">{formatDate(tuition.created_at)}</span>
      </div>
    </Link>
  )
}
