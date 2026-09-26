import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TuitionCard } from '@/components/tuition-card'
import { RealtimeRefresh } from '@/components/realtime-refresh'
import { createClient } from '@/lib/supabase/server'
import { CLASSES, SUBJECTS, selectClassName } from '@/lib/format'
import type { Tuition } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Browse tuitions',
  description: 'Find open home tuition posts by subject, class and location.',
}

type SearchParams = Promise<{ subject?: string; class?: string; location?: string }>

export default async function TuitionsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const subject = params.subject?.slice(0, 80) ?? ''
  const klass = params.class?.slice(0, 60) ?? ''
  const location = params.location?.trim().slice(0, 100) ?? ''

  const supabase = await createClient()
  let query = supabase
    .from('tuitions')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(60)
  if (subject) query = query.eq('subject', subject)
  if (klass) query = query.eq('class', klass)
  if (location) query = query.ilike('location', `%${location}%`)

  const { data } = await query
  const tuitions = (data ?? []) as Tuition[]
  const hasFilters = Boolean(subject || klass || location)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
      <RealtimeRefresh tables={['tuitions']} channel="tuition-board" />
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">Tuition board</h1>
        <p className="text-muted-foreground">
          {tuitions.length} open {tuitions.length === 1 ? 'tuition' : 'tuitions'}
          {hasFilters ? ' matching your filters' : ''}. Updates live as new posts are published.
        </p>
      </div>

      <form
        method="get"
        className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">Subject</Label>
          <select id="subject" name="subject" defaultValue={subject} className={selectClassName}>
            <option value="">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="class">Class</Label>
          <select id="class" name="class" defaultValue={klass} className={selectClassName}>
            <option value="">All classes</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" placeholder="e.g. Dhanmondi" defaultValue={location} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className={buttonVariants({ className: 'flex-1 lg:flex-none' })}>
            Apply filters
          </button>
          {hasFilters && (
            <Link href="/tuitions" className={buttonVariants({ variant: 'ghost' })}>
              Clear
            </Link>
          )}
        </div>
      </form>

      {tuitions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No tuitions found. Try adjusting your filters or check back soon.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition) => (
            <TuitionCard key={tuition.id} tuition={tuition} />
          ))}
        </div>
      )}
    </div>
  )
}
