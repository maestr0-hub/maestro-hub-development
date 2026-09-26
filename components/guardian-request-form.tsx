'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormMessage } from '@/components/form-field'
import { submitGuardianRequest } from '@/app/actions/guardian'
import { CLASSES, SUBJECTS, selectClassName } from '@/lib/format'

export function GuardianRequestForm() {
  const [state, formAction, pending] = useActionState(submitGuardianRequest, null)
  const err = (key: string) => state?.fieldErrors?.[key]?.[0]

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border bg-card p-8">
        <h2 className="font-heading text-2xl font-semibold">Request received</h2>
        <p className="text-muted-foreground">{state.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Submit another request
        </Button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 rounded-xl border bg-card p-6" noValidate>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Guardian details
        </legend>
        <FormField id="guardian_name" label="Your name" error={err('guardian_name')}>
          <Input id="guardian_name" name="guardian_name" required autoComplete="name" aria-invalid={!!err('guardian_name')} />
        </FormField>
        <FormField id="guardian_contact" label="Phone number" error={err('guardian_contact')}>
          <Input id="guardian_contact" name="guardian_contact" type="tel" required autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={!!err('guardian_contact')} />
        </FormField>
        <FormField id="guardian_email" label="Email (optional)" error={err('guardian_email')} className="sm:col-span-2">
          <Input id="guardian_email" name="guardian_email" type="email" autoComplete="email" aria-invalid={!!err('guardian_email')} />
        </FormField>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tuition requirements
        </legend>
        <FormField id="student_class" label="Student class" error={err('student_class')}>
          <select id="student_class" name="student_class" required defaultValue="" className={selectClassName}>
            <option value="" disabled>Select class</option>
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField id="subject" label="Subject" error={err('subject')}>
          <select id="subject" name="subject" required defaultValue="" className={selectClassName}>
            <option value="" disabled>Select subject</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField id="location" label="Location / area" error={err('location')}>
          <Input id="location" name="location" required placeholder="e.g. Dhanmondi, Dhaka" aria-invalid={!!err('location')} />
        </FormField>
        <FormField id="schedule" label="Preferred schedule" error={err('schedule')}>
          <Input id="schedule" name="schedule" required placeholder="e.g. 3 days/week, evenings" aria-invalid={!!err('schedule')} />
        </FormField>
        <FormField id="budget" label="Monthly budget (৳)" error={err('budget')}>
          <Input id="budget" name="budget" type="number" inputMode="numeric" min={500} step={100} required placeholder="6000" aria-invalid={!!err('budget')} />
        </FormField>
        <FormField id="notes" label="Additional notes (optional)" error={err('notes')} className="sm:col-span-2">
          <Textarea id="notes" name="notes" rows={4} maxLength={1000} placeholder="Tutor gender preference, curriculum, goals..." />
        </FormField>
      </fieldset>

      {state && !state.ok && <FormMessage ok={false} message={state.message} />}
      <Button type="submit" disabled={pending} className="h-10 w-full sm:w-fit sm:px-6">
        {pending ? 'Submitting...' : 'Submit request'}
      </Button>
    </form>
  )
}
