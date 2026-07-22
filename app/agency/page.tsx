'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, BriefcaseBusiness, Building2, CreditCard, Info, Loader2, Power, ShieldCheck, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface AgencyMembership {
  _id: string
  role: string
  permissions: string[]
  status: string
  hideFinancials: boolean
  agencyId?: {
    _id: string
    name: string
    slug: string
    status: string
    isOnline: boolean
    stripeAccountStatus: string
    categories: string[]
  }
}

interface AgencyReadiness {
  canGoOnline: boolean
  blockers: string[]
  documentsReady: boolean
  stripeReady: boolean
  missingDocuments: { type: string; label: string; categories: string[] }[]
}

const hasAgencyPermission = (member: AgencyMembership, permission: string) =>
  member.role === 'owner' ||
  member.permissions?.includes('agency:*') ||
  member.permissions?.includes(permission)

const canUseAgencyPortal = (member: AgencyMembership) =>
  !!member.agencyId?._id &&
  member.role !== 'worker' &&
  (
    hasAgencyPermission(member, 'agency:view_dashboard') ||
    hasAgencyPermission(member, 'agency:view_jobs') ||
    hasAgencyPermission(member, 'agency:accept_jobs') ||
    hasAgencyPermission(member, 'agency:assign_workers') ||
    hasAgencyPermission(member, 'agency:manage_documents') ||
    hasAgencyPermission(member, 'agency:manage_payouts')
  )

const roleLabel = (role: string) => role.replace(/_/g, ' ')

