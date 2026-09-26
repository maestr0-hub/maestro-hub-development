'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { FormMessage } from '@/components/form-field'
import { applyToTuition } from '@/app/actions/tutor'
import type { ApplicationStatus } from '@/lib/types'

export function ApplyPanel({
  tuitionId,
  isOpen,
  isLoggedIn,
  hasProfile,
  applicationStatus,
}: {
  tuitionId: string
  isOpen: boolean
  isLoggedIn: boolean
  hasProfile: boolean
  applicationStatus: ApplicationStatus | null
}) {
  const [state, formAction, pending] = useActionState(applyToTuition, null)

  let body: React.ReactNode
  if (applicationStatus || state?.ok) {
    body = (
      <div className="flex flex-col gap-3">
        <p className="flex items-center gap-2 text-sm">
          Your application status:
          <Badge variant="secondary" className="capitalize">
            {applicationStatus ?? 'pending'}
          </Badge>
        </p>
        <Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>
          Go to dashboard
        </Link>
      </div>
    )
  } else if (!isOpen) {
    body = <p className="text-sm text-muted-foreground">This tuition is no longer accepting applications.</p>
  } else if (!isLoggedIn) {
    body = (
      <div className="flex flex-col gap-2">
        <Link href={`/auth/login?next=/tuitions/${tuitionId}`} className={buttonVariants()}>
          Log in to apply
        </Link>
        <Link href="/auth/sign-up" className={buttonVariants({ variant: 'outline' })}>
          Create a tutor account
        </Link>
      </div>
    )
  } else if (!hasProfile) {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Complete your tutor profile before applying.</p>
        <Link href="/dashboard" className={buttonVariants()}>
          Complete profile
        </Link>
      </div>
    )
  } else {
    body = (
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="tuition_id" value={tuitionId} />
        <div className="flex flex-col gap-2">
          <Label htmlFor="cover_note">Note to the guardian (optional)</Label>
          <Textarea
            id="cover_note"
            name="cover_note"
            rows={4}
            maxLength={1000}
            placeholder="Briefly explain why you are a great fit."
          />
        </div>
        {state && !state.ok && <FormMessage ok={false} message={state.message} />}
        <Button type="submit" disabled={pending} className="h-10">
          {pending ? 'Submitting...' : 'Apply now'}
        </Button>
      </form>
    )
  }

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Interested in this tuition?</CardTitle>
        <CardDescription>Your profile is shared with our team when you apply.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {state?.ok && <FormMessage ok message={state.message} />}
        {body}
      </CardContent>
    </Card>
  )
}
