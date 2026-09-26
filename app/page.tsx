'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import type { Tuition, Application } from '@/lib/types'

export default function TuitionBoardPage() {
  const { user, loading } = useAuth()
  const [tuitions, setTuitions] = useState<Tuition[]>([])
  const [loadingTuitions, setLoadingTuitions] = useState(true)
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [applying, setApplying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('tuitions')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          setTuitions((data as Tuition[]) ?? [])
        }
        setLoadingTuitions(false)
      })
  }, [])

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('applications')
      .select('tuition_id')
      .eq('tutor_id', user.id)
      .then(({ data }) => {
        if (data) {
          setAppliedIds(new Set((data as Application[]).map((a) => a.tuition_id)))
        }
      })
  }, [user])

  async function handleApply(tuition: Tuition) {
    if (!user) return
    setApplying(tuition.id)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('applications').insert({
      tutor_id: user.id,
      tuition_id: tuition.id,
      message: '',
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setAppliedIds((prev) => new Set([...prev, tuition.id]))
      } else {
        setError(insertError.message)
      }
    } else {
      setAppliedIds((prev) => new Set([...prev, tuition.id]))
    }
    setApplying(null)
  }

  if (loadingTuitions) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Open Tuitions</h1>
        <p className="mt-2 text-muted-foreground">
          Browse available tuition opportunities and apply to the ones that match your expertise.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {tuitions.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            No open tuitions right now. New opportunities appear here as soon as they are approved.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition) => {
            const hasApplied = appliedIds.has(tuition.id)
            return (
              <div
                key={tuition.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {tuition.subject}
                  </span>
                  {tuition.level && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {tuition.level}
                    </span>
                  )}
                </div>
                <h3 className="mb-1 font-semibold">{tuition.title}</h3>
                {tuition.details && (
                  <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                    {tuition.details}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-3">
                  {tuition.budget ? (
                    <span className="text-sm font-medium">{tuition.budget}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Budget negotiable</span>
                  )}
                  {loading ? null : !user ? (
                    <Link href="/login">
                      <Button size="sm" variant="outline">
                        Log in to Apply
                      </Button>
                    </Link>
                  ) : hasApplied ? (
                    <Button size="sm" variant="secondary" disabled>
                      Applied
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApply(tuition)}
                      disabled={applying === tuition.id}
                    >
                      {applying === tuition.id ? 'Applying...' : 'Apply'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
