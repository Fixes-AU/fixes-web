'use client'

import { useEffect, useState } from 'react'
import { ApiError } from '@/lib/api'
import {
  CHANNEL_OPTIONS, DiscountCode, DiscountCodeDraft, JOB_CATEGORY_OPTIONS, MarketingCampaign, codeToDraft, toDatetimeLocal,
} from '@/lib/marketing'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  campaign: MarketingCampaign
  code: DiscountCode | null
  busy: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draft: DiscountCodeDraft, token: string) => Promise<void>
}

const emptyDraft = (campaign: MarketingCampaign): DiscountCodeDraft => ({
  displayCode: '', purpose: 'attribution_and_discount', discountType: 'percentage',
  percentageBasisPoints: 2000, fixedAmountCents: null, maximumDiscountCents: 5000,
  minimumSubtotalCents: 10000, eligibleCategories: [], eligibleChannels: [], firstJobOnly: false,
  totalRedemptionLimit: null, perUserRedemptionLimit: 1,
  startsAt: toDatetimeLocal(campaign.startsAt), expiresAt: toDatetimeLocal(campaign.endsAt),
  fundingMode: 'platform_funded', stackingAllowed: false, appliesToRecurringFirstInstanceOnly: true,
  restrictionsSummary: null,
})

const centsToInput = (value: number | null) => value == null ? '' : String(value / 100)
const inputToCents = (value: string) => value.trim() === '' ? null : Math.round(Number(value) * 100)

