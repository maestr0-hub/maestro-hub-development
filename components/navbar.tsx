'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    setMenuOpen(false)
  }

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors hover:text-foreground ${
        pathname === href ? 'text-foreground' : 'text-muted-foreground'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-lg">Maestro Hub</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLink('/', 'Tuition Board')}
          {navLink('/request', 'Request a Tutor')}
          {navLink('/admin', 'Admin')}
          {navLink('/admin-login', 'Admin Login')}
          {user && navLink('/dashboard', 'Dashboard')}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? null : user ? (
            <>
              <span className="text-xs text-muted-foreground">{user.email}</span>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="flex items-center px-2 py-1 text-sm md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLink('/', 'Tuition Board')}
            {navLink('/request', 'Request a Tutor')}
            {navLink('/admin', 'Admin')}
            {navLink('/admin-login', 'Admin Login')}
            {user && navLink('/dashboard', 'Dashboard')}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" variant="ghost">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMenuOpen(false)}>
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
