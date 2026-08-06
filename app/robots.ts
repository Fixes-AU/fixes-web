import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin-select',
          '/cleaning-admin',
          '/dashboard',
          '/agency',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/delete-account',
          '/stripe-connect',
          '/track',
          '/app/fixes',
          '/app/fixer',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