export default function DiscountCodeDialog({ open, campaign, code, busy, onOpenChange, onSave }: Props) {
  const [draft, setDraft] = useState<DiscountCodeDraft>(() => emptyDraft(campaign))
  const [percentage, setPercentage] = useState('20')
  const [fixed, setFixed] = useState('')
  const [maximum, setMaximum] = useState('50')
  const [minimum, setMinimum] = useState('100')
  const [totalLimit, setTotalLimit] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!open) return
    const next = code ? codeToDraft(code) : emptyDraft(campaign)
    setDraft(next)
    setPercentage(next.percentageBasisPoints == null ? '' : String(next.percentageBasisPoints / 100))
    setFixed(centsToInput(next.fixedAmountCents))
    setMaximum(centsToInput(next.maximumDiscountCents))
    setMinimum(centsToInput(next.minimumSubtotalCents))
    setTotalLimit(next.totalRedemptionLimit == null ? '' : String(next.totalRedemptionLimit))
    setConfirming(false)
    setError(null)
  }, [campaign, code, open])

  const locked = Boolean(code?.termsLockedAt)
  const set = <K extends keyof DiscountCodeDraft>(key: K, value: DiscountCodeDraft[K]) => setDraft(current => ({ ...current, [key]: value }))
  const toggle = (key: 'eligibleCategories' | 'eligibleChannels', value: string) => set(key, draft[key].includes(value)
    ? draft[key].filter(item => item !== value)
    : [...draft[key], value])

  const buildDraft = () => {
    const attributionOnly = draft.purpose === 'attribution_only'
    const percentageBasisPoints = attributionOnly || draft.discountType !== 'percentage' ? null : Math.round(Number(percentage) * 100)
    const fixedAmountCents = attributionOnly || draft.discountType !== 'fixed_aud' ? null : inputToCents(fixed)
    const result: DiscountCodeDraft = {
      ...draft,
      displayCode: draft.displayCode.trim().toUpperCase(),
      discountType: attributionOnly ? null : draft.discountType,
      percentageBasisPoints,
      fixedAmountCents,
      maximumDiscountCents: attributionOnly ? null : inputToCents(maximum),
      minimumSubtotalCents: attributionOnly ? 0 : (inputToCents(minimum) || 0),
      totalRedemptionLimit: totalLimit.trim() ? Number(totalLimit) : null,
    }
    if (!result.displayCode || (!attributionOnly && result.discountType === 'percentage' && (!percentageBasisPoints || percentageBasisPoints >= 10000))) {
      throw new ApiError('Enter a valid code and a percentage greater than 0% and below 100%.', 422, { code: 'VALIDATION_FAILED' })
    }
    return result
  }

  const requestConfirmation = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    try {
      setDraft(buildDraft())
      setConfirming(true)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause : new ApiError('Discount terms are invalid.', 422))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={value => !busy && !confirming && onOpenChange(value)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" showCloseButton={!busy}>
          <DialogHeader>
            <DialogTitle>{code ? 'Edit discount code' : 'Create discount code'}</DialogTitle>
            <DialogDescription>One code per job, no stacking, no 100% offers, and only the first recurring instance are enforced by the server.</DialogDescription>
          </DialogHeader>
          <form onSubmit={requestConfirmation} className="space-y-5">
            {locked && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">These financial terms are locked after their first reservation. Create a new code for material changes.</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}{error.requestId && <span className="block text-[10px] mt-1">Request ID: {error.requestId}</span>}</div>}
            <fieldset disabled={locked || busy} className="space-y-5 disabled:opacity-60">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Code"><Input value={draft.displayCode} required maxLength={64} onChange={event => set('displayCode', event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} placeholder="COFFEE20" /></Field>
                <Field label="Purpose"><select value={draft.purpose} onChange={event => set('purpose', event.target.value as DiscountCodeDraft['purpose'])} className={selectClass}><option value="attribution_and_discount">Attribution + discount</option><option value="discount_only">Discount only</option><option value="attribution_only">Attribution only</option></select></Field>
                <Field label="Funding"><Input value="Fixes platform funded" readOnly /></Field>
                {draft.purpose !== 'attribution_only' && <>
                  <Field label="Discount type"><select value={draft.discountType || 'percentage'} onChange={event => set('discountType', event.target.value as DiscountCodeDraft['discountType'])} className={selectClass}><option value="percentage">Percentage</option><option value="fixed_aud">Fixed AUD</option></select></Field>
                  {draft.discountType === 'percentage' ? <Field label="Percentage" hint="Must stay below 100%"><Input type="number" min="0.01" max="99" step="0.01" value={percentage} required onChange={event => setPercentage(event.target.value)} /></Field> : <Field label="Fixed discount (AUD)"><Input type="number" min="0.01" step="0.01" value={fixed} required onChange={event => setFixed(event.target.value)} /></Field>}
                  <Field label="Maximum discount (AUD)" hint="Required safeguard for percentage offers"><Input type="number" min="0.01" step="0.01" value={maximum} onChange={event => setMaximum(event.target.value)} /></Field>
                  <Field label="Minimum eligible subtotal (AUD)"><Input type="number" min="0" step="0.01" value={minimum} onChange={event => setMinimum(event.target.value)} /></Field>
                </>}
                <Field label="Total usage cap" hint="Blank means no code-level cap"><Input type="number" min="1" step="1" value={totalLimit} onChange={event => setTotalLimit(event.target.value)} /></Field>
                <Field label="Per-user cap"><Input type="number" min="1" step="1" value={draft.perUserRedemptionLimit} required onChange={event => set('perUserRedemptionLimit', Number(event.target.value))} /></Field>
                <Field label="Starts"><Input type="datetime-local" value={draft.startsAt} required onChange={event => set('startsAt', event.target.value)} /></Field>
                <Field label="Expires"><Input type="datetime-local" value={draft.expiresAt} required onChange={event => set('expiresAt', event.target.value)} /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={draft.firstJobOnly} onChange={event => set('firstJobOnly', event.target.checked)} /> First authorized job only</label>
              <OptionGrid title="Eligible job categories" subtitle="No selection means every category" options={JOB_CATEGORY_OPTIONS} selected={draft.eligibleCategories} onToggle={value => toggle('eligibleCategories', value)} />
              <OptionGrid title="Eligible fulfillment channels" subtitle="No selection means every marketplace/channel" options={CHANNEL_OPTIONS} selected={draft.eligibleChannels} onToggle={value => toggle('eligibleChannels', value)} />
              <Field label="Customer restrictions summary"><Textarea value={draft.restrictionsSummary || ''} maxLength={1500} rows={3} onChange={event => set('restrictionsSummary', event.target.value || null)} /></Field>
            </fieldset>
            <DialogFooter>
              <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={busy || locked}>{code ? 'Review and save' : 'Review and create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AdminActionConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={code ? 'Confirm financial term changes' : 'Confirm discount offer'}
        description="Review the amount, limits, eligibility and campaign dates. Your password confirmation is recorded in the admin audit trail."
        action="campaign:financial_terms"
        confirmLabel={code ? 'Save code' : 'Create code'}
        onConfirm={async token => {
          try { await onSave(draft, token); onOpenChange(false) }
          catch (cause) { setError(cause instanceof ApiError ? cause : new ApiError('Code could not be saved.', 500)); throw cause }
        }}
      />
    </>
  )
}

const selectClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-sm font-medium text-gray-700"><span>{label}</span>{children}{hint && <span className="block text-[11px] font-normal text-gray-400">{hint}</span>}</label>
}

function OptionGrid({ title, subtitle, options, selected, onToggle }: { title: string; subtitle: string; options: readonly string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <section className="rounded-xl border border-gray-200 p-4"><div className="mb-3"><h3 className="text-sm font-semibold text-gray-800">{title}</h3><p className="text-[11px] text-gray-400">{subtitle}</p></div><div className="flex flex-wrap gap-2">{options.map(option => <button key={option} type="button" onClick={() => onToggle(option)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold capitalize ${selected.includes(option) ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'}`}>{option.replaceAll('_', ' ')}</button>)}</div></section>
}
