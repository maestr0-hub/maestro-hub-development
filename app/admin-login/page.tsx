'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('Login succeeded but no user ID returned.')
      setLoading(false)
      return
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (adminError || !adminData) {
      await supabase.auth.signOut()
      setError('This account does not have admin access.')
      setLoading(false)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Admin Login</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Sign in with an admin-authorized account to access the admin panel.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Admin Sign In'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Not an admin?{' '}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Tutor login
        </Link>
      </p>
    </div>
  )
}
