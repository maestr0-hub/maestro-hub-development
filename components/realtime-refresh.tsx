'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Table = 'tuitions' | 'guardian_requests' | 'applications'

export function RealtimeRefresh({ tables, channel }: { tables: Table[]; channel: string }) {
  const router = useRouter()
  const tableKey = tables.join(',')

  useEffect(() => {
    const supabase = createClient()
    let timeout: ReturnType<typeof setTimeout> | undefined
    const scheduleRefresh = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => router.refresh(), 300)
    }

    const sub = supabase.channel(channel)
    for (const table of tableKey.split(',')) {
      sub.on('postgres_changes', { event: '*', schema: 'public', table }, scheduleRefresh)
    }
    sub.subscribe()

    return () => {
      clearTimeout(timeout)
      supabase.removeChannel(sub)
    }
  }, [router, tableKey, channel])

  return null
}
