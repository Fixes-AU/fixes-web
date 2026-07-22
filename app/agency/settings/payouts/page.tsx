'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, CreditCard, Info, Loader2, RefreshCw, Save } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface Membership {
  _id: string
  role: string
  permissions: string[]
  agencyId?: {
    _id: string
    name: string
    phone?: string
    abn?: string
    stripeAccountStatus: string
    businessAddress?: {
      line1?: string
      suburb?: string
      state?: string
      postcode?: string
      country?: string
    }
  }
}

interface ConnectStatus {
  stripeAccountId: string | null
  stripeAccountStatus: 'not_connected' | 'pending' | 'active' | 'requires_action'
  payoutsEnabled?: boolean
  transfersCapability?: string | null
  requirements?: {
    currently_due?: string[]
    eventually_due?: string[]
    errors?: { code?: string; reason?: string; requirement?: string }[]
  } | null
}

const hasAgencyPermission = (member: Membership | null, permission: string) =>
  !!member && (
    member.role === 'owner' ||
    member.permissions?.includes('agency:*') ||
    member.permissions?.includes(permission)
  )

const canUsePayoutsPortal = (member: Membership) =>
  member.role !== 'worker' &&
  !!member.agencyId?._id &&
  hasAgencyPermission(member, 'agency:manage_payouts')

