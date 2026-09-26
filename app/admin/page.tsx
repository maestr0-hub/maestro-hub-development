'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import type { GuardianRequest, Tuition, Admin } from '@/lib/types'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<GuardianRequest[]>([])
  const [tuitions, setTuitions] = useState<Tuition[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminChecked, setAdminChecked] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const [reqRes, tuiRes] = await Promise.all([
      supabase
        .from('guardian_requests')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('tuitions')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (reqRes.error) setError(reqRes.error.message)
    else setRequests((reqRes.data as GuardianRequest[]) ?? [])

    if (tuiRes.error) setError(tuiRes.error.message)
    else setTuitions((tuiRes.data as Tuition[]) ?? [])

    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user) {
      setAdminChecked(true)
      return
    }
    const supabase = createClient()
    supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error: adminError }) => {
        if (adminError) {
          setError(adminError.message)
        }
        setIsAdmin(!!data)
        setAdminChecked(true)
      })
  }, [user, loading])

  useEffect(() => {
    if (isAdmin) loadData()
    else if (adminChecked) setLoadingData(false)
  }, [isAdmin, adminChecked, loadData])

  async function handleApprove(req: GuardianRequest) {
    setActionLoading(req.id)
    setError(null)

    const supabase = createClient()

    const { data: tuitionData, error: insertError } = await supabase
      .from('tuitions')
      .insert({
        request_id: req.id,
        title: `${req.subject} — ${req.student_name ?? req.guardian_name}`,
        subject: req.subject,
        level: req.level,
        details: req.details,
        budget: req.budget,
        status: 'open',
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setActionLoading(null)
      return
    }

    const { error: updateError } = await supabase
      .from('guardian_requests')
      .update({ status: 'approved' })
      .eq('id', req.id)

    if (updateError) {
      setError(updateError.message)
      setActionLoading(null)
      return
    }

    setTuitions((prev) => [tuitionData as Tuition, ...prev])
    setRequests((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, status: 'approved' } : r))
    )
    setActionLoading(null)
  }

  async function handleReject(req: GuardianRequest) {
    setActionLoading(req.id)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('guardian_requests')
      .update({ status: 'rejected' })
      .eq('id', req.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, status: 'rejected' } : r))
      )
    }
    setActionLoading(null)
  }

  async function handleCloseTuition(tuition: Tuition) {
    setActionLoading(tuition.id)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('tuitions')
      .update({ status: 'closed' })
      .eq('id', tuition.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setTuitions((prev) =>
        prev.map((t) => (t.id === tuition.id ? { ...t, status: 'closed' } : t))
      )
    }
    setActionLoading(null)
  }

  async function handleAddTuition(tuitionData: {
    title: string
    subject: string
    level: string
    details: string
    budget: string
  }) {
    setError(null)
    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('tuitions')
      .insert({
        title: tuitionData.title,
        subject: tuitionData.subject,
        level: tuitionData.level || null,
        details: tuitionData.details || null,
        budget: tuitionData.budget || null,
        status: 'open',
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      return false
    }

    setTuitions((prev) => [data as Tuition, ...prev])
    return true
  }

  if (loading || !adminChecked) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-32 w-full rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Admin Access Required</h1>
        <p className="mb-6 text-muted-foreground">
          {user
            ? 'Your account does not have admin privileges.'
            : 'Please sign in with an admin account to access this panel.'}
        </p>
        <Button onClick={() => router.push('/admin-login')}>Admin Login</Button>
      </div>
    )
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')
  const openTuitions = tuitions.filter((t) => t.status === 'open')
  const closedTuitions = tuitions.filter((t) => t.status === 'closed')

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Admin Panel</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-10">
        <AddTuitionForm onAdd={handleAddTuition} />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">
          Pending Requests ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            No pending requests. New guardian submissions will appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {req.subject}
                      </span>
                      {req.level && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {req.level}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guardian:</span> {req.guardian_name} ({req.guardian_email})
                    </div>
                    {req.guardian_phone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {req.guardian_phone}
                      </div>
                    )}
                    {req.student_name && (
                      <div>
                        <span className="text-muted-foreground">Student:</span> {req.student_name}
                      </div>
                    )}
                    {req.details && (
                      <div>
                        <span className="text-muted-foreground">Details:</span> {req.details}
                      </div>
                    )}
                    {req.budget && (
                      <div>
                        <span className="text-muted-foreground">Budget:</span> {req.budget}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Submitted {new Date(req.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req)}
                      disabled={actionLoading === req.id}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(req)}
                      disabled={actionLoading === req.id}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">
          Open Tuitions ({openTuitions.length})
        </h2>
        {openTuitions.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            No open tuitions. Approve a request above or add one manually.
          </p>
        ) : (
          <div className="space-y-3">
            {openTuitions.map((tuition) => (
              <div key={tuition.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {tuition.subject}
                      </span>
                      {tuition.level && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {tuition.level}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium">{tuition.title}</h3>
                    {tuition.details && (
                      <p className="text-muted-foreground">{tuition.details}</p>
                    )}
                    {tuition.budget && (
                      <p className="text-muted-foreground">Budget: {tuition.budget}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Posted {new Date(tuition.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCloseTuition(tuition)}
                    disabled={actionLoading === tuition.id}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {closedTuitions.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Closed Tuitions ({closedTuitions.length})
          </h2>
          <div className="space-y-3">
            {closedTuitions.map((tuition) => (
              <div key={tuition.id} className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="space-y-1 text-sm">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {tuition.subject}
                  </span>
                  <h3 className="font-medium text-muted-foreground">{tuition.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AddTuitionForm({
  onAdd,
}: {
  onAdd: (data: {
    title: string
    subject: string
    level: string
    details: string
    budget: string
  }) => Promise<boolean>
}) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [details, setDetails] = useState('')
  const [budget, setBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const success = await onAdd({ title, subject, level, details, budget })
    if (success) {
      setTitle('')
      setSubject('')
      setLevel('')
      setDetails('')
      setBudget('')
      setShowForm(false)
    }
    setSubmitting(false)
  }

  if (!showForm) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold">Post a Tuition</h2>
        <Button onClick={() => setShowForm(true)}>Add Tuition</Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold">Add Tuition</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Math tutoring for high school student"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Math"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Level</label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="High School"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="Describe the tuition opportunity..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Budget</label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="$30/hr or Negotiable"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Tuition'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
