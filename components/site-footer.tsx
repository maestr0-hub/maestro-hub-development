import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          {'© '}
          {new Date().getFullYear()} Maestro Hub. Connecting learners with great
          tutors.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <Link href="/tuitions" className="hover:text-foreground">
            Tuitions
          </Link>
          <Link href="/request-tutor" className="hover:text-foreground">
            Request a tutor
          </Link>
          <Link href="/auth/sign-up" className="hover:text-foreground">
            Become a tutor
          </Link>
          <Link href="/admin/login" className="hover:text-foreground">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  )
}