export default function AgencyPayoutsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [connect, setConnect] = useState<ConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [businessForm, setBusinessForm] = useState({
    companyName: '',
    phone: '',
    abn: '',
    line1: '',
    suburb: '',
    state: '',
    postcode: '',
    businessUrl: 'https://fixesau.com',
  })
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bsb: '',
    accountNumber: '',
  })

  const agency = membership?.agencyId

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login?next=/agency/settings/payouts')
  }, [isLoading, user, router])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const me = await api.get<{ agencyMemberships: Membership[] }>('/api/agency/me')
      const active = (me.data.agencyMemberships || []).find(canUsePayoutsPortal) || null
      setMembership(active)

      if (active?.agencyId?._id) {
        const nextAgency = active.agencyId
        setBusinessForm(prev => ({
          ...prev,
          companyName: nextAgency.name || '',
          phone: nextAgency.phone || '',
          abn: nextAgency.abn || '',
          line1: nextAgency.businessAddress?.line1 || '',
          suburb: nextAgency.businessAddress?.suburb || '',
          state: nextAgency.businessAddress?.state || '',
          postcode: nextAgency.businessAddress?.postcode || '',
        }))
        setBankForm(prev => ({ ...prev, accountHolderName: nextAgency.name || '' }))

        const status = await api.get<ConnectStatus>(`/api/agency/${nextAgency._id}/connect/status`)
        setConnect(status.data)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load agency payout setup.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'tradie') {
      load()
    } else if (user) {
      setLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const initConnect = async () => {
    if (!agency?._id) return
    setSaving('init')
    setError('')
    setSuccess('')
    try {
      const res = await api.post<ConnectStatus>(`/api/agency/${agency._id}/connect/custom/init`, {})
      setConnect(res.data)
      setSuccess('Agency Stripe Connect account initialized.')
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Stripe Connect.')
    } finally {
      setSaving('')
    }
  }

  const saveBusiness = async () => {
    if (!agency?._id) return
    setSaving('business')
    setError('')
    setSuccess('')
    try {
      await api.post(`/api/agency/${agency._id}/connect/custom/business`, {
        companyName: businessForm.companyName,
        phone: businessForm.phone,
        abn: businessForm.abn,
        businessUrl: businessForm.businessUrl,
        businessAddress: {
          line1: businessForm.line1,
          suburb: businessForm.suburb,
          state: businessForm.state,
          postcode: businessForm.postcode,
          country: 'AU',
        },
      })
      setSuccess('Business details sent to Stripe.')
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to save business details.')
    } finally {
      setSaving('')
    }
  }

  const saveBank = async () => {
    if (!agency?._id) return
    setSaving('bank')
    setError('')
    setSuccess('')
    try {
      await api.post(`/api/agency/${agency._id}/connect/custom/bank`, bankForm)
      setBankForm(prev => ({ ...prev, bsb: '', accountNumber: '' }))
      setSuccess('Bank details securely sent to Stripe.')
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to save bank details.')
    } finally {
      setSaving('')
    }
  }

  if (isLoading || loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-400" /></main>
  }

  const status = connect?.stripeAccountStatus || agency?.stripeAccountStatus || 'not_connected'
  const isActive = status === 'active'

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="max-w-5xl mx-auto space-y-6">
        <Link href="/agency" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back to agency</Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-7 h-7 text-blue-600" /> Agency Payouts</h1>
            <p className="text-sm text-gray-500 mt-1">{agency?.name || 'Agency'} Stripe Connect readiness for Direct Contracts.</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {!agency && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">No agency payout management access found for this account.</div>}
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

        {agency && <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                {isActive ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Info className="w-5 h-5 text-amber-600" />}
                Stripe Connect status
              </h2>
              <p className="text-sm text-gray-500 mt-1">Agencies cannot go online for dispatch until this is active.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${isActive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {status.replace(/_/g, ' ')}
              </span>
              {status === 'not_connected' && (
                <button onClick={initConnect} disabled={!agency || saving === 'init'} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60">
                  {saving === 'init' && <Loader2 className="w-4 h-4 animate-spin" />}
                  Initialize
                </button>
              )}
            </div>
          </div>

          {connect?.requirements?.currently_due?.length ? (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs font-semibold text-amber-900">Stripe currently needs</p>
              <p className="text-xs text-amber-800 mt-1">{connect.requirements.currently_due.join(', ')}</p>
            </div>
          ) : null}
          {connect?.requirements?.errors?.length ? (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3">
              <p className="text-xs font-semibold text-red-900">Stripe errors</p>
              {connect.requirements.errors.map((item, index) => (
                <p key={`${item.code || 'error'}-${index}`} className="text-xs text-red-700 mt-1">{item.requirement}: {item.reason || item.code}</p>
              ))}
            </div>
          ) : null}
        </section>}

        {agency && <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Business details</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={businessForm.companyName} onChange={event => setBusinessForm(prev => ({ ...prev, companyName: event.target.value }))} placeholder="Company name" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={businessForm.phone} onChange={event => setBusinessForm(prev => ({ ...prev, phone: event.target.value }))} placeholder="Phone" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={businessForm.abn} onChange={event => setBusinessForm(prev => ({ ...prev, abn: event.target.value }))} placeholder="ABN" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={businessForm.businessUrl} onChange={event => setBusinessForm(prev => ({ ...prev, businessUrl: event.target.value }))} placeholder="Business website" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={businessForm.line1} onChange={event => setBusinessForm(prev => ({ ...prev, line1: event.target.value }))} placeholder="Address line" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm md:col-span-2" />
            <input value={businessForm.suburb} onChange={event => setBusinessForm(prev => ({ ...prev, suburb: event.target.value }))} placeholder="Suburb" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={businessForm.state} onChange={event => setBusinessForm(prev => ({ ...prev, state: event.target.value }))} placeholder="State" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={businessForm.postcode} onChange={event => setBusinessForm(prev => ({ ...prev, postcode: event.target.value }))} placeholder="Postcode" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </div>
          <button onClick={saveBusiness} disabled={!agency || !connect?.stripeAccountId || saving === 'business'} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60">
            {saving === 'business' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Business Details
          </button>
        </section>}

        {agency && <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900">Bank account</h2>
            <p className="text-xs text-gray-500 mt-1">Bank details are sent to Stripe and are not stored by Fixes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <input value={bankForm.accountHolderName} onChange={event => setBankForm(prev => ({ ...prev, accountHolderName: event.target.value }))} placeholder="Account holder name" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={bankForm.bsb} onChange={event => setBankForm(prev => ({ ...prev, bsb: event.target.value }))} placeholder="BSB" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <input value={bankForm.accountNumber} onChange={event => setBankForm(prev => ({ ...prev, accountNumber: event.target.value }))} placeholder="Account number" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
          </div>
          <button onClick={saveBank} disabled={!agency || !connect?.stripeAccountId || saving === 'bank'} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60">
            {saving === 'bank' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Bank Details
          </button>
        </section>}
      </section>
    </main>
  )
}
