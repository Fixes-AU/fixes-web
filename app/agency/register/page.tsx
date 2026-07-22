'use client'

import { useState } from 'react'
import { Building2, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api'

const CATEGORY_OPTIONS = [
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plastering', label: 'Plastering' },
  { value: 'painting', label: 'Painting' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'carpentry', label: 'Carpentry' },
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

  const toggleCategory = (value: string) => {
    setCategories(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value])
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
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
        serviceAreas: form.serviceAreas
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
          .map(label => ({ label })),
        documents: form.documentNotes
          ? [{ type: 'other', label: 'Application document notes', notes: form.documentNotes }]
          : [],
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
