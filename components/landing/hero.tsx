import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
      <div className="flex flex-col gap-6">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <ShieldCheck className="size-3.5" aria-hidden />
          Every request reviewed by our team
        </p>
        <h1 className="text-balance font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          The right home tutor for every learner.
        </h1>
        <p className="max-w-prose text-pretty text-lg leading-relaxed text-muted-foreground">
          Maestro Hub connects guardians with qualified tutors. Guardians post a
          request for free, tutors browse verified tuitions and apply in one click.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/request-tutor" className={buttonVariants({ size: 'lg', className: 'h-11 px-5' })}>
            Request a tutor
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Link>
          <Link
            href="/tuitions"
            className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-11 px-5' })}
          >
            Browse tuitions
          </Link>
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border">
        <Image
          src="/images/hero-tutoring.png"
          alt="A tutor helping a student with homework at a desk"
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}
