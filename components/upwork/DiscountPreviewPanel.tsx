'use client'

import { useEffect, useReducer } from 'react'
import { BadgePercent, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import {
  type DiscountOptionSet,
  type DiscountPreview,
  discountPreviewErrorMessage,
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

  return (
    <section className="mb-5 rounded-xl border border-gray-200 bg-white p-3" aria-label="Discount code">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <BadgePercent className="h-4 w-4 text-[var(--upwork-green)]" />
        Discount code
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={state.code}
          onChange={event => dispatch({ type: 'CODE_CHANGED', code: event.target.value.toUpperCase() })}
          placeholder="Discount code"
          autoCapitalize="characters"
          maxLength={64}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold uppercase tracking-wide text-gray-900 outline-none focus:border-[var(--upwork-green)] focus:ring-2 focus:ring-green-100"
        />
        <button
          type="button"
          onClick={handleValidate}
          disabled={!tier || !state.code.trim() || state.status === 'validating'}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--upwork-green)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--upwork-green-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.status === 'validating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgePercent className="h-4 w-4" />}
          Apply
        </button>
      </div>

      {state.status === 'stale' && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700"><RefreshCw className="h-3.5 w-3.5" />Quote selection changed. Validate the code again.</p>
      )}
      {state.status === 'error' && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
      {state.preview && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> {state.preview.offer.code} applied. The selected quote now shows your discount.
        </p>
      )}
    </section>
  )
}
