// fixes-web/app/register/page.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { ApiError } from '@/lib/api'
import { parseFragmentState } from '@/lib/fragmentState'
import { Button } from '@/components/ui/button'
import {
  captureMarketingTouch,
  loadPublicMarketingCampaign,
  marketingEntryFromSearch,
  type PublicMarketingCampaign,
} from '@/lib/marketing-attribution'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RegisterPage() {
  const router = useRouter()
  const { registerClient } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showBusinessDialog, setShowBusinessDialog] = useState(false)
  const [marketingCode, setMarketingCode] = useState('')
  const [analyticsConsent, setAnalyticsConsent] = useState(true)
  const [marketingStatus, setMarketingStatus] = useState<'idle' | 'loading' | 'captured' | 'error'>('idle')
  const [marketingMessage, setMarketingMessage] = useState('')
  const [publicCampaign, setPublicCampaign] = useState<PublicMarketingCampaign | null>(null)
  const marketingCaptureRef = useRef<Promise<unknown> | null>(null)

  useEffect(() => {
    const syncPlan = () => {
      const params = parseFragmentState(window.location.hash)
      setShowBusinessDialog(params.get('plan') === 'business')
    }

    syncPlan()
    window.addEventListener('hashchange', syncPlan)
    return () => window.removeEventListener('hashchange', syncPlan)
  }, [])

  useEffect(() => {
    const entry = marketingEntryFromSearch(window.location.search)
    if (!entry) return

    if (entry.manualCode) setMarketingCode(entry.manualCode)
    setMarketingStatus('loading')
    setMarketingMessage('Checking your campaign offer...')

    const capture = Promise.all([
      captureMarketingTouch(entry),
      entry.campaignIdentifier
        ? loadPublicMarketingCampaign(entry.campaignIdentifier)
        : Promise.resolve(null),
    ]).then(([, campaign]) => {
      setPublicCampaign(campaign)
      setMarketingStatus('captured')
      setMarketingMessage(entry.manualCode
        ? `Offer code ${entry.manualCode} is ready and will be checked again when you accept a quote.`
        : `${campaign?.campaign.name || 'Campaign'} has been linked to this signup.`)
    }).catch(() => {
      setMarketingStatus('error')
      setMarketingMessage('We could not verify this campaign link. You can still sign up and enter the code again later.')
    })

    marketingCaptureRef.current = capture
    void capture.catch(() => undefined)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password) {
      setError('Name, email, and password are required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      if (marketingCaptureRef.current) await marketingCaptureRef.current
      await registerClient({
        name,
        email,
        password,
        phone: phone || undefined,
        marketingCode: marketingCode || undefined,
        analyticsConsent,
      })
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white flex flex-col">
      <Dialog open={showBusinessDialog} onOpenChange={setShowBusinessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Under Development</DialogTitle>
            <DialogDescription>
              The Business plan is currently under development. In the meantime, you can sign up with our free Home Owner plan to get started.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button onClick={() => setShowBusinessDialog(false)} className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white w-full">
              Sign up for free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <Link href="/" className="inline-block" aria-label="Fixes home">
            <Image
              src="/logo.svg"
              alt="Fixes"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-(--upwork-navy) text-center mb-2">
              Create your account
            </h1>
            <p className="text-sm text-(--upwork-gray) text-center mb-8">
              Sign up to post jobs and hire trusted tradies.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="register-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04XX XXX XXX"
                  autoComplete="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="register-marketing-code" className="block text-sm font-medium text-(--upwork-navy) mb-1.5">
                  Campaign or discount code <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input id="register-marketing-code" value={marketingCode} onChange={event => {
                  setMarketingCode(event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))
                  setMarketingStatus('idle')
                  setMarketingMessage('')
                }} placeholder="e.g. COFFEE20" maxLength={64} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow" />
                <p className="text-xs text-gray-400 mt-1">If the offer is eligible, it will be saved to your account and revalidated when you accept a quote.</p>
                {marketingMessage && (
                  <p className={`text-xs mt-2 ${marketingStatus === 'error' ? 'text-amber-700' : marketingStatus === 'captured' ? 'text-emerald-700' : 'text-gray-500'}`} role={marketingStatus === 'error' ? 'alert' : 'status'}>
                    {marketingMessage}
                  </p>
                )}
                {publicCampaign?.campaign.termsSummary && marketingStatus === 'captured' && (
                  <p className="text-xs text-gray-500 mt-1">{publicCampaign.campaign.termsSummary}</p>
                )}
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-500">
                <input type="checkbox" checked={analyticsConsent} onChange={event => setAnalyticsConsent(event.target.checked)} className="mt-0.5" />
                Allow Fixes to use campaign interaction data to measure this signup. Turning this off does not remove an eligible offer from your account.
              </label>

              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-sm text-(--upwork-gray)">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-(--upwork-green) font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Are you a tradie?{' '}
            <Link href="/register/tradie" className="text-(--upwork-green) hover:underline">
              Join as a tradie
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
