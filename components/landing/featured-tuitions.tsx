import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { TuitionCard } from '@/components/tuition-card'
import { createClient } from '@/lib/supabase/server'
import type { Tuition } from '@/lib/types'

export async function FeaturedTuitions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tuitions')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(6)
  const tuitions = (data ?? []) as Tuition[]

  return (
    <section aria-labelledby="featured-heading" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 id="featured-heading" className="font-heading text-3xl font-semibold tracking-tight">
            Latest tuitions
          </h2>
          <p className="text-muted-foreground">Fresh, verified opportunities for tutors.</p>
        </div>
        <Link href="/tuitions" className={buttonVariants({ variant: 'outline' })}>
          View all
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Link>
      </div>
      {tuitions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No open tuitions right now. New posts appear here as soon as they are published.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tuitions.map((tuition) => (
            <TuitionCard key={tuition.id} tuition={tuition} />
          ))}
        </div>
      )}
    </section>
  )
}
