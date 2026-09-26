import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/dashboard/profile-form'
import { ApplicationsList, type TutorApplication } from '@/components/dashboard/applications-list'
import { RealtimeRefresh } from '@/components/realtime-refresh'
import { createClient } from '@/lib/supabase/server'
import type { Tutor } from '@/lib/types'

export const metadata: Metadata = { title: 'Tutor dashboard', robots: { index: false } }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/dashboard')

  const { data: tutorData } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  const tutor = tutorData as Tutor | null

  let applications: TutorApplication[] = []
  if (tutor) {
    const { data } = await supabase
      .from('applications')
      .select('id, status, cover_note, applied_at, tuition:tuitions(id, title, subject, class, location, salary, status)')
      .eq('tutor_id', tutor.id)
      .order('applied_at', { ascending: false })
    applications = (data ?? []) as unknown as TutorApplication[]
  }

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <RealtimeRefresh tables={['applications']} channel="tutor-dashboard" />
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {tutor ? `Welcome, ${tutor.name.split(' ')[0]}` : 'Complete your profile'}
        </h1>
        <p className="text-muted-foreground">Manage your profile and track your tuition applications.</p>
      </div>

      <dl className="grid grid-cols-3 gap-4">
        {[
          { label: 'Applications', value: counts.total },
          { label: 'Pending', value: counts.pending },
          { label: 'Accepted', value: counts.accepted },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className="font-heading text-3xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section aria-labelledby="apps-heading" className="flex flex-col gap-4">
          <h2 id="apps-heading" className="text-lg font-semibold">My applications</h2>
          <ApplicationsList applications={applications} />
        </section>
        <section aria-labelledby="profile-heading" className="flex flex-col gap-4">
          <h2 id="profile-heading" className="text-lg font-semibold">Profile</h2>
          <ProfileForm tutor={tutor} email={user.email ?? ''} />
        </section>
      </div>
    </div>
  )
}
