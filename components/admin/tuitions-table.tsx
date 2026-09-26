import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { setTuitionStatus } from '@/app/actions/admin'
import { formatDate, formatMoney } from '@/lib/format'
import type { Tuition } from '@/lib/types'

export function TuitionsTable({ tuitions }: { tuitions: (Tuition & { applications: { count: number }[] })[] }) {
  if (tuitions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        No tuitions yet. Publish a guardian request to create one.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b text-left text-muted-foreground">
          <tr>
            <th scope="col" className="p-3 font-medium">Title</th>
            <th scope="col" className="p-3 font-medium">Subject / Class</th>
            <th scope="col" className="p-3 font-medium">Salary</th>
            <th scope="col" className="p-3 font-medium">Applicants</th>
            <th scope="col" className="p-3 font-medium">Posted</th>
            <th scope="col" className="p-3 font-medium">Status</th>
            <th scope="col" className="p-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tuitions.map((t) => (
            <tr key={t.id}>
              <td className="max-w-64 p-3">
                <Link href={`/tuitions/${t.id}`} className="line-clamp-2 font-medium hover:text-primary">{t.title}</Link>
                <span className="text-xs text-muted-foreground">{t.location}</span>
              </td>
              <td className="p-3 whitespace-nowrap">{`${t.subject} · ${t.class}`}</td>
              <td className="p-3 whitespace-nowrap">{formatMoney(t.salary)}</td>
              <td className="p-3">
                <Link href="/admin?tab=applications" className="hover:text-primary">{t.applications?.[0]?.count ?? 0}</Link>
              </td>
              <td className="p-3 whitespace-nowrap text-muted-foreground">{formatDate(t.created_at)}</td>
              <td className="p-3"><StatusBadge status={t.status} /></td>
              <td className="p-3 text-right">
                <form action={setTuitionStatus}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="status" value={t.status === 'open' ? 'closed' : 'open'} />
                  <Button type="submit" size="sm" variant="outline">
                    {t.status === 'open' ? 'Close' : 'Reopen'}
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
