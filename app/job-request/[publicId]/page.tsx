'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Loader2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react'
import AddressAutocomplete from '@/components/upwork/AddressAutocomplete'
import { useAuth } from '@/contexts/auth-context'
import { api, ApiError } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import {
  datetimeLocalInStateToISO,
  formatDatetimeLocalInState,
  getMinScheduledDatetimeLocal,
} from '@/lib/australianTime'

type DraftImage = { url: string; publicId: string; uploadedAt?: string }
type DraftLocation = {
  address: string
  suburb: string
  postcode: string
  state: string
  coordinates: { lat: number | null; lng: number | null }
}
type CleaningTask = { title: string; description?: string; subtasks?: Array<string | { title: string }> }
type AutoCareDetails = {
  serviceType: 'car_detailing' | 'car_washing' | 'both' | 'unknown'
  serviceLocationMode: 'client_address' | 'client_dropoff'
  dropoffRadiusKm: number
  vehicle: {
    type: 'sedan' | 'hatchback' | 'suv_4wd' | 'ute' | 'van' | 'truck' | 'other' | ''
    makeModel: string
    year: string
    colour: string
    registrationNumber: string
  }
}
type DraftPayload = {
  category: string
  title: string
  description: string
  images: DraftImage[]
  location: DraftLocation
  preferredTime: string
  scheduledFor: string | null
  diagnosticAnswers: Record<string, unknown>
  autoCareDetails: AutoCareDetails | null
  cleaningType: string | null
  cleaningTasks: CleaningTask[]
  propertyDetails: { propertyType: string | null; bedrooms: number | null; bathrooms: number | null }
}
type VoiceDraft = {
  publicId: string
  status: string
  payload: DraftPayload
  missingFields: string[]
  lowConfidenceFields: string[]
  linkExpiresAt: string
  version: number
}
type CleaningTemplate = {
  cleaningType: string
  label: string
  category: 'cleaning' | 'waste_removal'
  tasks: Array<{
    title: string
    description?: string
    order?: number
    subtasks?: Array<{ title: string }>
  }>
}
type QuoteOption = {
  tier: string
  suggestedFixedPrice: number
  estimatedHours: { min: number; max: number }
  totalIncGst?: number
  confidence?: number
}
type FinalizationResult = {
  job: { _id: string; jobCode?: string; status: string; isAgencyManaged?: boolean; cleaningPricing?: { totalEstimate?: number } }
  quote?: { options?: QuoteOption[] }
  clientSecret?: string
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')
const CATEGORIES = Object.entries(CATEGORY_LABELS)
const PROPERTY_TYPES = [
  ['studio', 'Studio'],
  ['1bed_apartment', '1-bed apartment'],
  ['2bed_apartment', '2-bed apartment'],
  ['single_storey', 'Single-storey home'],
  ['townhouse', 'Townhouse'],
  ['double_storey', 'Double-storey home'],
  ['commercial', 'Commercial property'],
] as const

const fieldClass = 'w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-[16px] text-[var(--upwork-navy)] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--upwork-green)]'
const ADDRESS_VERIFICATION_MESSAGE = 'We could not confidently verify this address. Please choose the matching address suggestion, then generate your quote again.'

const hasVerifiedCoordinates = (location: DraftLocation) => (
  Number.isFinite(location.coordinates?.lat) && Number.isFinite(location.coordinates?.lng)
)

const geocodeDraftLocation = async (location: DraftLocation): Promise<DraftLocation> => {
  if (hasVerifiedCoordinates(location)) return location
  if (typeof window === 'undefined' || !window.google?.maps?.Geocoder) {
    throw new Error(ADDRESS_VERIFICATION_MESSAGE)
  }

  const query = [
    location.address,
    location.suburb,
    [location.state, location.postcode].filter(Boolean).join(' '),
    'Australia',
  ].filter(Boolean).join(', ')

  const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
    new google.maps.Geocoder().geocode(
      { address: query, componentRestrictions: { country: 'AU' } },
      (matches, status) => {
        if (status === google.maps.GeocoderStatus.OK && matches?.length) resolve(matches)
        else reject(new Error(ADDRESS_VERIFICATION_MESSAGE))
      }
    )
  })

  const match = results.find((result) => !result.partial_match && result.geometry?.location)
  if (!match) throw new Error(ADDRESS_VERIFICATION_MESSAGE)

  const component = (type: string) => match.address_components.find((item) => item.types.includes(type))
  const country = component('country')?.short_name?.toUpperCase()
  const matchedState = component('administrative_area_level_1')?.short_name?.toUpperCase()
  const matchedPostcode = component('postal_code')?.long_name?.trim()
  if (
    country !== 'AU' ||
    (location.state && matchedState !== location.state.trim().toUpperCase()) ||
    (location.postcode && matchedPostcode !== location.postcode.trim())
  ) {
    throw new Error(ADDRESS_VERIFICATION_MESSAGE)
  }

  return {
    ...location,
    coordinates: {
      lat: match.geometry.location.lat(),
      lng: match.geometry.location.lng(),
    },
  }
}

