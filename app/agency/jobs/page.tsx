'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, BriefcaseBusiness, CalendarClock, CheckCircle2, Loader2, MapPin, RefreshCw, UserCheck } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface Membership {
  _id: string
  role: string
  permissions: string[]
  agencyId?: { _id: string; name: string }
}

interface AgencyOffer {
  _id: string
  status: string
  offerExpiresAt?: string | null
  assignmentDueAt?: string | null
  jobId?: {
    _id: string
    jobCode: string
    title: string
    description?: string
    category: string
    status: string
    preferredTime: string
    scheduledFor?: string | null
    location?: {
      suburb?: string
      state?: string
      postcode?: string
    }
    images?: { url: string; publicId: string }[]
  }
  assignedWorkerId?: {
    _id: string
    name?: string
    email?: string
    fixId?: string
  } | null
}

interface AgencyMember {
  _id: string
  role: string
  status: string
  categories?: string[]
  canReceiveAssignments?: boolean
  userId?: {
    _id: string
    name?: string
    email?: string
    fixId?: string
  }
}

const statusLabel = (status: string) => status.replace(/_/g, ' ')

const hasAgencyPermission = (member: Membership | null, permission: string) =>
  !!member && (
    member.role === 'owner' ||
    member.permissions?.includes('agency:*') ||
    member.permissions?.includes(permission)
  )

const canUseJobsPortal = (member: Membership) =>
  member.role !== 'worker' && hasAgencyPermission(member, 'agency:view_jobs') && !!member.agencyId?._id

export default function AgencyJobsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [offers, setOffers] = useState<AgencyOffer[]>([])
  const [members, setMembers] = useState<AgencyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [workerSelections, setWorkerSelections] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const agency = membership?.agencyId
  const canAccept = hasAgencyPermission(membership, 'agency:accept_jobs')
  const canAssign = hasAgencyPermission(membership, 'agency:assign_workers')

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login?next=/agency/jobs')
  }, [isLoading, user, router])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const me = await api.get<{ agencyMemberships: Membership[] }>('/api/agency/me')
      const active = (me.data.agencyMemberships || []).find(canUseJobsPortal) || null
      setMembership(active)
      if (active?.agencyId?._id) {
        const [res, memberRes] = await Promise.all([
          api.get<{ offers: AgencyOffer[] }>(`/api/agency/${active.agencyId._id}/jobs/offers`),
          api.get<{ members: AgencyMember[] }>(`/api/agency/${active.agencyId._id}/members`),
        ])
        setOffers(res.data.offers || [])
        setMembers(memberRes.data.members || [])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load agency jobs.')
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

  const acceptOffer = async (offer: AgencyOffer) => {
    if (!agency?._id || !offer.jobId?._id) return
    setAcceptingId(offer._id)
    setError('')
    setSuccess('')
    try {
      await api.post(`/api/agency/${agency._id}/jobs/${offer.jobId._id}/accept`, {})
      setSuccess('Agency accepted the job. Worker assignment is the next step.')
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to accept agency job.')
    } finally {
      setAcceptingId(null)
    }
  }

  const assignWorker = async (offer: AgencyOffer) => {
    if (!agency?._id || !offer.jobId?._id) return
    const memberId = workerSelections[offer._id]
    if (!memberId) {
      setError('Select a worker before assigning this job.')
      return
    }

    setAssigningId(offer._id)
    setError('')
    setSuccess('')
    try {
      await api.post(`/api/agency/${agency._id}/jobs/${offer.jobId._id}/assign-worker`, { memberId })
      setSuccess('Worker assigned. The job will now appear as an active job in their Fixer app without payment details.')
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to assign worker.')
    } finally {
      setAssigningId(null)
    }
  }

  if (isLoading || loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-400" /></main>
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="max-w-6xl mx-auto space-y-6">
        <Link href="/agency" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back to agency</Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><BriefcaseBusiness className="w-7 h-7 text-blue-600" /> Agency Jobs</h1>
            <p className="text-sm text-gray-500 mt-1">{agency?.name || 'Agency'} dispatch offers and accepted agency jobs.</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {!agency && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">No agency manager job access found for this account. Agency workers receive assigned jobs inside the Fixer app active job screen.</div>}
        {!canAccept && agency && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">Your role can view agency jobs but cannot accept dispatch offers.</div>}
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
        {success && <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

        <div className="grid gap-4">
          {offers.length === 0 ? (
            <section className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <BriefcaseBusiness className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900">No agency offers yet</h2>
              <p className="text-sm text-gray-500 mt-2">Eligible jobs will appear here once Direct Contracts dispatch finds this agency.</p>
            </section>
          ) : offers.map(offer => {
            const job = offer.jobId
            const pending = offer.status === 'offered_to_agency'
            const assignableMembers = members.filter(member => {
              if (!member.userId || member.status !== 'active' || member.canReceiveAssignments === false) return false
              const memberCategories = member.categories || []
              return memberCategories.length === 0 || !job?.category || memberCategories.includes(job.category)
            })
            const needsWorker = ['agency_accepted', 'worker_assigned', 'in_progress'].includes(offer.status)
            return (
              <section key={offer._id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${pending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {statusLabel(offer.status)}
                      </span>
                      {job?.jobCode && <span className="text-xs font-semibold text-green-700">#{job.jobCode}</span>}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{job?.title || 'Job offer'}</h2>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job?.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job?.location?.suburb || 'Location'} {job?.location?.state || ''}</span>
                      <span className="inline-flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> {job?.scheduledFor ? new Date(job.scheduledFor).toLocaleString('en-AU') : job?.preferredTime || 'Timing TBC'}</span>
                    </div>
                  </div>
                  {pending ? (
                    <button
                      onClick={() => acceptOffer(offer)}
                      disabled={!canAccept || acceptingId === offer._id}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {acceptingId === offer._id && <Loader2 className="w-4 h-4 animate-spin" />}
                      Accept for Agency
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> {offer.assignedWorkerId ? 'Worker assigned' : 'Accepted'}
                    </div>
                  )}
                </div>

                {needsWorker && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                          Assigned worker
                        </label>
                        <select
                          value={workerSelections[offer._id] || offer.assignedWorkerId?._id || ''}
                          onChange={(event) => setWorkerSelections(prev => ({ ...prev, [offer._id]: event.target.value }))}
                          disabled={!canAssign}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 disabled:bg-gray-100"
                        >
                          <option value="">Select active worker</option>
                          {assignableMembers.map(member => (
                            <option key={member._id} value={member._id}>
                              {member.userId?.name || member.userId?.email || 'Agency worker'}{member.userId?.fixId ? ` (${member.userId.fixId})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => assignWorker(offer)}
                        disabled={!canAssign || assigningId === offer._id || assignableMembers.length === 0}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-60"
                      >
                        {assigningId === offer._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                        Assign Worker
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Once assigned, this job appears directly in the worker&apos;s active job screen. Payment, quote, GST, platform fee, and payout fields stay hidden from that worker.
                    </p>
                    {!canAssign && <p className="text-xs text-amber-700 mt-2">Your agency role can view jobs but cannot assign workers.</p>}
                    {canAssign && assignableMembers.length === 0 && <p className="text-xs text-amber-700 mt-2">No active assignable worker matches this job category.</p>}
                  </div>
                )}

                {pending && offer.offerExpiresAt && (
                  <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Offer expires {new Date(offer.offerExpiresAt).toLocaleTimeString('en-AU')}. First valid acceptance wins across tradies and agencies.
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </section>
    </main>
  )
}
