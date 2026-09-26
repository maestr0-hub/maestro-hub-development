import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { withdrawApplication } from '@/app/actions/tutor'
import { formatDate, formatMoney } from '@/lib/format'
import type { ApplicationStatus, Tuition } from '@/lib/types'

export type TutorApplication = {
  id: string
  status: ApplicationStatus
  cover_note: string | null
  applied_at: string
  tuition: Pick<Tuition, 'id' | 'title' | 'subject' | 'class' | 'location' | 'salary' | 'status'> | null
}

export function ApplicationsList({ applications }: { applications: TutorApplication[] }) {
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground">You have not applied to any tuitions yet.</p>
        <Link href="/tuitions" className={buttonVariants()}>
          Browse tuitions
        </Link>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {applications.map((app) => (
        <li key={app.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            {app.tuition ? (
              <Link href={`/tuitions/${app.tuition.id}`} className="truncate font-medium hover:text-primary">
                {app.tuition.title}
              </Link>
            ) : (
              <span className="font-medium text-muted-foreground">Tuition removed</span>
            )}
            <p className="text-sm text-muted-foreground">
              {app.tuition
                ? `${app.tuition.subject} · ${app.tuition.class} · ${app.tuition.location} · ${formatMoney(app.tuition.salary)}`
                : ''}
            </p>
            <p className="text-xs text-muted-foreground">Applied {formatDate(app.applied_at)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {app.tuition?.status === 'closed' && <Badge variant="outline">Post closed</Badge>}
            <StatusBadge status={app.status} />
            {app.status === 'pending' && (
              <form action={withdrawApplication}>
                <input type="hidden" name="id" value={app.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Withdraw
                </Button>
              </form>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
