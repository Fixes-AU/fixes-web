'use client'

import { useState } from 'react'
import { Building2, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { AUSTRALIAN_STATES, ROOFING_CAPABILITIES } from '@/lib/constants'
import { registrationAttributionPayload } from '@/lib/marketing-attribution'
import { useMarketingRegistrationEntry } from '@/hooks/use-marketing-registration-entry'
import MarketingRegistrationField from '@/components/marketing/MarketingRegistrationField'

const CATEGORY_OPTIONS = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plastering', label: 'Plastering' },
  { value: 'painting', label: 'Painting' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'emergency_make_safe', label: 'Emergency Make Safe' },
  { value: 'general_labourer', label: 'General Labourer' },
  { value: 'handyman', label: 'Handyman' },
  { value: 'gardening_landscaping', label: 'Gardening & Landscaping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'waste_removal', label: 'Waste Removal' },
]

export default function AgencyRegistrationPage() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    companyName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    abn: '',
    line1: '',
    suburb: '',
    state: 'VIC',
    postcode: '',
    serviceAreas: '',
    documentNotes: '',
  })
  const [categories, setCategories] = useState<string[]>([])
  const [roofingCapabilities, setRoofingCapabilities] = useState<string[]>([])
  const [roofingJurisdictions, setRoofingJurisdictions] = useState<string[]>([])
  const { marketingCode, setMarketingCode, marketingStatus, marketingMessage, waitForMarketingCapture } = useMarketingRegistrationEntry()

  const toggleCategory = (value: string) => {
    setCategories(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value])
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    if (categories.includes('roofing') && (!roofingCapabilities.length || !roofingJurisdictions.length)) {
      setError('Select at least one Roofing service and one Australian service jurisdiction.')
      setSubmitting(false)
      return
    }
    try {
      await waitForMarketingCapture()
      await api.post('/api/agency-applications', {
        companyName: form.companyName,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        ownerPhone: form.ownerPhone,
        abn: form.abn,
        businessAddress: {
          line1: form.line1,
          suburb: form.suburb,
          state: form.state,
          postcode: form.postcode,
          country: 'AU',
        },
        requestedCategories: categories,
        categoryCapabilities: {
          roofing: {
            capabilities: categories.includes('roofing') ? roofingCapabilities : [],
            jurisdictions: categories.includes('roofing') ? roofingJurisdictions : [],
          },
        },
        serviceAreas: form.serviceAreas
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
          .map(label => ({ label })),
        documents: form.documentNotes
          ? [{ type: 'other', label: 'Application document notes', notes: form.documentNotes }]
          : [],
        marketingAttribution: registrationAttributionPayload({ manualCode: marketingCode }),
      }, true)
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Could not submit agency application.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <section className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Application submitted</h1>
          <p className="text-sm text-gray-500 mt-3 leading-6">
            Thanks. The Fixes authorised team will review your agency details, documents, categories,
            and payout readiness before enabling job dispatch.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <section className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Fixes Direct Contracts
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Agency application</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Submit your company details for Fixes admin review. Approved agencies can manage jobs,
            assign workers, and receive payouts through their own Stripe Connect account.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">One operational workspace</h2>
              <p className="mt-2 text-xs leading-5 text-gray-600">
                Coordinate accepted jobs, worker assignments, documents, and service areas from an agency account built for
                multi-person trade businesses.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">Structured compliance review</h2>
              <p className="mt-2 text-xs leading-5 text-gray-600">
                Tell the Fixes team which trades and regions you cover. Licence, insurance, ABN, and category details help
                reviewers confirm your agency is ready for suitable work.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-gray-900">Clear job and payout records</h2>
              <p className="mt-2 text-xs leading-5 text-gray-600">
                Approved agencies can keep job activity and Stripe Connect payout readiness together, helping authorised team
                members understand responsibilities and payment status.
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-gray-600">
            Complete the application with accurate contact information, service locations, trade categories, and document
            notes. Submission does not automatically activate dispatch: the Fixes authorised team reviews the information and
            may request supporting evidence before an agency can receive jobs.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            This application is intended for trade businesses that coordinate multiple workers or service teams. Use the
            document notes to identify the licences, insurance, tax records, and category-specific evidence available so the
            review team can follow up efficiently.
          </p>
        </div>

        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <Building2 className="w-5 h-5 text-blue-600" />
            Company details
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              ['companyName', 'Company name'],
              ['ownerName', 'Owner name'],
              ['ownerEmail', 'Owner email'],
              ['ownerPhone', 'Owner phone'],
              ['abn', 'ABN'],
              ['line1', 'Business address'],
              ['suburb', 'Suburb'],
              ['state', 'State'],
              ['postcode', 'Postcode'],
              ['serviceAreas', 'Service areas, comma separated'],
            ].map(([key, label]) => (
              <label key={key} className="space-y-1">
                <span className="text-xs font-semibold text-gray-500">{label}</span>
                <input
                  value={(form as any)[key]}
                  onChange={event => setForm(prev => ({ ...prev, [key]: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  required={['companyName', 'ownerName', 'ownerEmail', 'ownerPhone'].includes(key)}
                />
              </label>
            ))}
          </div>

          <MarketingRegistrationField
            id="agency-marketing-code"
            value={marketingCode}
            onChange={setMarketingCode}
            status={marketingStatus}
            message={marketingMessage}
            accent="blue"
          />

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Trade categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(category => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => toggleCategory(category.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                    categories.includes(category.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {categories.includes('roofing') && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Roofing services offered</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ROOFING_CAPABILITIES.map(option => (
                    <label key={option.value} className="flex items-start gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={roofingCapabilities.includes(option.value)}
                        onChange={() => setRoofingCapabilities(current => current.includes(option.value)
                          ? current.filter(value => value !== option.value)
                          : [...current, option.value])}
                        className="mt-0.5 accent-emerald-600"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Licensed service jurisdictions</p>
                <div className="flex flex-wrap gap-2">
                  {AUSTRALIAN_STATES.map(state => (
                    <label key={state.value} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={roofingJurisdictions.includes(state.value)}
                        onChange={() => setRoofingJurisdictions(current => current.includes(state.value)
                          ? current.filter(value => value !== state.value)
                          : [...current, state.value])}
                        className="accent-emerald-600"
                      />
                      {state.value}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-500">Document notes</span>
            <textarea
              value={form.documentNotes}
              onChange={event => setForm(prev => ({ ...prev, documentNotes: event.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="List licenses, insurance, tax documents, category-specific documents, and any extra documents available."
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit for review
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
