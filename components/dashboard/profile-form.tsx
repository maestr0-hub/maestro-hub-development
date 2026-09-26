'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormMessage } from '@/components/form-field'
import { updateTutorProfile } from '@/app/actions/tutor'
import type { Tutor } from '@/lib/types'

export function ProfileForm({ tutor, email }: { tutor: Tutor | null; email: string }) {
  const [state, formAction, pending] = useActionState(updateTutorProfile, null)
  const err = (key: string) => state?.fieldErrors?.[key]?.[0]

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <FormField id="p-email" label="Email" hint="Email is linked to your login and cannot be changed here.">
        <Input id="p-email" value={email} readOnly disabled />
      </FormField>
      <FormField id="p-name" label="Full name" error={err('name')}>
        <Input id="p-name" name="name" defaultValue={tutor?.name ?? ''} required aria-invalid={!!err('name')} />
      </FormField>
      <FormField id="p-phone" label="Phone" error={err('phone')}>
        <Input id="p-phone" name="phone" type="tel" defaultValue={tutor?.phone ?? ''} required aria-invalid={!!err('phone')} />
      </FormField>
      <FormField id="p-subjects" label="Subjects" hint="Comma separated" error={err('subjects')}>
        <Input id="p-subjects" name="subjects" defaultValue={tutor?.subjects.join(', ') ?? ''} required aria-invalid={!!err('subjects')} />
      </FormField>
      <FormField id="p-qualifications" label="Qualifications" error={err('qualifications')}>
        <Textarea id="p-qualifications" name="qualifications" rows={3} defaultValue={tutor?.qualifications ?? ''} required />
      </FormField>
      <FormField id="p-experience" label="Experience" error={err('experience')}>
        <Textarea id="p-experience" name="experience" rows={3} defaultValue={tutor?.experience ?? ''} />
      </FormField>
      {state && <FormMessage ok={state.ok} message={state.message} />}
      <Button type="submit" disabled={pending} className="h-10">
        {pending ? 'Saving...' : 'Save profile'}
      </Button>
    </form>
  )
}
