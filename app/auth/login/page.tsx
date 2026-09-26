import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Tutor login' }

function safeNext(value: string | undefined) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <LoginForm mode="tutor" next={safeNext(next)} />
    </div>
  )
}
