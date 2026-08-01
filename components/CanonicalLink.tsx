'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SITE_URL } from '@/lib/site'

function getCanonicalUrl(pathname: string) {
  const canonicalUrl = new URL(SITE_URL)
  canonicalUrl.pathname = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  return canonicalUrl.href
}

export function CanonicalLink() {
  const pathname = usePathname()
  const canonicalUrl = getCanonicalUrl(pathname)

  useEffect(() => {
    const canonicalLinks = document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
    const canonicalLink = canonicalLinks.item(0)

    if (canonicalLink) {
      canonicalLink.href = canonicalUrl
    }

    canonicalLinks.forEach((link, index) => {
      if (index > 0) link.remove()
    })
  }, [canonicalUrl])

  return <link rel="canonical" href={canonicalUrl} />
}
