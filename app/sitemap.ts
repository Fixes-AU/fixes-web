import type { MetadataRoute } from 'next'
import { SERVICE_DATA } from '@/lib/service-data'
import { SITE_URL } from '@/lib/site'

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

interface SitemapPage {
  path: string
  changeFrequency: ChangeFrequency
  priority: number
}

const PUBLIC_PAGES: SitemapPage[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/post-job', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/categories', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/i-want-to-work', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/enterprise', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/how-fixes-works', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/how-to-find-work', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/trust-and-quality', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/safety', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/about-us', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/articles', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/community', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/community-impact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/direct-contracts', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faqs', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/faqs-tradie', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/resources', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tips', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/careers', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact-us', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/council-regulations', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/investors', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/licensing', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/press', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/support', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/accessibility', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/ca-notice', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/cookie-settings', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/job-poster-tcs', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/privacy-policy/client', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/privacy-policy/tradie', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.4 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = PUBLIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }))

  const categories = SERVICE_DATA.map(({ slug }) => ({
    url: `${SITE_URL}/categories/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...pages, ...categories]
}
