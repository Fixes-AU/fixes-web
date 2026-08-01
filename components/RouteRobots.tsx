'use client'

import { usePathname } from 'next/navigation'
import { shouldNoIndex } from '@/lib/route-indexing'

export function RouteRobots() {
  const pathname = usePathname()

  if (!shouldNoIndex(pathname)) return null

  return <meta name="robots" content="noindex, nofollow" />
}
