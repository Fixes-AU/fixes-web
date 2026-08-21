// fixes-web/app/register/tradie/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, Info } from 'lucide-react'
import { api, setTokens, ApiError } from '@/lib/api'
import { VALID_CATEGORIES, CATEGORY_LABELS, ROOFING_CAPABILITIES, AUSTRALIAN_STATES } from '@/lib/constants'
import type { RegisterTradieResponse, TradieCategory, RoofingCapability } from '@/lib/types'
import { clearRegistrationAttribution, registrationAttributionPayload } from '@/lib/marketing-attribution'
import { useMarketingRegistrationEntry } from '@/hooks/use-marketing-registration-entry'
import MarketingRegistrationField from '@/components/marketing/MarketingRegistrationField'

export default function RegisterTradiePage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [category, setCategory] = useState<TradieCategory | ''>('')
  const [roofingCapabilities, setRoofingCapabilities] = useState<RoofingCapability[]>([])
  const [roofingJurisdictions, setRoofingJurisdictions] = useState<string[]>([])
  const [skillLevel, setSkillLevel] = useState<'junior' | 'senior' | 'specialist' | ''>('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const { marketingCode, setMarketingCode, marketingStatus, marketingMessage, waitForMarketingCapture } = useMarketingRegistrationEntry()

  const completeRegistration = async (signupToken: string) => {
    const res = await api.post<RegisterTradieResponse>('/api/auth/register/tradie', {
      name, email, password, phone, category,
      roofingCapabilities: category === 'roofing' ? roofingCapabilities : [],
      roofingJurisdictions: category === 'roofing' ? roofingJurisdictions : [],
      skillLevel,
      skills: skills ? skills.split(',').map((item) => item.trim()).filter(Boolean) : [],
      bio: bio || undefined,
      signupToken,
    }, true)
    setTokens(res.data.accessToken, res.data.refreshToken)
    clearRegistrationAttribution()
    router.push('/dashboard')
  }

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit verification code'); return }
    setIsSubmitting(true); setError('')
    try {
      const response = await api.post<{ signupToken: string }>('/api/auth/register/tradie/verify', { email, otp }, true)
      await completeRegistration(response.data.signupToken)
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.') }
    finally { setIsSubmitting(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otpSent) {
      await verifyOtp()
      return
    }

    if (!name || !email || !password || !category || !skillLevel) {
      setError('Name, email, password, category and skill level are required')
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

    if (category === 'roofing' && (!roofingCapabilities.length || !roofingJurisdictions.length)) {
      setError('Select at least one roofing service and one Australian service jurisdiction')
      return
    }

    setIsSubmitting(true)

    try {
      await waitForMarketingCapture()
      await api.post('/api/auth/register/tradie/init', {
        email,
        phone,
        marketingAttribution: registrationAttributionPayload({ manualCode: marketingCode }),
      }, true)
      setOtpSent(true)
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
        <div className="w-full max-w-lg">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Tradie registration will move to the <strong>Fixes mobile app</strong> soon.
              This is a temporary web registration.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-(--upwork-navy) text-center mb-2">
              Join as a Tradie
            </h1>
            <p className="text-sm text-(--upwork-gray) text-center mb-8">
              Create your account and start receiving job offers.
            </p>

            <section aria-labelledby="tradie-registration-details" className="mb-8 rounded-xl border border-green-100 bg-green-50/60 p-4">
              <h2 id="tradie-registration-details" className="text-sm font-semibold text-(--upwork-navy)">
                What to include in your tradie profile
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Select the trade that best represents your main work and describe the skills clients should know about. Accurate
                experience, licence jurisdiction, and service information helps Fixes assess eligibility and match you with more
                relevant job opportunities.
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-gray-600">
                <li><strong className="text-(--upwork-navy)">Trade details:</strong> choose your category, skill level, and specialist capabilities.</li>
                <li><strong className="text-(--upwork-navy)">Profile quality:</strong> add practical skills and a short, client-friendly summary of your experience.</li>
                <li><strong className="text-(--upwork-navy)">Verification:</strong> be ready to provide licences, insurance, and other required documents in the Fixer app.</li>
              </ul>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Creating an account does not guarantee immediate dispatch. Your approved categories, verification status,
                availability, and service location determine which opportunities may be suitable once onboarding is complete.
              </p>
            </section>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="tradie-name"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="tradie-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              <MarketingRegistrationField
                id="tradie-marketing-code"
                value={marketingCode}
                onChange={setMarketingCode}
                status={marketingStatus}
                message={marketingMessage}
              />

              <div>
                <label
                  htmlFor="tradie-email"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Email
                </label>
                <input
                  id="tradie-email"
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
                  htmlFor="tradie-phone"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Phone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="tradie-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04XX XXX XXX"
                  autoComplete="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label
                  htmlFor="tradie-category"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Primary Trade Category
                </label>
                <select
                  id="tradie-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TradieCategory)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                >
                  <option value="" disabled>
                    Select your trade...
                  </option>
                  {VALID_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'roofing' ? 'Roofer' : CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {category === 'roofing' && (
                <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-(--upwork-navy) mb-2">Roofing services offered</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {ROOFING_CAPABILITIES.map((option) => (
                        <label key={option.value} className="flex items-start gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={roofingCapabilities.includes(option.value)}
                            onChange={() => setRoofingCapabilities((current) => current.includes(option.value)
                              ? current.filter((value) => value !== option.value)
                              : [...current, option.value])}
                            className="mt-0.5 accent-(--upwork-green)"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--upwork-navy) mb-2">Australian service jurisdictions</p>
                    <div className="flex flex-wrap gap-2">
                      {AUSTRALIAN_STATES.map((state) => (
                        <label key={state.value} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={roofingJurisdictions.includes(state.value)}
                            onChange={() => setRoofingJurisdictions((current) => current.includes(state.value)
                              ? current.filter((value) => value !== state.value)
                              : [...current, state.value])}
                            className="accent-(--upwork-green)"
                          />
                          {state.value}
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Licence evidence is generated from the services and jurisdictions selected.</p>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="tradie-skill-level"
                  className="flex items-center gap-2 text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Skill Level
                  <div className="group relative flex items-center">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 text-center">
                      Skill level can be downgraded by system if your uploaded documents or licenses don't match your selection.
                      <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </label>
                <select
                  id="tradie-skill-level"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) bg-white focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                >
                  <option value="" disabled>Select your skill level...</option>
                  <option value="junior">Junior (Apprentice / Handyman)</option>
                  <option value="senior">Senior (Fully Licensed / Tradesman)</option>
                  <option value="specialist">Specialist (Advanced Certifications)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="tradie-skills"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Skills <span className="text-gray-400 font-normal">(comma-separated, optional)</span>
                </label>
                <input
                  id="tradie-skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Rewiring, Switchboard, LED Installation"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label
                  htmlFor="tradie-bio"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Bio <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="tradie-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about your experience and expertise..."
                  maxLength={1000}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {bio.length}/1000
                </p>
              </div>

              <div>
                <label
                  htmlFor="tradie-password"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="tradie-password"
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
                  htmlFor="tradie-confirm-password"
                  className="block text-sm font-medium text-(--upwork-navy) mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="tradie-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-(--upwork-navy) placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-(--upwork-green) focus:border-transparent transition-shadow"
                />
              </div>

              {otpSent && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                  <label htmlFor="tradie-registration-otp" className="block text-sm font-medium text-emerald-900">Verification code</label>
                  <input id="tradie-registration-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="6-digit code" className="w-full px-4 py-3 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-(--upwork-green)" />
                  <p className="text-xs text-emerald-700">We sent the code to your email and phone. Your campaign attribution is retained through verification.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-(--upwork-green) hover:bg-(--upwork-green-dark) disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {otpSent ? 'Verifying...' : 'Sending code...'}
                  </>
                ) : (
                  otpSent ? 'Verify and create account' : 'Continue to verification'
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
            <p className="text-center text-sm text-(--upwork-gray) mt-2">
              Looking to hire?{' '}
              <Link
                href="/register"
                className="text-(--upwork-green) font-medium hover:underline"
              >
                Sign up as a client
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
