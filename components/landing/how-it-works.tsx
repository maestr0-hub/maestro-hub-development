import { ClipboardList, Megaphone, UserCheck } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    title: 'Guardians post a request',
    body: 'Share the class, subject, location, schedule and budget. No account needed.',
  },
  {
    icon: Megaphone,
    title: 'We review and publish',
    body: 'Our team verifies each request and publishes it to the public tuition board.',
  },
  {
    icon: UserCheck,
    title: 'Tutors apply',
    body: 'Registered tutors apply with their profile. We shortlist and connect the best match.',
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="border-y bg-muted/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
        <div className="flex flex-col gap-2">
          <h2 id="how-heading" className="font-heading text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="text-muted-foreground">Three simple steps from request to first class.</p>
        </div>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <span className="font-heading text-3xl font-semibold text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
