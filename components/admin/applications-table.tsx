import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { setApplicationStatus } from '@/app/actions/admin'
import { formatDate } from '@/lib/format'
import type { ApplicationStatus, Tutor } from '@/lib/types'

export type AdminApplication = {
  id: string
  status: ApplicationStatus
  cover_note: string | null
  applied_at: string
  tuition: { id: string; title: string } | null
  tutor: Pick<Tutor, 'name' | 'email' | 'phone' | 'subjects' | 'qualifications' | 'experience'> | null
}

function StatusButton({ id, status, label, variant }: { id: string; status: ApplicationStatus; label: string; variant: 'default' | 'outline' | 'destructive' }) {
  return (
    <form action={setApplicationStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>{label}</Button>
    </form>
  )
}

export function ApplicationsTable({ applications }: { applications: AdminApplication[] }) {
  if (applications.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        No applications yet. They appear here in real time as tutors apply.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {applications.map((a) => (
        <li key={a.id} className="flex flex-col gap-4 rounded-xl border bg-card p-5 md:flex-row md:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{a.tutor?.name ?? 'Unknown tutor'}</span>
              <StatusBadge status={a.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {'Applied to '}
              {a.tuition ? (
                <Link href={`/tuitions/${a.tuition.id}`} className="text-foreground underline underline-offset-4">
                  {a.tuition.title}
                </Link>
              ) : (
                'a removed tuition'
              )}
              {` on ${formatDate(a.applied_at)}`}
            </p>
            {a.tutor && (
              <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                <div><dt className="inline text-muted-foreground">{'Email: '}</dt><dd className="inline break-all">{a.tutor.email}</dd></div>
                <div><dt className="inline text-muted-foreground">{'Phone: '}</dt><dd className="inline">{a.tutor.phone ?? '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="inline text-muted-foreground">{'Subjects: '}</dt><dd className="inline">{a.tutor.subjects.join(', ') || '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="inline text-muted-foreground">{'Qualifications: '}</dt><dd className="inline">{a.tutor.qualifications ?? '—'}</dd></div>
                {a.tutor.experience && (
                  <div className="sm:col-span-2"><dt className="inline text-muted-foreground">{'Experience: '}</dt><dd className="inline">{a.tutor.experience}</dd></div>
                )}
              </dl>
            )}
            {a.cover_note && (
              <blockquote className="border-l-2 border-accent pl-3 text-sm italic text-muted-foreground">{a.cover_note}</blockquote>
            )}
          </div>
          <div className="flex shrink-0 gap-2 md:flex-col">
            {a.status !== 'accepted' && <StatusButton id={a.id} status="accepted" label="Accept" variant="default" />}
            {a.status !== 'rejected' && <StatusButton id={a.id} status="rejected" label="Reject" variant="destructive" />}
            {a.status !== 'pending' && <StatusButton id={a.id} status="pending" label="Reset" variant="outline" />}
          </div>
        </li>
      ))}
    </ul>
  )
}
