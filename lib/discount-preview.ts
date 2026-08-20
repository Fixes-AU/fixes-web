import { api, ApiError } from './api'

export type DiscountOptionSet = 'standard' | 'morning' | 'weekday'

export interface DiscountAvailableOffer {
  code: string
  discountType: 'percentage' | 'fixed_aud'
  percentageBasisPoints: number | null
  fixedAmountCents: number | null
  maximumDiscountCents: number | null
  minimumSubtotalCents: number
  expiresAt: string
  restrictionsSummary: string | null
}

export interface DiscountPreviewAccess {
  enabled: boolean
  allowed: boolean
  availableOffer: DiscountAvailableOffer | null
}

export interface DiscountPricingPreview {
  currency: 'aud'
  originalSubtotalExGstCents: number
  discountExGstCents: number
  discountedSubtotalExGstCents: number
  originalGstCents: number
  finalGstCents: number
  originalTotalIncGstCents: number
  finalChargeCents: number
  platformSubsidyCents: number
  fundingMode: string
  taxBasis: 'subtotal_ex_gst'
}

export interface DiscountPreview {
  previewOnly: true
  reservesCapacity: false
  validationReference: string
  pricingFingerprint: string
  previewExpiresAt: string
  offer: DiscountAvailableOffer & { campaignName: string }
  selection: {
    jobId: string
    quoteId: string
    tier: string
    optionSet: DiscountOptionSet
    scheduledFor: string | null
    category: string
    channel: string
  }
  pricing: DiscountPricingPreview
}

export interface ValidateDiscountPreviewInput {
  jobId: string
  tier: string
  optionSet: DiscountOptionSet
  scheduledFor?: string
  code?: string
  surface: 'web' | 'fixes_mobile'
}

export const loadDiscountPreviewAccess = async () => (
  (await api.get<DiscountPreviewAccess>('/api/marketing/discounts/access')).data
)

export const validateDiscountPreview = async (input: ValidateDiscountPreviewInput) => (
  (await api.post<DiscountPreview>('/api/marketing/discounts/validate', { ...input })).data
)

export const formatAudCents = (cents: number) => new Intl.NumberFormat('en-AU', {
  style: 'currency', currency: 'AUD', minimumFractionDigits: 2,
}).format(cents / 100)

const DISCOUNT_ERROR_MESSAGES: Record<string, string> = {
  DISCOUNT_CODE_FORMAT_INVALID: 'Use 3–64 letters, numbers, hyphens, or underscores.',
  DISCOUNT_CODE_UNAVAILABLE: 'That code is unavailable. Check it and try again.',
  DISCOUNT_CODE_NOT_STARTED: 'This offer has not started yet.',
  DISCOUNT_CODE_EXPIRED: 'This offer has expired.',
  DISCOUNT_CODE_PAUSED: 'This offer is temporarily paused.',
  DISCOUNT_CODE_REVOKED: 'This offer has been withdrawn.',
  DISCOUNT_CODE_EXHAUSTED: 'This offer has reached its usage limit.',
  CAMPAIGN_BUDGET_EXHAUSTED: 'This campaign has reached its budget.',
  DISCOUNT_AUDIENCE_INELIGIBLE: 'This offer is not available for this account type.',
  DISCOUNT_JOB_INELIGIBLE: 'This quote is not eligible for that offer.',
  DISCOUNT_CATEGORY_INELIGIBLE: 'This job category is not eligible for that offer.',
  DISCOUNT_CHANNEL_INELIGIBLE: 'This service channel is not eligible for that offer.',
  DISCOUNT_FIRST_JOB_REQUIRED: 'This offer is only available for a first authorized job.',
  DISCOUNT_MINIMUM_SPEND_NOT_MET: 'This quote does not meet the offer minimum spend.',
  DISCOUNT_USER_LIMIT_REACHED: 'This account has reached the offer usage limit.',
  DISCOUNT_FINAL_AMOUNT_TOO_LOW: 'That discount would make the final charge too low.',
  DISCOUNT_PREVIEW_STALE: 'The quote or offer changed. Refresh it and validate again.',
  RATE_LIMITED: 'Too many attempts. Wait a few minutes and try again.',
}

export const discountPreviewErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return DISCOUNT_ERROR_MESSAGES[error.code] || error.message
  return 'The discount could not be validated. Please try again.'
}
