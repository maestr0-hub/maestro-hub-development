import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">
        The link may have expired or already been used. Please try logging in again.
      </p>
      <Link href="/auth/login" className={buttonVariants()}>
        Back to login
      </Link>
    </div>
  )
}
