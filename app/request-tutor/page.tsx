import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { GuardianRequestForm } from '@/components/guardian-request-form'

export const metadata: Metadata = {
  title: 'Request a tutor',
  description: 'Tell us what your child needs and we will find the right home tutor.',
}

const promises = [
  'Free for guardians — no account required',
  'Every request is reviewed before publishing',
  'Your contact details are never shown publicly',
]

export default function RequestTutorPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[340px_1fr]">
      <div className="flex flex-col gap-4">
        <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Request a home tutor
        </h1>
        <p className="leading-relaxed text-muted-foreground">
          Share a few details about the student. Our team reviews your request and
          publishes it so qualified tutors can apply.
        </p>
        <ul className="flex flex-col gap-3 text-sm">
          {promises.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <GuardianRequestForm />
    </div>
  )
}
