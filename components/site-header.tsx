import Link from 'next/link'
import { GraduationCap, Menu } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { getViewer } from '@/lib/auth'
import { signOut } from '@/app/actions/auth'

const navLinks = [
  { href: '/tuitions', label: 'Browse tuitions' },
  { href: '/request-tutor', label: 'Request a tutor' },
]

export async function SiteHeader() {
  const { user, isAdmin } = await getViewer()

  const accountLinks = user ? (
    <>
      {isAdmin && (
        <Link href="/admin" className={buttonVariants({ variant: 'ghost' })}>
          Admin
        </Link>
      )}
      <Link href="/dashboard" className={buttonVariants({ variant: 'ghost' })}>
        Dashboard
      </Link>
      <form action={signOut}>
        <button type="submit" className={buttonVariants({ variant: 'outline' })}>
          Sign out
        </button>
      </form>
    </>
  ) : (
    <>
      <Link href="/auth/login" className={buttonVariants({ variant: 'ghost' })}>
        Tutor login
      </Link>
      <Link href="/auth/sign-up" className={buttonVariants()}>
        Join as tutor
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight">
            Maestro Hub
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">{accountLinks}</div>

        <details className="relative md:hidden">
          <summary
            className={`${buttonVariants({ variant: 'outline', size: 'icon' })} list-none [&::-webkit-details-marker]:hidden`}
          >
            <Menu aria-hidden />
            <span className="sr-only">Open menu</span>
          </summary>
          <div className="absolute right-0 mt-2 flex w-56 flex-col gap-1 rounded-xl border bg-popover p-2 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={buttonVariants({ variant: 'ghost', className: 'justify-start' })}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-1 border-t" />
            <div className="flex flex-col gap-1 [&_a]:justify-start [&_button]:w-full">
              {accountLinks}
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}
