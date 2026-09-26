import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false } }

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <LoginForm
        mode="admin"
        next="/admin"
        initialError={error === 'forbidden' ? 'Please sign in with an admin account.' : undefined}
      />
    </div>
  )
}
