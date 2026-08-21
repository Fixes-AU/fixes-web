'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  captureMarketingTouch,
  loadPublicMarketingCampaign,
  marketingEntryFromSearch,
} from '@/lib/marketing-attribution'

export function useMarketingRegistrationEntry() {
  const [marketingCode, setMarketingCodeValue] = useState('')
  const [marketingStatus, setMarketingStatus] = useState<'idle' | 'loading' | 'captured' | 'error'>('idle')
  const [marketingMessage, setMarketingMessage] = useState('')
  const captureRef = useRef<Promise<unknown> | null>(null)

  useEffect(() => {
    const entry = marketingEntryFromSearch(window.location.search)
    if (!entry) return
    if (entry.manualCode) setMarketingCodeValue(entry.manualCode)
    setMarketingStatus('loading')
    setMarketingMessage('Checking your campaign link...')

    const capture = Promise.all([
      captureMarketingTouch(entry),
      entry.campaignIdentifier
        ? loadPublicMarketingCampaign(entry.campaignIdentifier)
        : Promise.resolve(null),
    ]).then(([, campaign]) => {
      setMarketingStatus('captured')
      setMarketingMessage(entry.manualCode
        ? `Offer code ${entry.manualCode} is ready and will be checked when eligible.`
        : `${campaign?.campaign.name || 'Campaign'} has been linked to this registration.`)
    }).catch(() => {
      setMarketingStatus('error')
      setMarketingMessage('We could not verify this campaign link. You can continue and enter the code again later.')
    })
    captureRef.current = capture
    void capture.catch(() => undefined)
  }, [])

  const setMarketingCode = useCallback((value: string) => {
    setMarketingCodeValue(value.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 64))
    setMarketingStatus('idle')
    setMarketingMessage('')
  }, [])

  const waitForMarketingCapture = useCallback(async () => {
    if (captureRef.current) await captureRef.current
  }, [])

  return {
    marketingCode,
    setMarketingCode,
    marketingStatus,
    marketingMessage,
    waitForMarketingCapture,
  }
}
