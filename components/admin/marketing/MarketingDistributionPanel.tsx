'use client'

import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download, ExternalLink, Loader2 } from 'lucide-react'
import type { DiscountCode, MarketingCampaign } from '@/lib/marketing'
import {
  buildMarketingRegistrationUrl,
  MARKETING_DISTRIBUTION_TARGETS,
  type MarketingDistributionTarget,
} from '@/lib/marketing-links'

export default function MarketingDistributionPanel({
  campaign,
  codes,
}: {
  campaign: MarketingCampaign
  codes: DiscountCode[]
}) {
  const [target, setTarget] = useState<MarketingDistributionTarget>('client_web')
  const [codeId, setCodeId] = useState('')
  const [qrData, setQrData] = useState('')
  const [copied, setCopied] = useState(false)
  const activeCodes = useMemo(() => codes.filter(code => code.status === 'active'), [codes])
  const selectedCode = activeCodes.find(code => code._id === codeId) || null
  const origin = typeof window === 'undefined' ? 'https://www.fixesau.com' : window.location.origin
  const common = {
    origin,
    target,
    campaignIdentifier: campaign.publicIdentifier,
    code: selectedCode?.displayCode,
    utm: {
      source: campaign.tracking?.source,
      medium: campaign.tracking?.medium,
      campaign: campaign.publicIdentifier,
      content: campaign.tracking?.content,
    },
  }
  const directUrl = buildMarketingRegistrationUrl(common)
  const qrUrl = buildMarketingRegistrationUrl({ ...common, via: 'qr' })

  useEffect(() => {
    if (codeId && !activeCodes.some(code => code._id === codeId)) setCodeId('')
  }, [activeCodes, codeId])

  useEffect(() => {
    let active = true
    setQrData('')
    QRCode.toDataURL(qrUrl, { width: 512, margin: 2, errorCorrectionLevel: 'M' })
      .then(value => { if (active) setQrData(value) })
      .catch(() => { if (active) setQrData('') })
    return () => { active = false }
  }, [qrUrl])

  const isWebTarget = target.endsWith('_web') || target.endsWith('_waitlist')
  const filename = `${campaign.publicIdentifier}-${selectedCode?.displayCode.toLowerCase() || 'tracking'}-${target}-qr.png`

  return (
    <aside className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 h-fit space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Distribution link and QR</h3>
        <p className="text-[11px] text-gray-500 mt-1">Choose the signup destination and exact offer before distributing.</p>
      </div>

      <label className="block space-y-1 text-[11px] font-semibold text-gray-600">
        <span>Destination</span>
        <select value={target} onChange={event => setTarget(event.target.value as MarketingDistributionTarget)} className="w-full rounded-lg border border-violet-100 bg-white px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-violet-400">
          {MARKETING_DISTRIBUTION_TARGETS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      <label className="block space-y-1 text-[11px] font-semibold text-gray-600">
        <span>Offer</span>
        <select value={codeId} onChange={event => setCodeId(event.target.value)} className="w-full rounded-lg border border-violet-100 bg-white px-2.5 py-2 text-xs text-gray-700 outline-none focus:border-violet-400">
          <option value="">Campaign tracking only</option>
          {activeCodes.map(code => <option key={code._id} value={code._id}>{code.displayCode}</option>)}
        </select>
      </label>

      {qrData ? <img src={qrData} alt={`QR for ${campaign.publicName}${selectedCode ? ` and ${selectedCode.displayCode}` : ''}`} className="w-40 h-40 mx-auto rounded-lg bg-white" /> : <div className="h-40 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-violet-500" /></div>}

      <div className="flex gap-2">
        <button type="button" className="marketing-button-secondary flex-1" onClick={async () => { await navigator.clipboard.writeText(directUrl); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
          <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied' : selectedCode ? 'Copy offer link' : 'Copy tracking link'}
        </button>
        {qrData && <a href={qrData} download={filename} className="marketing-button-secondary" aria-label="Download QR"><Download className="w-3.5 h-3.5" /></a>}
      </div>

      {isWebTarget ? <a href={directUrl} target="_blank" rel="noreferrer" className="flex items-start gap-1 text-[11px] text-violet-600 break-all"><ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />{directUrl}</a> : <p className="text-[10px] text-violet-600 break-all">{directUrl}</p>}
      <p className="text-[10px] leading-4 text-gray-500">The downloaded QR adds <code>via=qr</code>. Campaign-only distribution tracks signup; selecting a code also carries that exact offer.</p>
    </aside>
  )
}
