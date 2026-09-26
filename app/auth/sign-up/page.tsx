import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = { title: 'Join as a tutor' }

export default function SignUpPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <SignUpForm />
    </div>
  )
}
