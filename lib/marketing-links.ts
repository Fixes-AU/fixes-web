export type MarketingDistributionTarget =
  | 'client_web'
  | 'fixer_web'
  | 'agency_web'
  | 'client_waitlist'
  | 'fixer_waitlist'
  | 'fixes_mobile'
  | 'fixer_mobile'

export const MARKETING_DISTRIBUTION_TARGETS: ReadonlyArray<{
  value: MarketingDistributionTarget
  label: string
}> = [
  { value: 'client_web', label: 'Client registration — web' },
  { value: 'fixer_web', label: 'Fixer registration — web' },
  { value: 'agency_web', label: 'Agency registration — web' },
  { value: 'client_waitlist', label: 'Client waitlist — web' },
  { value: 'fixer_waitlist', label: 'Fixer waitlist — web' },
  { value: 'fixes_mobile', label: 'Fixes client app' },
  { value: 'fixer_mobile', label: 'Fixer app' },
]

const WEB_TARGET_PATHS: Partial<Record<MarketingDistributionTarget, string>> = {
  client_web: '/register',
  fixer_web: '/register/tradie',
  agency_web: '/agency/register',
  client_waitlist: '/waitlist/client',
  fixer_waitlist: '/waitlist/tradie',
}

export function buildMarketingRegistrationUrl({
  origin,
  target,
  campaignIdentifier,
  code,
  via,
  utm,
}: {
  origin: string
  target: MarketingDistributionTarget
  campaignIdentifier: string
  code?: string | null
  via?: 'qr'
  utm?: {
    source?: string | null
    medium?: string | null
    campaign?: string | null
    content?: string | null
  }
}) {
  const webPath = WEB_TARGET_PATHS[target]
  const url = webPath
    ? new URL(webPath, origin)
    : new URL(target === 'fixes_mobile' ? 'fixes://register' : 'fixer://register')

  url.searchParams.set('campaign', campaignIdentifier)
  if (code) url.searchParams.set('code', code.trim().toUpperCase())
  if (via) url.searchParams.set('via', via)
  if (utm?.source) url.searchParams.set('utm_source', utm.source)
  if (utm?.medium) url.searchParams.set('utm_medium', utm.medium)
  if (utm?.campaign) url.searchParams.set('utm_campaign', utm.campaign)
  if (utm?.content) url.searchParams.set('utm_content', utm.content)

  return url.toString()
}
