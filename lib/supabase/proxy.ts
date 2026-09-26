import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Must run immediately after client creation to keep the session in sync.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const redirectTo = (path: string, params?: Record<string, string>) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = ''
    for (const [key, value] of Object.entries(params ?? {})) {
      url.searchParams.set(key, value)
    }
    const response = NextResponse.redirect(url)
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  if (pathname.startsWith('/dashboard') && !user) {
    return redirectTo('/auth/login', { next: pathname })
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) return redirectTo('/admin/login')
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) return redirectTo('/admin/login', { error: 'forbidden' })
  }

  return supabaseResponse
}
