import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getViewer() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { supabase, user: null, isAdmin: false }

  const { data: isAdmin } = await supabase.rpc('is_admin')
  return { supabase, user, isAdmin: Boolean(isAdmin) }
}

export async function requireAdmin() {
  const viewer = await getViewer()
  if (!viewer.user || !viewer.isAdmin) redirect('/admin/login?error=forbidden')
  return viewer
}
