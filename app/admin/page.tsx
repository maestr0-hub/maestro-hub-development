import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { RealtimeRefresh } from '@/components/realtime-refresh'
import { RequestEditor } from '@/components/admin/request-editor'
import { TuitionsTable } from '@/components/admin/tuitions-table'
import { ApplicationsTable, type AdminApplication } from '@/components/admin/applications-table'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { GuardianRequest, Tuition } from '@/lib/types'

export const metadata: Metadata = { title: 'Admin', robots: { index: false } }

const TABS = [
  { key: 'requests', label: 'Guardian requests' },
  { key: 'tuitions', label: 'Tuitions' },
  { key: 'applications', label: 'Applications' },
] as const
type TabKey = (typeof TABS)[number]['key']

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { supabase } = await requireAdmin()
  const { tab: rawTab } = await searchParams
  const tab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'requests'

  const [requestsRes, tuitionsRes, applicationsRes] = await Promise.all([
    supabase.from('guardian_requests').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('tuitions').select('*, applications(count)').order('created_at', { ascending: false }).limit(200),
    supabase
      .from('applications')
      .select('id, status, cover_note, applied_at, tuition:tuitions(id, title), tutor:tutors(name, email, phone, subjects, qualifications, experience)')
      .order('applied_at', { ascending: false })
      .limit(300),
  ])

  const requests = (requestsRes.data ?? []) as GuardianRequest[]
  const tuitions = (tuitionsRes.data ?? []) as (Tuition & { applications: { count: number }[] })[]
  const applications = (applicationsRes.data ?? []) as unknown as AdminApplication[]
  const pending = requests.filter((r) => r.status === 'pending')
  const handled = requests.filter((r) => r.status !== 'pending')

  const stats = [
    { label: 'Pending requests', value: pending.length },
    { label: 'Open tuitions', value: tuitions.filter((t) => t.status === 'open').length },
    { label: 'Pending applications', value: applications.filter((a) => a.status === 'pending').length },
  ]

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <RealtimeRefresh tables={['guardian_requests', 'tuitions', 'applications']} channel="admin-panel" />
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Admin panel</h1>
        <p className="text-muted-foreground">Review requests, publish tuitions and manage applications. Updates live.</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="font-heading text-3xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin?tab=${t.key}`}
            aria-current={tab === t.key ? 'page' : undefined}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === 'requests' && (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4" aria-labelledby="pending-heading">
            <h2 id="pending-heading" className="text-lg font-semibold">Pending review ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                No pending requests. New guardian submissions appear here instantly.
              </p>
            ) : (
              pending.map((r) => <RequestEditor key={r.id} request={r} />)
            )}
          </section>
          {handled.length > 0 && (
            <section className="flex flex-col gap-4" aria-labelledby="handled-heading">
              <h2 id="handled-heading" className="text-lg font-semibold">Recently handled</h2>
              <ul className="divide-y rounded-xl border bg-card">
                {handled.slice(0, 20).map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <span>
                      <span className="font-medium">{r.guardian_name}</span>
                      <span className="text-muted-foreground">
                        {` · ${r.subject} · ${r.student_class} · ${r.location} · ${formatMoney(r.budget)}`}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-muted-foreground">{formatDate(r.created_at)}</span>
                      <StatusBadge status={r.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {tab === 'tuitions' && <TuitionsTable tuitions={tuitions} />}
      {tab === 'applications' && <ApplicationsTable applications={applications} />}
    </div>
  )
}
