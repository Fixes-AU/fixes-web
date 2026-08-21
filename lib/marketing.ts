import { api } from '@/lib/api'

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'archived'
export type CampaignAudience = 'client' | 'fixer'
export type DiscountCodeStatus = 'draft' | 'active' | 'paused' | 'revoked' | 'exhausted' | 'expired'
export type DiscountCodePurpose = 'attribution_only' | 'discount_only' | 'attribution_and_discount'
export type DiscountType = 'percentage' | 'fixed_aud'

export interface MarketingAccess {
  canView: boolean
  canManage: boolean
  canExport: boolean
}

export interface MarketingCampaign {
  _id: string
  internalName: string
  publicName: string
  publicIdentifier: string
  status: CampaignStatus
  audiences: CampaignAudience[]
  tracking: { source?: string | null; medium?: string | null; channel?: string | null; content?: string | null; utmId?: string | null }
  physicalPartner?: { venueName?: string | null; branch?: string | null; suburb?: string | null; placementNotes?: string | null }
  startsAt: string
  endsAt: string
  timezone: string
  ownerId: string
  defaultSignupCodeId?: string | null
  budgetCents: number | null
  reservedBudgetCents: number
  authorizedBudgetCents: number
  redeemedBudgetCents: number
  termsSummary: string
  costNotes?: string | null
  termsLockedAt?: string | null
  lastStateReason?: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export interface DiscountCode {
  _id: string
  campaignId: string
  displayCode: string
  purpose: DiscountCodePurpose
  status: DiscountCodeStatus
  discountType: DiscountType | null
  percentageBasisPoints: number | null
  fixedAmountCents: number | null
  maximumDiscountCents: number | null
  minimumSubtotalCents: number
  eligibleCategories: string[]
  eligibleChannels: string[]
  firstJobOnly: boolean
  totalRedemptionLimit: number | null
  perUserRedemptionLimit: number
  reservedCount: number
  authorizedCount: number
  redeemedCount: number
  startsAt: string
  expiresAt: string
  fundingMode: 'platform_funded'
  restrictionsSummary?: string | null
  termsLockedAt?: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export interface CampaignDraft {
  internalName: string
  publicName: string
  publicIdentifier: string
  audiences: CampaignAudience[]
  startsAt: string
  endsAt: string
  timezone: string
  ownerId: string
  budgetCents: number | null
  termsSummary: string
  costNotes: string | null
  tracking: { source: string | null; medium: string | null; channel: string | null; content: string | null; utmId: string | null }
  physicalPartner: { venueName: string | null; branch: string | null; suburb: string | null; placementNotes: string | null }
}

export interface DiscountCodeDraft {
  displayCode: string
  purpose: DiscountCodePurpose
  discountType: DiscountType | null
  percentageBasisPoints: number | null
  fixedAmountCents: number | null
  maximumDiscountCents: number | null
  minimumSubtotalCents: number
  eligibleCategories: string[]
  eligibleChannels: string[]
  firstJobOnly: boolean
  totalRedemptionLimit: number | null
  perUserRedemptionLimit: number
  startsAt: string
  expiresAt: string
  fundingMode: 'platform_funded'
  stackingAllowed: false
  appliesToRecurringFirstInstanceOnly: true
  restrictionsSummary: string | null
}

export interface MarketingAnalytics {
  range: { from: string; to: string; timezone: string }
  funnel: { eventType: string; count: number; conversionBaseEvent: string | null; conversionFromPrevious: number | null; approximate: boolean }[]
  daily: Array<Record<string, string | number>>
  audience: { audience: string; count: number }[]
  campaignStates: { status: CampaignStatus; count: number; budgetCents: number; committedCents: number }[]
}

export interface MarketingAuditEntry {
  _id: string
  actorId: string
  action: string
  resourceType: 'campaign' | 'discount_code' | 'attribution_adjustment' | 'export'
  resourceId: string
  reason?: string | null
  requestId?: string | null
  createdAt: string
}

export interface MarketingBulkJob {
  _id: string
  campaignId: string
  batchId: string
  status: 'pending' | 'processing' | 'retry_scheduled' | 'completed' | 'partial_failed' | 'failed'
  requestedCount: number
  generatedCount: number
  failedCount: number
  codePrefix: string
  resultExpiresAt?: string | null
  lastErrorCode?: string | null
  createdAt: string
}

export interface MarketingOperationalIncident {
  id: string
  kind: 'checkout_reconciliation' | 'stripe_webhook_dead_letter' | 'financial_document_dead_letter'
  severity: 'critical' | 'warning'
  occurredAt: string
  summary: string
  errorCode: string
  attempts: number
  references: {
    checkoutAttemptId: string | null
    jobId: string | null
    paymentId: string | null
    campaignId: string | null
    processorObjectId: string | null
    requestId: string | null
    documentId?: string | null
    documentNumber?: string | null
  }
}

export interface MarketingOperations {
  generatedAt: string
  featureFlags: {
    marketingPanelEnabled: boolean
    attributionEnabled: boolean
    discountValidationEnabled: boolean
    discountCheckoutEnabled: boolean
    stripeWebhookInboxEnabled: boolean
    financialEnvironmentApproved: boolean
    rolloutMode: string
    rolloutCampaignCount: number
  }
  activation: {
    ready: boolean
    blockers: string[]
    transaction: { ready: boolean; topology: string; reason: string | null; logicalSessionTimeoutMinutes: number | null }
    checks: { name: string; ready: boolean; reason: string | null; missing: string[] }[]
  }
  incidentCounts: { checkoutReconciliation: number; webhookDeadLetters: number; financialDocumentDeadLetters: number }
  incidents: MarketingOperationalIncident[]
  ownership: { technical: string; operational: string }
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft', scheduled: 'Scheduled', active: 'Active', paused: 'Paused', ended: 'Ended', archived: 'Archived',
}

export const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-600', scheduled: 'bg-blue-100 text-blue-700', active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700', ended: 'bg-slate-100 text-slate-600', archived: 'bg-zinc-100 text-zinc-500',
}

export const JOB_CATEGORY_OPTIONS = [
  'electrical', 'plumbing', 'hvac', 'plastering', 'painting', 'flooring', 'carpentry', 'roofing',
  'emergency_make_safe', 'general_labourer', 'handyman', 'gardening_landscaping', 'auto_care', 'other', 'cleaning', 'waste_removal',
] as const

export const CHANNEL_OPTIONS = [
  'marketplace', 'auto_care', 'cleaning_agency', 'waste_removal', 'direct_contract_agency', 'recurring_service',
] as const

export const formatAud = (cents: number | null | undefined) => cents == null
  ? 'Unlimited'
  : new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(cents / 100)

export const toDatetimeLocal = (value: string | Date) => {
  const date = new Date(value)
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return shifted.toISOString().slice(0, 16)
}

export const toIso = (localValue: string) => new Date(localValue).toISOString()

export const campaignToDraft = (campaign: MarketingCampaign): CampaignDraft => ({
  internalName: campaign.internalName,
  publicName: campaign.publicName,
  publicIdentifier: campaign.publicIdentifier,
  audiences: [...campaign.audiences],
  startsAt: toDatetimeLocal(campaign.startsAt),
  endsAt: toDatetimeLocal(campaign.endsAt),
  timezone: campaign.timezone,
  ownerId: String(campaign.ownerId),
  budgetCents: campaign.budgetCents,
  termsSummary: campaign.termsSummary,
  costNotes: campaign.costNotes || null,
  tracking: {
    source: campaign.tracking?.source || null, medium: campaign.tracking?.medium || null,
    channel: campaign.tracking?.channel || null, content: campaign.tracking?.content || null,
    utmId: campaign.tracking?.utmId || null,
  },
  physicalPartner: {
    venueName: campaign.physicalPartner?.venueName || null, branch: campaign.physicalPartner?.branch || null,
    suburb: campaign.physicalPartner?.suburb || null, placementNotes: campaign.physicalPartner?.placementNotes || null,
  },
})

export const codeToDraft = (code: DiscountCode): DiscountCodeDraft => ({
  displayCode: code.displayCode,
  purpose: code.purpose,
  discountType: code.discountType,
  percentageBasisPoints: code.percentageBasisPoints,
  fixedAmountCents: code.fixedAmountCents,
  maximumDiscountCents: code.maximumDiscountCents,
  minimumSubtotalCents: code.minimumSubtotalCents,
  eligibleCategories: [...code.eligibleCategories],
  eligibleChannels: [...code.eligibleChannels],
  firstJobOnly: code.firstJobOnly,
  totalRedemptionLimit: code.totalRedemptionLimit,
  perUserRedemptionLimit: code.perUserRedemptionLimit,
  startsAt: toDatetimeLocal(code.startsAt),
  expiresAt: toDatetimeLocal(code.expiresAt),
  fundingMode: 'platform_funded',
  stackingAllowed: false,
  appliesToRecurringFirstInstanceOnly: true,
  restrictionsSummary: code.restrictionsSummary || null,
})

export const marketingApi = {
  access: () => api.get<{ access: MarketingAccess }>('/api/admin/marketing/access'),
  campaigns: (params: URLSearchParams) => api.get<{ campaigns: MarketingCampaign[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/api/admin/marketing/campaigns?${params}`),
  campaign: (id: string) => api.get<{ campaign: MarketingCampaign }>(`/api/admin/marketing/campaigns/${id}`),
  codes: (id: string) => api.get<{ codes: DiscountCode[] }>(`/api/admin/marketing/campaigns/${id}/codes`),
  createCampaign: (draft: CampaignDraft) => api.post<{ campaign: MarketingCampaign }>('/api/admin/marketing/campaigns', serializeCampaign(draft)),
  updateCampaign: (id: string, version: number, draft: CampaignDraft) => api.raw<{ data: { campaign: MarketingCampaign } }>(`/api/admin/marketing/campaigns/${id}`, {
    method: 'PATCH', headers: { 'If-Match': `"${version}"` }, body: serializeCampaign(draft),
  }),
  transitionCampaign: (id: string, version: number, nextStatus: CampaignStatus, reason: string, token: string) => api.raw<{ data: { campaign: MarketingCampaign } }>(`/api/admin/marketing/campaigns/${id}/transition`, {
    method: 'POST', headers: { 'If-Match': `"${version}"`, 'X-Admin-Action-Token': token }, body: { nextStatus, reason },
  }),
  setDefaultSignupOffer: (id: string, version: number, codeId: string | null, token: string) => api.raw<{ data: { campaign: MarketingCampaign } }>(`/api/admin/marketing/campaigns/${id}/default-signup-offer`, {
    method: 'PATCH', headers: { 'If-Match': `"${version}"`, 'X-Admin-Action-Token': token }, body: { codeId },
  }),
  createCode: (campaignId: string, draft: DiscountCodeDraft, token: string) => api.raw<{ data: { code: DiscountCode } }>(`/api/admin/marketing/campaigns/${campaignId}/codes`, {
    method: 'POST', headers: { 'X-Admin-Action-Token': token }, body: serializeCode(draft),
  }),
  updateCode: (campaignId: string, codeId: string, version: number, draft: DiscountCodeDraft, token: string) => api.raw<{ data: { code: DiscountCode } }>(`/api/admin/marketing/campaigns/${campaignId}/codes/${codeId}`, {
    method: 'PATCH', headers: { 'If-Match': `"${version}"`, 'X-Admin-Action-Token': token }, body: serializeCode(draft),
  }),
  transitionCode: (campaignId: string, codeId: string, version: number, nextStatus: DiscountCodeStatus, reason: string, token: string) => api.raw<{ data: { code: DiscountCode } }>(`/api/admin/marketing/campaigns/${campaignId}/codes/${codeId}/transition`, {
    method: 'POST', headers: { 'If-Match': `"${version}"`, 'X-Admin-Action-Token': token }, body: { nextStatus, reason },
  }),
  analytics: (params: URLSearchParams) => api.get<MarketingAnalytics>(`/api/admin/marketing/analytics?${params}`),
  operations: () => api.get<MarketingOperations>('/api/admin/marketing/operations?limit=50'),
  audit: (params: URLSearchParams) => api.get<{ items: MarketingAuditEntry[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/api/admin/marketing/audit?${params}`),
  export: (type: 'campaigns' | 'codes' | 'funnel', params: URLSearchParams) => api.getBlob(`/api/admin/marketing/exports/${type}?${params}`),
  bulkJobs: (campaignId: string) => api.get<{ jobs: MarketingBulkJob[] }>(`/api/admin/marketing/campaigns/${campaignId}/bulk-jobs`),
  createBulkJob: (campaignId: string, version: number, count: number, prefix: string, template: DiscountCodeDraft, batchId: string, token: string) => api.raw<{ data: { job: MarketingBulkJob } }>(`/api/admin/marketing/campaigns/${campaignId}/codes/bulk`, {
    method: 'POST', headers: { 'If-Match': `"${version}"`, 'X-Admin-Action-Token': token },
    body: { count, prefix, batchId, template: serializeCode(template) },
  }),
  bulkResult: (jobId: string) => api.getBlob(`/api/admin/marketing/bulk-jobs/${jobId}/result`),
}

const serializeCampaign = (draft: CampaignDraft): Record<string, unknown> => ({
  ...draft,
  startsAt: toIso(draft.startsAt),
  endsAt: toIso(draft.endsAt),
})

const serializeCode = (draft: DiscountCodeDraft): Record<string, unknown> => ({
  ...draft,
  startsAt: toIso(draft.startsAt),
  expiresAt: toIso(draft.expiresAt),
})
