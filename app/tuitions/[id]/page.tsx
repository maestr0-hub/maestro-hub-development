import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, CalendarClock, GraduationCap, MapPin, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ApplyPanel } from '@/components/apply-panel'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatMoney } from '@/lib/format'
import type { ApplicationStatus, Tuition } from '@/lib/types'

export default async function TuitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = await createClient()
  const { data } = await supabase.from('tuitions').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  const tuition = data as Tuition

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasProfile = false
  let applicationStatus: ApplicationStatus | null = null
  if (user) {
    const { data: tutor } = await supabase
      .from('tutors')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    hasProfile = Boolean(tutor)
    if (tutor) {
      const { data: application } = await supabase
        .from('applications')
        .select('status')
        .eq('tuition_id', id)
        .eq('tutor_id', tutor.id)
        .maybeSingle()
      applicationStatus = (application?.status as ApplicationStatus) ?? null
    }
  }

  const details = [
    { icon: BookOpen, label: 'Subject', value: tuition.subject },
    { icon: GraduationCap, label: 'Class', value: tuition.class },
    { icon: MapPin, label: 'Location', value: tuition.location },
    { icon: CalendarClock, label: 'Schedule', value: tuition.schedule },
    { icon: Wallet, label: 'Salary', value: `${formatMoney(tuition.salary)} / month` },
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <Link href="/tuitions" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden />
        Back to tuitions
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <article className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={tuition.status === 'open' ? 'default' : 'destructive'}>
                {tuition.status === 'open' ? 'Open' : 'Closed'}
              </Badge>
              <span className="text-sm text-muted-foreground">Posted {formatDate(tuition.created_at)}</span>
            </div>
            <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              {tuition.title}
            </h1>
          </div>
          <dl className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <d.icon className="size-4" aria-hidden />
                </span>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{d.label}</dt>
                  <dd className="font-medium">{d.value}</dd>
                </div>
              </div>
            ))}
          </dl>
          {tuition.description && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">Details</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{tuition.description}</p>
            </section>
          )}
        </article>
        <aside>
          <ApplyPanel
            tuitionId={tuition.id}
            isOpen={tuition.status === 'open'}
            isLoggedIn={Boolean(user)}
            hasProfile={hasProfile}
            applicationStatus={applicationStatus}
          />
        </aside>
      </div>
    </div>
  )
}
