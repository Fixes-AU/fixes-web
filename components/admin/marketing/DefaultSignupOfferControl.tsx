'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'
import type { DiscountCode, MarketingCampaign } from '@/lib/marketing'

interface Props {
  campaign: MarketingCampaign
  codes: DiscountCode[]
  canManage: boolean
  busy: boolean
  onSave: (codeId: string | null, token: string) => Promise<void>
}

export default function DefaultSignupOfferControl({ campaign, codes, canManage, busy, onSave }: Props) {
  const eligibleCodes = useMemo(() => codes.filter(code => (
    code.status === 'active' && code.purpose === 'attribution_and_discount'
  )), [codes])
  const current = campaign.defaultSignupCodeId || ''
  const [selected, setSelected] = useState(current)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => setSelected(current), [current])

  return <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 space-y-2">
    <div>
      <p className="text-sm font-semibold text-gray-900">Default signup offer</p>
      <p className="text-xs text-gray-500 mt-0.5">
        Used only by campaign-only signup links. Links containing an explicit code always use that exact code.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row gap-2">
      <select
        value={selected}
        disabled={!canManage || busy}
        onChange={event => setSelected(event.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
      >
        <option value="">No automatic offer (tracking only)</option>
        {eligibleCodes.map(code => <option key={code._id} value={code._id}>{code.displayCode}</option>)}
      </select>
      {canManage && <button
        type="button"
        disabled={busy || selected === current}
        onClick={() => setConfirming(true)}
        className="marketing-button-secondary disabled:opacity-40"
      >
        Save default
      </button>}
    </div>
    {eligibleCodes.length === 0 && <p className="text-xs text-amber-700">Activate an attribution-and-discount code before selecting a default offer.</p>}
    <AdminActionConfirmDialog
      open={confirming}
      onOpenChange={setConfirming}
      title="Change default signup offer"
      description={selected
        ? 'Campaign-only links will attach the selected offer to future signups. Existing explicit-code links are unchanged.'
        : 'Campaign-only links will remain attribution-only and will not attach a discount offer.'}
      action="campaign:financial_terms"
      confirmLabel="Save default offer"
      onConfirm={async token => {
        await onSave(selected || null, token)
        setConfirming(false)
      }}
    />
  </div>
}
