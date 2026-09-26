'use client'

import { useActionState } from 'react'
import { Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormMessage } from '@/components/form-field'
import { handleGuardianRequest } from '@/app/actions/admin'
import { CLASSES, SUBJECTS, formatDate, selectClassName } from '@/lib/format'
import type { GuardianRequest } from '@/lib/types'

export function RequestEditor({ request: r }: { request: GuardianRequest }) {
  const [state, formAction, pending] = useActionState(handleGuardianRequest, null)
  const f = (name: string) => `${name}-${r.id}`
  const subjectOptions = SUBJECTS.includes(r.subject as (typeof SUBJECTS)[number]) ? SUBJECTS : [r.subject, ...SUBJECTS]
  const classOptions = CLASSES.includes(r.student_class as (typeof CLASSES)[number]) ? CLASSES : [r.student_class, ...CLASSES]

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-xl border bg-card p-5">
      <input type="hidden" name="id" value={r.id} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{r.guardian_name}</h3>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" aria-hidden />
              {r.guardian_contact}
            </span>
            {r.guardian_email && (
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden />
                {r.guardian_email}
              </span>
            )}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">Submitted {formatDate(r.created_at)}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField id={f('class')} label="Class">
          <select id={f('class')} name="student_class" defaultValue={r.student_class} className={selectClassName}>
            {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField id={f('subject')} label="Subject">
          <select id={f('subject')} name="subject" defaultValue={r.subject} className={selectClassName}>
            {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField id={f('budget')} label="Guardian budget (৳)">
          <Input id={f('budget')} name="budget" type="number" min={1} defaultValue={r.budget} />
        </FormField>
        <FormField id={f('location')} label="Location">
          <Input id={f('location')} name="location" defaultValue={r.location} />
        </FormField>
        <FormField id={f('schedule')} label="Schedule" className="lg:col-span-2">
          <Input id={f('schedule')} name="schedule" defaultValue={r.schedule} />
        </FormField>
        <FormField id={f('notes')} label="Guardian notes" className="sm:col-span-2 lg:col-span-3">
          <Textarea id={f('notes')} name="notes" rows={2} defaultValue={r.notes ?? ''} />
        </FormField>
      </div>

      <fieldset className="grid gap-4 rounded-lg border border-dashed p-4 sm:grid-cols-[1fr_180px]">
        <legend className="px-1 text-sm font-medium">Public post</legend>
        <FormField id={f('title')} label="Post title">
          <Input id={f('title')} name="title" defaultValue={`${r.subject} tutor needed for ${r.student_class}`} />
        </FormField>
        <FormField id={f('salary')} label="Salary shown (৳)" hint="Defaults to budget">
          <Input id={f('salary')} name="salary" type="number" min={0} defaultValue={r.budget} />
        </FormField>
        <FormField id={f('description')} label="Description (shown to tutors)" className="sm:col-span-2">
          <Textarea id={f('description')} name="description" rows={3} defaultValue={r.notes ?? ''} />
        </FormField>
      </fieldset>

      {state && <FormMessage ok={state.ok} message={state.message} />}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="submit" name="intent" value="reject" variant="destructive" disabled={pending}>
          Reject
        </Button>
        <Button type="submit" name="intent" value="save" variant="outline" disabled={pending}>
          Save edits
        </Button>
        <Button type="submit" name="intent" value="publish" disabled={pending}>
          {pending ? 'Working...' : 'Approve & publish'}
        </Button>
      </div>
    </form>
  )
}
