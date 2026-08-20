import { api, ApiError } from './api'
import type { DiscountOptionSet, DiscountPreview } from './discount-preview'

const STORAGE_PREFIX = 'fixes_discount_checkout_v1:'

export type DiscountCheckoutState =
  | 'preparing'
  | 'reserving'
  | 'requires_payment_method'
  | 'requires_action'
  | 'reserved'
  | 'scheduled_committed'
  | 'reconciliation_required'
  | 'processor_creating'
  | 'authorized'
  | 'captured'
  | 'cancelled'
  | 'expired'
  | 'failed_retryable'
  | 'refunded'
  | 'disputed'
  | 'failed_terminal'

export interface DiscountFinancialPricing {
  currency: 'aud'
  originalServiceSubtotalExGstCents: number
  scopeVariationSubtotalExGstCents: number
  eligibleSubtotalExGstCents: number
  discountExGstCents: number
  discountGstEffectCents: number
  discountedTaxableSubtotalExGstCents: number
  gstCents: number
  originalGstCents: number
  originalTotalIncGstCents: number
  clientChargeIncGstCents: number
  platformSubsidyCents: number
  fundingMode: string
  calculationPolicyVersion: string
  customerFacingCampaignLabel: string | null
  customerFacingCodeDisplay: string | null
}

export interface DiscountCheckoutSelection {
  jobId: string
  tier: string
  optionSet: DiscountOptionSet
  scheduledFor: string | null
  discountCode: string
}

export interface DiscountCheckoutResponse {
  checkoutAttemptId: string
  paymentId: string | null
  paymentIntentId: string | null
  setupIntentId: string | null
  clientSecret: string | null
  ephemeralKey: string | null
  customer: string | null
  state: DiscountCheckoutState
  scheduledCommitment: boolean
  reservationExpiresAt: string
  absoluteExpiresAt: string
  authorizationDueAt: string | null
  pricing: DiscountFinancialPricing
}

export interface PersistedDiscountCheckout {
  version: 1
  selection: DiscountCheckoutSelection
  idempotencyKey: string
  checkoutAttemptId: string | null
  state: DiscountCheckoutState
  scheduledCommitment: boolean | null
  reservationExpiresAt: string | null
  absoluteExpiresAt: string | null
  updatedAt: string
}

const storageKey = (jobId: string) => `${STORAGE_PREFIX}${jobId}`

