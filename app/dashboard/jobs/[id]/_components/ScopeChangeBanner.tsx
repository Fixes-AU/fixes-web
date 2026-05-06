'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Clock, XCircle, FileImage, ShieldAlert } from 'lucide-react' // using normal lucide-react if web? Wait, dashboard is web, it uses lucide-react. Let me check what it imports. I will use lucide-react.
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { api } from '@/lib/api'
import { Job, ScopeChange, QuoteOption } from '@/lib/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
  const [selectedTier, setSelectedTier] = useState<'junior' | 'senior' | 'specialist' | null>(null)
  const [processing, setProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [balanceToPay, setBalanceToPay] = useState(0)

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
      if (res.data.scopeChange?.newQuoteOptions?.length === 1) {
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
            Your tradie found additional factors affecting this job and has submitted an updated scope for your approval.
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

        <h3 className="text-sm font-semibold text-gray-900 mb-4">Updated Quote Options</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {scopeChange.newQuoteOptions.map((opt: QuoteOption) => {
            const isSelected = selectedTier === opt.tier
            const priceDiff = opt.suggestedFixedPrice - scopeChange.originalPrice
            return (
              <div
                key={opt.tier}
                onClick={() => setSelectedTier(opt.tier)}
                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col ${isSelected
                    ? 'border-(--upwork-green) bg-green-50/50 shadow-md transform scale-[1.02]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-(--upwork-green) text-white rounded-full p-1 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${opt.tier === 'junior' ? 'bg-blue-100 text-blue-700' :
                      opt.tier === 'senior' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {opt.tier} Option
                  </span>
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${opt.suggestedFixedPrice}
                </div>

                {priceDiff > 0 ? (
                  <p className="text-xs font-medium text-amber-600 mb-3">+${priceDiff} additional</p>
                ) : priceDiff < 0 ? (
                  <p className="text-xs font-medium text-green-600 mb-3">-${Math.abs(priceDiff)} refund</p>
                ) : (
                  <p className="text-xs font-medium text-gray-500 mb-3">No price change</p>
                )}

                <div className="text-xs text-gray-600 flex-1 space-y-2">
                  <div className="flex items-center gap-1.5 font-medium text-gray-700">
                    <Clock className="w-3.5 h-3.5" />
                    Est. {opt.estimatedHours.min}-{opt.estimatedHours.max} hrs
                  </div>
                  <p className="line-clamp-4">{opt.reasoning}</p>
                </div>
              </div>
            )
          })}
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
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <PaymentForm 
              amount={balanceToPay} 
              onSuccess={handlePaymentSuccess} 
              onCancel={() => setClientSecret(null)} 
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
