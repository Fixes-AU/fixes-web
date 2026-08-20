'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { CampaignAudience, CampaignDraft, MarketingCampaign, campaignToDraft, toDatetimeLocal } from '@/lib/marketing'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  campaign: MarketingCampaign | null
  ownerId: string
  busy: boolean
  onOpenChange: (open: boolean) => void
  onSave: (draft: CampaignDraft) => Promise<void>
}

const newDraft = (ownerId: string): CampaignDraft => {
  const now = new Date()
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return {
    internalName: '', publicName: '', publicIdentifier: '', audiences: ['client'],
    startsAt: toDatetimeLocal(now), endsAt: toDatetimeLocal(end), timezone: 'Australia/Sydney', ownerId,
    budgetCents: null, termsSummary: '', costNotes: null,
    tracking: { source: null, medium: null, channel: null, content: null, utmId: null },
    physicalPartner: { venueName: null, branch: null, suburb: null, placementNotes: null },
  }
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100)

export default function CampaignFormDialog({ open, campaign, ownerId, busy, onOpenChange, onSave }: Props) {
  const [draft, setDraft] = useState<CampaignDraft>(() => newDraft(ownerId))
  const [budgetDollars, setBudgetDollars] = useState('')
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (!open) return
    const next = campaign ? campaignToDraft(campaign) : newDraft(ownerId)
    setDraft(next)
    setBudgetDollars(next.budgetCents == null ? '' : String(next.budgetCents / 100))
    setError(null)
  }, [campaign, open, ownerId])

  const fieldErrors = useMemo(() => new Map(error?.fieldErrors.map(item => [item.path, item.message]) || []), [error])
  const locked = Boolean(campaign?.termsLockedAt)
  const set = <K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => setDraft(current => ({ ...current, [key]: value }))
  const setTracking = (key: keyof CampaignDraft['tracking'], value: string) => setDraft(current => ({
    ...current, tracking: { ...current.tracking, [key]: value.trim() ? value : null },
  }))
  const setPartner = (key: keyof CampaignDraft['physicalPartner'], value: string) => setDraft(current => ({
    ...current, physicalPartner: { ...current.physicalPartner, [key]: value.trim() ? value : null },
  }))
  const toggleAudience = (audience: CampaignAudience) => set('audiences', draft.audiences.includes(audience)
    ? draft.audiences.filter(item => item !== audience)
    : [...draft.audiences, audience])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!draft.audiences.length) {
      setError(new ApiError('Select at least one audience.', 422, {
        code: 'CAMPAIGN_TERMS_INCOMPLETE', fieldErrors: [{ path: 'audiences', code: 'REQUIRED', message: 'Select at least one audience' }],
      }))
      return
    }
    const amount = budgetDollars.trim() === '' ? null : Math.round(Number(budgetDollars) * 100)
    if (amount != null && (!Number.isSafeInteger(amount) || amount < 0)) {
      setError(new ApiError('Budget must be a valid non-negative AUD amount.', 422, { code: 'VALIDATION_FAILED' }))
      return
    }
    try {
      await onSave({ ...draft, budgetCents: amount })
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause : new ApiError('Campaign could not be saved.', 500))
    }
  }

  return (
    <Dialog open={open} onOpenChange={value => !busy && onOpenChange(value)}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" showCloseButton={!busy}>
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit campaign' : 'Create campaign'}</DialogTitle>
          <DialogDescription>
            Campaign dates use Australia/Sydney time. Financial values are stored as integer cents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          {locked && <Notice>Material dates and budget are locked because this campaign has a reservation history. Create a new campaign for changed financial terms.</Notice>}
          {error && <ErrorBox error={error} />}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Internal name" error={fieldErrors.get('internalName')}><Input value={draft.internalName} maxLength={160} required onChange={event => set('internalName', event.target.value)} /></Field>
            <Field label="Customer-facing name" error={fieldErrors.get('publicName')}><Input value={draft.publicName} maxLength={160} required onChange={event => { set('publicName', event.target.value); if (!campaign && !draft.publicIdentifier) set('publicIdentifier', slugify(event.target.value)) }} /></Field>
            <Field label="Public link identifier" hint="Lowercase letters, numbers, dots, underscores or hyphens"><Input value={draft.publicIdentifier} maxLength={100} required onChange={event => set('publicIdentifier', slugify(event.target.value))} /></Field>
            <Field label="Timezone"><Input value={draft.timezone} readOnly /></Field>
            <Field label="Starts"><Input type="datetime-local" value={draft.startsAt} disabled={locked} required onChange={event => set('startsAt', event.target.value)} /></Field>
            <Field label="Ends"><Input type="datetime-local" value={draft.endsAt} disabled={locked} required onChange={event => set('endsAt', event.target.value)} /></Field>
            <Field label="Budget (AUD)" hint="Leave blank for no campaign-level cap"><Input type="number" min="0" step="0.01" value={budgetDollars} disabled={locked} onChange={event => setBudgetDollars(event.target.value)} placeholder="5000.00" /></Field>
            <Field label="Audiences" error={fieldErrors.get('audiences')}>
              <div className="flex gap-2 pt-1">
                {(['client', 'fixer'] as CampaignAudience[]).map(audience => <button key={audience} type="button" onClick={() => toggleAudience(audience)} className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize ${draft.audiences.includes(audience) ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'}`}>{audience}</button>)}
              </div>
            </Field>
          </div>
          <Field label="Customer-facing terms" error={fieldErrors.get('termsSummary')}><Textarea value={draft.termsSummary} required maxLength={2000} rows={3} onChange={event => set('termsSummary', event.target.value)} placeholder="Explain eligibility, limits, and expiry in plain language." /></Field>
          <Field label="Internal cost notes"><Textarea value={draft.costNotes || ''} maxLength={1000} rows={2} onChange={event => set('costNotes', event.target.value || null)} /></Field>
          <section className="rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Attribution and physical placement</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Source"><Input value={draft.tracking.source || ''} onChange={event => setTracking('source', event.target.value.toLowerCase())} placeholder="coffee.shop" /></Field>
              <Field label="Medium"><Input value={draft.tracking.medium || ''} onChange={event => setTracking('medium', event.target.value.toLowerCase())} placeholder="poster" /></Field>
              <Field label="Channel"><Input value={draft.tracking.channel || ''} onChange={event => setTracking('channel', event.target.value.toLowerCase())} placeholder="physical" /></Field>
              <Field label="Venue"><Input value={draft.physicalPartner.venueName || ''} onChange={event => setPartner('venueName', event.target.value)} /></Field>
              <Field label="Branch"><Input value={draft.physicalPartner.branch || ''} onChange={event => setPartner('branch', event.target.value)} /></Field>
              <Field label="Suburb"><Input value={draft.physicalPartner.suburb || ''} onChange={event => setPartner('suburb', event.target.value)} /></Field>
            </div>
          </section>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{campaign ? 'Save changes' : 'Create draft'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 text-sm font-medium text-gray-700"><span>{label}</span>{children}{(error || hint) && <span className={`block text-[11px] ${error ? 'text-red-600' : 'text-gray-400'}`}>{error || hint}</span>}</label>
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{children}</div>
}

function ErrorBox({ error }: { error: ApiError }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><p>{error.message}</p>{error.requestId && <p className="mt-1 text-[10px] text-red-500">Request ID: {error.requestId}</p>}</div>
}
