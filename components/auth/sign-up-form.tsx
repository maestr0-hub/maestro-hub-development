'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormMessage } from '@/components/form-field'

function signUpErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'weak_password') return 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || status === 429)
    return 'Too many attempts. Please wait a moment and try again.'
  if (code === 'email_address_invalid') return 'Please use a valid email address.'
  return 'Could not create your account. Please try again.'
}

export function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const get = (k: string) => String(form.get(k) ?? '').trim()

    if (get('password').length < 8) return setError('Password must be at least 8 characters.')
    if (get('password') !== get('confirm')) return setError('Passwords do not match.')
    if (!/^\+?[0-9\s-]{7,20}$/.test(get('phone'))) return setError('Enter a valid phone number.')

    setIsLoading(true)
    setError(null)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signUp({
        email: get('email'),
        password: get('password'),
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          data: {
            role: 'tutor',
            name: get('name'),
            phone: get('phone'),
            subjects: get('subjects'),
            qualifications: get('qualifications'),
            experience: get('experience'),
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (err) {
      console.error('Sign up error:', err)
      setError(signUpErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Join as a tutor</CardTitle>
        <CardDescription>Create your profile to start applying to verified tuitions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <FormField id="name" label="Full name">
            <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} />
          </FormField>
          <FormField id="phone" label="Phone number">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
          </FormField>
          <FormField id="email" label="Email" className="sm:col-span-2">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </FormField>
          <FormField id="subjects" label="Subjects you teach" hint="Comma separated, e.g. Mathematics, Physics" className="sm:col-span-2">
            <Input id="subjects" name="subjects" required maxLength={300} />
          </FormField>
          <FormField id="qualifications" label="Qualifications" className="sm:col-span-2">
            <Textarea id="qualifications" name="qualifications" rows={2} required maxLength={1000} placeholder="e.g. BSc in Physics, University of Dhaka" />
          </FormField>
          <FormField id="experience" label="Teaching experience (optional)" className="sm:col-span-2">
            <Textarea id="experience" name="experience" rows={2} maxLength={1000} placeholder="e.g. 3 years tutoring SSC students" />
          </FormField>
          <FormField id="password" label="Password">
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          </FormField>
          <FormField id="confirm" label="Confirm password">
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
          </FormField>
          {error && (
            <div className="sm:col-span-2">
              <FormMessage ok={false} message={error} />
            </div>
          )}
          <Button type="submit" className="h-10 sm:col-span-2" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create tutor account'}
          </Button>
          <p className="text-center text-sm text-muted-foreground sm:col-span-2">
            {'Already registered? '}
            <Link href="/auth/login" className="text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
