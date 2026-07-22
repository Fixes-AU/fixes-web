'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Clock, XCircle, FileImage, ShieldAlert, CreditCard, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { api } from '@/lib/api'
import { Job, ScopeChange, QuoteOption } from '@/lib/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function roundMoney(value: number | undefined | null) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function quoteBreakdown(option?: QuoteOption | null) {
  const subtotal = roundMoney(option?.suggestedFixedPrice)
  const gstAmount = Number(option?.gstAmount) > 0 ? roundMoney(option?.gstAmount) : roundMoney(subtotal * 0.1)
  const totalIncGst = Number(option?.totalIncGst) > 0 ? roundMoney(option?.totalIncGst) : roundMoney(subtotal + gstAmount)
  return { subtotal, gstAmount, totalIncGst }
}

function formatMoney(value: number | undefined | null) {
  return `$${roundMoney(value).toFixed(2)}`
}

function PaymentForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isConfirming, setIsConfirming] = useState(false)
  const [payError, setPayError] = useState('')

  const handleConfirm = async () => {
    if (!stripe || !elements) return
    setIsConfirming(true)
    setPayError('')

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', 
    })

    if (error) {
      setPayError(error.message || 'Payment failed. Please try again.')
      setIsConfirming(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Pay Balance Difference</h3>
      <PaymentElement
        options={{ layout: 'accordion' }}
        onLoadError={(err) => {
          setPayError('Failed to load payment form. Please refresh and try again.')
        }}
      />

      {payError && (
        <div className="flex items-start gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{payError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={handleConfirm}
          disabled={!stripe || !elements || isConfirming}
          className="flex-1 bg-(--upwork-green) hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isConfirming ? 'Processing...' : `Pay $${amount} AUD & Confirm`}
        </button>
        <button
          onClick={onCancel}
          disabled={isConfirming}
          className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl hover:border-gray-300 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  )
}

interface ScopeChangeBannerProps {
  job: Job
}

export default function ScopeChangeBanner({ job }: ScopeChangeBannerProps) {
  const router = useRouter()
  const [scopeChange, setScopeChange] = useState<ScopeChange | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTier, setSelectedTier] = useState<'junior' | 'senior' | 'specialist' | 'premium' | null>('premium')
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [balanceToPay, setBalanceToPay] = useState(0)

  type SavedCard = { id: string; brand: string; last4: string; expMonth: number; expYear: number }
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null)
  const [useNewCard, setUseNewCard] = useState(false)
  const [isPayingWithSaved, setIsPayingWithSaved] = useState(false)

  useEffect(() => {
    if (job.activeScopeChangeId) {
      fetchScopeChange()
    }
  }, [job.activeScopeChangeId])

  const fetchScopeChange = async () => {
    try {
      setLoading(true)
      const res = await api.get<any>(`/api/jobs/${job._id}/scope-change/${job.activeScopeChangeId}`)
      setScopeChange(res.data.scopeChange)
      if (res.data.scopeChange?.newQuoteOptions?.length >= 1) {
        setSelectedTier(res.data.scopeChange.newQuoteOptions[0].tier)
      }
    } catch (err) {
      setError('Failed to load scope change details.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!selectedTier) return
    try {
      setProcessing(true)
      setError('')
      const res = await api.post<any>(`/api/jobs/${job._id}/scope-change/${scopeChange?._id}/accept`, { tier: selectedTier })
      
      if (res.data.requiresPayment && res.data.clientSecret) {
        setClientSecret(res.data.clientSecret)
        setBalanceToPay(res.data.priceDifference)
        setProcessing(false)
        try {
          const cardsRes = await api.get<{ cards: SavedCard[] }>('/api/payments/saved-cards')
          setSavedCards(cardsRes.data.cards)
          if (cardsRes.data.cards.length === 0) setUseNewCard(true)
        } catch { setUseNewCard(true) }
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to accept scope change')
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      setProcessing(true)
      setError('')
      await api.post(`/api/jobs/${job._id}/scope-change/${scopeChange?._id}/confirm-payment`)
      window.location.reload()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to confirm payment on the server. Contact support.')
      setProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this scope change? Your tradie will be asked to submit proof of work done so far.')) return
    try {
      setProcessing(true)
      setError('')
      await api.post(`/api/jobs/${job._id}/scope-change/${scopeChange?._id}/decline`)
      window.location.reload()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to decline scope change')
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-4 bg-gray-50 animate-pulse rounded-xl mb-6">Loading scope change review...</div>
  if (!scopeChange) return null


  if (scopeChange.status === 'declined') {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
        <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm">Scope Change Declined</h3>
          <p className="text-sm mt-1">You have declined this scope change. We have notified your tradie to submit proof of the work done so far, or complete the original scope. Our team will review it.</p>
        </div>
      </div>
    )
  }

  if (scopeChange.status === 'proof_submitted') {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-sm">Proof Submitted</h3>
          <p className="text-sm mt-1">Your tradie has submitted proof of work for the declined scope change. Our admin team is reviewing it and will process a fair resolution.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Scope Change Request
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Your tradie found additional factors affecting this job and has submitted notes and photos for an updated quote.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Fixes Authorised team will manually review each variation. If a price change applies, the updated quote is sent for approval before any extra payment is charged or balance is adjusted.
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Tradie's Notes:</h3>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 border border-gray-100">
            {scopeChange.description}
          </div>
        </div>

        {typeof scopeChange.estimatedExtraCost === 'number' && (
          <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-amber-800 font-medium">Tradie rough estimate</span>
            <span className="text-amber-900 font-bold">{formatMoney(scopeChange.estimatedExtraCost)} AUD</span>
          </div>
        )}

        {scopeChange.photos && scopeChange.photos.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Attached Photos:</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {scopeChange.photos.map(photo => (
                <a key={photo.publicId} href={photo.url} target="_blank" rel="noreferrer" className="shrink-0 relative group">
                  <img src={photo.url} alt="Scope change photo" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                    <FileImage className="w-5 h-5 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <hr className="border-gray-100 my-6" />

        <h3 className="text-sm font-semibold text-gray-900 mb-4">Updated Premium Quote</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="mb-6">
          {scopeChange.newQuoteOptions[0] && (() => {
            const opt = scopeChange.newQuoteOptions[0]
            const breakdown = quoteBreakdown(opt)
            const originalTotal = roundMoney(scopeChange.originalPrice * 1.1)
            const priceDiff = scopeChange.priceDifference ?? roundMoney(breakdown.totalIncGst - originalTotal)
            return (
              <div className="relative border-2 rounded-xl p-4 border-emerald-500 bg-green-50/50 shadow-md">
                <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    Premium Service
                  </span>
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatMoney(breakdown.totalIncGst)} incl. GST
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Subtotal {formatMoney(breakdown.subtotal)} + GST {formatMoney(breakdown.gstAmount)}
                </p>

                {priceDiff > 0 ? (
                  <p className="text-xs font-medium text-amber-600 mb-3">+{formatMoney(priceDiff)} additional incl. GST</p>
                ) : priceDiff < 0 ? (
                  <p className="text-xs font-medium text-green-600 mb-3">-{formatMoney(Math.abs(priceDiff))} refund incl. GST</p>
                ) : (
                  <p className="text-xs font-medium text-gray-500 mb-3">No price change</p>
                )}

                <div className="text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-1.5 font-medium text-gray-700">
                    <Clock className="w-3.5 h-3.5" />
                    Est. {opt.estimatedHours.min}-{opt.estimatedHours.max} hrs
                  </div>
                  <p className="line-clamp-4">{opt.reasoning}</p>
                </div>
              </div>
            )
          })()}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleDecline}
            disabled={processing || !!clientSecret}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Decline Scope Change
          </button>
          <button
            onClick={handleAccept}
            disabled={!selectedTier || processing || !!clientSecret}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-(--upwork-green) rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-35"
          >
            {processing ? 'Processing...' : 'Accept & Update'}
          </button>
        </div>

        {clientSecret && (
          <div className="mt-6">
            {savedCards.length > 0 && !useNewCard && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-(--upwork-green)" />
                  Pay with Saved Card
                </h3>
                <div className="space-y-2">
                  {savedCards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedSavedCard(card.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                        selectedSavedCard === card.id
                          ? 'border-(--upwork-green) bg-green-50 ring-1 ring-(--upwork-green)'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedSavedCard === card.id ? 'border-(--upwork-green)' : 'border-gray-300'
                      }`}>
                        {selectedSavedCard === card.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-(--upwork-green)" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {card.brand} •••• {card.last4}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <button
                    onClick={async () => {
                      if (!selectedSavedCard || !scopeChange) return
                      setIsPayingWithSaved(true)
                      setError('')
                      try {
                        await handlePaymentSuccess()
                      } catch (err: any) {
                        setError(err.message || 'Payment failed')
                        setIsPayingWithSaved(false)
                      }
                    }}
                    disabled={!selectedSavedCard || isPayingWithSaved}
                    className="flex-1 bg-(--upwork-green) hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isPayingWithSaved
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      : `Pay $${balanceToPay} AUD & Confirm`
                    }
                  </button>
                  <button
                    onClick={() => { setUseNewCard(true); setSelectedSavedCard(null) }}
                    className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl hover:border-gray-300 transition-colors text-sm"
                  >
                    Use a new card
                  </button>
                </div>
              </div>
            )}

            {(useNewCard || savedCards.length === 0) && (
              <>
                {savedCards.length > 0 && (
                  <button
                    onClick={() => { setUseNewCard(false); setSelectedSavedCard(null) }}
                    className="flex items-center gap-1.5 text-sm text-(--upwork-green) font-medium mb-3 hover:opacity-80 transition-opacity"
                  >
                    ← Back to saved cards
                  </button>
                )}
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <PaymentForm
                    amount={balanceToPay}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setClientSecret(null)}
                  />
                </Elements>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
