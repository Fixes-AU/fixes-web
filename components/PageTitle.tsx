'use client'

import { usePathname } from 'next/navigation'
import { getRouteTitle } from '@/lib/page-titles'

export function PageTitle() {
  const pathname = usePathname()
  const title = getRouteTitle(pathname)

  if (!title) return null

  return <title>{title}</title>
}