const normalizeAutoCareDetails = (value: AutoCareDetails | null): AutoCareDetails => ({
  serviceType: value?.serviceType || 'car_detailing',
  serviceLocationMode: value?.serviceLocationMode || 'client_address',
  dropoffRadiusKm: value?.dropoffRadiusKm || 20,
  vehicle: {
    type: value?.vehicle?.type || '',
    makeModel: value?.vehicle?.makeModel || '',
    year: value?.vehicle?.year || '',
    colour: value?.vehicle?.colour || '',
    registrationNumber: value?.vehicle?.registrationNumber || '',
  },
})

function capabilityStorageKey(publicId: string) {
  return `fixes:voice-draft:${publicId}`
}

function getCapabilityFromBrowser(publicId: string) {
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const fragmentToken = fragment.get('access')
  if (fragmentToken) {
    sessionStorage.setItem(capabilityStorageKey(publicId), fragmentToken)
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    return fragmentToken
  }
  return sessionStorage.getItem(capabilityStorageKey(publicId)) || ''
}

function PaymentPanel({ amount, jobId, onDone }: { amount: number; jobId: string; onDone: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    if (!stripe || !elements) return
    setWorking(true)
    setError('')
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/dashboard/jobs/${jobId}` },
      redirect: 'if_required',
    })
    if (result.error) {
      setError(result.error.message || 'Payment could not be confirmed.')
      setWorking(false)
      return
    }
    onDone()
  }

  return (
    <div className="space-y-5">
      <PaymentElement options={{ layout: 'accordion' }} />
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="button" onClick={confirm} disabled={!stripe || !elements || working} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--upwork-green)] px-5 py-3.5 font-semibold text-white disabled:opacity-50">
        {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        Pay ${amount.toFixed(2)} AUD
      </button>
    </div>
  )
}

export default function VoiceJobRequestPage() {
  const params = useParams<{ publicId: string }>()
  const publicId = params.publicId
  const router = useRouter()
  const { user, isLoading: authLoading, login, registerClient } = useAuth()
  const [capability, setCapability] = useState('')
  const [draft, setDraft] = useState<VoiceDraft | null>(null)
  const [payload, setPayload] = useState<DraftPayload | null>(null)
  const [templates, setTemplates] = useState<CleaningTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [authWorking, setAuthWorking] = useState(false)
  const [result, setResult] = useState<FinalizationResult | null>(null)

  // Send both supported transports while the draft is anonymous. After login,
  // apiFetch replaces Authorization with the user's Bearer token and the
  // dedicated header continues carrying the draft capability for finalization.
  const draftHeaders = useMemo(() => ({
    Authorization: `Draft ${capability}`,
    'x-fixes-draft-token': capability,
  }), [capability])
  const isManaged = payload ? ['cleaning', 'waste_removal'].includes(payload.category) : false
  const selectedTemplate = templates.find((item) => item.cleaningType === payload?.cleaningType) || null
  const autoCareDetails = normalizeAutoCareDetails(payload?.autoCareDetails || null)

  useEffect(() => {
    if (!publicId) return
    const token = getCapabilityFromBrowser(publicId)
    setCapability(token)
    if (!token) {
      setError('This job-request link is incomplete. Open the full link from your Fixes text message.')
      setLoading(false)
    }
  }, [publicId])

  const loadDraft = useCallback(async () => {
    if (!capability) return
    setLoading(true)
    setError('')
    try {
      const response = await api.raw<{ data: { draft: VoiceDraft } }>(`/api/voice-assistant/drafts/${publicId}`, {
        headers: draftHeaders,
        noAuth: true,
      })
      setDraft(response.data.draft)
      setPayload(response.data.draft.payload)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'This job request could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [capability, draftHeaders, publicId])

  useEffect(() => { loadDraft() }, [loadDraft])

  useEffect(() => {
    if (!isManaged || !payload?.category) {
      setTemplates([])
      return
    }
    api.get<CleaningTemplate[]>(`/api/cleaning/templates?category=${encodeURIComponent(payload.category)}`, true)
      .then((response) => setTemplates(response.data))
      .catch(() => setError('Managed-service options could not be loaded. Please try again.'))
  }, [isManaged, payload?.category])

  const updatePayload = <K extends keyof DraftPayload>(field: K, value: DraftPayload[K]) => {
    setPayload((current) => current ? { ...current, [field]: value } : current)
    setSavedMessage('')
  }

  const updateLocation = (field: keyof Omit<DraftLocation, 'coordinates'>, value: string) => {
    if (!payload) return
    updatePayload('location', {
      ...payload.location,
      [field]: value,
      coordinates: { lat: null, lng: null },
    })
  }

  const updateAutoCare = (patch: Partial<AutoCareDetails>) => {
    updatePayload('autoCareDetails', { ...autoCareDetails, ...patch })
  }

  const updateAutoCareVehicle = (field: keyof AutoCareDetails['vehicle'], value: string) => {
    updateAutoCare({ vehicle: { ...autoCareDetails.vehicle, [field]: value } })
  }

  const updateDiagnosticAnswer = (field: string, value: string) => {
    updatePayload('diagnosticAnswers', { ...payload?.diagnosticAnswers, [field]: value })
  }

  const saveDraft = async (payloadOverride?: DraftPayload) => {
    const draftPayload = payloadOverride || payload
    if (!draftPayload || !draft) throw new Error('Draft is not loaded')
    setSaving(true)
    setError('')
    try {
      const patch = {
        category: draftPayload.category,
        title: draftPayload.title,
        description: draftPayload.description,
        location: draftPayload.location,
        preferredTime: draftPayload.preferredTime,
        scheduledFor: draftPayload.preferredTime === 'scheduled' && draftPayload.scheduledFor
          ? datetimeLocalInStateToISO(
              draftPayload.scheduledFor.endsWith('Z')
                ? formatDatetimeLocalInState(new Date(draftPayload.scheduledFor), draftPayload.location.state)
                : draftPayload.scheduledFor,
              draftPayload.location.state
            )
          : null,
        diagnosticAnswers: draftPayload.diagnosticAnswers || {},
        autoCareDetails: draftPayload.category === 'auto_care' ? normalizeAutoCareDetails(draftPayload.autoCareDetails) : null,
        isAgencyManaged: isManaged,
        cleaningType: isManaged ? draftPayload.cleaningType : null,
        cleaningTasks: isManaged ? draftPayload.cleaningTasks : [],
        propertyDetails: isManaged ? draftPayload.propertyDetails : {},
      }
      const response = await api.raw<{ data: { draft: VoiceDraft } }>(`/api/voice-assistant/drafts/${publicId}`, {
        method: 'PATCH',
        body: { patch, expectedVersion: draft.version },
        headers: draftHeaders,
        noAuth: true,
      })
      setDraft(response.data.draft)
      setPayload(response.data.draft.payload)
      setSavedMessage('Changes saved')
      return response.data.draft
    } catch (requestError) {
      const message = requestError instanceof ApiError ? requestError.message : 'Your changes could not be saved.'
      setError(message)
      throw requestError
    } finally {
      setSaving(false)
    }
  }

  const uploadImages = async (files: FileList | null) => {
    if (!files || !payload) return
    const available = 5 - payload.images.length
    const selected = Array.from(files).slice(0, available)
    if (!selected.length) return
    if (selected.some((file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)) {
      setError('Choose image files up to 10 MB each.')
      return
    }
    setUploading(true)
    setError('')
    try {
      for (const file of selected) {
        const signedResponse = await api.raw<{ data: { upload: { signature: string; timestamp: number; cloudName: string; apiKey: string; folder: string } } }>(`/api/voice-assistant/drafts/${publicId}/uploads/sign`, {
          method: 'POST', body: {}, headers: draftHeaders, noAuth: true,
        })
        const signed = signedResponse.data.upload
        const body = new FormData()
        body.append('file', file)
        body.append('api_key', signed.apiKey)
        body.append('timestamp', String(signed.timestamp))
        body.append('signature', signed.signature)
        body.append('folder', signed.folder)
        const cloudResponse = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: 'POST', body })
        if (!cloudResponse.ok) throw new Error('Image upload failed')
        const cloud = await cloudResponse.json() as { public_id: string }
        const confirmed = await api.raw<{ data: { draft: VoiceDraft } }>(`/api/voice-assistant/drafts/${publicId}/uploads/confirm`, {
          method: 'POST', body: { publicId: cloud.public_id }, headers: draftHeaders, noAuth: true,
        })
        setDraft(confirmed.data.draft)
        setPayload(confirmed.data.draft.payload)
      }
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'One of the images could not be uploaded.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (assetPublicId: string) => {
    setUploading(true)
    setError('')
    try {
      const response = await api.raw<{ data: { draft: VoiceDraft } }>(`/api/voice-assistant/drafts/${publicId}/uploads`, {
        method: 'DELETE',
        body: { publicId: assetPublicId },
        headers: draftHeaders,
        noAuth: true,
      })
      setDraft(response.data.draft)
      setPayload(response.data.draft.payload)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'The image could not be removed.')
    } finally {
      setUploading(false)
    }
  }

  const submitAuth = async () => {
    setAuthWorking(true)
    setError('')
    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password)
      } else {
        await registerClient({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          phone: authForm.phone || undefined,
        })
      }
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Account authentication failed.')
    } finally {
      setAuthWorking(false)
    }
  }

  const finalize = async () => {
    if (!user || user.role !== 'client' || !payload) return
    setFinalizing(true)
    setError('')
    try {
      const verifiedLocation = await geocodeDraftLocation(payload.location)
      const verifiedPayload = { ...payload, location: verifiedLocation }
      if (verifiedPayload !== payload) setPayload(verifiedPayload)
      await saveDraft(verifiedPayload)
      const keyName = `fixes:voice-finalize:${publicId}`
      let idempotencyKey = sessionStorage.getItem(keyName)
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID()
        sessionStorage.setItem(keyName, idempotencyKey)
      }
      const response = await api.raw<{ data: FinalizationResult }>(`/api/voice-assistant/drafts/${publicId}/finalize`, {
        method: 'POST',
        body: {},
        headers: { ...draftHeaders, 'Idempotency-Key': idempotencyKey },
      })
      setResult(response.data)
      sessionStorage.removeItem(capabilityStorageKey(publicId))
    } catch (requestError) {
      const message = requestError instanceof ApiError
        ? requestError.message
        : requestError instanceof Error && requestError.message === ADDRESS_VERIFICATION_MESSAGE
          ? requestError.message
          : 'The job and quote could not be created.'
      setError(message)
      if (message === ADDRESS_VERIFICATION_MESSAGE) {
        document.getElementById('job-address-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } finally {
      setFinalizing(false)
    }
  }

  const cancelCreatedJob = async () => {
    if (!result?.job._id) return
    try {
      await api.patch(`/api/jobs/${result.job._id}/cancel`, { reason: 'Cancelled from voice-assisted job review' })
      router.push('/dashboard/jobs')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'The job could not be cancelled.')
    }
  }

  if (loading || authLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7faf7]"><Loader2 className="h-8 w-8 animate-spin text-[var(--upwork-green)]" /></div>
  }

  if (!draft || !payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7faf7] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-bold text-[var(--upwork-navy)]">Job request unavailable</h1>
          <p className="mt-2 text-sm text-gray-600">{error || 'The link may have expired or already been used.'}</p>
          <Link href="/post-job" className="mt-6 inline-flex rounded-xl bg-[var(--upwork-green)] px-5 py-3 font-semibold text-white">Start a new job request</Link>
        </div>
      </main>
    )
  }

  if (result) {
    const amount = result.job.cleaningPricing?.totalEstimate || result.quote?.options?.[0]?.suggestedFixedPrice || 0
    return (
      <div className="min-h-screen bg-[#f7faf7]">
        <header className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-6"><Image src="/logo.svg" alt="Fixes" width={120} height={40} className="h-8 w-auto" /></div></header>
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
            <CheckCircle2 className="mb-4 h-12 w-12 text-[var(--upwork-green)]" />
            <h1 className="text-2xl font-bold text-[var(--upwork-navy)]">Your job and quote are ready</h1>
            <p className="mt-2 text-gray-600">Reference {result.job.jobCode || result.job._id}. Nothing has been charged.</p>
            {result.clientSecret ? (
              <div className="mt-8">
                <h2 className="mb-2 text-lg font-bold text-[var(--upwork-navy)]">Choose whether to pay now</h2>
                <p className="mb-5 text-sm text-gray-600">You can complete the secure payment, or cancel this job without making a payment.</p>
                <Elements stripe={stripePromise} options={{ clientSecret: result.clientSecret }}>
                  <PaymentPanel amount={amount} jobId={result.job._id} onDone={() => router.push(`/dashboard/jobs/${result.job._id}`)} />
                </Elements>
                <button type="button" onClick={cancelCreatedJob} className="mt-3 w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700">Cancel job</button>
              </div>
            ) : (
              <div className="mt-7 space-y-3">
                {(result.quote?.options || []).map((option) => (
                  <div key={option.tier} className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
                    <div><p className="font-semibold capitalize text-[var(--upwork-navy)]">{option.tier}</p><p className="text-sm text-gray-500">{option.estimatedHours.min}–{option.estimatedHours.max} hours</p></div>
                    <p className="text-lg font-bold text-[var(--upwork-green)]">${(option.totalIncGst || option.suggestedFixedPrice).toFixed(2)}</p>
                  </div>
                ))}
                <button type="button" onClick={() => router.push(`/dashboard/jobs/${result.job._id}`)} className="mt-4 w-full rounded-xl bg-[var(--upwork-green)] px-5 py-3.5 font-semibold text-white">Continue with this job</button>
                <button type="button" onClick={cancelCreatedJob} className="w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700">Cancel job</button>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7faf7]">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Fixes home"><Image src="/logo.svg" alt="Fixes" width={120} height={40} className="h-8 w-auto" priority /></Link>
          <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm"><LockKeyhole className="h-4 w-4 text-[var(--upwork-green)]" /> Secure job request</div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <section className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm font-semibold text-[var(--upwork-green)]">Created from your Fixes call</p><h1 className="mt-1 text-2xl font-bold text-[var(--upwork-navy)] sm:text-3xl">Review your job request</h1><p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">Check the details, add photos, then sign in or create a client account to generate the real quote.</p></div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800"><Clock3 className="h-4 w-4" /> Expires {new Date(draft.linkExpiresAt).toLocaleString('en-AU')}</div>
            </div>
          </div>

          {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span></div>}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-[var(--upwork-navy)]">Job details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Category</span><select value={payload.category} onChange={(event) => updatePayload('category', event.target.value)} className={fieldClass}>{CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Job title</span><input value={payload.title} maxLength={150} onChange={(event) => updatePayload('title', event.target.value)} className={fieldClass} /></label>
              <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-gray-700">What needs to be done?</span><textarea value={payload.description} maxLength={2000} rows={6} onChange={(event) => updatePayload('description', event.target.value)} className={fieldClass} /></label>
              <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">When do you need it?</span><select value={payload.preferredTime} onChange={(event) => updatePayload('preferredTime', event.target.value)} className={fieldClass}><option value="now">As soon as possible</option><option value="scheduled">Specific date and time</option><option value="1-2weeks">Within 1–2 weeks</option><option value="no-rush">No rush</option></select></label>
              {payload.preferredTime === 'scheduled' && <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Date and time</span><input type="datetime-local" min={getMinScheduledDatetimeLocal(payload.location.state, 5)} value={payload.scheduledFor ? (payload.scheduledFor.endsWith('Z') ? formatDatetimeLocalInState(new Date(payload.scheduledFor), payload.location.state) : payload.scheduledFor.slice(0, 16)) : ''} onChange={(event) => updatePayload('scheduledFor', event.target.value)} className={fieldClass} /></label>}
            </div>
          </div>

          {Object.keys(payload.diagnosticAnswers || {}).length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-[var(--upwork-navy)]">Details from your call</h2>
              <p className="mt-1 text-sm text-gray-600">Review and edit the answers the assistant recorded about the job.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {Object.entries(payload.diagnosticAnswers).map(([field, value]) => <label key={field}><span className="mb-1.5 block text-sm font-semibold text-gray-700">{field.replaceAll('_', ' ')}</span><input value={typeof value === 'string' ? value : JSON.stringify(value)} maxLength={2000} onChange={(event) => updateDiagnosticAnswer(field, event.target.value)} className={fieldClass} /></label>)}
              </div>
            </div>
          )}

          {isManaged && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-[var(--upwork-navy)]">Managed service details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <label className="sm:col-span-3"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Service type</span><select value={payload.cleaningType || ''} onChange={(event) => { updatePayload('cleaningType', event.target.value); updatePayload('cleaningTasks', []) }} className={fieldClass}><option value="">Choose a service</option>{templates.map((template) => <option key={template.cleaningType} value={template.cleaningType}>{template.label}</option>)}</select></label>
                <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Property type</span><select value={payload.propertyDetails?.propertyType || ''} onChange={(event) => updatePayload('propertyDetails', { ...payload.propertyDetails, propertyType: event.target.value })} className={fieldClass}><option value="">Choose</option>{PROPERTY_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Bedrooms</span><input type="number" min={0} max={100} value={payload.propertyDetails?.bedrooms ?? ''} onChange={(event) => updatePayload('propertyDetails', { ...payload.propertyDetails, bedrooms: event.target.value === '' ? null : Number(event.target.value) })} className={fieldClass} /></label>
                <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Bathrooms</span><input type="number" min={0} max={100} value={payload.propertyDetails?.bathrooms ?? ''} onChange={(event) => updatePayload('propertyDetails', { ...payload.propertyDetails, bathrooms: event.target.value === '' ? null : Number(event.target.value) })} className={fieldClass} /></label>
              </div>
              {selectedTemplate && <div className="mt-6"><p className="mb-3 text-sm font-semibold text-gray-700">Select included tasks</p><div className="grid gap-2 sm:grid-cols-2">{selectedTemplate.tasks.map((task) => { const selected = payload.cleaningTasks.some((item) => item.title === task.title); return <label key={task.title} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selected ? 'border-[var(--upwork-green)] bg-green-50' : 'border-gray-200'}`}><input type="checkbox" checked={selected} onChange={() => updatePayload('cleaningTasks', selected ? payload.cleaningTasks.filter((item) => item.title !== task.title) : [...payload.cleaningTasks, { title: task.title, description: task.description || '', subtasks: (task.subtasks || []).map((item) => item.title) }])} className="mt-1 h-4 w-4 accent-[var(--upwork-green)]" /><span><span className="block text-sm font-semibold text-[var(--upwork-navy)]">{task.title}</span>{task.description && <span className="mt-0.5 block text-xs text-gray-500">{task.description}</span>}</span></label> })}</div></div>}
            </div>
          )}

          {payload.category === 'auto_care' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-[var(--upwork-navy)]">Vehicle and service details</h2>
              <p className="mt-1 text-sm text-gray-600">Check the details collected on the call. Auto Care requires at least four vehicle photos before quote generation.</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Service needed</span>
                  <select value={autoCareDetails.serviceType} onChange={(event) => updateAutoCare({ serviceType: event.target.value as AutoCareDetails['serviceType'] })} className={fieldClass}>
                    <option value="car_detailing">Car detailing</option>
                    <option value="car_washing">Car washing</option>
                    <option value="both">Washing and detailing</option>
                    <option value="unknown">Not sure</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Service location</span>
                  <select value={autoCareDetails.serviceLocationMode} onChange={(event) => updateAutoCare({ serviceLocationMode: event.target.value as AutoCareDetails['serviceLocationMode'] })} className={fieldClass}>
                    <option value="client_address">At my address</option>
                    <option value="client_dropoff">I can drop it at a workshop</option>
                  </select>
                </label>
                {autoCareDetails.serviceLocationMode === 'client_dropoff' && <label>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Drop-off travel radius</span>
                  <select value={autoCareDetails.dropoffRadiusKm} onChange={(event) => updateAutoCare({ dropoffRadiusKm: Number(event.target.value) })} className={fieldClass}>
                    <option value={5}>Up to 5 km</option><option value={10}>Up to 10 km</option><option value={20}>Up to 20 km</option><option value={60}>Flexible</option>
                  </select>
                </label>}
                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Vehicle type</span>
                  <select value={autoCareDetails.vehicle.type} onChange={(event) => updateAutoCareVehicle('type', event.target.value)} className={fieldClass}>
                    <option value="">Choose a vehicle</option><option value="sedan">Sedan</option><option value="hatchback">Hatchback</option><option value="suv_4wd">SUV / 4WD</option><option value="ute">Ute</option><option value="van">Van</option><option value="truck">Truck / larger</option><option value="other">Other</option>
                  </select>
                </label>
                <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Make and model</span><input value={autoCareDetails.vehicle.makeModel} maxLength={100} onChange={(event) => updateAutoCareVehicle('makeModel', event.target.value)} placeholder="e.g. Toyota Corolla" className={fieldClass} /></label>
                <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Year</span><input inputMode="numeric" value={autoCareDetails.vehicle.year} maxLength={4} onChange={(event) => updateAutoCareVehicle('year', event.target.value.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="e.g. 2021" className={fieldClass} /></label>
                <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Colour</span><input value={autoCareDetails.vehicle.colour} maxLength={40} onChange={(event) => updateAutoCareVehicle('colour', event.target.value)} placeholder="e.g. White" className={fieldClass} /></label>
                <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-gray-700">Registration number {autoCareDetails.serviceLocationMode === 'client_address' && <span className="font-normal text-gray-400">(optional)</span>}</span><input value={autoCareDetails.vehicle.registrationNumber} maxLength={20} onChange={(event) => updateAutoCareVehicle('registrationNumber', event.target.value.toUpperCase())} placeholder="e.g. ABC123" className={fieldClass} /></label>
              </div>
              {payload.images.length < 4 && <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> Add front, rear, side and interior photos below before generating the quote.</div>}
            </div>
          )}

          <div id="job-address-card" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-[var(--upwork-navy)]">Job address</h2>
            <p className="mt-1 text-sm text-gray-600">Select an Australian address so Fixes can verify its map coordinates.</p>
            <div className="mt-5"><AddressAutocomplete defaultValue={[payload.location.address, payload.location.suburb, payload.location.state, payload.location.postcode].filter(Boolean).join(', ')} onManualMode={() => document.getElementById('manual-address')?.focus()} onSelect={(address) => updatePayload('location', { address: address.address, suburb: address.suburb, postcode: address.postcode, state: address.state, coordinates: { lat: address.lat, lng: address.lng } })} /></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2" id="manual-address">
              <label className="sm:col-span-2"><span className="mb-1 block text-xs font-semibold text-gray-600">Street address</span><input value={payload.location.address} onChange={(event) => updateLocation('address', event.target.value)} className={fieldClass} /></label>
              <label><span className="mb-1 block text-xs font-semibold text-gray-600">Suburb</span><input value={payload.location.suburb} onChange={(event) => updateLocation('suburb', event.target.value)} className={fieldClass} /></label>
              <label><span className="mb-1 block text-xs font-semibold text-gray-600">Postcode</span><input value={payload.location.postcode} onChange={(event) => updateLocation('postcode', event.target.value)} className={fieldClass} /></label>
              <label><span className="mb-1 block text-xs font-semibold text-gray-600">State</span><input value={payload.location.state} onChange={(event) => updateLocation('state', event.target.value.toUpperCase())} className={fieldClass} /></label>
              <div className="flex items-end"><p className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${Number.isFinite(payload.location.coordinates?.lat) ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}><MapPin className="h-4 w-4" />{Number.isFinite(payload.location.coordinates?.lat) ? 'Address verified' : 'Select the address suggestion to verify'}</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-[var(--upwork-navy)]">Photos</h2><p className="mt-1 text-sm text-gray-600">Add up to five photos. Auto Care requires at least four.</p></div><span className="text-sm font-semibold text-gray-500">{payload.images.length}/5</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{payload.images.map((image) => <div key={image.publicId} className="relative aspect-square overflow-hidden rounded-xl border border-gray-200"><img src={image.url} alt="Job attachment" className="h-full w-full object-cover" /><button type="button" onClick={() => removeImage(image.publicId)} disabled={uploading} aria-label="Remove image" className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-gray-700 shadow disabled:opacity-50"><X className="h-4 w-4" /></button></div>)}{payload.images.length < 5 && <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-center text-sm text-gray-500 hover:border-[var(--upwork-green)] hover:text-[var(--upwork-green)]"><input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => uploadImages(event.target.files)} disabled={uploading} />{uploading ? <Loader2 className="mb-2 h-6 w-6 animate-spin" /> : <ImagePlus className="mb-2 h-6 w-6" />}Add photos</label>}</div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => saveDraft().catch(() => undefined)} disabled={saving || finalizing} className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button><button type="button" onClick={finalize} disabled={saving || finalizing || !user || user.role !== 'client'} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--upwork-green)] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{finalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Generate my quote</button></div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[var(--upwork-navy)]">Ready check</h2>
            <div className="mt-4 space-y-2 text-sm">{draft.missingFields.length ? draft.missingFields.map((field) => <p key={field} className="flex items-center gap-2 text-amber-700"><AlertCircle className="h-4 w-4 shrink-0" /> {field.replaceAll('.', ' ')}</p>) : <p className="flex items-center gap-2 text-green-700"><CheckCircle2 className="h-4 w-4" /> Call details are ready for review</p>}</div>
            {savedMessage && <p className="mt-3 text-xs font-semibold text-green-700">{savedMessage}</p>}
          </div>

          {!user ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <LockKeyhole className="mb-3 h-7 w-7 text-[var(--upwork-green)]" />
              <h2 className="font-bold text-[var(--upwork-navy)]">Sign in to create the real job</h2>
              <p className="mt-1 text-xs text-gray-600">The secure link lets you edit this draft. Your client account is required before Fixes generates a live job and quote.</p>
              <div className="mt-4 grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm"><button type="button" onClick={() => setAuthMode('login')} className={`rounded-lg py-2 font-semibold ${authMode === 'login' ? 'bg-white text-[var(--upwork-navy)] shadow-sm' : 'text-gray-500'}`}>Log in</button><button type="button" onClick={() => setAuthMode('register')} className={`rounded-lg py-2 font-semibold ${authMode === 'register' ? 'bg-white text-[var(--upwork-navy)] shadow-sm' : 'text-gray-500'}`}>Register</button></div>
              <div className="mt-4 space-y-3">{authMode === 'register' && <><input placeholder="Full name" autoComplete="name" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} className={fieldClass} /><input placeholder="Phone (optional)" autoComplete="tel" value={authForm.phone} onChange={(event) => setAuthForm({ ...authForm, phone: event.target.value })} className={fieldClass} /></>}<input type="email" placeholder="Email" autoComplete="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} className={fieldClass} /><input type="password" placeholder="Password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} className={fieldClass} /><button type="button" onClick={submitAuth} disabled={authWorking || !authForm.email || !authForm.password || (authMode === 'register' && !authForm.name)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--upwork-green)] px-4 py-3 font-semibold text-white disabled:opacity-50">{authWorking && <Loader2 className="h-4 w-4 animate-spin" />}{authMode === 'login' ? 'Log in and continue' : 'Create client account'}</button></div>
            </div>
          ) : user.role === 'client' ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5"><p className="flex items-center gap-2 font-semibold text-green-800"><CheckCircle2 className="h-5 w-5" /> Signed in as {user.name}</p><p className="mt-1 text-xs text-green-700">You can now generate the job and quote.</p></div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"><p className="font-semibold">A client account is required</p><p className="mt-1">Tradie and administrator sessions cannot own a customer job.</p></div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-xs leading-5 text-gray-500 shadow-sm"><p className="flex items-center gap-2 font-semibold text-gray-700"><ShieldCheck className="h-4 w-4 text-[var(--upwork-green)]" /> You stay in control</p><p className="mt-2">Generating a quote does not charge you. If a payment step is offered, you can pay securely or cancel the job.</p></div>
        </aside>
      </main>
    </div>
  )
}