export default function AgencyPortalShellPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [memberships, setMemberships] = useState<AgencyMembership[]>([])
  const [readinessByAgency, setReadinessByAgency] = useState<Record<string, AgencyReadiness>>({})
  const [loadingAgency, setLoadingAgency] = useState(true)
  const [togglingAgencyId, setTogglingAgencyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?next=/agency')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (!user || user.role !== 'tradie') {
      setLoadingAgency(false)
      return
    }
    const load = async () => {
      setLoadingAgency(true)
      setError('')
      try {
        const res = await api.get<{ agencyMemberships: AgencyMembership[] }>('/api/agency/me')
        const nextMemberships = res.data.agencyMemberships || []
        setMemberships(nextMemberships)

        const portalMemberships = nextMemberships.filter(canUseAgencyPortal)
        const readinessEntries = await Promise.all(
          portalMemberships
            .filter(member => member.agencyId?._id)
            .map(async (member) => {
              const agencyId = member.agencyId!._id
              const readinessRes = await api.get<{ readiness: AgencyReadiness }>(`/api/agency/${agencyId}/readiness`)
              return [agencyId, readinessRes.data.readiness] as const
            })
        )
        setReadinessByAgency(Object.fromEntries(readinessEntries))
      } catch (err: any) {
        setError(err?.message || 'Failed to load agency access.')
      } finally {
        setLoadingAgency(false)
      }
    }
    load()
  }, [user])

  const toggleOnline = async (agencyId: string, isOnline: boolean) => {
    setTogglingAgencyId(agencyId)
    setError('')
    try {
      await api.patch(`/api/agency/${agencyId}/online`, { isOnline: !isOnline })
      const res = await api.get<{ agencyMemberships: AgencyMembership[] }>('/api/agency/me')
      setMemberships(res.data.agencyMemberships || [])
      const readinessRes = await api.get<{ readiness: AgencyReadiness }>(`/api/agency/${agencyId}/readiness`)
      setReadinessByAgency(prev => ({ ...prev, [agencyId]: readinessRes.data.readiness }))
    } catch (err: any) {
      const blockers = err?.data?.errors?.readiness?.blockers
      setError(blockers?.join(' ') || err?.message || 'Failed to update agency online state.')
    } finally {
      setTogglingAgencyId(null)
    }
  }

  if (isLoading || loadingAgency) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
      </main>
    )
  }

  if (!user || user.role !== 'tradie') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <section className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">Agency access requires a tradie account</h1>
          <p className="text-sm text-gray-500 mt-2">Please sign in with an approved agency owner or manager account.</p>
        </section>
      </main>
    )
  }

  const portalMemberships = memberships.filter(canUseAgencyPortal)
  const hasWorkerOnlyMembership = memberships.length > 0 && portalMemberships.length === 0

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="max-w-6xl mx-auto space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Direct Contracts
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Agency Portal</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage Direct Contract availability, job offers, worker assignment, documents, and agency payout readiness from one controlled portal.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          Agency online mode is backend-gated. Fixes admin approval, verified category documents, and active Stripe Connect are required before dispatch eligibility.
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        {memberships.length === 0 ? (
          <section className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">No agency membership yet</h2>
            <p className="text-sm text-gray-500 mt-2">
              Once Fixes admin approves your agency and links your account, agency controls will appear here.
            </p>
          </section>
        ) : hasWorkerOnlyMembership ? (
          <section className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <BriefcaseBusiness className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">Agency worker access</h2>
            <p className="text-sm text-gray-500 mt-2">
              Assigned agency jobs appear directly in the Fixer app active job screen. This web portal is reserved for agency owners and authorised managers.
            </p>
          </section>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {portalMemberships.map(member => {
              const agency = member.agencyId
              const readiness = agency?._id ? readinessByAgency[agency._id] : null
              const canToggleOnline = hasAgencyPermission(member, 'agency:accept_jobs')
              const canViewJobs = hasAgencyPermission(member, 'agency:view_jobs')
              const canManageWorkers = hasAgencyPermission(member, 'agency:invite_members') || hasAgencyPermission(member, 'agency:assign_workers') || hasAgencyPermission(member, 'agency:remove_members')
              const canManageDocuments = hasAgencyPermission(member, 'agency:manage_documents')
              const canManagePayouts = hasAgencyPermission(member, 'agency:manage_payouts') || hasAgencyPermission(member, 'agency:view_finance')
              return (
                <section key={member._id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        {agency?.name || 'Agency'}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">{roleLabel(member.role)} - {member.status}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${agency?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {agency?.status?.replace(/_/g, ' ') || 'pending'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <Power className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Online</p>
                      <p className="text-sm font-semibold text-gray-900">{agency?.isOnline ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <Users className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Financial visibility</p>
                      <p className="text-sm font-semibold text-gray-900">{member.hideFinancials ? 'Hidden' : 'Visible'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <CreditCard className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Stripe</p>
                      <p className="text-sm font-semibold text-gray-900">{agency?.stripeAccountStatus?.replace(/_/g, ' ') || 'not connected'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <ShieldCheck className="w-4 h-4 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Readiness</p>
                      <p className={`text-sm font-semibold ${readiness?.canGoOnline ? 'text-green-700' : 'text-amber-700'}`}>
                        {readiness?.canGoOnline ? 'Ready' : 'Blocked'}
                      </p>
                    </div>
                  </div>

                  {readiness && !readiness.canGoOnline && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                      <div className="flex gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-900">Before this agency can go online</p>
                          <ul className="mt-1 space-y-1">
                            {readiness.blockers.map(blocker => (
                              <li key={blocker} className="text-xs text-amber-800">{blocker}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {(agency?.categories || []).map(category => (
                      <span key={category} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
                        {category.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => agency?._id && toggleOnline(agency._id, !!agency.isOnline)}
                      disabled={!canToggleOnline || !agency?._id || togglingAgencyId === agency?._id || (!agency?.isOnline && readiness?.canGoOnline === false)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 ${agency?.isOnline ? 'bg-gray-900 text-white' : 'bg-emerald-600 text-white'}`}
                    >
                      {togglingAgencyId === agency?._id ? 'Saving...' : agency?.isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                    {canManageWorkers && (
                      <Link href="/agency/workers" className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
                        Workers
                      </Link>
                    )}
                    {canViewJobs && (
                      <Link href="/agency/jobs" className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold">
                        Jobs
                      </Link>
                    )}
                    {canManageDocuments && (
                      <Link href="/agency/settings/documents" className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold">
                        Documents
                      </Link>
                    )}
                    {canManagePayouts && (
                      <Link href="/agency/settings/payouts" className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold">
                        Payouts
                      </Link>
                    )}
                  </div>
                  {!canToggleOnline && (
                    <p className="text-xs text-gray-500">Your role can monitor this agency but cannot change online dispatch availability.</p>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
