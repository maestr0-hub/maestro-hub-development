'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormField, FormMessage } from '@/components/form-field'

function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'email_not_confirmed') return 'Please confirm your email address — check your inbox for the link.'
  if (code === 'over_request_rate_limit' || status === 429) return 'Too many attempts. Please wait a moment and try again.'
  if (code === 'invalid_credentials') return 'Invalid email or password.'
  return 'Something went wrong. Please try again.'
}

export function LoginForm({
  mode,
  next,
  initialError,
}: {
  mode: 'tutor' | 'admin'
  next: string
  initialError?: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(form.get('email')),
        password: String(form.get('password')),
      })
      if (error) throw error

      if (mode === 'admin') {
        const { data: isAdmin } = await supabase.rpc('is_admin')
        if (!isAdmin) {
          await supabase.auth.signOut()
          setError('This account does not have admin access.')
          return
        }
      }
      router.push(next)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError(loginErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">
          {mode === 'admin' ? 'Admin sign in' : 'Tutor login'}
        </CardTitle>
        <CardDescription>
          {mode === 'admin'
            ? 'Restricted area for Maestro Hub staff.'
            : 'Log in to apply for tuitions and track your applications.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FormField id="email" label="Email">
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </FormField>
          <FormField id="password" label="Password">
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </FormField>
          {error && <FormMessage ok={false} message={error} />}
          <Button type="submit" className="h-10 w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
          {mode === 'tutor' && (
            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/sign-up" className="text-foreground underline underline-offset-4">
                Join as a tutor
              </Link>
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
