import { api } from '@/lib/api'

const STORAGE_KEY = 'fixes_marketing_attribution_v1'
const VISIT_KEY = 'fixes_marketing_visit_v1'

interface StoredAttribution {
  firstToken: string
  latestToken: string
  expiresAt: string
}

const uuid = () => crypto.randomUUID()
const read = (): StoredAttribution | null => {
  if (typeof window === 'undefined') return null
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as StoredAttribution | null
    if (!value?.firstToken || !value.latestToken || new Date(value.expiresAt) <= new Date()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return value
  } catch { localStorage.removeItem(STORAGE_KEY); return null }
}

const visitId = () => {
  let value = sessionStorage.getItem(VISIT_KEY)
  if (!value) { value = uuid(); sessionStorage.setItem(VISIT_KEY, value) }
  return value
}

export async function captureMarketingTouch({ campaignIdentifier, manualCode, surface = 'web', method }: {
  campaignIdentifier?: string | null
  manualCode?: string | null
  surface?: 'web' | 'fixes_mobile' | 'fixer_mobile'
  method?: 'url' | 'qr' | 'manual_code' | 'mobile_deep_link'
}) {
  if (!campaignIdentifier && !manualCode) return read()
  const existing = read()
  const currentVisit = visitId()
  const response = await api.post<{ token: string; expiresAt: string }>('/api/marketing/touch', {
    campaignIdentifier: campaignIdentifier || undefined,
    manualCode: manualCode || undefined,
    visitId: currentVisit,
    idempotencyKey: uuid(),
    surface,
    attributionMethod: method || (manualCode ? 'manual_code' : 'url'),
    isFirstTouch: !existing,
    utm: typeof window === 'undefined' ? {} : {
      source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
      medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
      campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
      content: new URLSearchParams(window.location.search).get('utm_content') || undefined,
    },
  }, true)
  const stored: StoredAttribution = {
    firstToken: existing?.firstToken || response.data.token,
    latestToken: response.data.token,
    expiresAt: response.data.expiresAt,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  return stored
}

export function registrationAttributionPayload({ manualCode, surface = 'web', analyticsConsent = true, directMarketingConsent = false }: {
  manualCode?: string
  surface?: 'web' | 'fixes_mobile' | 'fixer_mobile'
  analyticsConsent?: boolean
  directMarketingConsent?: boolean
} = {}) {
  const stored = read()
  return {
    firstToken: stored?.firstToken,
    token: stored?.latestToken,
    manualCode: manualCode?.trim() || undefined,
    visitId: typeof window === 'undefined' ? undefined : visitId(),
    idempotencyKey: uuid(),
    surface,
    analyticsConsent,
    directMarketingConsent,
  }
}

export function clearRegistrationAttribution() {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
}