export const createFinancialIdempotencyKey = (operation = 'checkout') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${operation}_${crypto.randomUUID()}`
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(24))
    return `${operation}_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`
  }
  throw new Error('Secure checkout identifier generation is unavailable in this browser.')
}

const sameSelection = (left: DiscountCheckoutSelection, right: DiscountCheckoutSelection) => (
  left.jobId === right.jobId &&
  left.tier === right.tier &&
  left.optionSet === right.optionSet &&
  left.scheduledFor === right.scheduledFor &&
  left.discountCode.trim().toUpperCase() === right.discountCode.trim().toUpperCase()
)

export const selectionFromPreview = (preview: DiscountPreview): DiscountCheckoutSelection => ({
  jobId: preview.selection.jobId,
  tier: preview.selection.tier,
  optionSet: preview.selection.optionSet,
  scheduledFor: preview.selection.scheduledFor,
  discountCode: preview.offer.code.trim().toUpperCase(),
})

export const loadPersistedDiscountCheckout = (jobId: string): PersistedDiscountCheckout | null => {
  if (typeof window === 'undefined') return null
  try {
    const parsed = JSON.parse(sessionStorage.getItem(storageKey(jobId)) || 'null') as PersistedDiscountCheckout | null
    if (!parsed || parsed.version !== 1 || parsed.selection?.jobId !== jobId || !parsed.idempotencyKey) return null
    return parsed
  } catch {
    sessionStorage.removeItem(storageKey(jobId))
    return null
  }
}

export const prepareDiscountCheckout = (selection: DiscountCheckoutSelection): PersistedDiscountCheckout => {
  const existing = loadPersistedDiscountCheckout(selection.jobId)
  if (existing && sameSelection(existing.selection, selection) && existing.state !== 'failed_terminal') return existing
  const next: PersistedDiscountCheckout = {
    version: 1,
    selection,
    idempotencyKey: createFinancialIdempotencyKey(),
    checkoutAttemptId: null,
    state: 'preparing',
    scheduledCommitment: null,
    reservationExpiresAt: null,
    absoluteExpiresAt: null,
    updatedAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') sessionStorage.setItem(storageKey(selection.jobId), JSON.stringify(next))
  return next
}

const persistResponse = (request: PersistedDiscountCheckout, response: DiscountCheckoutResponse) => {
  const next: PersistedDiscountCheckout = {
    ...request,
    checkoutAttemptId: response.checkoutAttemptId,
    state: response.state,
    scheduledCommitment: response.scheduledCommitment,
    reservationExpiresAt: response.reservationExpiresAt,
    absoluteExpiresAt: response.absoluteExpiresAt,
    updatedAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined') sessionStorage.setItem(storageKey(request.selection.jobId), JSON.stringify(next))
  return next
}

export const beginDiscountCheckout = async (request: PersistedDiscountCheckout) => {
  const { selection } = request
  const envelope = await api.raw<{ data: DiscountCheckoutResponse }>(
    `/api/jobs/${selection.jobId}/accept-quote`,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': request.idempotencyKey },
      body: {
        tier: selection.tier,
        optionSet: selection.optionSet,
        ...(selection.scheduledFor ? { scheduledFor: selection.scheduledFor } : {}),
        discountCode: selection.discountCode,
      },
    }
  )
  persistResponse(request, envelope.data)
  return envelope.data
}

export const retryDiscountSavedCard = async ({
  request,
  paymentMethodId,
}: {
  request: PersistedDiscountCheckout
  paymentMethodId: string
}) => {
  if (!request.checkoutAttemptId) throw new Error('Checkout recovery information is unavailable.')
  const retryKey = `${request.idempotencyKey}_pm_${paymentMethodId}`
  const envelope = await api.raw<{ data: DiscountCheckoutResponse }>(
    `/api/payments/checkout-attempts/${request.checkoutAttemptId}/retry`,
    {
      method: 'POST',
      headers: { 'Idempotency-Key': retryKey },
      body: { paymentMethodId },
    }
  )
  persistResponse(request, envelope.data)
  return envelope.data
}

export const clearPersistedDiscountCheckout = (jobId: string) => {
  if (typeof window !== 'undefined') sessionStorage.removeItem(storageKey(jobId))
}

const CHECKOUT_ERROR_MESSAGES: Record<string, string> = {
  DISCOUNT_PREVIEW_STALE: 'The quote or offer changed. Validate the discount again.',
  DISCOUNT_RESERVATION_EXPIRED: 'The discount reservation expired. Return to the quote and validate again.',
  PAYMENT_ATTEMPT_IN_PROGRESS: 'Checkout is still being prepared. Please wait a moment and try again.',
  PAYMENT_ATTEMPT_LIMIT_REACHED: 'Too many payment methods were tried for this checkout. Please contact support.',
  PAYMENT_ATTEMPT_RATE_LIMITED: 'Too many payment attempts were made. Please wait before trying again.',
  PAYMENT_METHOD_DECLINED: 'That payment method was declined. Choose another payment method.',
  PAYMENT_METHOD_REJECTED: 'That payment method cannot be used. Choose another payment method.',
  PAYMENT_RECONCILIATION_REQUIRED: 'Payment status is being checked. Do not submit another payment; refresh shortly.',
  PAYMENT_PROVIDER_UNAVAILABLE: 'Payments are temporarily unavailable. Your checkout can be safely retried.',
  IDEMPOTENCY_KEY_REUSED: 'This checkout changed. Return to the quote and start again.',
  JOB_STATE_CONFLICT: 'The job changed while checkout was open. Refresh the job before continuing.',
}

export const discountCheckoutErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) return CHECKOUT_ERROR_MESSAGES[error.code] || error.message
  return error instanceof Error ? error.message : 'Checkout could not be started. Please try again.'
}
