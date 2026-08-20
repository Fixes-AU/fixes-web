'use client'

import { useEffect, useReducer } from 'react'
import { BadgePercent, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import {
  type DiscountOptionSet,
  type DiscountPreview,
  discountPreviewErrorMessage,
  formatAudCents,
  loadDiscountPreviewAccess,
  validateDiscountPreview,
} from '@/lib/discount-preview'

type State = {
  access: 'loading' | 'hidden' | 'ready'
  code: string
  status: 'idle' | 'validating' | 'valid' | 'error' | 'stale'
  preview: DiscountPreview | null
  error: string
}

type Action =
  | { type: 'ACCESS_HIDDEN' }
  | { type: 'ACCESS_READY'; code: string }
  | { type: 'CODE_CHANGED'; code: string }
  | { type: 'SELECTION_CHANGED' }
  | { type: 'VALIDATING' }
  | { type: 'VALID'; preview: DiscountPreview }
  | { type: 'ERROR'; error: string }

const initialState: State = {
  access: 'loading', code: '', status: 'idle', preview: null, error: '',
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ACCESS_HIDDEN': return { ...state, access: 'hidden' }
    case 'ACCESS_READY': return { ...state, access: 'ready', code: state.code || action.code }
    case 'CODE_CHANGED': return {
      ...state, code: action.code, status: state.preview ? 'stale' : 'idle', preview: null, error: '',
    }
    case 'SELECTION_CHANGED': return state.preview
      ? { ...state, status: 'stale', preview: null, error: '' }
      : state
    case 'VALIDATING': return { ...state, status: 'validating', preview: null, error: '' }
    case 'VALID': return { ...state, status: 'valid', preview: action.preview, error: '' }
    case 'ERROR': return { ...state, status: 'error', preview: null, error: action.error }
  }
}

export function DiscountPreviewPanel({
  jobId,
  tier,
  optionSet,
  scheduledFor,
  onPreviewChange,
}: {
  jobId: string
  tier: string | null
  optionSet: DiscountOptionSet
  scheduledFor?: string
  onPreviewChange?: (preview: DiscountPreview | null) => void
}) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const selectionKey = `${jobId}:${tier || ''}:${optionSet}:${scheduledFor || ''}`

  useEffect(() => {
    let active = true
    loadDiscountPreviewAccess()
      .then(access => {
        if (!active) return
        if (!access.enabled || !access.allowed) dispatch({ type: 'ACCESS_HIDDEN' })
        else dispatch({ type: 'ACCESS_READY', code: access.availableOffer?.code || '' })
      })
      .catch(() => { if (active) dispatch({ type: 'ACCESS_HIDDEN' }) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    dispatch({ type: 'SELECTION_CHANGED' })
    onPreviewChange?.(null)
  }, [selectionKey])

  useEffect(() => {
    onPreviewChange?.(state.preview)
  }, [state.preview, onPreviewChange])

  if (state.access !== 'ready') return null

  const handleValidate = async () => {
    if (!tier || !state.code.trim()) return
    dispatch({ type: 'VALIDATING' })
    try {
      const preview = await validateDiscountPreview({
        jobId,
        tier,
        optionSet,
        ...(scheduledFor ? { scheduledFor } : {}),
        code: state.code,
        surface: 'web',
      })
      dispatch({ type: 'VALID', preview })
    } catch (error) {
      dispatch({ type: 'ERROR', error: discountPreviewErrorMessage(error) })
    }
  }

  const pricing = state.preview?.pricing
  const discountIncGst = pricing
    ? pricing.originalTotalIncGstCents - pricing.finalChargeCents
    : 0

  return (
    <section className="mb-6 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/60 p-4 sm:p-5" aria-label="Staff discount preview">
      <div className="mb-3 flex items-start gap-3">
        <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700"><BadgePercent className="h-5 w-5" /></div>
        <div>
          <p className="text-sm font-semibold text-indigo-950">Staff-only discount preview</p>
          <p className="text-xs leading-5 text-indigo-700">Validation only—this does not reserve the offer, change payment, or apply it to checkout.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={state.code}
          onChange={event => dispatch({ type: 'CODE_CHANGED', code: event.target.value.toUpperCase() })}
          placeholder="Discount code"
          autoCapitalize="characters"
          maxLength={64}
          className="min-w-0 flex-1 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="button"
          onClick={handleValidate}
          disabled={!tier || !state.code.trim() || state.status === 'validating'}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.status === 'validating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
          Validate
        </button>
      </div>

      {state.status === 'stale' && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700"><RefreshCw className="h-3.5 w-3.5" />Quote selection changed. Validate the code again.</p>
      )}
      {state.status === 'error' && <p className="mt-3 text-sm text-red-700">{state.error}</p>}

      {state.preview && pricing && (
        <div className="mt-4 rounded-xl border border-indigo-200 bg-white p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700">
            <CheckCircle2 className="h-4 w-4" /> {state.preview.offer.code} is eligible for this quote
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4 text-gray-600"><dt>Original subtotal</dt><dd>{formatAudCents(pricing.originalSubtotalExGstCents)}</dd></div>
            <div className="flex justify-between gap-4 text-gray-600"><dt>Original GST</dt><dd>{formatAudCents(pricing.originalGstCents)}</dd></div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-2 text-gray-600"><dt>Discount incl. GST</dt><dd className="font-semibold text-green-700">−{formatAudCents(discountIncGst)}</dd></div>
            <div className="flex justify-between gap-4 text-gray-600"><dt>Discounted subtotal</dt><dd>{formatAudCents(pricing.discountedSubtotalExGstCents)}</dd></div>
            <div className="flex justify-between gap-4 text-gray-600"><dt>Final GST</dt><dd>{formatAudCents(pricing.finalGstCents)}</dd></div>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 font-bold text-gray-950"><dt>Preview total</dt><dd>{formatAudCents(pricing.finalChargeCents)}</dd></div>
          </dl>
          <p className="mt-3 text-[11px] leading-4 text-gray-500">Preview expires {new Date(state.preview.previewExpiresAt).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}. Eligibility must be checked again before payment.</p>
        </div>
      )}
    </section>
  )
}
