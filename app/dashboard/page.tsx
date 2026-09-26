'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import type { Tutor, Application, Tuition } from '@/lib/types'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    Promise.all([
      supabase
        .from('tutors')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('applications')
        .select('*, tuitions(*)')
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false }),
    ]).then(([tutorRes, appRes]) => {
      if (tutorRes.error) setError(tutorRes.error.message)
      else setTutor(tutorRes.data as Tutor | null)

      if (appRes.error) setError(appRes.error.message)
      else setApplications((appRes.data as Application[]) ?? [])

      setLoadingData(false)
    })
  }, [user])

  if (loading || (!user && !loading)) {
    return <div className="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">Loading...</div>
  }

  if (loadingData) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-32 w-full rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Tutor Dashboard</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">My Profile</h2>
            {tutor ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span> {tutor.full_name}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {tutor.email}
                </div>
                {tutor.subjects && (
                  <div>
                    <span className="text-muted-foreground">Subjects:</span> {tutor.subjects}
                  </div>
                )}
                {tutor.bio && (
                  <div>
                    <span className="text-muted-foreground">Bio:</span> {tutor.bio}
                  </div>
                )}
                {tutor.hourly_rate != null && (
                  <div>
                    <span className="text-muted-foreground">Hourly Rate:</span> ${tutor.hourly_rate}
                  </div>
                )}
                {tutor.location && (
                  <div>
                    <span className="text-muted-foreground">Location:</span> {tutor.location}
                  </div>
                )}
                {tutor.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span> {tutor.phone}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? 'Close Edit' : 'Edit Profile'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No tutor profile found. This may happen if signup was interrupted.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    const supabase = createClient()
                    if (!user) return
                    supabase
                      .from('tutors')
                      .insert({
                        id: user.id,
                        email: user.email ?? '',
                        full_name: user.email?.split('@')[0] ?? 'Tutor',
                      })
                      .then(({ error: insertError }) => {
                        if (insertError) setError(insertError.message)
                        else window.location.reload()
                      })
                  }}
                >
                  Create Profile
                </Button>
              </div>
            )}

            {editing && tutor && (
              <ProfileEditor
                tutor={tutor}
                onSaved={() => {
                  setEditing(false)
                  window.location.reload()
                }}
                onError={setError}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold">My Applications</h2>
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven&apos;t applied to any tuitions yet. Browse the{' '}
                <a href="/" className="underline hover:text-foreground">tuition board</a> to apply.
              </p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const tuition = app.tuitions as Tuition | undefined
                  return (
                    <div
                      key={app.id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium">
                            {tuition?.title ?? 'Tuition (deleted)'}
                          </h3>
                          {tuition && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {tuition.subject}
                              {tuition.level ? ` • ${tuition.level}` : ''}
                            </p>
                          )}
                          {app.message && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              &ldquo;{app.message}&rdquo;
                            </p>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
                            app.status === 'pending'
                              ? 'bg-muted text-muted-foreground'
                              : app.status === 'accepted'
                                ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                                : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileEditor({
  tutor,
  onSaved,
  onError,
}: {
  tutor: Tutor
  onSaved: () => void
  onError: (msg: string | null) => void
}) {
  const [subjects, setSubjects] = useState(tutor.subjects ?? '')
  const [bio, setBio] = useState(tutor.bio ?? '')
  const [hourlyRate, setHourlyRate] = useState(
    tutor.hourly_rate != null ? String(tutor.hourly_rate) : ''
  )
  const [location, setLocation] = useState(tutor.location ?? '')
  const [phone, setPhone] = useState(tutor.phone ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('tutors')
      .update({
        subjects: subjects || null,
        bio: bio || null,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        location: location || null,
        phone: phone || null,
      })
      .eq('id', tutor.id)

    if (updateError) {
      onError(updateError.message)
      setSaving(false)
    } else {
      onSaved()
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      <div>
        <label className="mb-1 block text-xs font-medium">Subjects</label>
        <input
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium">Hourly Rate ($)</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium">Phone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded border border-input bg-background px-2 py-1 text-sm"
        />
      </div>
      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
